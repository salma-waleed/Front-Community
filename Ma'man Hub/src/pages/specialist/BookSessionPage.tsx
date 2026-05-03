import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  CalendarDays,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  addDays,
  isSameDay,
  startOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30",
];

export default function BookSessionPage() {
  const { specialistId } = useParams<{ specialistId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  // Fetch specialist profile
  const { data: specialist } = useQuery({
    queryKey: ["specialist-profile", specialistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", specialistId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!specialistId,
  });

  // Fetch specialist availability
  const { data: availability = [] } = useQuery({
    queryKey: ["specialist-availability", specialistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialist_availability")
        .select("*")
        .eq("specialist_id", specialistId!)
        .eq("is_available", true);
      if (error) throw error;
      return data;
    },
    enabled: !!specialistId,
  });

  // Fetch existing appointments for the specialist to check conflicts
  const { data: existingAppointments = [] } = useQuery({
    queryKey: ["specialist-appointments", specialistId, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("specialist_id", specialistId!)
        .eq("appointment_date", format(selectedDate, "yyyy-MM-dd"))
        .neq("status", "cancelled");
      if (error) throw error;
      return data;
    },
    enabled: !!specialistId && !!selectedDate,
  });

  const bookedSlots = existingAppointments.map((a) => a.start_time.substring(0, 5));

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.filter((a) => a.day_of_week === dayOfWeek);

    if (dayAvailability.length === 0 && availability.length > 0) {
      return [];
    }

    // If no availability data, show default slots
    if (availability.length === 0) {
      return timeSlots.filter((slot) => !bookedSlots.includes(slot));
    }

    return timeSlots.filter((slot) => {
      if (bookedSlots.includes(slot)) return false;
      return dayAvailability.some((a) => {
        const start = a.start_time.substring(0, 5);
        const end = a.end_time.substring(0, 5);
        return slot >= start && slot < end;
      });
    });
  }, [selectedDate, availability, bookedSlots]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !title) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Not logged in", description: "Please log in to book a session.", variant: "destructive" });
      return;
    }

    setIsBooking(true);
    try {
      const [hours, minutes] = selectedSlot.split(":").map(Number);
      const endHours = minutes === 30 ? hours + 1 : hours;
      const endMinutes = minutes === 30 ? 0 : 30;
      const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;

      const { error } = await supabase.from("appointments").insert({
        specialist_id: specialistId!,
        student_id: user.id,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedSlot,
        end_time: endTime,
        title,
        description: description || null,
        status: "pending",
      });

      if (error) throw error;

      setBooked(true);
      toast({ title: "Session Booked!", description: "Your booking request has been sent to the specialist." });
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };

  const displayName = specialist?.full_name || "Specialist";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  if (booked) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-lg py-16 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Session Booked Successfully!</h1>
          <p className="text-muted-foreground">
            Your session with <strong>{displayName}</strong> on{" "}
            <strong>{selectedDate && format(selectedDate, "MMMM d, yyyy")}</strong> at{" "}
            <strong>{selectedSlot}</strong> has been requested. You'll be notified once confirmed.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/specialists")}>
              Browse More
            </Button>
            <Button onClick={() => navigate("/bookings")}>
              View My Bookings
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate("/specialists")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Specialists
        </Button>

        {/* Specialist info */}
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={specialist?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              {specialist?.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {specialist.location}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {specialist?.bio || "Learning specialist available for booking."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Date picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-5 w-5" /> Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                disabled={(date) => date < startOfDay(new Date())}
                className={cn("rounded-md border pointer-events-auto")}
              />
            </CardContent>
          </Card>

          {/* Time + details */}
          <div className="space-y-6">
            {/* Time slots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5" /> Select Time
                </CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Available slots for ${format(selectedDate, "MMMM d, yyyy")}`
                    : "Pick a date first"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <p className="text-sm text-muted-foreground">Please select a date to see available times.</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No available slots on this day. Try another date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSlot(slot)}
                        className="text-sm"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Study Skills Assessment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Notes (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you'd like help with..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleBook}
                  disabled={!selectedDate || !selectedSlot || !title || isBooking}
                >
                  {isBooking ? "Booking..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
