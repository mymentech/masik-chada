import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import Reports from './Reports';
import { afterEach, vi } from 'vitest';
import { MONTHLY_REPORT_QUERY } from '../graphql/queries';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Reports page', () => {
  it('renders monthly report totals and collector rows', async () => {
    const month = currentMonth();
    const mocks = [
      {
        request: {
          query: MONTHLY_REPORT_QUERY,
          variables: { month }
        },
        result: {
          data: {
            monthlyReport: {
              __typename: 'MonthlyReportType',
              collected: 2500,
              totalBalance: 900,
              byCollector: [
                {
                  __typename: 'CollectorReportType',
                  name: 'Collector A',
                  total: 1700
                },
                {
                  __typename: 'CollectorReportType',
                  name: 'Collector B',
                  total: 800
                }
              ]
            }
          }
        }
      }
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Reports />
      </MockedProvider>
    );

    expect(await screen.findByRole('heading', { name: 'মাসিক রিপোর্ট' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'মোট সংগ্রহ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'মোট বকেয়া' })).toBeInTheDocument();
    expect(screen.getByText('Collector A')).toBeInTheDocument();
    expect(screen.getByText('Collector B')).toBeInTheDocument();
    expect(screen.getByTestId('reports-export-pdf')).toBeEnabled();
  });

  it('requests a new report when month changes', async () => {
    const initialMonth = currentMonth();
    const nextMonth = '2026-03';

    const mocks = [
      {
        request: {
          query: MONTHLY_REPORT_QUERY,
          variables: { month: initialMonth }
        },
        result: {
          data: {
            monthlyReport: {
              __typename: 'MonthlyReportType',
              collected: 1000,
              totalBalance: 400,
              byCollector: []
            }
          }
        }
      },
      {
        request: {
          query: MONTHLY_REPORT_QUERY,
          variables: { month: nextMonth }
        },
        result: {
          data: {
            monthlyReport: {
              __typename: 'MonthlyReportType',
              collected: 1800,
              totalBalance: 200,
              byCollector: [
                {
                  __typename: 'CollectorReportType',
                  name: 'Collector C',
                  total: 1800
                }
              ]
            }
          }
        }
      }
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Reports />
      </MockedProvider>
    );

    const monthInput = await screen.findByLabelText('মাস নির্বাচন করুন');
    fireEvent.change(monthInput, { target: { value: nextMonth } });

    expect(await screen.findByText('Collector C')).toBeInTheDocument();
  });

  it('triggers browser print for PDF export action', async () => {
    const month = currentMonth();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    const mocks = [
      {
        request: {
          query: MONTHLY_REPORT_QUERY,
          variables: { month }
        },
        result: {
          data: {
            monthlyReport: {
              __typename: 'MonthlyReportType',
              collected: 2500,
              totalBalance: 900,
              byCollector: []
            }
          }
        }
      }
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Reports />
      </MockedProvider>
    );

    const exportButton = await screen.findByTestId('reports-export-pdf');
    fireEvent.click(exportButton);

    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});
