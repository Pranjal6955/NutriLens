import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageSpinner } from './Spinner';

export const RequireAuth = () => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;
  if (status !== 'authenticated') {
    return <Navigate to='/login' state={{ from: location.pathname, payload: location.state }} replace />;
  }

  return <Outlet />;
};

export const RedirectIfAuthenticated = () => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'authenticated') {
    const redirectState = location.state as { from?: string; payload?: unknown };
    const redirectTo = redirectState?.from || '/';
    return <Navigate to={redirectTo} state={redirectState?.payload} replace />;
  }

  return <Outlet />;
};
