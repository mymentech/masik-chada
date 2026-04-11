#!/usr/bin/env python3
"""Profile a MySQL SQL dump for migration readiness checks."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

CREATE_TABLE_RE = re.compile(r"CREATE TABLE `([^`]+)` \((.*?)\) ENGINE=", re.S)
INSERT_RE = re.compile(r"INSERT INTO `([^`]+)` \((.*?)\) VALUES\s*(.*?);\n", re.S)


@dataclass
class ProfileResult:
    source_file: str
    tables: list[str]
    table_columns: dict[str, list[str]]
    insert_row_counts: dict[str, int]
    findings: dict[str, Any]

    def as_dict(self) -> dict[str, Any]:
        return {
            "source_file": self.source_file,
            "tables": self.tables,
            "table_columns": self.table_columns,
            "insert_row_counts": self.insert_row_counts,
            "findings": self.findings,
        }


def parse_tuples(values_blob: str) -> list[str]:
    tuples: list[str] = []
    i = 0
    n = len(values_blob)

    while i < n:
        if values_blob[i] != "(":
            i += 1
            continue

        depth = 0
        in_quote = False
        escaped = False
        start = i + 1
        i += 1

        while i < n:
            ch = values_blob[i]
            if in_quote:
                if escaped:
                    escaped = False
                elif ch == "\\":
                    escaped = True
                elif ch == "'":
                    if i + 1 < n and values_blob[i + 1] == "'":
                        i += 1
                    else:
                        in_quote = False
            else:
                if ch == "'":
                    in_quote = True
                elif ch == "(":
                    depth += 1
                elif ch == ")":
                    if depth == 0:
                        tuples.append(values_blob[start:i])
                        break
                    depth -= 1
            i += 1

        i += 1

    return tuples


def split_fields(row_tuple: str) -> list[str]:
    fields: list[str] = []
    current: list[str] = []
    in_quote = False
    escaped = False
    i = 0

    while i < len(row_tuple):
        ch = row_tuple[i]
        if in_quote:
            current.append(ch)
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == "'":
                if i + 1 < len(row_tuple) and row_tuple[i + 1] == "'":
                    current.append(row_tuple[i + 1])
                    i += 1
                else:
                    in_quote = False
        else:
            if ch == "'":
                in_quote = True
                current.append(ch)
            elif ch == ",":
                fields.append("".join(current).strip())
                current = []
            else:
                current.append(ch)
        i += 1

    fields.append("".join(current).strip())
    return fields


def decode_sql_value(raw: str) -> Any:
    if raw.upper() == "NULL":
        return None

    if raw.startswith("'") and raw.endswith("'"):
        value = raw[1:-1]
        return value.replace("''", "'").replace("\\'", "'").replace("\\\\", "\\")

    try:
        if "." in raw:
            return float(raw)
        return int(raw)
    except ValueError:
        return raw


def parse_sql_dump(sql_text: str) -> tuple[dict[str, list[str]], dict[str, list[dict[str, Any]]]]:
    table_columns: dict[str, list[str]] = {}
    rows_by_table: dict[str, list[dict[str, Any]]] = {}

    for table, body in CREATE_TABLE_RE.findall(sql_text):
        cols = []
        for line in body.splitlines():
            match = re.match(r"\s*`([^`]+)`\s+", line)
            if match:
                cols.append(match.group(1))
        table_columns[table] = cols

    for table, cols_blob, values_blob in INSERT_RE.findall(sql_text):
        insert_cols = [c.strip().strip("`") for c in cols_blob.split(",")]
        rows_by_table.setdefault(table, [])

        for tuple_blob in parse_tuples(values_blob):
            values = [decode_sql_value(part) for part in split_fields(tuple_blob)]
            rows_by_table[table].append(dict(zip(insert_cols, values)))

    return table_columns, rows_by_table


def profile_dump(source_path: Path, rows_by_table: dict[str, list[dict[str, Any]]], table_columns: dict[str, list[str]]) -> ProfileResult:
    donors = rows_by_table.get("donors", [])
    payments = rows_by_table.get("payments", [])
    users = rows_by_table.get("users", [])
    dues = rows_by_table.get("dues", [])

    findings: dict[str, Any] = {}

    if donors:
        donor_ids = {row["id"] for row in donors}
        serials = [row["serial_number"] for row in donors]
        serial_counts = Counter(serials)
        serial_gaps: list[dict[str, int]] = []

        sorted_serials = sorted(k for k in serial_counts if isinstance(k, int))
        for left, right in zip(sorted_serials, sorted_serials[1:]):
            if right - left > 1:
                serial_gaps.append({"start": left + 1, "end": right - 1})

        monthly_counter = Counter(row["monthly_amount"] for row in donors)
        zero_amount_examples = [
            {
                "id": row["id"],
                "serial_number": row["serial_number"],
                "name": row["name"],
            }
            for row in donors
            if row.get("monthly_amount") == 0
        ]

        findings["donors"] = {
            "row_count": len(donors),
            "unique_serial_count": len(serial_counts),
            "duplicate_serials": [s for s, count in serial_counts.items() if count > 1],
            "serial_gaps": serial_gaps,
            "monthly_amount_distribution": {str(k): v for k, v in sorted(monthly_counter.items())},
            "zero_monthly_amount_examples": zero_amount_examples,
            "registration_date_min": min(row["registration_date"] for row in donors),
            "registration_date_max": max(row["registration_date"] for row in donors),
            "has_due_from_column": "due_from" in table_columns.get("donors", []),
        }
    else:
        donor_ids = set()

    if users:
        user_ids = {row["id"] for row in users}
        emails = [row.get("email") for row in users]
        email_counts = Counter(emails)
        findings["users"] = {
            "row_count": len(users),
            "duplicate_emails": [email for email, count in email_counts.items() if email and count > 1],
            "null_or_empty_emails": sum(1 for email in emails if email in (None, "")),
        }
    else:
        user_ids = set()

    if dues:
        due_ids = {row["id"] for row in dues}
        dues_by_donor = Counter(row["donor_id"] for row in dues)
        month_year_counts = Counter(row["month_year"] for row in dues)

        findings["dues"] = {
            "row_count": len(dues),
            "null_month_year_count": sum(1 for row in dues if row.get("month_year") in (None, "")),
            "null_paid_amount_count": sum(1 for row in dues if row.get("paid_amount") is None),
            "orphan_donor_refs": sum(1 for row in dues if row.get("donor_id") not in donor_ids),
            "distinct_month_year_count": len(month_year_counts),
            "month_year_min": min(month_year_counts) if month_year_counts else None,
            "month_year_max": max(month_year_counts) if month_year_counts else None,
            "rows_per_month_year_sample": {k: month_year_counts[k] for k in sorted(month_year_counts)[:3]},
            "rows_per_donor_distribution_top": Counter(dues_by_donor.values()).most_common(10),
        }
    else:
        due_ids = set()

    if payments:
        findings["payments"] = {
            "row_count": len(payments),
            "payment_date_min": min(row["payment_date"] for row in payments),
            "payment_date_max": max(row["payment_date"] for row in payments),
            "orphan_donor_refs": sum(1 for row in payments if row.get("donor_id") not in donor_ids),
            "orphan_collector_refs": sum(1 for row in payments if row.get("collector_id") not in user_ids),
            "orphan_due_refs_non_null": sum(
                1
                for row in payments
                if row.get("due_id") is not None and row.get("due_id") not in due_ids
            ),
            "null_due_id_count": sum(1 for row in payments if row.get("due_id") is None),
            "negative_amount_count": sum(
                1 for row in payments if isinstance(row.get("amount"), (int, float)) and row["amount"] < 0
            ),
            "zero_amount_count": sum(1 for row in payments if row.get("amount") == 0),
        }

    # Compare due-row counts against expected month coverage using registration_date only.
    if donors and dues:
        as_of = date(2026, 4, 30)
        dues_by_donor = Counter(row["donor_id"] for row in dues)

        mismatches: list[dict[str, Any]] = []
        expected_total = 0

        for donor in donors:
            y, m, d = map(int, donor["registration_date"].split("-"))
            start = date(y, m, d)
            expected = max((as_of.year - start.year) * 12 + (as_of.month - start.month) + 1, 0)
            got = dues_by_donor[donor["id"]]
            expected_total += expected

            if expected != got:
                mismatches.append(
                    {
                        "id": donor["id"],
                        "serial_number": donor["serial_number"],
                        "registration_date": donor["registration_date"],
                        "expected_rows": expected,
                        "actual_rows": got,
                        "name": donor["name"],
                    }
                )

        findings["dues_vs_registration_expectation_as_of_2026_04_30"] = {
            "expected_total_rows": expected_total,
            "actual_total_rows": len(dues),
            "delta_actual_minus_expected": len(dues) - expected_total,
            "donor_mismatch_count": len(mismatches),
            "mismatch_examples": mismatches[:20],
        }

    return ProfileResult(
        source_file=str(source_path),
        tables=sorted(table_columns.keys()),
        table_columns=table_columns,
        insert_row_counts={k: len(v) for k, v in sorted(rows_by_table.items())},
        findings=findings,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Profile SQL dump data for migration planning")
    parser.add_argument("--input", required=True, help="Path to SQL dump")
    parser.add_argument("--output", required=False, help="Path to JSON output")
    args = parser.parse_args()

    source = Path(args.input)
    sql_text = source.read_text(encoding="utf-8")
    table_columns, rows_by_table = parse_sql_dump(sql_text)
    result = profile_dump(source, rows_by_table, table_columns)

    output = json.dumps(result.as_dict(), ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(output + "\n", encoding="utf-8")
    else:
        print(output)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
