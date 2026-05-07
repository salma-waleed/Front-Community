import { Navigate, useLocation } from "react-router-dom";

export type UserRole =
  | "Admin"
  | "ContentCreator"
  | "Parent"
  | "Student"
  | "Specialist";

interface StoredUser {
  id: string;
  fullName: string;
  role: UserRole;
  isFirstLogin: boolean;
  profilePictureUrl: string | null;
}

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

interface ProtectedRouteProps {
  element?: React.ReactElement;
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ element, children, allowedRoles = [] }: ProtectedRouteProps) => {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Support both usage patterns
  return <>{element ?? children}</>;
};

export default ProtectedRoute;

export function roleHome(role: UserRole): string {
  switch (role) {
    case "Admin":          return "/admin/dashboard";
    case "ContentCreator": return "/ContentCreator/dashboard";
    case "Parent":         return "/parent/dashboard";
    case "Student":        return "/student/dashboard";
    case "Specialist":     return "/specialist/dashboard";
    default:               return "/";
  }
}