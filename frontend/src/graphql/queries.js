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

export const DONORS_PAGE_QUERY = gql`
  query DonorsPage($search: String, $address: String, $offset: Int, $limit: Int) {
    donorsPage(search: $search, address: $address, offset: $offset, limit: $limit) {
      items {
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
      total
      offset
      limit
      hasMore
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

export const DONOR_PAYMENTS_QUERY = gql`
  query DonorPayments($donorId: String!) {
    donorPayments(donorId: $donorId) {
      id
      amount
      payment_date
      created_at
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      phone
      role
    }
  }
`;

export const USERS_QUERY = gql`
  query Users {
    users {
      id
      name
      email
      phone
      role
      created_at
    }
  }
`;

export const APP_SETTINGS_QUERY = gql`
  query AppSettings {
    appSettings {
      allow_donor_delete
      updated_at
    }
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
      payments {
        id
        donor_serial
        donor_name
        donor_address
        amount
        payment_date
        collector_name
      }
    }
  }
`;
