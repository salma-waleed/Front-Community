import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle,
  Pause,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  FileText,
  Download,
  MessageCircle,
  StickyNote,
  Maximize,
  Volume2,
  Settings,
  SkipForward,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Mock data
const mockCourse = {
  id: "1",
  title: "Complete Web Development Bootcamp 2024",
  modules: [
    {
      id: "1",
      title: "Front-End Web Development",
      lessons: [
        {
          id: "1-1",
          title: "What You'll Get From This Course",
          duration: "4:32",
          completed: true,
        },
        {
          id: "1-2",
          title: "How to Get Help",
          duration: "2:15",
          completed: true,
        },
        {
          id: "1-3",
          title: "How Websites Work",
          duration: "12:45",
          completed: true,
        },
        {
          id: "1-4",
          title: "Your First Webpage",
          duration: "18:30",
          completed: false,
          current: true,
        },
        {
          id: "1-5",
          title: "HTML Tags and Attributes",
          duration: "15:20",
          completed: false,
        },
      ],
    },
    {
      id: "2",
      title: "Introduction to HTML",
      lessons: [
        {
          id: "2-1",
          title: "HTML Document Structure",
          duration: "10:15",
          completed: false,
        },
        {
          id: "2-2",
          title: "Headings and Paragraphs",
          duration: "8:45",
          completed: false,
        },
        {
          id: "2-3",
          title: "Lists and Links",
          duration: "12:30",
          completed: false,
        },
        {
          id: "2-4",
          title: "Images and Media",
          duration: "14:20",
          completed: false,
        },
      ],
    },
    {
      id: "3",
      title: "CSS Styling",
      lessons: [
        {
          id: "3-1",
          title: "Introduction to CSS",
          duration: "14:20",
          completed: false,
        },
        {
          id: "3-2",
          title: "CSS Selectors",
          duration: "18:45",
          completed: false,
        },
        {
          id: "3-3",
          title: "CSS Box Model",
          duration: "22:10",
          completed: false,
        },
      ],
    },
  ],
  resources: [
    { id: "1", name: "Course Slides - Module 1", type: "pdf", size: "2.4 MB" },
    { id: "2", name: "Starter Code Files", type: "zip", size: "1.8 MB" },
    { id: "3", name: "Cheat Sheet - HTML Tags", type: "pdf", size: "540 KB" },
  ],
};

