import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
  Loader2,
  BookOpen,
  Users,
  Video,
  Stethoscope,
  Check,
  Calendar,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";

const roles = [
  {
    id: "student",
    name: "Student",
    description: "Learn from top instructors",
    icon: BookOpen,
  },
  {
    id: "parent",
    name: "Parent",
    description: "Monitor your child's progress",
    icon: Users,
  },
  {
    id: "content_creator",
    name: "Content Creator",
    description: "Create and sell courses",
    icon: Video,
  },
  {
    id: "specialist",
    name: "Specialist",
    description: "Provide expert guidance",
    icon: Stethoscope,
  },
];

// Base schema with common fields for all users
const baseSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  country: z.string().min(1, "Please select a country"),
  otherCountry: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

const studentSchema = baseSchema;

const parentSchema = baseSchema;

const creatorSchema = baseSchema.extend({
  expertise: z.string().min(2, "Area of expertise is required"),
  portfolioUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  cvLink: z.string().url("Please enter a valid CV link").min(1, "CV link is required"),
});

const specialistSchema = baseSchema.extend({
  expertise: z.string().min(2, "Area of expertise is required"),
  portfolioUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  cvLink: z.string().url("Please enter a valid CV link").min(1, "CV link is required"),
});

type RegisterFormData = z.infer<typeof studentSchema> &
  Partial<z.infer<typeof creatorSchema>> &
  Partial<z.infer<typeof specialistSchema>>;

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtherCountry, setShowOtherCountry] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getSchema = () => {
    const schema = (() => {
      switch (selectedRole) {
        case "parent":
          return parentSchema;
        case "content_creator":
          return creatorSchema;
        case "specialist":
          return specialistSchema;
        default:
          return studentSchema;
      }
    })();

    // Add validation for other country field
    return schema
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      })
      .refine(
        (data) => {
          if (data.country === "Other") {
            return data.otherCountry && data.otherCountry.length >= 2;
          }
          return true;
        },
        {
          message: "Please specify your country",
          path: ["otherCountry"],
        }
      );
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      terms: false,
    },
  });

  const watchedPassword = watch("password");

  const roleMapping: Record<string, number> = {
    student: 1,
    parent: 2,
    content_creator: 3,
    specialist: 4,
    admin: 5,
  };

  const onSubmit = async (data: RegisterFormData) => {
  if (!selectedRole) {
    toast({
      title: "Please select a role",
      description: "Choose your account type to continue.",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);
  try {
    const finalCountry = data.country === "Other" ? data.otherCountry : data.country;

    // Base registration data (common for all roles)
    const registerData: any = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: roleMapping[selectedRole],
      dateOfBirth: data.dateOfBirth,
      country: finalCountry,
    };

    // Only add role-specific fields if they exist and the role requires them
    if (selectedRole === "content_creator" || selectedRole === "specialist") {
      registerData.expertise = data.expertise;
      registerData.cvLink = data.cvLink;
      if (data.portfolioUrl && data.portfolioUrl.trim() !== "") {
        registerData.portfolioUrl = data.portfolioUrl;
      }
    }

    console.log("Sending registration data:", registerData);

    await authService.register(registerData);

    toast({
      title: "Account created!",
      description: "Please check your email to verify your account.",
    });
    navigate("/verify-email");
  } catch (error: any) {
    console.error("Registration error:", error.response?.data);

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Registration failed";

    toast({
      title: "Registration failed",
      description: message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleLogin = () => {
    authService.googleAuth();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-2/5 gradient-hero items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-md text-primary-foreground"
        >
          <div className="mb-8 flex">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold font-display mb-4">
            Start Your Learning Journey
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Join our community of learners and educators to unlock your
            potential.
          </p>
          <ul className="space-y-4">
            {[
              "Access to 500+ courses",
              "Learn from industry experts",
              "Earn certificates",
              "Join study groups",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                  <Check className="h-4 w-4 text-accent-foreground" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg space-y-6"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">EduPlatform</span>
          </Link>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold font-display">
              Create your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Choose your role and get started in minutes
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                  selectedRole === role.id
                    ? "border-accent bg-accent/5 shadow-glow"
                    : "border-border hover:border-accent/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                    selectedRole === role.id
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <role.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{role.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {role.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Google Signup */}
          <Button
            variant="outline"
            className="w-full h-12 gap-3"
            onClick={handleGoogleLogin}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or register with email
              </span>
            </div>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            {selectedRole && (
              <motion.form
                key={selectedRole}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder={
                        selectedRole === "student"
                          ? "e.g., Ahmed Ali"
                          : selectedRole === "parent"
                            ? "e.g., Fatima Hassan"
                            : "e.g., Dr. Mohammed Ibrahim"
                      }
                      className="pl-10 h-12"
                      {...register("fullName")}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 h-12"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="pl-10 h-12"
                      {...register("dateOfBirth")}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                    <select
                      id="country"
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register("country", {
                        onChange: (e) => {
                          setShowOtherCountry(e.target.value === "Other");
                        },
                      })}
                    >
                      <option value="">Select your country</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Iraq">Iraq</option>
                      <option value="Jordan">Jordan</option>
                      <option value="Palestine">Palestine</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Syria">Syria</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.country && (
                    <p className="text-sm text-destructive">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                {/* Other Country Input */}
                {showOtherCountry && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="otherCountry">Specify Country</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="otherCountry"
                        placeholder="Enter your country"
                        className="pl-10 h-12"
                        {...register("otherCountry")}
                      />
                    </div>
                    {errors.otherCountry && (
                      <p className="text-sm text-destructive">
                        {errors.otherCountry.message}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Role-specific fields for Content Creator and Specialist */}
                {(selectedRole === "content_creator" ||
                  selectedRole === "specialist") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="expertise">
                          Area of Expertise <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="expertise"
                          placeholder={
                            selectedRole === "content_creator"
                              ? "e.g., Early Childhood Education, Arabic Language, STEM for Kids"
                              : "e.g., Child Psychology, Special Education, Learning Disabilities"
                          }
                          className="h-12"
                          {...register("expertise")}
                        />
                        {errors.expertise && (
                          <p className="text-sm text-destructive">
                            {errors.expertise.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="portfolioUrl">
                          Portfolio URL (Optional)
                        </Label>
                        <Input
                          id="portfolioUrl"
                          placeholder="https://yourportfolio.com"
                          className="h-12"
                          {...register("portfolioUrl")}
                        />
                        {errors.portfolioUrl && (
                          <p className="text-sm text-destructive">
                            {errors.portfolioUrl.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cvLink">
                          CV Link <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="cvLink"
                          placeholder="https://drive.google.com/your-cv or https://linkedin.com/in/yourprofile"
                          className="h-12"
                          {...register("cvLink")}
                        />
                        {errors.cvLink && (
                          <p className="text-sm text-destructive">
                            {errors.cvLink.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10 h-12"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                  <PasswordStrength password={watchedPassword || ""} />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 h-12"
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-2">
                  <Controller
                    name="terms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link to="/terms" className="text-accent hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-accent hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-destructive">
                    {errors.terms.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {!selectedRole && (
            <p className="text-center text-muted-foreground">
              Select your role above to continue registration
            </p>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}