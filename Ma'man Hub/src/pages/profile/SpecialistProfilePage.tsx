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
import {
  Mail,
  Phone,
  MapPin,
  Camera,
  Users,
  Star,
  Calendar,
  Clock,
  Award,
  Briefcase,
  GraduationCap,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const certifications = [
  {
    id: 1,
    name: "AWS Certified Solutions Architect",
    issuer: "Amazon",
    year: "2024",
  },
  { id: 2, name: "Google Cloud Professional", issuer: "Google", year: "2023" },
  {
    id: 3,
    name: "Certified Kubernetes Administrator",
    issuer: "CNCF",
    year: "2023",
  },
];

const availability = [
  { day: "Monday", slots: ["9:00 AM", "2:00 PM", "4:00 PM"] },
  { day: "Tuesday", slots: ["10:00 AM", "3:00 PM"] },
  { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM"] },
  { day: "Thursday", slots: ["10:00 AM", "4:00 PM"] },
  { day: "Friday", slots: ["9:00 AM", "1:00 PM"] },
];

export default function SpecialistProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Dr. Emily",
    lastName: "Chen",
    email: "emily.chen@example.com",
    phone: "+1 (555) 456-7890",
    location: "Boston, MA",
    title: "Learning Specialist & Educational Psychologist",
    bio: "PhD in Educational Psychology with 15 years of experience helping students overcome learning challenges. Specialized in ADHD, dyslexia, and anxiety-related learning difficulties.",
    specializations: "ADHD, Dyslexia, Anxiety, Study Skills, Time Management",
    hourlyRate: "150",
    yearsExperience: "15",
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
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">
                    {profile.firstName.charAt(0)}
                    {profile.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <Badge className="bg-purple-500">Specialist</Badge>
                </div>
                <p className="text-muted-foreground">{profile.title}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    4.9 Rating
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    120+ Students
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {profile.yearsExperience} Years
                  </span>
                </div>
              </div>
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="rates">Rates</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Your specialist profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={profile.title}
                    onChange={(e) =>
                      setProfile({ ...profile, title: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations</Label>
                  <Input
                    id="specializations"
                    value={profile.specializations}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        specializations: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.specializations.split(", ").map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-9"
                        value={profile.email}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-9"
                        value={profile.phone}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications & Credentials
                  </CardTitle>
                  <CardDescription>
                    Your professional certifications
                  </CardDescription>
                </div>
                <Button>Add Certification</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cert.issuer} • {cert.year}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Availability Schedule
                </CardTitle>
                <CardDescription>Set your available time slots</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availability.map((day) => (
                  <div key={day.day} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{day.day}</h3>
                      <div className="flex flex-wrap gap-2">
                        {day.slots.map((slot) => (
                          <Badge key={slot} variant="secondary">
                            <Clock className="mr-1 h-3 w-3" />
                            {slot}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Edit Availability
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rates Tab */}
          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle>Session Rates</CardTitle>
                <CardDescription>
                  Configure your consultation pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) =>
                      setProfile({ ...profile, hourlyRate: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">30-min Session</h4>
                    <p className="text-2xl font-bold mt-2">
                      ${parseInt(profile.hourlyRate) / 2}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">60-min Session</h4>
                    <p className="text-2xl font-bold mt-2">
                      ${profile.hourlyRate}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Platform fee: 15% per session. You'll receive $
                    {(parseInt(profile.hourlyRate) * 0.85).toFixed(2)} per hour
                    after fees.
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
