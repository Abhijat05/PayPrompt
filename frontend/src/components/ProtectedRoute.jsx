import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useUserRole } from "./UserProvider";

export function ProtectedRoute({ children, allowedRoles, redirectPath = "/" }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { hasRole, isRoleLoading } = useUserRole();

  // Show loading if auth or role is still loading
  if (!isLoaded || isRoleLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not signed in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  // Check if user has required role(s)
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to={redirectPath} />;
  }

  return children;
}