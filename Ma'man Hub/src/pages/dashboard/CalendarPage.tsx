import { useCallback, useMemo, useState } from "react";
import {
  format,
  isSameDay,
  startOfMonth,
  addMonths,
  subMonths,
  isAfter,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import {
  CalendarDays,
  Clock,
  Plus,
  Video,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Tv,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "Live Class" | "Deadline" | "Study Group" | "Webinar" | "Reminder";
  description?: string;
  attendees?: number;
  instructor?: string;
};

type EventFormData = {
  title: string;
  description: string;
  type: CalendarEvent["type"];
  date: string;
  time: string;
};

const emptyForm: EventFormData = {
  title: "",
  description: "",
  type: "Reminder",
  date: "",
  time: "",
};

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Live Q&A: JavaScript Fundamentals",
    date: new Date(2026, 2, 22, 10, 0),
    time: "10:00 AM",
    type: "Live Class",
    attendees: 234,
    instructor: "Dr. Sarah Chen",
  },
  {
    id: "2",
    title: "Assignment Due: Python Basics",
    date: new Date(2026, 2, 22, 23, 59),
    time: "11:59 PM",
    type: "Deadline",
  },
  {
    id: "3",
    title: "Study Group: Data Structures",
    date: new Date(2026, 2, 23, 15, 0),
    time: "3:00 PM",
    type: "Study Group",
  },
  {
    id: "4",
    title: "Webinar: Career in AI",
    date: new Date(2026, 2, 24, 14, 0),
    time: "2:00 PM",
    type: "Webinar",
    attendees: 567,
    instructor: "Prof. Michael Torres",
  },
  {
    id: "5",
    title: "Math Live Session",
    date: new Date(2026, 2, 25, 16, 0),
    time: "4:00 PM",
    type: "Live Class",
    attendees: 89,
    instructor: "Ms. Johnson",
  },
  {
    id: "6",
    title: "Science Quiz Deadline",
    date: new Date(2026, 2, 26, 23, 59),
    time: "11:59 PM",
    type: "Deadline",
  },
  {
    id: "7",
    title: "Parent Check-in",
    date: new Date(2026, 2, 27, 18, 30),
    time: "6:30 PM",
    type: "Reminder",
  },
  {
    id: "8",
    title: "Project Review",
    date: new Date(2026, 2, 28, 14, 0),
    time: "2:00 PM",
    type: "Study Group",
  },
];

const eventTypeConfig: Record<
  CalendarEvent["type"],
  { icon: typeof Video; bg: string; text: string }
