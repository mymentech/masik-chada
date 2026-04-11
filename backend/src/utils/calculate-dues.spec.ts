import { describe, expect, it } from 'vitest';
import { calculateOutstandingBalance, calculateTotalDue } from './calculate-dues';

interface DuesCase {
  id: string;
  asOf: string;
  registrationDate: string;
  dueFrom: string | null;
  monthlyAmount: number;
  totalPaid: number;
  expectedDue: number;
  expectedBalance: number;
}

const matrix: DuesCase[] = [
  {
    id: 'DUES-001',
    asOf: '2026-04-30',
    registrationDate: '2025-01-15',
    dueFrom: null,
    monthlyAmount: 100,
    totalPaid: 0,
    expectedDue: 1600,
    expectedBalance: 1600,
  },
  {
    id: 'DUES-002',
    asOf: '2026-04-30',
    registrationDate: '2024-01-01',
    dueFrom: '2026-02-10',
    monthlyAmount: 100,
    totalPaid: 100,
    expectedDue: 300,
    expectedBalance: 200,
  },
  {
    id: 'DUES-003',
    asOf: '2026-04-30',
    registrationDate: '2026-04-01',
    dueFrom: null,
    monthlyAmount: 250,
    totalPaid: 0,
    expectedDue: 250,
    expectedBalance: 250,
  },
  {
    id: 'DUES-004',
    asOf: '2026-04-30',
    registrationDate: '2026-04-01',
    dueFrom: '2026-06-01',
    monthlyAmount: 250,
    totalPaid: 0,
    expectedDue: 0,
    expectedBalance: 0,
  },
  {
    id: 'DUES-005',
    asOf: '2026-04-30',
    registrationDate: '2026-01-20',
    dueFrom: null,
    monthlyAmount: 200,
    totalPaid: 450,
    expectedDue: 800,
    expectedBalance: 350,
  },
  {
    id: 'DUES-006',
    asOf: '2026-04-30',
    registrationDate: '2026-03-01',
    dueFrom: null,
    monthlyAmount: 150,
    totalPaid: 700,
    expectedDue: 300,
    expectedBalance: -400,
  },
  {
    id: 'DUES-007',
    asOf: '2024-02-29',
    registrationDate: '2024-02-29',
    dueFrom: null,
    monthlyAmount: 100,
    totalPaid: 0,
    expectedDue: 100,
    expectedBalance: 100,
  },
  {
    id: 'DUES-008',
    asOf: '2026-05-31',
    registrationDate: '2026-02-10',
    dueFrom: '2026-02-10',
    monthlyAmount: 300,
    totalPaid: 300,
    expectedDue: 1200,
    expectedBalance: 900,
  },
  {
    id: 'DUES-009',
    asOf: '2026-04-30',
    registrationDate: '2025-12-01',
    dueFrom: null,
    monthlyAmount: 180,
    totalPaid: 100,
    expectedDue: 900,
    expectedBalance: 800,
  },
];

describe('calculate-dues regression matrix', () => {
  it.each(matrix)('$id should match expected due and balance', (scenario) => {
    const totalDue = calculateTotalDue(
      {
        monthly_amount: scenario.monthlyAmount,
        registration_date: scenario.registrationDate,
        due_from: scenario.dueFrom,
      },
      new Date(`${scenario.asOf}T00:00:00.000Z`),
    );

    const balance = calculateOutstandingBalance(totalDue, scenario.totalPaid);

    expect(totalDue).toBe(scenario.expectedDue);
    expect(balance).toBe(scenario.expectedBalance);
  });

  it('throws when registration date is invalid', () => {
    expect(() =>
      calculateTotalDue({
        monthly_amount: 100,
        registration_date: 'not-a-date',
      }),
    ).toThrowError('Invalid date value: not-a-date');
  });
});
