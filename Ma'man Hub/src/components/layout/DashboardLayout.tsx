import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Trophy,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  BarChart3,
  User,
  Bell,
  ChevronDown,
  Users,
  DollarSign,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";

// import { useAuthStore } from "@/stores/authStore";

interface DashboardLayoutProps {
  children: ReactNode;
}

const studentNavigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: Home },
  { name: "My Courses", href: "/student/my-courses", icon: BookOpen },
  { name: "Messages", href: "/student/messages", icon: MessageSquare },
  { name: "Group Chats", href: "/student/groups", icon: Users },
  { name: "Achievements", href: "/student/achievements", icon: Trophy },
  { name: "Profile", href: "/student/profile", icon: User },
  { name: "Settings", href: "/student/settings", icon: Settings },
];

const creatorNavigation = [
  { name: "Dashboard", href: "/content-creator/dashboard", icon: Home },
  { name: "Upload Video", href: "/content-creator/upload", icon: BarChart3 },
  { name: "Go Live", href: "/content-creator/go-live", icon: BookOpen },
  { name: "Messages", href: "/content-creator/messages", icon: MessageSquare },
  { name: "Profile", href: "/content-creator/profile", icon: User },
  { name: "Settings", href: "/content-creator/settings", icon: Settings },
];

const specialistNavigation = [
  { name: "Dashboard", href: "/specialist/dashboard", icon: Home },
  { name: "My Sessions", href: "/specialist/sessions", icon: BookOpen },
  { name: "Messages", href: "/specialist/messages", icon: MessageSquare },
  { name: "Profile", href: "/specialist/profile", icon: User },
  { name: "Settings", href: "/specialist/settings", icon: Settings },
];

const parentNavigation = [
  { name: "Dashboard", href: "/parent/dashboard", icon: Home },
  { name: "My Children", href: "/parent/children", icon: Users },
  { name: "Messages", href: "/parent/messages", icon: MessageSquare },
  { name: "Profile", href: "/parent/profile", icon: User },
  { name: "Settings", href: "/parent/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Users", href: "/admin/users", icon: User },
  { name: "Moderation", href: "/admin/moderation", icon: Shield },
  { name: "Financial", href: "/admin/financial", icon: DollarSign },
  { name: "Profile", href: "/admin/profile", icon: User },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // const { user, logout } = useAuthStore();

  // Get user from localStorage with error handling
  const getUserData = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const user = getUserData();

  // Redirect to login if no user data
  if (!user) {
    navigate("/login");
    return null;
  }

  // Get user data from localStorage
  const fullName = user?.fullName || "User";
  const role = user?.role || "Student";
  const profilePictureUrl = user?.profilePictureUrl;

  // Get initials from full name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Determine navigation based on role (case-insensitive and handles variations)
  const getNavigationForRole = (userRole: string) => {
    const roleLower = userRole.toLowerCase().trim();
    
    // Admin role
    if (roleLower === "admin") {
      return adminNavigation;
    }
    
    // Content Creator role (handle multiple variations)
    if (roleLower === "contentcreator" || 
        roleLower === "content-creator" || 
        roleLower === "content creator") {
      return creatorNavigation;
    }
    
    // Specialist role
    if (roleLower === "specialist") {
      return specialistNavigation;
    }
    
    // Parent role
    if (roleLower === "parent") {
      return parentNavigation;
    }
    
    // Student role (default)
    return studentNavigation;
  };

  const navigation = getNavigationForRole(role);

  // Get display role name
  const getDisplayRole = (userRole: string): string => {
    const roleLower = userRole.toLowerCase().trim();
    
    if (roleLower === "admin") return "Admin";
    if (roleLower === "contentcreator" || roleLower === "content-creator" || roleLower === "content creator") {
      return "Content Creator";
    }
    if (roleLower === "specialist") return "Specialist";
    if (roleLower === "parent") return "Parent";
    return "Student";
  };

  const displayRole = getDisplayRole(role);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">EduPlatform</span>
        </Link>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-sidebar p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                    <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-sidebar-foreground">
                    EduPlatform
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sidebar-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sidebar-foreground/70"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen flex-col bg-sidebar transition-all duration-300 lg:flex",
          sidebarOpen ? "w-64" : "w-20",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {sidebarOpen && (
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              EduPlatform
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !sidebarOpen && "justify-center px-0",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && item.name}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          <div
            className={cn(
              "flex items-center gap-3",
              !sidebarOpen && "justify-center",
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={profilePictureUrl} alt={fullName} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {fullName}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {displayRole}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              sidebarOpen ? "rotate-90" : "-rotate-90",
            )}
          />
        </Button>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20",
        )}
      >
        {/* Desktop Header */}
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur lg:flex">
          <h1 className="text-lg font-semibold">
            {navigation.find((n) => n.href === location.pathname)?.name ||
              "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                3
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}