import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 1. General Authentication Guard
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  // If not logged in, intercept and send to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, allow navigation to nested child routes
  return <Outlet />;
}

// 2. Role-Based Authorization Guard
export function RoleProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  // If no user profile loaded (safety fallback), route to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if active user role is authorized for this route
  const isAuthorized = allowedRoles.includes(user.role);

  if (!isAuthorized) {
    // If a logged-in Customer attempts to view Restaurant Dashboard, redirect to Customer Dashboard
    if (user.role === 'customer') {
      return <Navigate to="/customer-dashboard" replace />;
    }
    // If a logged-in Restaurant attempts to view Customer Dashboard, redirect to Restaurant Dashboard
    if (user.role === 'restaurant') {
      return <Navigate to="/restaurant-dashboard" replace />;
    }
    // Fallback redirect for unrecognized user types
    return <Navigate to="/" replace />;
  }

  // If authorized, proceed to render layout
  return <Outlet />;
}
