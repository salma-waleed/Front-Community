import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";

// Profile Pages
import AdminProfilePage from "./pages/profile/AdminProfilePage";
import CreatorProfilePage from "./pages/profile/CreatorProfilePage";
import ParentProfilePage from "./pages/profile/ParentProfilePage";
import StudentProfilePage from "./pages/profile/StudentProfilePage";

// spcialist pages
import SpecialistProfilePage from "./pages/profile/SpecialistProfilePage";

// Admin Pages
import UserManagementPage from "./pages/admin/UserManagementPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          {/* Creator Routes */}
          <Route path="/creator/profile" element={<CreatorProfilePage />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />

          {/* Parent Routes */}
          <Route path="/parent/profile" element={<ParentProfilePage />} />

          {/* Specialist Routes */}
          <Route
            path="/specialist/profile"
            element={<SpecialistProfilePage />}
          />

          {/* Student Dashboard Routes */}
          <Route path="/profile" element={<StudentProfilePage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
