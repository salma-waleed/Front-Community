import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./ProtectedRoute.tsx";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage.tsx";
import CompleteProfilePage from "./pages/auth/CompleteProfilePage";
import RegistrationPendingPage from "./pages/auth/RegistrationPendingPage";

// Course Pages
import CoursesCatalogPage from "./pages/courses/CoursesCatalogPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import CoursePlayerPage from "./pages/courses/CoursePlayerPage";

// Cart & Checkout Pages
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage";

// Dashboard Pages
import StudentDashboardPage from "./pages/dashboard/StudentDashboardPage";
import MyCoursesPage from "./pages/dashboard/MyCoursesPage";
import CourseProgressPage from "./pages/dashboard/CourseProgressPage";
import CalendarPage from "./pages/dashboard/CalendarPage";

// Quiz Pages
import QuizPage from "./pages/quiz/QuizPage";

// Messages Pages
import MessagesPage from "./pages/messages/MessagesPage";
import GroupChatPage from "./pages/messages/GroupChatPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import FinancialOverviewPage from "./pages/admin/FinancialOverviewPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import ContentModerationPage from "./pages/admin/ContentModerationPage";
import AdminUserDetailPage from "@/pages/admin/AdminUserDetailPage";

// Profile Pages
import AdminProfilePage from "./pages/profile/AdminProfilePage";
import CreatorProfilePage from "./pages/profile/CreatorProfilePage";
import ParentProfilePage from "./pages/profile/ParentProfilePage";
import StudentProfilePage from "./pages/profile/StudentProfilePage";
import SpecialistProfilePage from "./pages/profile/SpecialistProfilePage";
import AcceptInvitePage from "./pages/profile/AcceptInvitePage";
import PublicProfilePage from "./pages/profile/PublicProfilePage";

// Creator Pages
import UploadVideoPage from "./pages/creator/UploadVideoPage";
import CreatorDashboardPage from "./pages/creator/CreatorDashboardPage";
import GoLivePage from "./pages/creator/GoLivePage";

// Live Session Pages
import LiveSessionPage from "./pages/live/LiveSessionPage";

// Parent Pages
import ParentDashboardPage from "./pages/parent/ParentDashboardPage";

const queryClient = new QueryClient();

