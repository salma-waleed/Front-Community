import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Star, Briefcase, Users, Calendar, Award, GraduationCap } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const mockSpecialists: Record<string, any> = {
  "mock-1": { full_name: "Dr. Emily Chen", avatar_url: null, bio: "PhD in Educational Psychology with 15+ years helping students overcome ADHD, dyslexia, and anxiety-related learning difficulties. My approach blends evidence-based strategies with personalized coaching.", location: "Boston, MA", specializations: ["ADHD", "Dyslexia", "Anxiety"], rating: 4.9, sessions: 120, rate: 150, experience: 15, education: "PhD, Harvard University" },
  "mock-2": { full_name: "Dr. James Wilson", avatar_url: null, bio: "Child psychologist with expertise in behavioral learning strategies and gifted education. I help families unlock their child's full potential.", location: "New York, NY", specializations: ["Gifted Education", "Behavioral Strategies"], rating: 4.8, sessions: 95, rate: 130, experience: 12, education: "PhD, Columbia University" },
  "mock-3": { full_name: "Sarah Martinez", avatar_url: null, bio: "Licensed speech-language pathologist specializing in language-based learning disabilities and articulation therapy.", location: "Los Angeles, CA", specializations: ["Speech Therapy", "Language Disorders"], rating: 4.7, sessions: 200, rate: 120, experience: 10, education: "MS, UCLA" },
  "mock-4": { full_name: "Dr. Michael Okafor", avatar_url: null, bio: "Educational consultant focused on study skills, time management, and executive functioning coaching for teens and college students.", location: "Chicago, IL", specializations: ["Study Skills", "Time Management", "Executive Functioning"], rating: 4.9, sessions: 180, rate: 140, experience: 8, education: "EdD, Northwestern" },
};

export default function PublicSpecialistProfilePage() {
  const { specialistId } = useParams();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["public-specialist", specialistId],
    queryFn: async () => {
      if (!specialistId) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", specialistId)
        .maybeSingle();
      return data;
    },
    enabled: !!specialistId && !specialistId.startsWith("mock"),
  });

  const mock = specialistId && mockSpecialists[specialistId];
  const display = profile
    ? {
        full_name: profile.full_name || "Specialist",
        avatar_url: profile.avatar_url,
        bio: profile.bio || "Helping learners reach their full potential.",
        location: profile.location,
        specializations: ["Learning Support"],
        rating: 4.8,
        sessions: 0,
        rate: 100,
        experience: 5,
        education: "Licensed Specialist",
      }
    : mock || mockSpecialists["mock-1"];

  return (
    <MainLayout>
      {/* Banner */}
      <div className="relative h-48 md:h-64 gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary)/0.5),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,hsl(var(--accent)/0.4),transparent_50%)]" />
        <div className="container relative h-full flex items-end pb-4">
          <Link to="/specialists">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Specialists
            </Button>
          </Link>
        </div>
      </div>

      <div className="container -mt-16 pb-12 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-32 w-32 ring-4 ring-background -mt-20 shadow-xl">
                  <AvatarImage src={display.avatar_url || undefined} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {(display.full_name || "S").split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold font-display">{display.full_name}</h1>
                    <Badge className="bg-primary text-primary-foreground">Verified Specialist</Badge>
                  </div>
                  {display.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-3.5 w-3.5" /> {display.location}
                    </p>
                  )}
                  <p className="text-foreground/80 mb-4 max-w-2xl">{display.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {display.specializations.map((s: string) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-2xl font-bold text-primary">${display.rate}<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
                  <Button onClick={() => navigate(`/specialists/${specialistId}/book`)}>
                    <Calendar className="mr-2 h-4 w-4" /> Book Session
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
                <div className="text-center">
                  <Star className="h-5 w-5 mx-auto mb-1 fill-warning text-warning" />
                  <p className="text-xl font-bold">{display.rating}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{display.sessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div className="text-center">
                  <Briefcase className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{display.experience}y</p>
                  <p className="text-xs text-muted-foreground">Experience</p>
                </div>
                <div className="text-center">
                  <Award className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="text-xl font-bold">Pro</p>
                  <p className="text-xs text-muted-foreground">Tier</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About sections */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-primary" /> Education
              </h2>
              <p className="text-sm text-muted-foreground">{display.education}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-accent" /> Approach
              </h2>
              <p className="text-sm text-muted-foreground">
                Personalized, evidence-based sessions tailored to each learner's pace and goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