> = {
  "Live Class": {
    icon: Video,
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
  },
  Deadline: {
    icon: FileText,
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
  },
  "Study Group": {
    icon: Users,
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
  },
  Webinar: {
    icon: Tv,
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
  },
  Reminder: {
    icon: Clock,
    bg: "bg-purple-50 border-purple-200",
    text: "text-purple-700",
  },
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarPage() {
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [formData, setFormData] = useState<EventFormData>(emptyForm);
  const { toast } = useToast();

  const calendarDays = useMemo(() => {
    const start = startOfWeek(month);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const endDisplay = endOfWeek(lastDay);
    return eachDayOfInterval({ start, end: endDisplay });
  }, [month]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(
        (e) => isAfter(e.date, new Date()) || isSameDay(e.date, new Date()),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [events]);

  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    return events.filter((e) => e.date >= weekStart && e.date <= weekEnd)
      .length;
  }, [events]);

  const deadlineCount = useMemo(
    () =>
      events.filter((e) => e.type === "Deadline" && isAfter(e.date, new Date()))
        .length,
    [events],
  );

  const hasEvent = useCallback(
    (day: Date) => events.some((e) => isSameDay(e.date, day)),
    [events],
  );

  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      type: event.type,
      date: format(event.date, "yyyy-MM-dd"),
      time: event.time,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.date) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and date.",
        variant: "destructive",
      });
      return;
    }
    const [y, m, d] = formData.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id
            ? {
                ...e,
                title: formData.title,
                description: formData.description,
                date,
                time: formData.time || e.time,
                type: formData.type,
              }
            : e,
        ),
      );
      toast({
        title: "Event updated",
        description: `"${formData.title}" has been updated.`,
      });
    } else {
      const created: CalendarEvent = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        date,
        time: formData.time || "12:00 PM",
        type: formData.type,
      };
      setEvents((prev) => [...prev, created]);
      toast({
        title: "Event created",
        description: `"${created.title}" added to your calendar.`,
      });
    }

    setDialogOpen(false);
    setEditingEvent(null);
    setFormData(emptyForm);
  };

  const handleDelete = () => {
    if (!deletingEvent) return;
    setEvents((prev) => prev.filter((e) => e.id !== deletingEvent.id));
    toast({
      title: "Event deleted",
      description: `"${deletingEvent.title}" has been removed.`,
    });
    setDeletingEvent(null);
  };

  const getActionLabel = (type: CalendarEvent["type"]) => {
    if (type === "Live Class" || type === "Webinar" || type === "Study Group")
      return "Join";
    if (type === "Deadline") return "View";
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">
              My <span className="text-accent">Calendar</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track your learning schedule, deadlines, and upcoming events
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Left column */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setMonth(subMonths(month, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-sm">
                    {format(month, "MMMM yyyy")}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setMonth(addMonths(month, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="py-1 font-medium">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {calendarDays.map((day, i) => {
                    const isCurrentMonth = day.getMonth() === month.getMonth();
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);
                    const dayHasEvent = hasEvent(day);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "relative h-8 w-8 rounded-full mx-auto flex items-center justify-center transition-colors text-sm",
                          !isCurrentMonth && "text-muted-foreground/40",
                          isCurrentMonth && "hover:bg-accent/10",
                          isToday &&
                            !isSelected &&
                            "bg-accent text-accent-foreground font-bold",
                          isSelected &&
                            "bg-primary text-primary-foreground font-bold",
                        )}
                      >
                        {day.getDate()}
                        {dayHasEvent && !isSelected && !isToday && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-accent" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-5">
                  <span className="text-2xl font-bold text-accent">
                    {thisWeekCount}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Events This Week
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-5">
                  <span className="text-2xl font-bold text-destructive">
                    {deadlineCount}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Deadlines
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right column */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-lg font-semibold">Nothing planned</p>
                  <p className="text-sm text-muted-foreground">
                    No upcoming events.
                  </p>
                </div>
              ) : (
                <>
                  {upcomingEvents.map((event) => {
                    const config = eventTypeConfig[event.type];
                    const Icon = config.icon;
                    const action = getActionLabel(event.type);
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "flex items-center gap-4 rounded-xl border p-4",
                          config.bg,
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            config.text,
                            "bg-white/70",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "font-semibold text-sm truncate",
                              config.text,
                            )}
                          >
                            {event.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {format(event.date, "EEE, MMM d")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                            </span>
                            {event.attendees && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.attendees} attending
                              </span>
                            )}
                            {event.instructor && (
                              <span>with {event.instructor}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {action && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                              onClick={() =>
                                toast({
                                  title: action,
                                  description: `${action} action for "${event.title}"`,
                                })
                              }
                            >
                              {action}
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(event)}
                              >
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeletingEvent(event)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    className="w-full text-center text-sm font-medium text-accent hover:underline pt-2"
                    onClick={() =>
                      toast({
                        title: "All events",
                        description: "Showing all scheduled events.",
                      })
                    }
                  >
                    View All Events
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingEvent(null);
            setFormData(emptyForm);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Create Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Update the event details below."
                : "Add a new event to your calendar."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evt-title">Title</Label>
              <Input
                id="evt-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Study Session"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-desc">Description (optional)</Label>
              <Textarea
                id="evt-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="evt-date">Date</Label>
                <Input
                  id="evt-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evt-time">Time</Label>
                <Input
                  id="evt-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, time: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData((p) => ({
                    ...p,
                    type: v as CalendarEvent["type"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reminder">Reminder</SelectItem>
                  <SelectItem value="Deadline">Deadline</SelectItem>
                  <SelectItem value="Study Group">Study Group</SelectItem>
                  <SelectItem value="Live Class">Live Class</SelectItem>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingEvent(null);
                setFormData(emptyForm);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingEvent ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingEvent}
        onOpenChange={(open) => {
          if (!open) setDeletingEvent(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingEvent?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
