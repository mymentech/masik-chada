import { gql } from '@apollo/client';

export const DASHBOARD_SUMMARY_QUERY = gql`
  query Dashboard {
    dashboard {
      totalDonors
      thisMonthCollected
      totalBalance
      totalCollectors
    }
  }
`;

export const DONORS_QUERY = gql`
  query Donors($search: String, $address: String) {
    donors(search: $search, address: $address) {
      id
      serial_number
      name
      phone
      address
      monthly_amount
      registration_date
      due_from
      total_due
      total_paid
      balance
    }
  }
`;

export const DONOR_QUERY = gql`
  query Donor($id: String!) {
    donor(id: $id) {
      id
      serial_number
      name
      phone
      address
      monthly_amount
      registration_date
      due_from
      total_due
      total_paid
      balance
    }
  }
`;

export const ADDRESSES_QUERY = gql`
  query Addresses {
    addresses
  }
`;

export const MONTHLY_REPORT_QUERY = gql`
  query MonthlyReport($month: String!) {
    monthlyReport(month: $month) {
      collected
      totalBalance
      byCollector {
        name
        total
      }
    }
  }
`;
