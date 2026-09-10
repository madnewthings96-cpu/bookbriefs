import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProtectedRouteDecision } from './authRouteModel';
import { getDashboardIdentityKey } from './dashboard/dashboardIdentityBoundary';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();
  const decision = getProtectedRouteDecision(isAuthReady, isAuthenticated);

  if (decision === 'loading') {
    return <div className="dashboard-auth-loading" role="status">Preparing your reading desk…</div>;
  }
  if (decision === 'redirect') {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  const identityKey = getDashboardIdentityKey(user?.id ?? null, isAuthenticated);
  return <React.Fragment key={identityKey}>{children ?? <Outlet />}</React.Fragment>;
};

export default ProtectedRoute;
