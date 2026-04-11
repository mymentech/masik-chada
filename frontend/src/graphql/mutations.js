import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const RECORD_PAYMENT_MUTATION = gql`
  mutation RecordPayment($donorId: String!, $amount: Float!, $paymentDate: String!) {
    recordPayment(donorId: $donorId, amount: $amount, paymentDate: $paymentDate) {
      id
      donor_id
      amount
      payment_date
      created_at
    }
  }
`;

export const CREATE_DONOR_MUTATION = gql`
  mutation CreateDonor($input: DonorInput!) {
    createDonor(input: $input) {
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

export const UPDATE_DONOR_MUTATION = gql`
  mutation UpdateDonor($id: String!, $input: DonorInput!) {
    updateDonor(id: $id, input: $input) {
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

export const DELETE_DONOR_MUTATION = gql`
  mutation DeleteDonor($id: String!) {
    deleteDonor(id: $id) {
      success
      message
    }
  }
`;
