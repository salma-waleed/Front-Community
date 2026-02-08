import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

type VerificationState = "loading" | "success" | "error" | "pending";

export default function EmailVerificationPage() {
  const [state, setState] = useState<VerificationState>("pending");
  const [isResending, setIsResending] = useState(false);
  const [emailForResend, setEmailForResend] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get email from various sources on component mount
  useEffect(() => {
    const email = getEmailFromSources();
    if (email) {
      setEmailForResend(email);
    }
  }, [searchParams]);

  // Helper function to get email from multiple sources
  const getEmailFromSources = (): string => {
    // Priority 1: URL parameter (passed from registration page)
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      return emailFromUrl;
    }

    // Priority 2: Session storage (temporary, cleared on tab close)
    const emailFromSession = sessionStorage.getItem("pending_verification_email");
    if (emailFromSession) {
      return emailFromSession;
    }

    // Priority 3: Local storage (persists across sessions)
    const emailFromLocal = localStorage.getItem("pending_verification_email");
    if (emailFromLocal) {
      return emailFromLocal;
    }

    return "";
  };

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      // If there's a token in the URL, verify it immediately
      if (token) {
        setState("loading");
        try {
          // Call authService to verify email
          await authService.verifyEmail(token);
          
          // Clear stored email after successful verification
          sessionStorage.removeItem("pending_verification_email");
          localStorage.removeItem("pending_verification_email");
          
          setState("success");
          toast({
            title: "Success!",
            description: "Your email has been verified successfully.",
          });
        } catch (error: any) {
          console.error("Verification error:", error);
          setState("error");
          toast({
            title: "Verification failed",
            description: error.response?.data?.message || "Failed to verify email. The link may have expired.",
            variant: "destructive",
          });
        }
      }
      // If no token, stay in "pending" state (waiting for user to check email)
    };

    verifyEmail();
  }, [searchParams, toast]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      let userEmail = emailForResend || getEmailFromSources();
      
      // If still no email, try to get current user
      if (!userEmail) {
        try {
          const currentUser = await authService.getCurrentUser();
          userEmail = currentUser.email;
        } catch (error) {
          // User is not authenticated
        }
      }
      
      if (!userEmail) {
        // Show email input field as last resort
        setShowEmailInput(true);
        setIsResending(false);
        toast({
          title: "Email required",
          description: "Please enter your email address to resend verification.",
          variant: "default",
        });
        return;
      }

      // Call authService to resend verification
      await authService.resendVerification(userEmail);
      
      // Store email for future resend attempts
      sessionStorage.setItem("pending_verification_email", userEmail);
      
      toast({
        title: "Email sent!",
        description: `A new verification email has been sent to ${userEmail}. Please check your inbox.`,
      });
      setShowEmailInput(false);
    } catch (error: any) {
      console.error("Resend error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold">EduPlatform</span>
        </Link>

        {state === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent" />
            <h1 className="text-2xl font-bold font-display">
              Verifying your email...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </motion.div>
        )}

        {state === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold font-display">Email verified!</h1>
            <p className="text-muted-foreground">
              Your email has been successfully verified. You can now log in to
              access all features of your account.
            </p>
            <Link to="/login">
              <Button className="w-full h-12 mt-6">Go to Login</Button>
            </Link>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold font-display">
              Verification failed
            </h1>
            <p className="text-muted-foreground">
              The verification link may have expired or is invalid. Please
              request a new verification email.
            </p>
            
            {showEmailInput && (
              <div className="space-y-2 mt-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={emailForResend}
                  onChange={(e) => setEmailForResend(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full h-12 mt-6"
              onClick={handleResendVerification}
              disabled={isResending || (showEmailInput && !emailForResend)}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
          </motion.div>
        )}

        {state === "pending" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-info/10">
              <Mail className="h-8 w-8 text-info" />
            </div>
            <h1 className="text-3xl font-bold font-display">
              Check your email
            </h1>
            <p className="text-muted-foreground">
              We've sent a verification link to{" "}
              {emailForResend && (
                <span className="font-semibold">{emailForResend}</span>
              )}
              {!emailForResend && "your email address"}. Click the link to verify
              your account and get started.
            </p>
            <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                Didn't receive the email? Check your spam folder or click the
                button below to resend.
              </p>
            </div>
            
            {showEmailInput && (
              <div className="space-y-2 mt-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={emailForResend}
                  onChange={(e) => setEmailForResend(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={handleResendVerification}
              disabled={isResending || (showEmailInput && !emailForResend)}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                Back to login
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}