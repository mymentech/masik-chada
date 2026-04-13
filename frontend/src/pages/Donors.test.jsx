import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import Donors from './Donors';
import { afterEach, vi } from 'vitest';
import {
  CREATE_DONOR_MUTATION,
  DELETE_DONOR_MUTATION,
  UPDATE_DONOR_MUTATION
} from '../graphql/mutations';
import { DASHBOARD_SUMMARY_QUERY, DONORS_QUERY } from '../graphql/queries';

const queryVariables = { search: undefined, address: undefined };

function donorsQueryMock(donors) {
  return {
    request: {
      query: DONORS_QUERY,
      variables: queryVariables
    },
    result: {
      data: {
        donors
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
          totalDonors: 2,
          thisMonthCollected: 1000,
          totalBalance: 400,
          totalCollectors: 1
        }
      }
    }
  };
}

const existingDonor = {
  __typename: 'DonorType',
  id: 'donor-1',
  serial_number: 101,
  name: 'পুরাতন ডোনার',
  phone: '+8801711111111',
  address: 'ঢাকা',
  monthly_amount: 400,
  registration_date: '2026-01-01T00:00:00.000Z',
  due_from: '2026-01-01T00:00:00.000Z',
  total_due: 1200,
  total_paid: 800,
  balance: 400
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Donors page', () => {
  it('creates a donor and shows success feedback', async () => {
    const registrationDate = '2026-04-10';

    const mocks = [
      donorsQueryMock([]),
      {
        request: {
          query: CREATE_DONOR_MUTATION,
          variables: {
            input: {
              name: 'নতুন ডোনার',
              phone: '+8801700000000',
              address: 'ঢাকা',
              monthly_amount: 450,
              registration_date: '2026-04-10T00:00:00.000Z',
              due_from: null
            }
          }
        },
        result: {
          data: {
            createDonor: {
              __typename: 'DonorType',
              id: 'donor-2',
              serial_number: 202,
              name: 'নতুন ডোনার',
              phone: '+8801700000000',
              address: 'ঢাকা',
              monthly_amount: 450,
              registration_date: '2026-04-10T00:00:00.000Z',
              due_from: '2026-04-10T00:00:00.000Z',
              total_due: 450,
              total_paid: 0,
              balance: 450
            }
          }
        }
      },
      donorsQueryMock([
        {
          __typename: 'DonorType',
          id: 'donor-2',
          serial_number: 202,
          name: 'নতুন ডোনার',
          phone: '+8801700000000',
          address: 'ঢাকা',
          monthly_amount: 450,
          registration_date: '2026-04-10T00:00:00.000Z',
          due_from: '2026-04-10T00:00:00.000Z',
          total_due: 450,
          total_paid: 0,
          balance: 450
        }
      ]),
      dashboardSummaryMock()
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Donors />
      </MockedProvider>
    );

    expect(await screen.findByRole('heading', { name: 'ডোনার ম্যানেজমেন্ট' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('নাম'), { target: { value: 'নতুন ডোনার' } });
    fireEvent.change(screen.getByLabelText('ফোন'), { target: { value: '+8801700000000' } });
    fireEvent.change(screen.getByLabelText('ঠিকানা'), { target: { value: 'ঢাকা' } });
    fireEvent.change(screen.getByLabelText('মাসিক টাকা'), { target: { value: '450' } });
    fireEvent.change(screen.getByLabelText('রেজিস্ট্রেশন তারিখ'), {
      target: { value: registrationDate }
    });

    fireEvent.click(screen.getByRole('button', { name: 'যোগ করুন' }));

    expect(await screen.findByText('নতুন ডোনার যোগ হয়েছে।')).toBeInTheDocument();
  });

  it('updates a donor and shows success feedback', async () => {
    const mocks = [
      donorsQueryMock([existingDonor]),
      {
        request: {
          query: UPDATE_DONOR_MUTATION,
          variables: {
            id: existingDonor.id,
            input: {
              name: 'আপডেটেড ডোনার',
              phone: '+8801711111112',
              address: 'চট্টগ্রাম',
              monthly_amount: 550,
              registration_date: '2026-01-01T00:00:00.000Z',
              due_from: '2026-02-01T00:00:00.000Z'
            }
          }
        },
        result: {
          data: {
            updateDonor: {
              ...existingDonor,
              name: 'আপডেটেড ডোনার',
              phone: '+8801711111112',
              address: 'চট্টগ্রাম',
              monthly_amount: 550,
              due_from: '2026-02-01T00:00:00.000Z',
              balance: 350
            }
          }
        }
      },
      donorsQueryMock([
        {
          ...existingDonor,
          name: 'আপডেটেড ডোনার',
          phone: '+8801711111112',
          address: 'চট্টগ্রাম',
          monthly_amount: 550,
          due_from: '2026-02-01T00:00:00.000Z',
          balance: 350
        }
      ]),
      dashboardSummaryMock()
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Donors />
      </MockedProvider>
    );

    expect(await screen.findByRole('heading', { name: 'ডোনার ম্যানেজমেন্ট' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'এডিট' }));

    fireEvent.change(screen.getByLabelText('নাম'), { target: { value: 'আপডেটেড ডোনার' } });
    fireEvent.change(screen.getByLabelText('ফোন'), { target: { value: '+8801711111112' } });
    fireEvent.change(screen.getByLabelText('ঠিকানা'), { target: { value: 'চট্টগ্রাম' } });
    fireEvent.change(screen.getByLabelText('মাসিক টাকা'), { target: { value: '550' } });
    fireEvent.change(screen.getByLabelText('অ্যামনেস্টি তারিখ (ঐচ্ছিক)'), { target: { value: '2026-02-01' } });

    fireEvent.click(screen.getByRole('button', { name: 'আপডেট করুন' }));

    expect(await screen.findByText('ডোনারের তথ্য আপডেট হয়েছে।')).toBeInTheDocument();
  });

  it('deletes a donor after confirmation and shows backend message', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const mocks = [
      donorsQueryMock([existingDonor]),
      {
        request: {
          query: DELETE_DONOR_MUTATION,
          variables: { id: existingDonor.id }
        },
        result: {
          data: {
            deleteDonor: {
              __typename: 'MutationDeleteDonorResponse',
              success: true,
              message: 'Donor and related payments deleted successfully'
            }
          }
        }
      },
      donorsQueryMock([]),
      dashboardSummaryMock()
    ];

    render(
      <MockedProvider mocks={mocks}>
        <Donors />
      </MockedProvider>
    );

    expect(await screen.findByRole('heading', { name: 'ডোনার ম্যানেজমেন্ট' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ডিলিট' }));

    expect(await screen.findByText('Donor and related payments deleted successfully')).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledTimes(1);
  });
});
