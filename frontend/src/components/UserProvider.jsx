import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

// Create a context for user role management
const UserRoleContext = createContext();

export function UserProvider({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [role, setRole] = useState("guest"); // Default role is guest
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (isLoaded && isSignedIn) {
        try {
          // First check if the user has role in public metadata
          if (user.publicMetadata?.role) {
            setRole(user.publicMetadata.role);
          } else {
            // For development, set a default role instead of trying to fetch from backend
            // This avoids the error when the backend isn't running or endpoint doesn't exist
            
            // DEVELOPMENT MODE: Set default role based on user email
            // In production, you would fetch this from your API
            if (user.primaryEmailAddress?.emailAddress?.includes('owner')) {
              setRole('owner');
            } else {
              setRole('user');
            }
            
            /* PRODUCTION MODE: Uncomment this when your backend is ready
            const response = await fetch(`/api/users/${user.id}/role`);
            if (response.ok) {
              const data = await response.json();
              setRole(data.role || "user"); // Default to regular user if no role specified
            } else {
              setRole("user"); // Default role if fetch fails
            }
            */
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          setRole("user"); // Default role if fetch fails
        }
      } else if (isLoaded && !isSignedIn) {
        setRole("guest");
      }
      setIsLoading(false);
    }

    fetchUserRole();
  }, [isLoaded, isSignedIn, user]);

  // Check if user has the specified role
  const hasRole = (requiredRole) => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  };

  return (
    <UserRoleContext.Provider value={{ role, hasRole, isRoleLoading: isLoading }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserProvider");
  }
  return context;
};