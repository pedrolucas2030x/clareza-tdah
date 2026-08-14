import { isValidEmail, isValidPassword, validateSignup } from '../validation';

describe('isValidEmail', () => {
  it('accepts a well-formed email', () => {
    expect(isValidEmail('ana@example.com')).toBe(true);
  });

  it('rejects an email without @', () => {
    expect(isValidEmail('ana.example.com')).toBe(false);
  });

  it('rejects an email without domain', () => {
    expect(isValidEmail('ana@')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts a password with 8 or more characters', () => {
    expect(isValidPassword('12345678')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(isValidPassword('1234567')).toBe(false);
  });
});

describe('validateSignup', () => {
  it('is valid when every field is correct and passwords match', () => {
    const result = validateSignup('Ana Silva', 'ana@example.com', '12345678', '12345678');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('flags an empty full name', () => {
    const result = validateSignup('  ', 'ana@example.com', '12345678', '12345678');
    expect(result.valid).toBe(false);
    expect(result.errors.fullName).toBe('required');
  });

  it('flags an invalid email', () => {
    const result = validateSignup('Ana Silva', 'not-an-email', '12345678', '12345678');
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBe('invalid');
  });

  it('flags a short password', () => {
    const result = validateSignup('Ana Silva', 'ana@example.com', '123', '123');
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBe('tooShort');
  });

  it('flags mismatched password confirmation', () => {
    const result = validateSignup('Ana Silva', 'ana@example.com', '12345678', '87654321');
    expect(result.valid).toBe(false);
    expect(result.errors.confirmPassword).toBe('mismatch');
  });
});
