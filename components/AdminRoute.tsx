import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import PrivatePageSEO from './PrivatePageSEO';
import { isAdminIdentity } from '../utils/adminAuth';

type AdminGateUser = {
  id?: string;
  uid?: string;
  email?: string | null;
  name?: string | null;
} | null;

type AdminGateProps = {
  user: AdminGateUser;
  loading: boolean;
  children: React.ReactNode;
};

export function AdminGate({ user, loading, children }: AdminGateProps) {
  const location = useLocation();

  if (loading) {
    return (
      <section className="admin-news-access" role="status" aria-live="polite">
        <span className="admin-news-kicker">Newsroom</span>
        <h1>Checking editorial access</h1>
        <p>Confirming your publishing account…</p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdminIdentity(user)) {
    return (
      <section className="admin-news-access" aria-labelledby="admin-access-denied-title">
        <span className="admin-news-kicker">Private workspace</span>
        <h1 id="admin-access-denied-title">Access denied</h1>
        <p>This account does not have permission to publish market news.</p>
        <Link to="/news">Return to Market News</Link>
      </section>
    );
  }

  return <>{children}</>;
}

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useFirebase();

  return (
    <>
      <PrivatePageSEO />
      <AdminGate user={currentUser} loading={loading}>{children}</AdminGate>
    </>
  );
}
