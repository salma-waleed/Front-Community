import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  BookOpen,
  Star,
  Users,
  Layers,
  Loader2,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import api from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MyCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  isPublished: boolean;
  price: number;
  totalSections: number;
  totalLessons: number;
  totalStudents: number;
  rating: number;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");

  // ── Fetch (debounced server-side search + filter) ─────────────────────────
  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      api
        .get("/coursecreator/courses/mine", { params })
        .then((res) => setCourses(res.data?.data ?? []))
        .catch(() => setError("Failed to load your courses. Please try again."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [searchQuery, statusFilter]);

  const counts = useMemo(
    () => ({
      total: courses.length,
      published: courses.filter((c) => c.isPublished).length,
      draft: courses.filter((c) => !c.isPublished).length,
    }),
    [courses]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">
              Manage your courses, curriculum, and video content
            </p>
          </div>
          <Button onClick={() => navigate("/creator/courses/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Summary stats */}
        {courses.length > 0 && (
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { label: "Total", value: counts.total },
              { label: "Published", value: counts.published },
              { label: "Drafts", value: counts.draft },
            ].map(({ label, value }) => (
              <div key={label} className="border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your courses…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading your courses…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-16 border rounded-xl border-dashed">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No courses match your filters"
                : "Create your first course"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Once you create a course, you can upload videos and build its curriculum."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => navigate("/creator/courses/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            )}
          </div>
        )}

        {/* Course grid */}
        {!loading && !error && courses.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/creator/courses/${course.id}`}>
                  <div className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant="secondary"
                          className={
                            course.isPublished
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-accent transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {course.description || "No description yet."}
                      </p>

                      {/* Quick stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" />
                          {course.totalSections} sections
                        </span>
                        <span className="flex items-center gap-1">
                          <PlayCircle className="h-3.5 w-3.5" />
                          {course.totalLessons} lessons
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {course.totalStudents} students
                        </span>
                        {course.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                            {course.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="font-semibold text-foreground">
                          ${course.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}