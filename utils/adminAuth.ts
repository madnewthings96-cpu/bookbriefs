export const ADMIN_UID = 'ME2iHxeBWgcSTpc1HKwKbSCrQ7t2';
export const ADMIN_EMAIL = 'belhalyt01@proton.me';

export const isAdminIdentity = (user: { id?: string; uid?: string; email?: string | null } | null) => (
  !!user && (user.id === ADMIN_UID || user.uid === ADMIN_UID || user.email === ADMIN_EMAIL)
);
