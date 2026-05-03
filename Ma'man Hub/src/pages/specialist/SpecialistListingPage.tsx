import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Star,
  Clock,
  Users,
  MapPin,
  Filter,
  Briefcase,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SpecialistProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
}

export default function SpecialistListingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: specialists = [], isLoading } = useQuery({
    queryKey: ["specialists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "specialist");
      if (error) throw error;
      return data as SpecialistProfile[];
    },
  });

  const filtered = specialists.filter((s) => {
    const matchSearch =
      !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.bio?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  // Mock data for display since profiles may be empty
  const mockSpecialists = [
    {
      id: "1",
      user_id: "mock-1",
      full_name: "Dr. Emily Chen",
      avatar_url: null,
      bio: "PhD in Educational Psychology. Specializes in ADHD, dyslexia, and anxiety-related learning difficulties.",
      location: "Boston, MA",
      specializations: ["ADHD", "Dyslexia", "Anxiety"],
      rating: 4.9,
      sessions: 120,
      rate: 150,
      experience: 15,
    },
    {
      id: "2",
      user_id: "mock-2",
      full_name: "Dr. James Wilson",
      avatar_url: null,
      bio: "Child psychologist with expertise in behavioral learning strategies and gifted education.",
      location: "New York, NY",
      specializations: ["Gifted Education", "Behavioral Strategies"],
      rating: 4.8,
      sessions: 95,
      rate: 130,
      experience: 12,
    },
    {
      id: "3",
      user_id: "mock-3",
      full_name: "Sarah Martinez",
      avatar_url: null,
      bio: "Licensed speech-language pathologist specializing in language-based learning disabilities.",
      location: "Los Angeles, CA",
      specializations: ["Speech Therapy", "Language Disorders"],
      rating: 4.7,
      sessions: 200,
      rate: 120,
      experience: 10,
    },
    {
      id: "4",
      user_id: "mock-4",
      full_name: "Dr. Michael Okafor",
      avatar_url: null,
      bio: "Educational consultant focused on study skills, time management, and executive functioning coaching.",
      location: "Chicago, IL",
      specializations: ["Study Skills", "Time Management", "Executive Functioning"],
      rating: 4.9,
      sessions: 180,
      rate: 140,
      experience: 8,
    },
  ];

  const displayList = filtered.length > 0 ? filtered : mockSpecialists;

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Find a Specialist</h1>
          <p className="text-muted-foreground">
            Browse and book sessions with learning specialists
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="adhd">ADHD</SelectItem>
              <SelectItem value="dyslexia">Dyslexia</SelectItem>
              <SelectItem value="anxiety">Anxiety</SelectItem>
              <SelectItem value="study-skills">Study Skills</SelectItem>
              <SelectItem value="speech">Speech Therapy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {displayList.length} specialist{displayList.length !== 1 ? "s" : ""} available
        </p>

        {/* Specialist Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {(displayList as any[]).map((specialist) => (
            <Card
              key={specialist.id}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarImage src={specialist.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {(specialist.full_name || "S")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {specialist.full_name}
                        </h3>
                        {specialist.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {specialist.location}
                          </p>
                        )}
                      </div>
                      {specialist.rating && (
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {specialist.rating}
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {specialist.bio}
                    </p>

                    {specialist.specializations && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {specialist.specializations.map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {specialist.sessions && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {specialist.sessions} sessions
                          </span>
                        )}
                        {specialist.experience && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {specialist.experience}y exp
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {specialist.rate && (
                          <span className="text-sm font-semibold text-primary">
                            ${specialist.rate}/hr
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/specialists/${specialist.user_id}`)}
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(`/specialists/${specialist.user_id}/book`)
                          }
                        >
                          Book
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
