import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;

export const RECORD_PAYMENT_MUTATION = gql`
  mutation RecordPayment($donorId: String!, $amount: Float!, $paymentDate: String!) {
    recordPayment(donorId: $donorId, amount: $amount, paymentDate: $paymentDate) {
      payment {
        id
        donor_id
        amount
        payment_date
        created_at
      }
      donor {
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
      dashboard {
        totalDonors
        thisMonthCollected
        totalBalance
        totalCollectors
      }
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

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      phone
      role
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      phone
      role
    }
  }
`;

export const ADMIN_UPDATE_USER_MUTATION = gql`
  mutation AdminUpdateUser($id: String!, $input: AdminUpdateUserInput!) {
    adminUpdateUser(id: $id, input: $input) {
      id
      name
      email
      phone
      role
    }
  }
`;

export const ADMIN_RESET_PASSWORD_MUTATION = gql`
  mutation AdminResetUserPassword($id: String!, $newPassword: String!) {
    adminResetUserPassword(id: $id, newPassword: $newPassword)
  }
`;

export const ADMIN_DELETE_USER_MUTATION = gql`
  mutation AdminDeleteUser($id: String!, $reassignToUserId: String!) {
    adminDeleteUser(id: $id, reassignToUserId: $reassignToUserId)
  }
`;

export const UPDATE_APP_SETTINGS_MUTATION = gql`
  mutation UpdateAppSettings($allowDonorDelete: Boolean, $allowPaymentDelete: Boolean) {
    updateAppSettings(
      allowDonorDelete: $allowDonorDelete
      allowPaymentDelete: $allowPaymentDelete
    ) {
      allow_donor_delete
      allow_payment_delete
      updated_at
    }
  }
`;

export const DELETE_PAYMENT_MUTATION = gql`
  mutation DeletePayment($id: String!) {
    deletePayment(id: $id) {
      donor {
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
      dashboard {
        totalDonors
        thisMonthCollected
        totalBalance
        totalCollectors
      }
    }
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;
