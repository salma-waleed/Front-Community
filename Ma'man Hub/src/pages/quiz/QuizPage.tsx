import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCcw,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MainLayout } from "@/components/layout/MainLayout";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Mock quiz data
const quizData = {
  id: "quiz1",
  title: "HTML Fundamentals Quiz",
  courseTitle: "Complete Web Development Bootcamp",
  timeLimit: 600, // 10 minutes in seconds
  passingScore: 70,
  questions: [
    {
      id: "q1",
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Hyper Transfer Markup Language",
        "Home Tool Markup Language",
      ],
      correctAnswer: 0,
      explanation:
        "HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages.",
    },
    {
      id: "q2",
      question: "Which HTML element is used for the largest heading?",
      options: ["<heading>", "<h6>", "<head>", "<h1>"],
      correctAnswer: 3,
      explanation:
        "The <h1> element defines the largest and most important heading. Headings range from <h1> to <h6>.",
    },
    {
      id: "q3",
      question: "What is the correct HTML element for inserting a line break?",
      options: ["<break>", "<lb>", "<br>", "<newline>"],
      correctAnswer: 2,
      explanation:
        "The <br> element inserts a single line break. It is an empty element with no closing tag.",
    },
    {
      id: "q4",
      question:
        "Which attribute is used to provide an alternate text for an image?",
      options: ["title", "alt", "src", "longdesc"],
      correctAnswer: 1,
      explanation:
        "The alt attribute provides alternative text for an image if it cannot be displayed.",
    },
    {
      id: "q5",
      question: "Which HTML element defines the title of a document?",
      options: ["<meta>", "<title>", "<head>", "<header>"],
      correctAnswer: 1,
      explanation:
        "The <title> element defines the title shown in the browser tab and search results.",
    },
  ] as Question[],
};

export default function QuizPage() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Timer
  useEffect(() => {
    if (isSubmitted || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowResults(true);

    const score = calculateScore();
    if (score >= quizData.passingScore) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quizData.questions.length) * 100);
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setTimeRemaining(quizData.timeLimit);
    setIsSubmitted(false);
    setShowResults(false);
  };

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  if (showResults) {
    const score = calculateScore();
    const passed = score >= quizData.passingScore;
    const correctCount = quizData.questions.filter(
      (q) => answers[q.id] === q.correctAnswer,
    ).length;

    return (
      <MainLayout>
        <div className="container max-w-3xl py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div
              className={`rounded-full p-6 w-fit mx-auto mb-6 ${
                passed ? "bg-success/10" : "bg-destructive/10"
              }`}
            >
              {passed ? (
                <Trophy className="h-16 w-16 text-success" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive" />
              )}
            </div>
            <h1 className="text-3xl font-bold font-display mb-2">
              {passed ? "Congratulations!" : "Keep Practicing!"}
            </h1>
            <p className="text-muted-foreground">
              {passed
                ? "You've successfully passed the quiz!"
                : "You didn't pass this time, but you can try again!"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border rounded-xl p-6 mb-6"
          >
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold text-accent">{score}%</p>
                <p className="text-sm text-muted-foreground">Your Score</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  {correctCount}/{quizData.questions.length}
                </p>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{quizData.passingScore}%</p>
                <p className="text-sm text-muted-foreground">Passing Score</p>
              </div>
            </div>
          </motion.div>

          {/* Review answers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-8"
          >
            <h2 className="text-xl font-bold">Review Your Answers</h2>
            {quizData.questions.map((q, index) => {
              const isCorrect = answers[q.id] === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className={`p-4 border rounded-lg ${
                    isCorrect
                      ? "border-success/50 bg-success/5"
                      : "border-destructive/50 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        {index + 1}. {q.question}
                      </p>
                      <p className="text-sm mb-1">
                        Your answer:{" "}
                        <span
                          className={
                            isCorrect ? "text-success" : "text-destructive"
                          }
                        >
                          {q.options[answers[q.id]] || "Not answered"}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-success">
                          Correct answer: {q.options[q.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => navigate(`/course/${courseId}/progress`)}>
              <Home className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">
            {quizData.courseTitle}
          </p>
          <h1 className="text-2xl font-bold font-display">{quizData.title}</h1>
        </div>

        {/* Progress and Timer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 mr-6">
            <div className="flex justify-between text-sm mb-2">
              <span>
                Question {currentQuestion + 1} of {quizData.questions.length}
              </span>
              <span>{answeredCount} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 60
                ? "bg-destructive/10 text-destructive"
                : "bg-muted"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-mono font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="border rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) =>
                handleAnswer(question.id, parseInt(value))
              }
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                    answers[question.id] === index
                      ? "border-accent bg-accent/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestion === quizData.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < quizData.questions.length}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm font-medium mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {quizData.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  currentQuestion === index
                    ? "bg-accent text-accent-foreground"
                    : answers[q.id] !== undefined
                      ? "bg-success/20 text-success"
                      : "bg-muted hover:bg-muted/80"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
