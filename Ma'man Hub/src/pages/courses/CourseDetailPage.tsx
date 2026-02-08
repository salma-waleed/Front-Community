import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Users,
  PlayCircle,
  FileText,
  Award,
  Download,
  Globe,
  Calendar,
  ChevronDown,
  ChevronRight,
  Check,
  Heart,
  Share2,
  ShoppingCart,
  Lock,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

// Mock course data
const mockCourse = {
  id: "1",
  title: "Complete Web Development Bootcamp 2024",
  subtitle:
    "Become a full-stack web developer with just ONE course. HTML, CSS, Javascript, Node, React, PostgreSQL, Web3 and DApps",
  instructor: {
    name: "Dr. Angela Yu",
    avatar: "",
    bio: "Developer and Lead Instructor at the London App Brewery, with 8+ years of teaching experience.",
    rating: 4.7,
    reviewsCount: 125000,
    studentsCount: 2500000,
    coursesCount: 12,
  },
  thumbnail:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  videoPreview: "",
  rating: 4.8,
  reviewsCount: 245678,
  price: 89.99,
  originalPrice: 199.99,
  level: "Beginner",
  duration: "52 hours",
  lecturesCount: 435,
  studentsCount: 567890,
  language: "English",
  lastUpdated: "January 2024",
  category: "Development",
  whatYoullLearn: [
    "Build 16 web development projects for your portfolio",
    "Learn the latest technologies including Javascript, React, Node and Web3",
    "Build fully-fledged websites and web apps for startups or business",
    "Master frontend development with React",
    "Master backend development with Node",
    "Learn professional developer best practices",
  ],
  requirements: [
    "No programming experience needed - I'll teach you everything you need to know",
    "A computer with access to the internet",
    "No paid software required",
  ],
  description: `Welcome to the Complete Web Development Bootcamp, the only course you need to learn to code and become a full-stack web developer.

At 52+ hours, this Web Development course is without a doubt the most comprehensive web development course available online. Even if you have zero programming experience, this course will take you from beginner to mastery.

The course includes over 52 hours of HD video tutorials and builds 16 real-world projects with step-by-step guidance. By the end of this course, you will be fluent in cutting-edge front-end and back-end technologies.`,
  modules: [
    {
      id: "1",
      title: "Front-End Web Development",
      duration: "8 hours",
      lessonsCount: 42,
      lessons: [
        {
          id: "1-1",
          title: "What You'll Get From This Course",
          duration: "4:32",
          isFree: true,
        },
        { id: "1-2", title: "How to Get Help", duration: "2:15", isFree: true },
        {
          id: "1-3",
          title: "How Websites Work",
          duration: "12:45",
          isFree: false,
        },
        {
          id: "1-4",
          title: "Your First Webpage",
          duration: "18:30",
          isFree: false,
        },
        {
          id: "1-5",
          title: "HTML Tags and Attributes",
          duration: "15:20",
          isFree: false,
        },
      ],
    },
    {
      id: "2",
      title: "Introduction to HTML",
      duration: "6 hours",
      lessonsCount: 28,
      lessons: [
        {
          id: "2-1",
          title: "HTML Document Structure",
          duration: "10:15",
          isFree: false,
        },
        {
          id: "2-2",
          title: "Headings and Paragraphs",
          duration: "8:45",
          isFree: false,
        },
        {
          id: "2-3",
          title: "Lists and Links",
          duration: "12:30",
          isFree: false,
        },
      ],
    },
    {
      id: "3",
      title: "CSS Styling",
      duration: "10 hours",
      lessonsCount: 52,
      lessons: [
        {
          id: "3-1",
          title: "Introduction to CSS",
          duration: "14:20",
          isFree: false,
        },
        { id: "3-2", title: "CSS Selectors", duration: "18:45", isFree: false },
        { id: "3-3", title: "CSS Box Model", duration: "22:10", isFree: false },
      ],
    },
    {
      id: "4",
      title: "JavaScript Fundamentals",
      duration: "12 hours",
      lessonsCount: 65,
      lessons: [
        {
          id: "4-1",
          title: "Variables and Data Types",
          duration: "20:15",
          isFree: false,
        },
        { id: "4-2", title: "Functions", duration: "25:30", isFree: false },
        {
          id: "4-3",
          title: "DOM Manipulation",
          duration: "30:45",
          isFree: false,
        },
      ],
    },
  ],
  reviews: [
    {
      id: "1",
      user: { name: "John D.", avatar: "" },
      rating: 5,
      date: "2 weeks ago",
      content:
        "This is the best web development course I've ever taken. Angela explains everything so clearly and the projects are really helpful for building a portfolio.",
    },
    {
      id: "2",
      user: { name: "Sarah M.", avatar: "" },
      rating: 5,
      date: "1 month ago",
      content:
        "Comprehensive course that covers everything you need to know. I went from zero coding knowledge to building full-stack apps in just a few months.",
    },
    {
      id: "3",
      user: { name: "Mike R.", avatar: "" },
      rating: 4,
      date: "1 month ago",
      content:
        "Great course overall. Some sections could be updated with the latest framework versions, but the fundamentals are solid.",
    },
  ],
  relatedCourses: [
    {
      id: "2",
      title: "The Complete JavaScript Course",
      instructor: "Jonas Schmedtmann",
      thumbnail:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400",
      rating: 4.7,
      price: 79.99,
    },
    {
      id: "3",
      title: "React - The Complete Guide",
      instructor: "Maximilian Schwarzmüller",
      thumbnail:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      rating: 4.8,
      price: 84.99,
    },
  ],
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [couponCode, setCouponCode] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem, isInCart } = useCartStore();

  const course = mockCourse;

  const handleAddToCart = () => {
    addItem({
      id: course.id,
      title: course.title,
      instructor: course.instructor.name,
      price: course.price,
      originalPrice: course.originalPrice,
      thumbnail: course.thumbnail,
      level: course.level,
    });
  };

  const ratingDistribution = [
    { stars: 5, percentage: 72 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-12 lg:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="secondary">Bestseller</Badge>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold font-display">
                {course.title}
              </h1>

              <p className="text-lg text-primary-foreground/80">
                {course.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-warning">
                    {course.rating}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(course.rating)
                            ? "fill-warning text-warning"
                            : "text-white/30",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-primary-foreground/60">
                    ({course.reviewsCount.toLocaleString()} ratings)
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.studentsCount.toLocaleString()} students
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={course.instructor.avatar} />
                  <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-primary-foreground/60">
                    Created by
                  </p>
                  <Link
                    to={`/instructor/${course.instructor.name}`}
                    className="hover:underline font-medium"
                  >
                    {course.instructor.name}
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Updated {course.lastUpdated}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {course.language}
                </span>
              </div>
            </div>

            {/* Course Card (Desktop - Sticky) */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-24 bg-card text-card-foreground rounded-xl shadow-xl overflow-hidden"
              >
                <div className="aspect-video relative group cursor-pointer">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <PlayCircle className="h-16 w-16 text-white" />
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">${course.price}</span>
                    {course.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${course.originalPrice}
                      </span>
                    )}
                    {course.originalPrice && (
                      <Badge className="bg-success text-success-foreground">
                        {Math.round(
                          (1 - course.price / course.originalPrice) * 100,
                        )}
                        % off
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-destructive font-medium">
                    ⏰ 2 days left at this price!
                  </p>

                  <div className="space-y-2">
                    <Button
                      className="w-full h-12"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={isInCart(course.id)}
                    >
                      {isInCart(course.id) ? (
                        "Added to Cart"
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full h-12" size="lg">
                      Buy Now
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    30-Day Money-Back Guarantee
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-semibold">This course includes:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-muted-foreground" />
                        {course.duration} on-demand video
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {course.lecturesCount} articles
                      </li>
                      <li className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        85 downloadable resources
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        Certificate of completion
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 mr-1",
                          isFavorite && "fill-destructive text-destructive",
                        )}
                      />
                      Wishlist
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Apply Coupon</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button variant="secondary">Apply</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Course Card */}
      <div className="lg:hidden sticky top-16 z-30 bg-card border-b border-border p-4">
        <div className="container flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold">${course.price}</span>
            {course.originalPrice && (
              <span className="ml-2 text-muted-foreground line-through">
                ${course.originalPrice}
              </span>
            )}
          </div>
          <Button onClick={handleAddToCart} disabled={isInCart(course.id)}>
            {isInCart(course.id) ? "In Cart" : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* Course Content */}
      <div className="container py-12">
        <div className="lg:w-2/3 space-y-12">
          {/* What You'll Learn */}
          <section>
            <h2 className="text-2xl font-bold font-display mb-6">
              What you'll learn
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 p-6 border border-border rounded-xl">
              {course.whatYoullLearn.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Course Content */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-display">
                Course content
              </h2>
              <p className="text-sm text-muted-foreground">
                {course.modules.reduce((acc, m) => acc + m.lessonsCount, 0)}{" "}
                lectures • {course.duration} total length
              </p>
            </div>

            <Accordion type="multiple" className="border rounded-xl">
              {course.modules.map((module) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-semibold text-left">
                        {module.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {module.lessonsCount} lectures • {module.duration}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0">
                    <ul className="divide-y divide-border">
                      {module.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.isFree ? (
                              <PlayCircle className="h-4 w-4 text-accent" />
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">{lesson.title}</span>
                            {lesson.isFree && (
                              <Badge variant="secondary" className="text-xs">
                                Preview
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {lesson.duration}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Requirements */}
          <section>
            <h2 className="text-2xl font-bold font-display mb-6">
              Requirements
            </h2>
            <ul className="space-y-2">
              {course.requirements.map((req, index) => (
                <li key={index} className="flex gap-3">
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold font-display mb-6">
              Description
            </h2>
            <div className="prose prose-sm max-w-none">
              {course.description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Instructor */}
          <section>
            <h2 className="text-2xl font-bold font-display mb-6">Instructor</h2>
            <div className="flex gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={course.instructor.avatar} />
                <AvatarFallback className="text-2xl">
                  {course.instructor.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  to={`/instructor/${course.instructor.name}`}
                  className="text-xl font-semibold text-accent hover:underline"
                >
                  {course.instructor.name}
                </Link>
                <p className="text-muted-foreground mt-1">
                  {course.instructor.bio}
                </p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-warning" />
                    {course.instructor.rating} Instructor Rating
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {course.instructor.reviewsCount.toLocaleString()} Reviews
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {(course.instructor.studentsCount / 1000000).toFixed(1)}M
                    Students
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-2xl font-bold font-display mb-6">
              Student Reviews
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-warning">
                  {course.rating}
                </p>
                <div className="flex justify-center my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(course.rating)
                          ? "fill-warning text-warning"
                          : "text-muted",
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Course Rating</p>
              </div>

              <div className="md:col-span-2 space-y-2">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-2">
                    <Progress value={item.percentage} className="h-2" />
                    <div className="flex items-center gap-1 w-24">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < item.stars
                              ? "fill-warning text-warning"
                              : "text-muted",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground w-10">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {course.reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.user.avatar} />
                      <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{review.user.name}</p>
                        <span className="text-sm text-muted-foreground">
                          {review.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 my-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < review.rating
                                ? "fill-warning text-warning"
                                : "text-muted",
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm mt-2">{review.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-6">
              Show all reviews
            </Button>
          </section>

          {/* Related Courses */}
          <section>
            <h2 className="text-2xl font-bold font-display mb-6">
              Students also bought
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {course.relatedCourses.map((related) => (
                <Link
                  key={related.id}
                  to={`/courses/${related.id}`}
                  className="flex gap-4 p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={related.thumbnail}
                    alt={related.title}
                    className="w-24 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {related.instructor}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-sm font-medium">
                        {related.rating}
                      </span>
                    </div>
                  </div>
                  <p className="font-bold">${related.price}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
