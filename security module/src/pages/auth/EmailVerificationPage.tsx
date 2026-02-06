import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type VerificationState = "loading" | "success" | "error" | "pending";

export default function EmailVerificationPage() {
  const [state, setState] = useState<VerificationState>("pending");
  const [isResending, setIsResending] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      if (token && type === "email") {
        setState("loading");
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "email",
          });

          if (error) {
            setState("error");
          } else {
            setState("success");
          }
        } catch (error) {
          setState("error");
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: user.email,
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Email sent!",
            description: "A new verification email has been sent.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email.",
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
              Your email has been successfully verified. You can now access all
              features of your account.
            </p>
            <Link to="/dashboard">
              <Button className="w-full h-12 mt-6">Go to Dashboard</Button>
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
            <Button
              variant="outline"
              className="w-full h-12 mt-6"
              onClick={handleResendVerification}
              disabled={isResending}
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
              We've sent a verification link to your email address. Click the
              link to verify your account and get started.
            </p>
            <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                Didn't receive the email? Check your spam folder or click the
                button below to resend.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={handleResendVerification}
              disabled={isResending}
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
