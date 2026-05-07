import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays, Clock, Video, ExternalLink,
  CheckCircle2, XCircle, HourglassIcon, User,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAfter, parseISO, isBefore } from "date-fns";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { appointmentService, AppointmentDto } from "@/services/appointmentService";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Pending: {
    label: "Pending payment",
    className: "bg-amber-100 text-amber-800",
    icon: <HourglassIcon className="h-3.5 w-3.5" />,
  },
  Confirmed: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  Completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
} as const;

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({
  session,
  onCancel,
  onComplete,
}: {
  session: AppointmentDto;
  onCancel: (s: AppointmentDto) => void;
  onComplete: (s: AppointmentDto) => void;
}) {
  const cfg = STATUS_CONFIG[session.status as keyof typeof STATUS_CONFIG];
  const initials = (session.studentName || "S")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Left accent stripe */}
          <div
            className={`w-full sm:w-1.5 shrink-0 ${
              session.status === "Confirmed"
                ? "bg-green-400"
                : session.status === "Pending"
                ? "bg-amber-400"
                : session.status === "Cancelled"
                ? "bg-red-300"
                : "bg-blue-400"
            }`}
          />

          <div className="flex-1 p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Student avatar */}
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={(session as any).studentProfilePictureUrl ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold">{session.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {session.studentName || "Student"}
                    </p>
                  </div>
                  <Badge className={`flex items-center gap-1 text-xs ${cfg.className}`}>
                    {cfg.icon} {cfg.label}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {session.appointmentDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {session.startTime} – {session.endTime}
                  </span>
                  {session.amountPaid != null && (
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <DollarSign className="h-3.5 w-3.5" />
                      {session.amountPaid.toFixed(2)} received
                    </span>
                  )}
                </div>

                {session.description && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {session.description}
                  </p>
                )}

                {/* Google Meet link */}
                {session.status === "Confirmed" && session.googleMeetLink && (
                  <a
                    href={session.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Join Google Meet
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* Cancellation reason */}
                {session.status === "Cancelled" && session.cancellationReason && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Reason: {session.cancellationReason}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col items-center gap-2 shrink-0">
                {session.status === "Confirmed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => onComplete(session)}
                  >
                    Mark Complete
                  </Button>
                )}
                {session.canCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onCancel(session)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpecialistSessionsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [cancelTarget, setCancelTarget] = useState<AppointmentDto | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [completeTarget, setCompleteTarget] = useState<AppointmentDto | null>(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["specialist-sessions", user?.id],
    queryFn: () => appointmentService.getMySessionsAsSpecialist(),
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentService.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialist-sessions"] });
      toast({ title: "Session Cancelled", description: "The student has been notified." });
      setCancelTarget(null);
      setCancelReason("");
    },
    onError: (err: any) => {
      toast({
        title: "Cannot cancel",
        description: err.response?.data?.message ?? "Failed to cancel session.",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => appointmentService.completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialist-sessions"] });
      toast({ title: "Session marked as complete!" });
      setCompleteTarget(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.response?.data?.message ?? "Failed to complete session.",
        variant: "destructive",
      });
    },
  });

  const upcoming = sessions.filter(
    (s) =>
      (s.status === "Pending" || s.status === "Confirmed") &&
      isAfter(parseISO(`${s.appointmentDate}T${s.endTime}:00`), new Date())
  );

  const past = sessions.filter(
    (s) =>
      s.status === "Completed" ||
      s.status === "Cancelled" ||
      isBefore(parseISO(`${s.appointmentDate}T${s.endTime}:00`), new Date())
  );

  const totalEarned = sessions
    .filter((s) => s.status === "Confirmed" || s.status === "Completed")
    .reduce((sum, s) => sum + (s.amountPaid ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Sessions</h1>
            <p className="text-muted-foreground">Sessions booked with you by students</p>
          </div>
          {totalEarned > 0 && (
            <div className="rounded-lg border bg-primary/5 px-4 py-2 text-right">
              <p className="text-xs text-muted-foreground">Total Earned</p>
              <p className="text-lg font-bold text-primary">${totalEarned.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["Pending", "Confirmed", "Completed", "Cancelled"] as const).map((status) => {
            const count = sessions.filter((s) => s.status === status).length;
            const cfg = STATUS_CONFIG[status];
            return (
              <Card key={status}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`rounded-full p-2 ${cfg.className}`}>{cfg.icon}</div>
                  <div>
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{cfg.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="history">History ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading sessions…
                </CardContent>
              </Card>
            ) : upcoming.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No upcoming sessions yet.
                </CardContent>
              </Card>
            ) : (
              upcoming.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onCancel={setCancelTarget}
                  onComplete={setCompleteTarget}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading history…
                </CardContent>
              </Card>
            ) : past.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No past sessions yet.
                </CardContent>
              </Card>
            ) : (
              past.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onCancel={() => {}}
                  onComplete={() => {}}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel dialog */}
      <AlertDialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel{" "}
              <strong>{cancelTarget?.title}</strong> with{" "}
              <strong>{cancelTarget?.studentName}</strong> on{" "}
              {cancelTarget?.appointmentDate} at {cancelTarget?.startTime}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 px-1">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Let the student know why you're cancelling…"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelReason("")}>Keep</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (cancelTarget) {
                  cancelMutation.mutate({
                    id: cancelTarget.id,
                    reason: cancelReason.trim() || undefined,
                  });
                }
              }}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete dialog */}
      <AlertDialog open={!!completeTarget} onOpenChange={() => setCompleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Session as Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm that <strong>{completeTarget?.title}</strong> with{" "}
              <strong>{completeTarget?.studentName}</strong> has been completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (completeTarget) completeMutation.mutate(completeTarget.id);
              }}
            >
              {completeMutation.isPending ? "Saving…" : "Confirm Complete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}