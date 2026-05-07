import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, User, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { isAfter, parseISO } from "date-fns";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { appointmentService } from "@/services/appointmentService";

const statusColors: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

export default function StudentBookingsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["student-bookings", user?.id],
    queryFn: () => appointmentService.getMyAppointments(),
    enabled: !!user,
  });

  const cancelBooking = useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
      toast({ title: "Booking Cancelled", description: "Your booking has been cancelled." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
    },
  });

  const upcoming = bookings.filter(
    (b) =>
      (b.status === "Pending" || b.status === "Confirmed") &&
      isAfter(parseISO(b.appointmentDate), new Date(new Date().setDate(new Date().getDate() - 1)))
  );

  const past = bookings.filter(
    (b) =>
      !isAfter(parseISO(b.appointmentDate), new Date(new Date().setDate(new Date().getDate() - 1))) ||
      b.status === "Completed" ||
      b.status === "Cancelled"
  );

  const BookingCard = ({ booking, showCancel }: { booking: any; showCancel: boolean }) => (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${showCancel ? "bg-primary/10" : "bg-muted"}`}>
            <User className={`h-5 w-5 ${showCancel ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <h4 className="font-medium">{booking.title}</h4>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {booking.appointmentDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
            {booking.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {booking.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[booking.status?.toLowerCase()] || "bg-muted"}>
            {booking.status}
          </Badge>
          {showCancel && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setCancelId(booking.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
            <p className="text-muted-foreground">Your specialist session bookings</p>
          </div>
          <Button onClick={() => navigate("/specialists")} className="gap-2">
            <Plus className="h-4 w-4" /> Book New Session
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="history">History ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading bookings...
                </CardContent>
              </Card>
            ) : upcoming.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <p className="text-muted-foreground">No upcoming bookings.</p>
                  <Button onClick={() => navigate("/specialists")}>
                    Find a Specialist
                  </Button>
                </CardContent>
              </Card>
            ) : (
              upcoming.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showCancel={true} />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading history...
                </CardContent>
              </Card>
            ) : past.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No past bookings yet.
                </CardContent>
              </Card>
            ) : (
              past.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showCancel={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (cancelId) cancelBooking.mutate(cancelId);
                setCancelId(null);
              }}
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}