const ADMIN = ["Admin"] as const;
const CREATOR = ["ContentCreator", "Admin"] as const;
const SPECIALIST = ["Specialist", "Admin"] as const;
const PARENT = ["Parent", "Admin"] as const;
const STUDENT_FAMILY = ["Student", "Parent", "Admin"] as const;
const ALL_AUTHENTICATED = [
  "Student",
  "Parent",
  "Specialist",
  "ContentCreator",
  "Admin",
] as const;
const BUYERS = ["Student", "Parent", "Admin"] as const;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ── Public ───────────────────────────────────────────────────────── */}
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<CoursesCatalogPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/profile/:userId" element={<PublicProfilePage />} />

          {/* ── Auth (no protection needed) ──────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route
            path="/registration-pending"
            element={<RegistrationPendingPage />}
          />

          {/* ── Admin ────────────────────────────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={[...ADMIN]}
                element={<AdminDashboardPage />}
              />
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute
                allowedRoles={[...ADMIN]}
                element={<AdminProfilePage />}
              />
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute
                allowedRoles={[...ADMIN]}
                element={<UserManagementPage />}
              />
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <ProtectedRoute
                allowedRoles={[...ADMIN]}
                element={<AdminUserDetailPage />}
              />
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <ProtectedRoute
                allowedRoles={[...ADMIN]}
                element={<ContentModerationPage />}
              />
            }
          />
          <Route
            path="/admin/financial"
            element={
              <ProtectedRoute
                allowedRoles={[...ADMIN]}
                element={<FinancialOverviewPage />}
              />
            }
          />

          {/* ── Creator ──────────────────────────────────────────────────────── */}
          <Route
            path="/creator"
            element={
              <ProtectedRoute
                allowedRoles={[...CREATOR]}
                element={<CreatorDashboardPage />}
              />
            }
          />
          <Route
            path="/content-creator/profile"
            element={
              <ProtectedRoute
                allowedRoles={[...CREATOR]}
                element={<CreatorProfilePage />}
              />
            }
          />
          <Route
            path="/creator/upload"
            element={
              <ProtectedRoute
                allowedRoles={[...CREATOR]}
                element={<UploadVideoPage />}
              />
            }
          />
          <Route
            path="/creator/go-live"
            element={
              <ProtectedRoute
                allowedRoles={[...CREATOR]}
                element={<GoLivePage />}
              />
            }
          />

          {/* ── Specialist ───────────────────────────────────────────────────── */}
          <Route
            path="/specialist/profile"
            element={
              <ProtectedRoute
                allowedRoles={[...SPECIALIST]}
                element={<SpecialistProfilePage />}
              />
            }
          />

          {/* ── Parent ───────────────────────────────────────────────────────── */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute
                allowedRoles={[...PARENT]}
                element={<ParentDashboardPage />}
              />
            }
          />
          <Route
            path="/parent/profile"
            element={
              <ProtectedRoute
                allowedRoles={[...PARENT]}
                element={<ParentProfilePage />}
              />
            }
          />

          {/* ── Student ──────────────────────────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[...STUDENT_FAMILY]}
                element={<StudentDashboardPage />}
              />
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute
                allowedRoles={[...STUDENT_FAMILY]}
                element={<MyCoursesPage />}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                allowedRoles={[...STUDENT_FAMILY]}
                element={<StudentProfilePage />}
              />
            }
          />
          <Route
            path="student/profile"
            element={
              <ProtectedRoute
                allowedRoles={[...STUDENT_FAMILY]}
                element={<StudentProfilePage />}
              />
            }
          />
          <Route
            path="student/accept-invite"
            element={
              <ProtectedRoute
                allowedRoles={[...STUDENT_FAMILY]}
                element={<AcceptInvitePage />}
              />
            }
          />
          <Route path="/calendar" element={<CalendarPage />} />

          {/* ── Course Learning ───────────────────────────────────────────────── */}
          <Route
            path="/course/:courseId/learn"
            element={
              <ProtectedRoute
                allowedRoles={[...ALL_AUTHENTICATED]}
                element={<CoursePlayerPage />}
              />
            }
          />
          <Route
            path="/course/:courseId/progress"
            element={
              <ProtectedRoute
                allowedRoles={[...ALL_AUTHENTICATED]}
                element={<CourseProgressPage />}
              />
            }
          />
          <Route
            path="/course/:courseId/quiz/:quizId"
            element={
              <ProtectedRoute
                allowedRoles={[...ALL_AUTHENTICATED]}
                element={<QuizPage />}
              />
            }
          />

          {/* ── Live Sessions ─────────────────────────────────────────────────── */}
          <Route
            path="/live/:sessionId"
            element={
              <ProtectedRoute
                allowedRoles={[...ALL_AUTHENTICATED]}
                element={<LiveSessionPage />}
              />
            }
          />

          {/* ── Messages ──────────────────────────────────────────────────────── */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute
                allowedRoles={[...ALL_AUTHENTICATED]}
                element={<MessagesPage />}
              />
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute
                allowedRoles={[...ALL_AUTHENTICATED]}
                element={<GroupChatPage />}
              />
            }
          />

          {/* ── Cart & Checkout ───────────────────────────────────────────────── */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute
                allowedRoles={[...BUYERS]}
                element={<CartPage />}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute
                allowedRoles={[...BUYERS]}
                element={<CheckoutPage />}
              />
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <ProtectedRoute
                allowedRoles={[...BUYERS]}
                element={<OrderConfirmationPage />}
              />
            }
          />

          {/* ── 404 ───────────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
