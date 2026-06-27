import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  BookOpen,
  Clock,
  FileText,
  Save,
  SkipForward,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  videoProcessingService,
  VideoProcessingJob,
  VideoChunk,
} from "@/services/videoProcessingService";
import api from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  title: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoReviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Job data
  const [job, setJob] = useState<VideoProcessingJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Step navigation
  const [currentStep, setCurrentStep] = useState(0);

  // Per-chunk editable state (keyed by chunkId)
  const [edits, setEdits] = useState<
    Record<string, { title: string; transcript: string }>
  >({});

  // Mapping state per chunk: sectionId + order
  const [mappings, setMappings] = useState<
    Record<string, { sectionId: string; order: number }>
  >({});

  // Sections available to map into
  const [sections, setSections] = useState<Section[]>([]);

  // Per-chunk saving state
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Auto-save debounce
  const [autoSaveTimers, setAutoSaveTimers] = useState<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Load job ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      try {
        const data = await videoProcessingService.getJob(jobId);
        setJob(data);

        // Initialise edits from job chunks
        const initEdits: Record<string, { title: string; transcript: string }> = {};
        data.chunks.forEach((c) => {
          initEdits[c.id] = { title: c.title, transcript: c.transcript };
        });
        setEdits(initEdits);
      } catch {
        setLoadError("Could not load the processing job.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [jobId]);

  // ── Load sections for the course ─────────────────────────────────────────
  // Uses the same management endpoint as CourseDetailManagementPage so
  // draft (unpublished) courses work too - the public curriculum endpoint
  // only returns published sections.

  useEffect(() => {
    if (!job?.courseId) return;
    api
      .get(`/coursecreator/courses/${job.courseId}/management`)
      .then((res) => {
        const raw = res.data?.data?.sections ?? [];
        setSections(raw.map((s: any) => ({ id: s.id, title: s.title })));
      })
      .catch(() => {
        // Silently fail; instructor can still type a sectionId manually
      });
  }, [job?.courseId]);

  // ── Auto-save edits ──────────────────────────────────────────────────────

  const scheduleAutoSave = useCallback(
    (chunkId: string, title: string, transcript: string) => {
      setAutoSaveTimers((prev) => {
        if (prev[chunkId]) clearTimeout(prev[chunkId]);
        const timer = setTimeout(async () => {
          try {
            await videoProcessingService.updateChunk(jobId!, chunkId, title, transcript);
          } catch {
            // Silent; will be sent again on next keypress
          }
        }, 1200);
        return { ...prev, [chunkId]: timer };
      });
    },
    [jobId]
  );

  const handleEditChange = (
    chunkId: string,
    field: "title" | "transcript",
    value: string
  ) => {
    setEdits((prev) => {
      const next = { ...prev, [chunkId]: { ...prev[chunkId], [field]: value } };
      scheduleAutoSave(chunkId, next[chunkId].title, next[chunkId].transcript);
      return next;
    });
  };

  // ── Save chunk as lesson ─────────────────────────────────────────────────

  const handleSaveChunk = async (chunk: VideoChunk) => {
    const mapping = mappings[chunk.id];
    if (!mapping?.sectionId) {
      toast({ title: "Choose a section first", variant: "destructive" });
      return;
    }

    setSaving((p) => ({ ...p, [chunk.id]: true }));
    try {
      await videoProcessingService.saveChunk(jobId!, chunk.id, {
        courseId: job!.courseId,
        sectionId: mapping.sectionId,
        title: edits[chunk.id]?.title ?? chunk.title,
        transcript: edits[chunk.id]?.transcript ?? chunk.transcript,
        order: mapping.order,
      });

      // Mark saved in local state
      setJob((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          chunks: prev.chunks.map((c) =>
            c.id === chunk.id ? { ...c, isSaved: true } : c
          ),
        };
      });

      toast({ title: "Lesson created ✓" });

      // Auto-advance to next unsaved chunk
      const nextUnsaved = job?.chunks.findIndex(
        (c, i) => i > currentStep && !c.isSaved && c.id !== chunk.id
      );
      if (nextUnsaved !== undefined && nextUnsaved !== -1) {
        setCurrentStep(nextUnsaved);
      }
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving((p) => ({ ...p, [chunk.id]: false }));
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const chunks = job?.chunks ?? [];
  const savedCount = chunks.filter((c) => c.isSaved).length;
  const totalCount = chunks.length;
  const allSaved = savedCount === totalCount && totalCount > 0;
  const currentChunk = chunks[currentStep] ?? null;

  // ── Loading / error ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading video chunks…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loadError || !job) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-muted-foreground">{loadError ?? "Job not found."}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (job.status === "failed") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="font-semibold">Processing failed</p>
          <p className="text-sm text-muted-foreground">{job.errorMessage}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Review Video Chunks</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Edit each AI-generated chunk, pick a section, then save it as a lesson.
            </p>
          </div>
          {allSaved && (
            <Button onClick={() => navigate(`/creator/courses/${job.courseId}`)}>
              Back to Course
            </Button>
          )}
        </div>

        {/* Overall progress */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Chunks saved as lessons</span>
              <span className="text-muted-foreground">
                {savedCount} / {totalCount}
              </span>
            </div>
            <Progress value={(savedCount / Math.max(totalCount, 1)) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Chunk list sidebar + main panel */}
        <div className="grid grid-cols-[220px_1fr] gap-6">

          {/* Sidebar: chunk list */}
          <div className="space-y-1">
            {chunks.map((chunk, i) => (
              <button
                key={chunk.id}
                onClick={() => setCurrentStep(i)}
                className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                  i === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <span className="shrink-0">
                  {chunk.isSaved ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        i === currentStep
                          ? "border-primary-foreground"
                          : "border-muted-foreground/40"
                      }`}
                    />
                  )}
                </span>
                <span className="truncate">
                  {edits[chunk.id]?.title || chunk.title || `Chunk ${i + 1}`}
                </span>
              </button>
            ))}
          </div>

          {/* Main panel: current chunk editor */}
          {currentChunk && (
            <div className="space-y-4">
              {/* Chunk meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {currentChunk.startTime} → {currentChunk.endTime}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Chunk {currentStep + 1} of {totalCount}
                </span>
                {currentChunk.isSaved && (
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Saved as lesson
                  </Badge>
                )}
              </div>

              {/* AI Summary */}
              {currentChunk.summary && (
                <Card className="bg-muted/40 border-dashed">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      AI Summary
                    </p>
                    <p className="text-sm">{currentChunk.summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Editable fields */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Lesson Details</CardTitle>
                  <CardDescription>
                    Edit the title and transcript before saving. Changes auto-save as you type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Lesson Title</Label>
                    <Input
                      value={edits[currentChunk.id]?.title ?? ""}
                      onChange={(e) =>
                        handleEditChange(currentChunk.id, "title", e.target.value)
                      }
                      placeholder="e.g. Introduction to Variables"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Transcript</Label>
                    <Textarea
                      value={edits[currentChunk.id]?.transcript ?? ""}
                      onChange={(e) =>
                        handleEditChange(currentChunk.id, "transcript", e.target.value)
                      }
                      rows={10}
                      className="font-mono text-sm resize-y"
                      placeholder="AI-generated transcript…"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section mapping */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Map to Section
                  </CardTitle>
                  <CardDescription>
                    Choose which course section this chunk should become a lesson in.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Section</Label>
                    {sections.length > 0 ? (
                      <Select
                        value={mappings[currentChunk.id]?.sectionId ?? ""}
                        onValueChange={(val) =>
                          setMappings((p) => ({
                            ...p,
                            [currentChunk.id]: {
                              sectionId: val,
                              order: p[currentChunk.id]?.order ?? currentStep + 1,
                            },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Section ID (no sections found)"
                        value={mappings[currentChunk.id]?.sectionId ?? ""}
                        onChange={(e) =>
                          setMappings((p) => ({
                            ...p,
                            [currentChunk.id]: {
                              sectionId: e.target.value,
                              order: p[currentChunk.id]?.order ?? currentStep + 1,
                            },
                          }))
                        }
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Lesson Order</Label>
                    <Input
                      type="number"
                      min={1}
                      value={mappings[currentChunk.id]?.order ?? currentStep + 1}
                      onChange={(e) =>
                        setMappings((p) => ({
                          ...p,
                          [currentChunk.id]: {
                            sectionId: p[currentChunk.id]?.sectionId ?? "",
                            order: parseInt(e.target.value) || 1,
                          },
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep((i) => i - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === totalCount - 1}
                    onClick={() => setCurrentStep((i) => i + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  {/* Skip (don't save this chunk) */}
                  {!currentChunk.isSaved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentStep === totalCount - 1}
                      onClick={() => setCurrentStep((i) => i + 1)}
                    >
                      <SkipForward className="h-4 w-4 mr-1" />
                      Skip
                    </Button>
                  )}

                  {/* Save as lesson */}
                  <Button
                    size="sm"
                    disabled={
                      currentChunk.isSaved ||
                      saving[currentChunk.id] ||
                      !mappings[currentChunk.id]?.sectionId
                    }
                    onClick={() => handleSaveChunk(currentChunk)}
                  >
                    {saving[currentChunk.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    {currentChunk.isSaved ? "Saved" : "Save as Lesson"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completion banner */}
        {allSaved && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-5 flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">All chunks saved as lessons!</p>
                <p className="text-sm text-green-700">
                  Head back to the course to publish them or add more content.
                </p>
              </div>
              <Button
                className="ml-auto"
                onClick={() => navigate(`/creator/courses/${job.courseId}`)}
              >
                Go to Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}