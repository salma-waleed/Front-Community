import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: "Weak", color: "bg-destructive" };
  } else if (score <= 4) {
    return { score, label: "Fair", color: "bg-warning" };
  } else if (score <= 5) {
    return { score, label: "Good", color: "bg-info" };
  } else {
    return { score, label: "Strong", color: "bg-success" };
  }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = getPasswordStrength(password);
  const maxScore = 6;
  const percentage = (score / maxScore) * 100;

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength</span>
        <span className={cn("font-medium", {
          "text-destructive": label === "Weak",
          "text-warning": label === "Fair",
          "text-info": label === "Good",
          "text-success": label === "Strong",
        })}>
          {label}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-300", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
