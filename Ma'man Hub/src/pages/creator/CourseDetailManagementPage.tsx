import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Layers,
  PlayCircle,
  Users,
  Star,
  Eye,
  EyeOff,
  Video,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import CourseUploadVideoTab from "@/components/ui/CourseUploadVideoTab";
import CourseSettingsTab from "@/components/ui/CourseSettingsTab";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManagementLesson {
  id: string;
  title: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
  hasVideo: boolean;
  materialsCount: number;
  hasQuiz: boolean;
}

interface ManagementSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: ManagementLesson[];
}

interface CourseManagementDetail {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  thumbnailUrl: string;
  price: number;
  discountPrice: number | null;
  ageGroup: string;
  language: string;
  isPublished: boolean;
  rating: number;
  totalStudents: number;
  totalSections: number;
  totalLessons: number;
  createdAt: string;
  updatedAt: string | null;
  sections: ManagementSection[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDuration = (seconds: number) => {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourseDetailManagementPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [course, setCourse] = useState<CourseManagementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeTab = searchParams.get("tab") ?? "overview";

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchCourse = () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    api
      .get(`/coursecreator/courses/${courseId}/management`)
      .then((res) => setCourse(res.data?.data ?? null))
      .catch(() => setError("Could not load this course."))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCourse, [courseId]);

  // ── Loading / error ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading course…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-muted-foreground">{error ?? "Course not found."}</p>
          <Button variant="outline" onClick={() => navigate("/creator/my-courses")}>
            Back to My Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Back link */}
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => navigate("/creator/my-courses")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          My Courses
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <Badge
                variant="secondary"
                className={
                  course.isPublished
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }
              >
                {course.isPublished ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" /> Published
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" /> Draft
                  </>
                )}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers className="h-4 w-4" /> {course.totalSections} sections
              </span>
              <span className="flex items-center gap-1">
                <PlayCircle className="h-4 w-4" /> {course.totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {course.totalStudents} students
              </span>
              {course.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {course.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(tab) => setSearchParams({ tab })}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="upload-video">Upload Video</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                <p className="text-2xl font-bold">
                  ${(course.discountPrice ?? course.price).toFixed(2)}
                </p>
                {course.discountPrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    ${course.price.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Language</p>
                <p className="text-lg font-medium">{course.language}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Age Group</p>
                <p className="text-lg font-medium">{course.ageGroup}</p>
              </div>
            </div>

            {course.totalLessons === 0 && (
              <div className="border border-dashed rounded-xl p-8 text-center">
                <Video className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No content yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a video to automatically generate lessons for this course.
                </p>
                <Button onClick={() => setSearchParams({ tab: "upload-video" })}>
                  Upload Video
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── Curriculum ── */}
          <TabsContent value="curriculum" className="space-y-4">
            {course.sections.length === 0 ? (
              <div className="border border-dashed rounded-xl p-8 text-center">
                <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No sections yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a video and map its chunks to sections, or add sections manually.
                </p>
                <Button onClick={() => setSearchParams({ tab: "upload-video" })}>
                  Upload Video
                </Button>
              </div>
            ) : (
              <Accordion type="multiple" className="border rounded-xl">
                {course.sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-semibold text-left">{section.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {section.lessons.length} lessons
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0">
                      {section.lessons.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          No lessons in this section yet.
                        </p>
                      ) : (
                        <ul className="divide-y divide-border">
                          {section.lessons.map((lesson) => (
                            <li
                              key={lesson.id}
                              className="flex items-center justify-between px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.hasVideo ? (
                                  <PlayCircle className="h-4 w-4 text-accent" />
                                ) : (
                                  <Video className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm">{lesson.title}</span>
                                {lesson.isFree && (
                                  <Badge variant="secondary" className="text-xs">
                                    Free
                                  </Badge>
                                )}
                                {!lesson.isPublished && (
                                  <Badge variant="secondary" className="text-xs bg-muted">
                                    Draft
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {lesson.materialsCount > 0 && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3.5 w-3.5" />
                                    {lesson.materialsCount}
                                  </span>
                                )}
                                {lesson.hasQuiz && (
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="h-3.5 w-3.5" />
                                    Quiz
                                  </span>
                                )}
                                <span>{formatDuration(lesson.duration)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          {/* ── Upload Video ── */}
          <TabsContent value="upload-video">
            <CourseUploadVideoTab
              courseId={course.id}
              sections={course.sections.map((s) => ({ id: s.id, title: s.title }))}
              onLessonsCreated={fetchCourse}
            />
          </TabsContent>

          {/* ── Settings ── */}
          <TabsContent value="settings">
            <CourseSettingsTab course={course} onUpdated={fetchCourse} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}