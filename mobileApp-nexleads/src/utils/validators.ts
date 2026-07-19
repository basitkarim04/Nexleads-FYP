export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Must contain at least one number' };
  }
  return { valid: true };
}

export function validateLoginForm(email: string, password: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Enter a valid email address';
  if (!password.trim()) return 'Password is required';
  return null;
}

export function validateSignupForm(name: string, email: string, password: string): string | null {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!email.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Enter a valid email address';
  const pwResult = isValidPassword(password);
  if (!pwResult.valid) return pwResult.message ?? 'Invalid password';
  return null;
}

export function validateOtp(otp: string): string | null {
  if (otp.length !== 6) return 'Enter the 6-digit code';
  if (!/^\d+$/.test(otp)) return 'OTP must be numeric';
  return null;
}
