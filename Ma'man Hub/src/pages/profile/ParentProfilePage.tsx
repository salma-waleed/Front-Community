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
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Users,
  Bell,
  Shield,
  CreditCard,
  Settings,
  Heart,
  Plus,
  ChevronRight,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const linkedChildren = [
  { id: 1, name: "Emma Johnson", age: 12, avatar: "", courses: 3 },
  { id: 2, name: "Liam Johnson", age: 9, avatar: "", courses: 2 },
];

export default function ParentProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 987-6543",
    location: "Los Angeles, CA",
    bio: "Parent of two wonderful kids who love learning.",
  });

  const [notifications, setNotifications] = useState({
    progressUpdates: true,
    weeklyReports: true,
    achievementAlerts: true,
    paymentReminders: true,
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  const notificationLabels = {
    progressUpdates: "Progress Updates",
    weeklyReports: "Weekly Reports",
    achievementAlerts: "Achievement Alerts",
    paymentReminders: "Payment Reminders",
  };

  const notificationDescriptions = {
    progressUpdates: "Receive notifications for progress updates",
    weeklyReports: "Receive notifications for weekly reports",
    achievementAlerts: "Receive notifications for achievement alerts",
    paymentReminders: "Receive notifications for payment reminders",
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Warm Header Section with Softer Colors */}
        <Card className="border-0 bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 shadow-md">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-400 to-orange-400 opacity-75 blur group-hover:opacity-100 transition"></div>
                  <Avatar className="relative h-28 w-28 border-4 border-white shadow-lg">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-rose-400 to-orange-400 text-2xl font-bold text-white">
                      {profile.firstName.charAt(0)}
                      {profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-rose-500 shadow-lg hover:bg-rose-600"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200">
                        <Heart className="mr-1 h-3 w-3" />
                        Parent Account
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                        <Users className="mr-1 h-3 w-3" />
                        {linkedChildren.length} Children
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                        <Shield className="mr-1 h-3 w-3" />
                        Parental Controls Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg"
              >
                <Settings className="mr-2 h-4 w-4" />
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs with Rounded Design */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="inline-flex h-auto w-full gap-2 rounded-xl bg-transparent p-0">
            <TabsTrigger
              value="profile"
              className="flex-1 rounded-lg border-2 border-transparent bg-white data-[state=active]:border-rose-500 data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 shadow-sm"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="children"
              className="flex-1 rounded-lg border-2 border-transparent bg-white data-[state=active]:border-orange-500 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 shadow-sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Children
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex-1 rounded-lg border-2 border-transparent bg-white data-[state=active]:border-purple-500 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 shadow-sm"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="flex-1 rounded-lg border-2 border-transparent bg-white data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 shadow-sm"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-2 border-rose-100 shadow-sm">
              <CardHeader className="space-y-1 bg-gradient-to-r from-rose-50 to-orange-50">
                <CardTitle className="flex items-center gap-2 text-rose-900">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="flex items-center gap-2 font-semibold text-gray-700"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                      className="h-11 rounded-lg border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="flex items-center gap-2 font-semibold text-gray-700"
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
                      className="h-11 rounded-lg border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 font-semibold text-gray-700"
                  >
                    <Mail className="h-4 w-4 text-rose-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled={!isEditing}
                    className="h-11 rounded-lg border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 font-semibold text-gray-700"
                  >
                    <Phone className="h-4 w-4 text-orange-500" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="h-11 rounded-lg border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="flex items-center gap-2 font-semibold text-gray-700"
                  >
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    disabled={!isEditing}
                    className="h-11 rounded-lg border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="bio"
                    className="flex items-center gap-2 font-semibold text-gray-700"
                  >
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    disabled={!isEditing}
                    className="rounded-lg border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Children Tab */}
          <TabsContent value="children">
            <Card className="border-2 border-orange-100 shadow-sm">
              <CardHeader className="space-y-1 bg-gradient-to-r from-orange-50 to-yellow-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-orange-900">
                      <Users className="h-5 w-5" />
                      Linked Children
                    </CardTitle>
                    <CardDescription>
                      Manage your children's accounts
                    </CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Child
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {linkedChildren.map((child) => (
                  <div
                    key={child.id}
                    className="group relative overflow-hidden rounded-xl border-2 border-orange-100 bg-gradient-to-r from-white to-orange-50/30 p-5 transition-all hover:border-orange-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-orange-200">
                          <AvatarImage src={child.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-400 text-lg font-bold text-white">
                            {child.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {child.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              Age: {child.age}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              {child.courses} courses enrolled
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                      >
                        View Progress
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-2 border-purple-100 shadow-sm">
              <CardHeader className="space-y-1 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control how you receive updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border-2 border-purple-100 bg-purple-50/30 p-5 transition-colors hover:bg-purple-50"
                  >
                    <div className="space-y-0.5">
                      <Label
                        htmlFor={key}
                        className="text-base font-semibold text-gray-900"
                      >
                        {
                          notificationLabels[
                            key as keyof typeof notificationLabels
                          ]
                        }
                      </Label>
                      <p className="text-sm text-gray-600">
                        {
                          notificationDescriptions[
                            key as keyof typeof notificationDescriptions
                          ]
                        }
                      </p>
                    </div>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [key]: checked })
                      }
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="border-2 border-blue-100 shadow-sm">
              <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CreditCard className="h-5 w-5" />
                  Billing & Payments
                </CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 text-white shadow-xl">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                  <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div>
                        <CreditCard className="h-10 w-10 text-white/90" />
                        <p className="mt-6 font-mono text-xl tracking-wider">
                          •••• •••• •••• 4242
                        </p>
                        <p className="mt-2 text-sm text-white/80">
                          Expires 12/26
                        </p>
                      </div>
                      <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Default
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-lg text-base font-semibold"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Payment Method
                </Button>

                <div className="rounded-xl bg-blue-50 border-2 border-blue-100 p-4">
                  <p className="text-sm text-blue-900">
                    💳 <span className="font-semibold">Secure Payments:</span>{" "}
                    Your payment information is encrypted and stored securely.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
