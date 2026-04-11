#!/usr/bin/env python3
"""Independent dues oracle for regression validation."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any


def parse_date(raw: str | None) -> date | None:
    if raw is None:
        return None
    trimmed = raw.strip()
    if not trimmed:
        return None
    if "T" in trimmed:
        return datetime.fromisoformat(trimmed.replace("Z", "+00:00")).date()
    return date.fromisoformat(trimmed)


def month_start(d: date) -> tuple[int, int]:
    return d.year, d.month


def inclusive_months(from_date: date, to_date: date) -> int:
    from_y, from_m = month_start(from_date)
    to_y, to_m = month_start(to_date)
    months = (to_y - from_y) * 12 + (to_m - from_m) + 1
    return max(months, 0)


def dec(value: Any) -> Decimal:
    return Decimal(str(value))


@dataclass
class Computed:
    months: int
    total_due: Decimal
    total_paid: Decimal
    balance: Decimal

    def as_json(self) -> dict[str, Any]:
        return {
            "months": self.months,
            "total_due": float(self.total_due),
            "total_paid": float(self.total_paid),
            "balance": float(self.balance),
        }


def evaluate_case(case: dict[str, Any]) -> Computed:
    as_of = parse_date(case["as_of"])
    donor = case["donor"]

    start = parse_date(donor.get("due_from")) or parse_date(donor["registration_date"])
    assert start is not None
    assert as_of is not None

    months = inclusive_months(start, as_of)
    monthly_amount = dec(donor["monthly_amount"])
    total_due = monthly_amount * dec(months)

    total_paid = Decimal("0")
    for payment in case.get("payments", []):
        payment_date = parse_date(payment.get("payment_date"))
        if payment_date is None or payment_date <= as_of:
            total_paid += dec(payment["amount"])

    balance = total_due - total_paid
    return Computed(months=months, total_due=total_due, total_paid=total_paid, balance=balance)


def main() -> int:
    cases_path = Path(__file__).with_name("dues_cases.json")
    payload = json.loads(cases_path.read_text(encoding="utf-8"))
    failures: list[str] = []

    for case in payload["cases"]:
        expected = case["expected"]
        computed = evaluate_case(case)
        got = computed.as_json()
        for key in ("months", "total_due", "total_paid", "balance"):
            if got[key] != expected[key]:
                failures.append(
                    f"{case['id']} mismatch for {key}: expected={expected[key]} got={got[key]}"
                )

    if failures:
        print("VALIDATION FAILED")
        for line in failures:
            print(line)
        return 1

    print(f"VALIDATION PASSED ({len(payload['cases'])} cases)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

