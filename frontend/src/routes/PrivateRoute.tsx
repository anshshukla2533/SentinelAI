import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { LoadingScreen } from '../components/common';

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!authLoaded) {
    return <LoadingScreen label="Checking your session..." />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}