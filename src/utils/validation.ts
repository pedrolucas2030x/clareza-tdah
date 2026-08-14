export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export interface SignupValidationResult {
  valid: boolean;
  errors: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

export function validateSignup(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string
): SignupValidationResult {
  const errors: SignupValidationResult['errors'] = {};

  if (fullName.trim().length === 0) {
    errors.fullName = 'required';
  }
  if (!isValidEmail(email)) {
    errors.email = 'invalid';
  }
  if (!isValidPassword(password)) {
    errors.password = 'tooShort';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'mismatch';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
