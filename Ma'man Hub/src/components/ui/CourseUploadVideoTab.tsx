import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Video,
  FileVideo,
  X,
  CheckCircle2,
  Youtube,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { videoProcessingService } from "@/services/videoProcessingService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile {
  file: File;
  name: string;
  size: string;
  progress: number;
  status: "idle" | "uploading" | "complete" | "error";
}

interface Props {
  courseId: string;
  sections: { id: string; title: string }[];
  onLessonsCreated?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourseUploadVideoTab({ courseId }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Upload tab state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // YouTube tab state
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Processing state (shared)
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isValidYoutubeUrl = (url: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(url);

  // ── Drag & drop ──────────────────────────────────────────────────────────

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  };

  const pickFile = (file: File) => {
    setUploadedFile({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: "idle",
    });
    setError(null);
  };

  // ── Submit: Upload ────────────────────────────────────────────────────────

  const handleUploadSubmit = async () => {
    if (!uploadedFile) {
      toast({ title: "Choose a video file first", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      setProcessingStep("Uploading video…");
      setUploadedFile((f) => (f ? { ...f, status: "uploading" } : f));

      const jobId = await videoProcessingService.processUpload(
        courseId,
        uploadedFile.file,
        (pct) => {
          setUploadedFile((f) => (f ? { ...f, progress: pct } : f));
          if (pct === 100) setProcessingStep("Transcribing & segmenting with AI…");
        }
      );

      setUploadedFile((f) => (f ? { ...f, status: "complete", progress: 100 } : f));
      toast({ title: "Processing complete!", description: "Review your chunks below." });
      navigate(`/creator/video-review/${jobId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Processing failed. Please try again.";
      setError(msg);
      setUploadedFile((f) => (f ? { ...f, status: "error" } : f));
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // ── Submit: YouTube ───────────────────────────────────────────────────────

  const handleYoutubeSubmit = async () => {
    if (!isValidYoutubeUrl(youtubeUrl)) {
      toast({ title: "Enter a valid YouTube URL", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStep("Downloading & transcribing YouTube video…");

    try {
      const jobId = await videoProcessingService.processYoutube(courseId, youtubeUrl);
      toast({ title: "Processing complete!", description: "Review your chunks below." });
      navigate(`/creator/video-review/${jobId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Processing failed. Please try again.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-sm text-muted-foreground">
        Upload a video file or paste a YouTube link — our AI will transcribe
        and segment it into lesson chunks for you to review and map to sections.
      </p>

      <Tabs defaultValue="upload">
        <TabsList className="w-full">
          <TabsTrigger value="upload" className="flex-1 gap-2">
            <Video className="h-4 w-4" />
            Upload Video File
          </TabsTrigger>
          <TabsTrigger value="youtube" className="flex-1 gap-2">
            <Youtube className="h-4 w-4" />
            YouTube Link
          </TabsTrigger>
        </TabsList>

        {/* ── Upload tab ── */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileVideo className="h-5 w-5" />
                Video File
              </CardTitle>
              <CardDescription>MP4, MOV, or AVI · up to 4 GB</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!uploadedFile ? (
                <div
                  className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="video/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) pickFile(f);
                    }}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Drop your video here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <Button variant="secondary" type="button">Browse Files</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileVideo className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate max-w-xs">{uploadedFile.name}</p>
                      <div className="flex items-center gap-2">
                        {uploadedFile.status === "complete" && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {uploadedFile.status === "error" && (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                        {!isProcessing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUploadedFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{uploadedFile.size}</p>
                    {uploadedFile.status === "uploading" && (
                      <Progress value={uploadedFile.progress} className="mt-2 h-1" />
                    )}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-3 rounded-lg bg-muted p-4 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>{processingStep}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleUploadSubmit}
                  disabled={isProcessing || !uploadedFile}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Process Video
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── YouTube tab ── */}
        <TabsContent value="youtube">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                YouTube URL
              </CardTitle>
              <CardDescription>
                Paste a YouTube video link — we'll download its audio, transcribe it,
                and segment it into lesson chunks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yt-url">YouTube URL</Label>
                <Input
                  id="yt-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setError(null);
                  }}
                  disabled={isProcessing}
                />
                {youtubeUrl && !isValidYoutubeUrl(youtubeUrl) && (
                  <p className="text-xs text-destructive">Please enter a valid YouTube URL.</p>
                )}
              </div>

              {isProcessing && (
                <div className="flex items-center gap-3 rounded-lg bg-muted p-4 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>{processingStep}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleYoutubeSubmit}
                  disabled={isProcessing || !youtubeUrl || !isValidYoutubeUrl(youtubeUrl)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Process Video
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-foreground pb-4">
        Processing typically takes 2–10 minutes depending on video length.
        You'll be taken to the review page automatically when it's ready.
      </p>
    </div>
  );
}