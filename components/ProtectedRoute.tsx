import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProtectedRouteDecision } from './authRouteModel';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();
  const decision = getProtectedRouteDecision(isAuthReady, isAuthenticated);

  if (decision === 'loading') {
    return <div className="dashboard-auth-loading" role="status">Preparing your reading desk…</div>;
  }
  if (decision === 'redirect') {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
