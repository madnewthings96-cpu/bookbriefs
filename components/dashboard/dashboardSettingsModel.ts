export interface SettingsSignInMethod {
  label: string;
  description: string;
  canResetPassword: boolean;
}

export interface SettingsDisplayNameValidation {
  value: string;
  error: string | null;
}

export const getSettingsSignInMethod = (providerIds: readonly string[]): SettingsSignInMethod => {
  const providers = new Set(providerIds);
  const hasPassword = providers.has('password');
  const hasGoogle = providers.has('google.com');

  if (hasPassword) {
    return {
      label: hasGoogle ? 'Email, password, and Google' : 'Email and password',
      description: 'Use a secure email link to choose a new password.',
      canResetPassword: true,
    };
  }

  if (hasGoogle) {
    return {
      label: 'Google',
      description: 'Password changes are managed by Google.',
      canResetPassword: false,
    };
  }

  return {
    label: 'Your sign-in provider',
    description: 'Manage your password with the provider you used to create this account.',
    canResetPassword: false,
  };
};

export const validateSettingsDisplayName = (name: string): SettingsDisplayNameValidation => {
  const value = name.trim();
  return value
    ? { value, error: null }
    : { value, error: 'Enter a display name.' };
};
