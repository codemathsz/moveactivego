
export interface ResetPasswordConfirmation {
  email: string;
  code: string;
  new_password: string;
  new_password_confirmation: string
}