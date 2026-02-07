import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  BookOpen,
  Trophy,
  Clock,
  GraduationCap,
  Star,
  Target,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";

const enrolledCourses = [
  { id: 1, title: "React Masterclass", progress: 75, instructor: "John Doe" },
  {
    id: 2,
    title: "TypeScript Fundamentals",
    progress: 45,
    instructor: "Jane Smith",
  },
  { id: 3, title: "Node.js Backend", progress: 20, instructor: "Mike Johnson" },
];

const achievements = [
  {
    id: 1,
    title: "Fast Learner",
    description: "Completed 5 lessons in one day",
    icon: "🚀",
  },
  {
    id: 2,
    title: "Quiz Master",
    description: "Scored 100% on 3 quizzes",
    icon: "🏆",
  },
  {
    id: 3,
    title: "Dedicated Student",
    description: "7-day learning streak",
    icon: "🔥",
  },
];

export default function StudentProfilePage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    email: user?.email || "alex@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate learner exploring web development and design.",
    learningGoals: "Master full-stack development by the end of the year.",
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Compact Top Bar Header */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-2 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-30 blur-lg"></div>
                  <Avatar className="relative h-20 w-20 border-4 border-white shadow-2xl ring-4 ring-cyan-200">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 text-2xl font-bold text-white">
                      {profile.firstName.charAt(0)}
                      {profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-xl hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-gray-600">
                    <Sparkles className="inline h-3.5 w-3.5 text-yellow-500" />{" "}
                    Student Learner
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-0 px-4 py-2">
                  <BookOpen className="mr-1.5 h-4 w-4" />
                  {enrolledCourses.length} Courses
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 px-4 py-2">
                  <Trophy className="mr-1.5 h-4 w-4" />
                  {achievements.length} Achievements
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-4 py-2">
                  <Clock className="mr-1.5 h-4 w-4" />
                  42 Hours
                </Badge>
                <Button
                  onClick={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 shadow-lg"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout: Sidebar + Main Content */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Sidebar - Compact Navigation */}
          <div className="lg:col-span-3">
            <Tabs
              defaultValue="profile"
              orientation="vertical"
              className="space-y-4"
            >
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardContent className="p-4">
                  <TabsList className="flex flex-col h-auto gap-2 bg-transparent p-0 w-full">
                    <TabsTrigger
                      value="profile"
                      className="w-full justify-start rounded-xl px-4 py-3.5 text-left data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                    >
                      <User className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="courses"
                      className="w-full justify-start rounded-xl px-4 py-3.5 text-left data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                    >
                      <GraduationCap className="mr-3 h-5 w-5" />
                      <span className="font-semibold">My Courses</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="achievements"
                      className="w-full justify-start rounded-xl px-4 py-3.5 text-left data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                    >
                      <Trophy className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Achievements</span>
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>

              {/* Quick Stats Sidebar */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 p-2.5 shadow-md">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">
                          Avg Progress
                        </p>
                        <p className="text-xl font-bold text-gray-900">47%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 p-2.5 shadow-md">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">
                          Completion
                        </p>
                        <p className="text-xl font-bold text-gray-900">1/3</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 p-2.5 shadow-md">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">
                          Active Goal
                        </p>
                        <p className="text-xl font-bold text-gray-900">1</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Tabs>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-9">
            <Tabs defaultValue="profile" className="space-y-6">
              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-0 space-y-6">
                <Card className="overflow-hidden border-0 shadow-xl">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
                  <CardHeader className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50">
                    <CardTitle className="flex items-center gap-2 text-cyan-900">
                      <User className="h-6 w-6 text-cyan-600" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-bold text-gray-700"
                        >
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              firstName: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-bold text-gray-700"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) =>
                            setProfile({ ...profile, lastName: e.target.value })
                          }
                          disabled={!isEditing}
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-bold text-gray-700"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-500" />
                        <Input
                          id="email"
                          type="email"
                          className="h-12 rounded-xl border-2 border-gray-200 pl-12 focus:border-cyan-500 focus:ring-cyan-500"
                          value={profile.email}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-bold text-gray-700"
                        >
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                          <Input
                            id="phone"
                            className="h-12 rounded-xl border-2 border-gray-200 pl-12 focus:border-blue-500 focus:ring-blue-500"
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-sm font-bold text-gray-700"
                        >
                          Location
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />
                          <Input
                            id="location"
                            className="h-12 rounded-xl border-2 border-gray-200 pl-12 focus:border-purple-500 focus:ring-purple-500"
                            value={profile.location}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                location: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="bio"
                        className="text-sm font-bold text-gray-700"
                      >
                        About Me
                      </Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        disabled={!isEditing}
                        className="rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="goals"
                        className="text-sm font-bold text-gray-700 flex items-center gap-2"
                      >
                        <Target className="h-4 w-4 text-orange-500" />
                        Learning Goals
                      </Label>
                      <Textarea
                        id="goals"
                        rows={3}
                        value={profile.learningGoals}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            learningGoals: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="mt-0">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="h-7 w-7 text-blue-600" />
                        Enrolled Courses
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Track your learning progress
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {enrolledCourses.map((course, index) => (
                      <Card
                        key={course.id}
                        className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all"
                      >
                        <div
                          className={`h-2 ${
                            index === 0
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                              : index === 1
                                ? "bg-gradient-to-r from-blue-500 to-purple-500"
                                : "bg-gradient-to-r from-purple-500 to-pink-500"
                          }`}
                        ></div>
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div
                              className={`rounded-2xl p-5 ${
                                index === 0
                                  ? "bg-gradient-to-br from-cyan-400 to-blue-500"
                                  : index === 1
                                    ? "bg-gradient-to-br from-blue-400 to-purple-500"
                                    : "bg-gradient-to-br from-purple-400 to-pink-500"
                              } shadow-lg`}
                            >
                              <GraduationCap className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-gray-900">
                              {course.title}
                            </h3>
                            <p className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                              <User className="h-3.5 w-3.5" />
                              by {course.instructor}
                            </p>

                            <div className="mt-5 w-full space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">
                                  Progress
                                </span>
                                <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 border-0 font-bold">
                                  {course.progress}%
                                </Badge>
                              </div>
                              <div className="relative h-3 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    index === 0
                                      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                      : index === 1
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500"
                                        : "bg-gradient-to-r from-purple-500 to-pink-500"
                                  }`}
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="mt-0">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="h-7 w-7 text-purple-600" />
                        Achievements
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Badges and milestones you've earned
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {achievements.map((achievement, index) => (
                      <Card
                        key={achievement.id}
                        className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all"
                      >
                        <div
                          className={`h-2 ${
                            index === 0
                              ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                              : index === 1
                                ? "bg-gradient-to-r from-purple-400 to-pink-500"
                                : "bg-gradient-to-r from-orange-400 to-red-500"
                          }`}
                        ></div>
                        <CardContent className="p-8 text-center">
                          <div
                            className={`mx-auto inline-flex h-24 w-24 items-center justify-center rounded-2xl ${
                              index === 0
                                ? "bg-gradient-to-br from-cyan-100 to-blue-100"
                                : index === 1
                                  ? "bg-gradient-to-br from-purple-100 to-pink-100"
                                  : "bg-gradient-to-br from-orange-100 to-red-100"
                            } shadow-lg`}
                          >
                            <span className="text-6xl">{achievement.icon}</span>
                          </div>
                          <h3 className="mt-5 text-lg font-bold text-gray-900">
                            {achievement.title}
                          </h3>
                          <p className="mt-2 text-sm text-gray-600">
                            {achievement.description}
                          </p>
                          <Badge className="mt-4 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 hover:from-yellow-200 hover:to-amber-200 border-0">
                            <Award className="mr-1 h-3 w-3" />
                            Unlocked
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