const mockTranscript = `Welcome back to the course! In this lesson, we're going to build your very first webpage from scratch.

Before we dive in, let me explain why this is such an important milestone in your web development journey. Creating your first webpage is like learning to write your first sentence - it opens up a whole new world of possibilities.

Let's start by opening our code editor. I recommend using Visual Studio Code, which we installed in the previous lesson.

First, create a new folder on your desktop called "my-first-website". This is where we'll store all our project files.

Inside this folder, create a new file called "index.html". The index.html file is special - it's typically the main page of a website and is the first file that browsers look for when loading a site.

Now, let's add some basic HTML structure...`;

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState("1-4");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState<
    { id: string; content: string; timestamp: string }[]
  >([]);
  const [activeTab, setActiveTab] = useState("content");
  const [progress, setProgress] = useState(35);

  const course = mockCourse;

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLesson = allLessons.find((l) => l.id === currentLessonId);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const completedCount = allLessons.filter((l) => l.completed).length;
  const totalCount = allLessons.length;
  const overallProgress = Math.round((completedCount / totalCount) * 100);

  const handleMarkComplete = () => {
    // In a real app, this would update the backend
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id);
    }
  };

  const handleSaveNote = () => {
    if (notes.trim()) {
      setSavedNotes([
        ...savedNotes,
        {
          id: Date.now().toString(),
          content: notes,
          timestamp: `${Math.floor(progress / 60)}:${String(progress % 60).padStart(2, "0")}`,
        },
      ]);
      setNotes("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to={`/courses/${courseId}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-medium line-clamp-1">{course.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Progress value={overallProgress} className="w-32 h-2" />
            <span className="text-sm text-muted-foreground">
              {overallProgress}% complete
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Player */}
          <div className="relative bg-black aspect-video max-h-[70vh] flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Placeholder for video */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-20 w-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-white" />
                  ) : (
                    <PlayCircle className="h-10 w-10 text-white" />
                  )}
                </motion.button>
                <p className="text-white/60 mt-4 text-sm">
                  {currentLesson?.title}
                </p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="space-y-2">
                <Progress value={progress} className="h-1 cursor-pointer" />
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <PlayCircle className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                    <span className="text-sm ml-2">
                      {Math.floor(progress / 60)}:
                      {String(progress % 60).padStart(2, "0")} /{" "}
                      {currentLesson?.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Info & Tabs */}
          <div className="flex-1 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="border-b border-border px-4">
                <TabsList className="h-12">
                  <TabsTrigger value="content">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="qa">Q&A</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <TabsContent value="content" className="p-6 m-0">
                  <div className="max-w-3xl">
                    <h2 className="text-2xl font-bold font-display mb-2">
                      {currentLesson?.title}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Duration: {currentLesson?.duration}
                    </p>

                    <div className="flex gap-4 mb-8">
                      <Button onClick={handleMarkComplete}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Complete
                      </Button>
                      {nextLesson && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentLessonId(nextLesson.id)}
                        >
                          Next Lesson
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <h3>Lesson Description</h3>
                      <p>
                        In this lesson, you'll learn how to create your very
                        first webpage from scratch. We'll cover the basic HTML
                        structure, how to set up your development environment,
                        and the fundamentals of web page creation.
                      </p>
                      <h3>Key Topics</h3>
                      <ul>
                        <li>Setting up a project folder</li>
                        <li>Creating an index.html file</li>
                        <li>Understanding HTML boilerplate</li>
                        <li>Writing your first HTML content</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="p-6 m-0">
                  <div className="max-w-3xl space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Your Notes</h3>
                      <Textarea
                        placeholder="Take notes during the lecture..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[150px] mb-4"
                      />
                      <Button onClick={handleSaveNote}>
                        <StickyNote className="mr-2 h-4 w-4" />
                        Save Note
                      </Button>
                    </div>

                    {savedNotes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-4">Saved Notes</h4>
                        <div className="space-y-4">
                          {savedNotes.map((note) => (
                            <div
                              key={note.id}
                              className="p-4 bg-muted rounded-lg"
                            >
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <PlayCircle className="h-4 w-4" />
                                <span>at {note.timestamp}</span>
                              </div>
                              <p className="text-sm">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="transcript" className="p-6 m-0">
                  <div className="max-w-3xl">
                    <h3 className="text-lg font-semibold mb-4">Transcript</h3>
                    <div className="prose prose-sm max-w-none">
                      {mockTranscript.split("\n\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qa" className="p-6 m-0">
                  <div className="max-w-3xl">
                    <h3 className="text-lg font-semibold mb-4">
                      Questions & Answers
                    </h3>
                    <Textarea
                      placeholder="Ask a question about this lesson..."
                      className="min-h-[100px] mb-4"
                    />
                    <Button>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Post Question
                    </Button>

                    <div className="mt-8 space-y-6">
                      <p className="text-muted-foreground">
                        No questions yet. Be the first to ask!
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="p-6 m-0">
                  <div className="max-w-3xl">
                    <h3 className="text-lg font-semibold mb-4">
                      Downloadable Resources
                    </h3>
                    <div className="space-y-3">
                      {course.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {resource.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {resource.type.toUpperCase()} • {resource.size}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border bg-card flex-shrink-0 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Course Content</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completedCount} / {totalCount} completed
                  </p>
                </div>

                <ScrollArea className="flex-1">
                  <Accordion
                    type="multiple"
                    defaultValue={course.modules.map((m) => m.id)}
                    className="w-full"
                  >
                    {course.modules.map((module) => (
                      <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                          <div className="text-left">
                            <p className="font-medium">{module.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {module.lessons.filter((l) => l.completed).length}{" "}
                              / {module.lessons.length}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                          <ul>
                            {module.lessons.map((lesson) => (
                              <li key={lesson.id}>
                                <button
                                  onClick={() => setCurrentLessonId(lesson.id)}
                                  className={cn(
                                    "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                                    lesson.id === currentLessonId
                                      ? "bg-accent/10"
                                      : "hover:bg-muted/50",
                                  )}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    {lesson.completed ? (
                                      <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
                                        <Check className="h-3 w-3 text-success-foreground" />
                                      </div>
                                    ) : lesson.id === currentLessonId ? (
                                      <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                                        <PlayCircle className="h-3 w-3 text-accent-foreground" />
                                      </div>
                                    ) : (
                                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={cn(
                                        "text-sm",
                                        lesson.id === currentLessonId &&
                                          "font-medium",
                                      )}
                                    >
                                      {lesson.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {lesson.duration}
                                    </p>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <footer className="h-16 border-t border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
        <Button
          variant="outline"
          disabled={!prevLesson}
          onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium">{currentLesson?.title}</p>
          <p className="text-xs text-muted-foreground">
            Lesson {currentIndex + 1} of {totalCount}
          </p>
        </div>
        <Button
          disabled={!nextLesson}
          onClick={() => nextLesson && setCurrentLessonId(nextLesson.id)}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}
