import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Donations from './Donations';
import { RECORD_PAYMENT_MUTATION } from '../graphql/mutations';
import { afterEach, vi } from 'vitest';
import { ADDRESSES_QUERY, DASHBOARD_SUMMARY_QUERY, DONORS_QUERY } from '../graphql/queries';

function donorQueryMock(donors, variables = { search: undefined, address: undefined }) {
  return {
    request: {
      query: DONORS_QUERY,
      variables
    },
    result: {
      data: {
        donors
      }
    }
  };
}

function addressesQueryMock(addresses = []) {
  return {
    request: {
      query: ADDRESSES_QUERY
    },
    result: {
      data: {
        addresses
      }
    }
  };
}

function dashboardSummaryMock() {
  return {
    request: {
      query: DASHBOARD_SUMMARY_QUERY
    },
    result: {
      data: {
        dashboard: {
          __typename: 'DashboardType',
          totalDonors: 1,
          thisMonthCollected: 1000,
          totalBalance: 0,
          totalCollectors: 1
        }
      }
    }
  };
}

const donor = {
  __typename: 'DonorType',
  id: 'donor-1',
  serial_number: 101,
  name: 'আব্দুল করিম',
  phone: '+8801700000000',
  address: 'চট্টগ্রাম',
  monthly_amount: 500,
  registration_date: '2026-01-01T00:00:00.000Z',
  due_from: '2026-01-01T00:00:00.000Z',
  total_due: 2500,
  total_paid: 2000,
  balance: 500
};

afterEach(() => {
  vi.useRealTimers();
});

describe('Donations page', () => {
  it('records payment and shows success feedback', async () => {
    const paymentDate = '2026-04-01';
    const expectedPaymentDateIso = '2026-04-01T00:00:00.000Z';

    const mocks = [
      addressesQueryMock(['চট্টগ্রাম']),
      donorQueryMock([donor]),
      {
        request: {
          query: RECORD_PAYMENT_MUTATION,
          variables: {
            donorId: donor.id,
            amount: 700,
            paymentDate: expectedPaymentDateIso
          }
        },
        result: {
          data: {
            recordPayment: {
              __typename: 'PaymentType',
              id: 'payment-1',
              donor_id: donor.id,
              amount: 700,
              payment_date: expectedPaymentDateIso,
              created_at: '2026-04-01T10:00:00.000Z'
            }
          }
        }
      },
      donorQueryMock([donor]),
      dashboardSummaryMock()
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Donations />
      </MockedProvider>
    );

    expect(await screen.findByTestId(`donor-row-${donor.id}`)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`donor-row-${donor.id}`));

    const amountInput = await screen.findByTestId('donations-payment-amount-input');
    const dateInput = screen.getByTestId('donations-payment-date-input');

    fireEvent.change(amountInput, { target: { value: '700' } });
    fireEvent.change(dateInput, { target: { value: paymentDate } });
    fireEvent.click(screen.getByTestId('donations-submit-payment'));

    expect(await screen.findByTestId('donations-feedback-success')).toHaveTextContent(
      `${donor.name} এর পেমেন্ট সফলভাবে যোগ হয়েছে।`
    );

    await waitFor(() => {
      expect(screen.getByTestId('donations-selected-donor-id')).toHaveTextContent('');
    });
  });

  it('shows error feedback when payment mutation fails', async () => {
    const paymentDate = '2026-04-02';

    const mocks = [
      addressesQueryMock(['চট্টগ্রাম']),
      donorQueryMock([donor]),
      {
        request: {
          query: RECORD_PAYMENT_MUTATION,
          variables: {
            donorId: donor.id,
            amount: 600,
            paymentDate: '2026-04-02T00:00:00.000Z'
          }
        },
        error: new Error('payment failed')
      }
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Donations />
      </MockedProvider>
    );

    expect(await screen.findByTestId(`donor-row-${donor.id}`)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`donor-row-${donor.id}`));

    fireEvent.change(screen.getByTestId('donations-payment-amount-input'), {
      target: { value: '600' }
    });
    fireEvent.change(screen.getByTestId('donations-payment-date-input'), {
      target: { value: paymentDate }
    });
    fireEvent.click(screen.getByTestId('donations-submit-payment'));

    expect(await screen.findByTestId('donations-feedback-error')).toHaveTextContent(
      'পেমেন্ট যোগ করা যায়নি। আবার চেষ্টা করুন।'
    );
  });

  it('applies 300ms debounced search before requesting donors', async () => {
    const mocks = [
      addressesQueryMock(['ঢাকা']),
      donorQueryMock([]),
      donorQueryMock([donor], { search: 'করিম', address: undefined })
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Donations />
      </MockedProvider>
    );

    expect(await screen.findByText('কোনো ডোনার পাওয়া যায়নি।')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('donations-search-input'), {
      target: { value: 'করিম' }
    });
    expect(screen.queryByTestId(`donor-row-${donor.id}`)).not.toBeInTheDocument();

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
    expect(screen.queryByTestId(`donor-row-${donor.id}`)).not.toBeInTheDocument();

    expect(await screen.findByTestId(`donor-row-${donor.id}`)).toBeInTheDocument();
  });

  it('filters donors by selected address', async () => {
    const dhakaDonor = { ...donor, id: 'donor-2', name: 'ঢাকা ডোনার', address: 'ঢাকা' };
    const mocks = [
      addressesQueryMock(['ঢাকা', 'চট্টগ্রাম']),
      donorQueryMock([donor, dhakaDonor]),
      donorQueryMock([dhakaDonor], { search: undefined, address: 'ঢাকা' })
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Donations />
      </MockedProvider>
    );

    expect(await screen.findByTestId(`donor-row-${donor.id}`)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('donations-address-filter'), {
      target: { value: 'ঢাকা' }
    });

    expect(await screen.findByTestId('donor-row-donor-2')).toBeInTheDocument();
  });
});
