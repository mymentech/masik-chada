#!/usr/bin/env python3
"""Deterministic SQL->Mongo dry-run transformer with validation report."""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from sql_dump_profile import parse_sql_dump


def parse_date(raw: Any) -> str | None:
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    if " " in text and "T" not in text:
        text = text.replace(" ", "T")
    try:
        parsed = datetime.fromisoformat(text)
        return parsed.isoformat()
    except ValueError:
        try:
            parsed = datetime.fromisoformat(f"{text}T00:00:00")
            return parsed.isoformat()
        except ValueError:
            return None


def deterministic_object_id(namespace: str, legacy_id: int) -> str:
    digest = hashlib.sha1(f"{namespace}:{legacy_id}".encode("utf-8")).hexdigest()
    return digest[:24]


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def preserves_non_ascii(text: str) -> bool:
    return any(ord(ch) > 127 for ch in text)


def sample_rows(rows: list[dict[str, Any]], limit: int) -> list[dict[str, Any]]:
    return rows[:limit]


def main() -> int:
    parser = argparse.ArgumentParser(description="Dry-run SQL to Mongo transform")
    parser.add_argument("--input", required=True, help="Path to SQL dump")
    parser.add_argument(
        "--out-dir",
        default="backend/validation/out",
        help="Output directory for transformed JSONL and report",
    )
    args = parser.parse_args()

    source = Path(args.input)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    sql_text = source.read_text(encoding="utf-8")
    _table_columns, rows_by_table = parse_sql_dump(sql_text)

    users_src = sorted(rows_by_table.get("users", []), key=lambda row: row.get("id", 0))
    donors_src = sorted(rows_by_table.get("donors", []), key=lambda row: row.get("id", 0))
    payments_src = sorted(rows_by_table.get("payments", []), key=lambda row: row.get("id", 0))

    quarantine: list[dict[str, Any]] = []

    users_out: list[dict[str, Any]] = []
    donors_out: list[dict[str, Any]] = []
    payments_out: list[dict[str, Any]] = []

    user_id_map: dict[int, str] = {}
    donor_id_map: dict[int, str] = {}

    user_email_seen: set[str] = set()
    donor_serial_seen: set[int] = set()

    # Users
    for row in users_src:
        legacy_id = row.get("id")
        email_raw = row.get("email")
        email = str(email_raw or "").strip().lower()

        if not legacy_id or not email or not row.get("password") or not row.get("name"):
            quarantine.append(
                {
                    "entity": "users",
                    "legacy_id": legacy_id,
                    "reason": "invalid_user_required_field",
                }
            )
            continue

        if email in user_email_seen:
            quarantine.append(
                {
                    "entity": "users",
                    "legacy_id": legacy_id,
                    "reason": "duplicate_email",
                    "email": email,
                }
            )
            continue

        user_email_seen.add(email)
        object_id = deterministic_object_id("users", int(legacy_id))
        user_id_map[int(legacy_id)] = object_id

        users_out.append(
            {
                "_id": object_id,
                "legacy_id": int(legacy_id),
                "name": str(row["name"]),
                "email": email,
                "password": row["password"],
                "created_at": parse_date(row.get("created_at")) or datetime.now(UTC).isoformat(),
                "upsert_key": {"email": email},
            }
        )

    # Donors
    for row in donors_src:
        legacy_id = row.get("id")
        serial = row.get("serial_number")
        monthly_amount = row.get("monthly_amount")
        registration_date = parse_date(row.get("registration_date"))

        if not legacy_id or not isinstance(serial, int) or serial <= 0:
            quarantine.append(
                {
                    "entity": "donors",
                    "legacy_id": legacy_id,
                    "reason": "invalid_serial_number",
                }
            )
            continue

        if serial in donor_serial_seen:
            quarantine.append(
                {
                    "entity": "donors",
                    "legacy_id": legacy_id,
                    "reason": "duplicate_serial_number",
                    "serial_number": serial,
                }
            )
            continue

        donor_serial_seen.add(serial)

        if not isinstance(monthly_amount, (int, float)) or monthly_amount <= 0:
            quarantine.append(
                {
                    "entity": "donors",
                    "legacy_id": legacy_id,
                    "reason": "invalid_monthly_amount",
                    "monthly_amount": monthly_amount,
                }
            )
            continue

        if not registration_date:
            quarantine.append(
                {
                    "entity": "donors",
                    "legacy_id": legacy_id,
                    "reason": "invalid_registration_date",
                }
            )
            continue

        object_id = deterministic_object_id("donors", int(legacy_id))
        donor_id_map[int(legacy_id)] = object_id

        donors_out.append(
            {
                "_id": object_id,
                "legacy_id": int(legacy_id),
                "serial_number": serial,
                "name": str(row.get("name") or ""),
                "phone": str(row.get("phone") or "").strip() or "+880",
                "address": str(row.get("address") or ""),
                "monthly_amount": float(monthly_amount),
                "registration_date": registration_date,
                "due_from": None,
                "created_at": parse_date(row.get("created_at")) or datetime.now(UTC).isoformat(),
                "updated_at": parse_date(row.get("updated_at")) or datetime.now(UTC).isoformat(),
                "upsert_key": {"serial_number": serial},
            }
        )

    # Payments
    for row in payments_src:
        legacy_id = row.get("id")
        legacy_donor_id = row.get("donor_id")
        legacy_collector_id = row.get("collector_id")
        amount = row.get("amount")
        payment_date = parse_date(row.get("payment_date"))

        donor_oid = donor_id_map.get(int(legacy_donor_id)) if isinstance(legacy_donor_id, int) else None
        collector_oid = user_id_map.get(int(legacy_collector_id)) if isinstance(legacy_collector_id, int) else None

        if donor_oid is None:
            quarantine.append(
                {
                    "entity": "payments",
                    "legacy_id": legacy_id,
                    "reason": "orphan_payment_missing_donor",
                    "legacy_donor_id": legacy_donor_id,
                }
            )
            continue

        if collector_oid is None:
            quarantine.append(
                {
                    "entity": "payments",
                    "legacy_id": legacy_id,
                    "reason": "orphan_payment_missing_collector",
                    "legacy_collector_id": legacy_collector_id,
                }
            )
            continue

        if not isinstance(amount, (int, float)) or amount <= 0:
            quarantine.append(
                {
                    "entity": "payments",
                    "legacy_id": legacy_id,
                    "reason": "invalid_payment_amount",
                    "amount": amount,
                }
            )
            continue

        if not payment_date:
            quarantine.append(
                {
                    "entity": "payments",
                    "legacy_id": legacy_id,
                    "reason": "invalid_payment_date",
                    "payment_date": row.get("payment_date"),
                }
            )
            continue

        object_id = deterministic_object_id("payments", int(legacy_id)) if isinstance(legacy_id, int) else None
        payments_out.append(
            {
                "_id": object_id,
                "legacy_id": legacy_id,
                "donor_id": donor_oid,
                "collector_id": collector_oid,
                "amount": float(amount),
                "payment_date": payment_date,
                "created_at": parse_date(row.get("created_at")) or payment_date,
                "upsert_key": {
                    "legacy_payment_id": legacy_id,
                    "fallback": {
                        "donor_id": donor_oid,
                        "collector_id": collector_oid,
                        "amount": float(amount),
                        "payment_date": payment_date,
                    },
                },
            }
        )

    quarantine_by_reason = Counter(item["reason"] for item in quarantine)
    quarantine_by_entity = Counter(item["entity"] for item in quarantine)

    users_by_legacy_id = {row["legacy_id"]: row for row in users_out}
    donors_by_legacy_id = {row["legacy_id"]: row for row in donors_out}
    payments_by_legacy_id = {
        row["legacy_id"]: row for row in payments_out if isinstance(row.get("legacy_id"), int)
    }

    bengali_checks: list[dict[str, Any]] = []
    bengali_failures: list[dict[str, Any]] = []

    for source_row in users_src:
        transformed = users_by_legacy_id.get(source_row.get("id"))
        if transformed is None:
            continue
        source_name = str(source_row.get("name") or "")
        if preserves_non_ascii(source_name):
            check = {
                "entity": "users",
                "legacy_id": source_row["id"],
                "field": "name",
                "source": source_name,
                "transformed": transformed["name"],
                "match": source_name == transformed["name"],
            }
            bengali_checks.append(check)
            if not check["match"]:
                bengali_failures.append(check)

    for source_row in donors_src:
        transformed = donors_by_legacy_id.get(source_row.get("id"))
        if transformed is None:
            continue
        for field in ("name", "address"):
            source_value = str(source_row.get(field) or "")
            if not source_value or not preserves_non_ascii(source_value):
                continue
            check = {
                "entity": "donors",
                "legacy_id": source_row["id"],
                "field": field,
                "source": source_value,
                "transformed": transformed[field],
                "match": source_value == transformed[field],
            }
            bengali_checks.append(check)
            if not check["match"]:
                bengali_failures.append(check)

    parity = {
        "users": {
            "source": len(users_src),
            "transformed": len(users_out),
            "quarantined": quarantine_by_entity["users"],
            "balanced": len(users_src) == len(users_out) + quarantine_by_entity["users"],
        },
        "donors": {
            "source": len(donors_src),
            "transformed": len(donors_out),
            "quarantined": quarantine_by_entity["donors"],
            "balanced": len(donors_src) == len(donors_out) + quarantine_by_entity["donors"],
        },
        "payments": {
            "source": len(payments_src),
            "transformed": len(payments_out),
            "quarantined": quarantine_by_entity["payments"],
            "balanced": len(payments_src) == len(payments_out) + quarantine_by_entity["payments"],
        },
    }

    golden_records = {
        "users": [
            {
                "legacy_id": row["id"],
                "source": {
                    "name": row["name"],
                    "email": str(row.get("email") or "").strip().lower(),
                    "password": row["password"],
                },
                "transformed": users_by_legacy_id[row["id"]],
            }
            for row in sample_rows([row for row in users_src if row.get("id") in users_by_legacy_id], 3)
        ],
        "donors": [
            {
                "legacy_id": row["id"],
                "source": {
                    "serial_number": row["serial_number"],
                    "name": row["name"],
                    "address": row["address"],
                    "monthly_amount": row["monthly_amount"],
                    "registration_date": row["registration_date"],
                },
                "transformed": donors_by_legacy_id[row["id"]],
            }
            for row in sample_rows([row for row in donors_src if row.get("id") in donors_by_legacy_id], 5)
        ],
        "payments": [
            {
                "legacy_id": row["id"],
                "source": {
                    "donor_id": row["donor_id"],
                    "collector_id": row["collector_id"],
                    "amount": row["amount"],
                    "payment_date": row["payment_date"],
                },
                "transformed": payments_by_legacy_id[row["id"]],
            }
            for row in sample_rows([row for row in payments_src if row.get("id") in payments_by_legacy_id], 5)
        ],
    }

    bengali_report = {
        "checked_fields_total": len(bengali_checks),
        "failed_fields_total": len(bengali_failures),
        "status": "pass" if not bengali_failures else "fail",
        "sample_passes": sample_rows([check for check in bengali_checks if check["match"]], 10),
        "failures": bengali_failures,
    }

    report = {
        "run_at_utc": datetime.now(UTC).isoformat(),
        "source_file": str(source),
        "mode": "dry_run_transform",
        "input_counts": {
            "users": len(users_src),
            "donors": len(donors_src),
            "payments": len(payments_src),
        },
        "output_counts": {
            "users_transformed": len(users_out),
            "donors_transformed": len(donors_out),
            "payments_transformed": len(payments_out),
            "quarantine_total": len(quarantine),
        },
        "quarantine_by_reason": dict(sorted(quarantine_by_reason.items())),
        "parity": parity,
        "id_map_counts": {
            "users": len(user_id_map),
            "donors": len(donor_id_map),
        },
        "bengali_fidelity": {
            "checked_fields_total": bengali_report["checked_fields_total"],
            "failed_fields_total": bengali_report["failed_fields_total"],
            "status": bengali_report["status"],
        },
        "artifact_paths": {
            "users_transformed": str(out_dir / "users.transformed.jsonl"),
            "donors_transformed": str(out_dir / "donors.transformed.jsonl"),
            "payments_transformed": str(out_dir / "payments.transformed.jsonl"),
            "quarantine": str(out_dir / "quarantine.jsonl"),
            "id_maps": str(out_dir / "id-maps.json"),
            "golden_records": str(out_dir / "golden-records.json"),
            "bengali_fidelity_report": str(out_dir / "bengali-fidelity-report.json"),
            "dryrun_report": str(out_dir / "dryrun-report.json"),
        },
        "notes": [
            "donors.due_from is set to null because source dump has no due_from column",
            "payments.due_id is ignored in target payload because target schema does not store it",
        ],
    }

    write_jsonl(out_dir / "users.transformed.jsonl", users_out)
    write_jsonl(out_dir / "donors.transformed.jsonl", donors_out)
    write_jsonl(out_dir / "payments.transformed.jsonl", payments_out)
    write_jsonl(out_dir / "quarantine.jsonl", quarantine)
    (out_dir / "id-maps.json").write_text(
        json.dumps({"users": user_id_map, "donors": donor_id_map}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (out_dir / "golden-records.json").write_text(
        json.dumps(golden_records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (out_dir / "bengali-fidelity-report.json").write_text(
        json.dumps(bengali_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (out_dir / "dryrun-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
