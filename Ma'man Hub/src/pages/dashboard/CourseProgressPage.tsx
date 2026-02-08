import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Play,
  FileText,
  Download,
  Clock,
  Trophy,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Mock course progress data
const courseData = {
  id: "1",
  title: "Complete Web Development Bootcamp",
  instructor: "Dr. Angela Yu",
  thumbnail:
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
  progress: 65,
  totalLessons: 120,
  completedLessons: 78,
  totalDuration: "40h",
  timeSpent: "26h 15m",
  modules: [
    {
      id: "m1",
      title: "Introduction to Web Development",
      completed: true,
      lessons: [
        {
          id: "l1",
          title: "Course Overview",
          duration: "5:30",
          completed: true,
          type: "video",
        },
        {
          id: "l2",
          title: "Setting Up Your Environment",
          duration: "12:45",
          completed: true,
          type: "video",
        },
        {
          id: "l3",
          title: "How the Web Works",
          duration: "8:20",
          completed: true,
          type: "video",
        },
      ],
    },
    {
      id: "m2",
      title: "HTML Fundamentals",
      completed: true,
      lessons: [
        {
          id: "l4",
          title: "HTML Structure",
          duration: "15:00",
          completed: true,
          type: "video",
        },
        {
          id: "l5",
          title: "HTML Elements",
          duration: "20:30",
          completed: true,
          type: "video",
        },
        {
          id: "l6",
          title: "HTML Quiz",
          duration: "10 questions",
          completed: true,
          type: "quiz",
          score: 85,
        },
      ],
    },
    {
      id: "m3",
      title: "CSS Styling",
      completed: false,
      lessons: [
        {
          id: "l7",
          title: "CSS Basics",
          duration: "18:00",
          completed: true,
          type: "video",
        },
        {
          id: "l8",
          title: "Flexbox Layout",
          duration: "25:00",
          completed: true,
          type: "video",
        },
        {
          id: "l9",
          title: "CSS Grid",
          duration: "22:00",
          completed: false,
          type: "video",
        },
        {
          id: "l10",
          title: "Responsive Design",
          duration: "30:00",
          completed: false,
          type: "video",
        },
      ],
    },
    {
      id: "m4",
      title: "JavaScript Basics",
      completed: false,
      lessons: [
        {
          id: "l11",
          title: "Variables and Data Types",
          duration: "20:00",
          completed: false,
          type: "video",
        },
        {
          id: "l12",
          title: "Functions",
          duration: "25:00",
          completed: false,
          type: "video",
        },
        {
          id: "l13",
          title: "DOM Manipulation",
          duration: "35:00",
          completed: false,
          type: "video",
        },
        {
          id: "l14",
          title: "JavaScript Quiz",
          duration: "15 questions",
          completed: false,
          type: "quiz",
        },
      ],
    },
  ],
  quizScores: [
    { name: "HTML Quiz", score: 85, maxScore: 100, date: "2024-01-15" },
    { name: "CSS Basics Quiz", score: 92, maxScore: 100, date: "2024-01-18" },
  ],
  notes: [
    {
      id: "n1",
      lesson: "HTML Structure",
      content: "Remember semantic HTML elements for SEO",
      date: "2024-01-15",
    },
    {
      id: "n2",
      lesson: "Flexbox Layout",
      content: "justify-content for main axis, align-items for cross axis",
      date: "2024-01-20",
    },
  ],
  bookmarks: [
    { id: "b1", lesson: "CSS Grid", timestamp: "12:34", date: "2024-01-19" },
    {
      id: "b2",
      lesson: "Responsive Design",
      timestamp: "05:20",
      date: "2024-01-22",
    },
  ],
};

export default function CourseProgressPage() {
  const { courseId } = useParams();
  const [expandedModules, setExpandedModules] = useState<string[]>(["m3"]);

  const isCompleted = courseData.progress === 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={courseData.thumbnail}
              alt={courseData.title}
              className="w-full md:w-48 h-32 object-cover rounded-lg"
            />
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold font-display">
                  {courseData.title}
                </h1>
                <p className="text-muted-foreground">{courseData.instructor}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-semibold">{courseData.progress}%</span>
                </div>
                <Progress value={courseData.progress} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {courseData.completedLessons} of {courseData.totalLessons}{" "}
                  lessons completed
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Time Spent: {courseData.timeSpent}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-accent" />
                  <span>Avg Quiz Score: 88%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link to={`/course/${courseId}/learn`}>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              </Link>
              {isCompleted && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="curriculum" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Scores</TabsTrigger>
            <TabsTrigger value="notes">My Notes</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-4">
            <Accordion
              type="multiple"
              value={expandedModules}
              onValueChange={setExpandedModules}
            >
              {courseData.modules.map((module, moduleIndex) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div
                        className={`rounded-full p-1 ${module.completed ? "bg-success/10" : "bg-muted"}`}
                      >
                        {module.completed ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <span className="h-5 w-5 flex items-center justify-center text-sm font-medium">
                            {moduleIndex + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{module.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {module.lessons.filter((l) => l.completed).length}/
                          {module.lessons.length} lessons
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-10">
                      {module.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          to={
                            lesson.type === "quiz"
                              ? `/course/${courseId}/quiz/${lesson.id}`
                              : `/course/${courseId}/learn?lesson=${lesson.id}`
                          }
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.completed ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            {lesson.type === "quiz" ? (
                              <FileText className="h-4 w-4 text-accent" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            <span
                              className={
                                lesson.completed ? "text-muted-foreground" : ""
                              }
                            >
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {lesson.type === "quiz" && lesson.score && (
                              <span className="text-success font-medium">
                                {lesson.score}%
                              </span>
                            )}
                            <span>{lesson.duration}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            {courseData.quizScores.map((quiz, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 rounded-full p-3">
                    <Award className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">{quiz.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed on {new Date(quiz.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success">
                    {quiz.score}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quiz.score}/{quiz.maxScore} points
                  </p>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {courseData.notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <p className="font-semibold">{note.lesson}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground">{note.content}</p>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            {courseData.bookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-semibold">{bookmark.lesson}</p>
                    <p className="text-sm text-muted-foreground">
                      at {bookmark.timestamp}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Go to Lesson
                </Button>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
