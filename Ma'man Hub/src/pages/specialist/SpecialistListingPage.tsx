import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  Briefcase,
  Users,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  specialistService,
  GetSpecialistsParams,
  SpecialistListItemDto,
} from "@/services/specialistService";
import { useDebounce } from "@/hooks/useDebounce"; // assumes you have this

const PAGE_SIZE = 12;

const SPECIALIZATION_OPTIONS = [
  { value: "all", label: "All Specialties" },
  { value: "ADHD", label: "ADHD" },
  { value: "Dyslexia", label: "Dyslexia" },
  { value: "Anxiety", label: "Anxiety" },
  { value: "Study Skills", label: "Study Skills" },
  { value: "Speech Therapy", label: "Speech Therapy" },
  { value: "Gifted Education", label: "Gifted Education" },
  { value: "Executive Functioning", label: "Executive Functioning" },
];

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "rate-asc", label: "Price: Low to High" },
  { value: "rate-desc", label: "Price: High to Low" },
  { value: "experience", label: "Most Experienced" },
];

function SpecialistCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SpecialistCard({ specialist }: { specialist: SpecialistListItemDto }) {
  const navigate = useNavigate();

  const initials = specialist.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={specialist.profilePictureUrl || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {specialist.fullName}
                </h3>
                {specialist.professionalTitle && (
                  <p className="text-sm text-muted-foreground truncate">
                    {specialist.professionalTitle}
                  </p>
                )}
                {specialist.country && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {specialist.country}
                  </p>
                )}
              </div>

              {specialist.rating > 0 && (
                <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {specialist.rating.toFixed(1)}
                  {specialist.reviewsCount > 0 && (
                    <span className="text-muted-foreground font-normal">
                      ({specialist.reviewsCount})
                    </span>
                  )}
                </div>
              )}
            </div>

            {specialist.bio && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {specialist.bio}
              </p>
            )}

            {specialist.specializations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {specialist.specializations.slice(0, 3).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s}
                  </Badge>
                ))}
                {specialist.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{specialist.specializations.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {specialist.studentsHelped > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {specialist.studentsHelped} Sessions
                  </span>
                )}
                {specialist.yearsOfExperience > 0 && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {specialist.yearsOfExperience}y exp
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {specialist.hourlyRate > 0 && (
                  <span className="text-sm font-semibold text-primary">
                    ${specialist.hourlyRate}/hr
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/profile/${specialist.id}`)}
                >
                  View Profile
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(`/specialists/${specialist.id}/book`)}
                >
                  Book
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SpecialistListingPage() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [sort, setSort] = useState("rating");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams: GetSpecialistsParams = {
    search: debouncedSearch || undefined,
    specialization: specialization !== "all" ? specialization : undefined,
    sortBy: sort.startsWith("rate") ? "rate" : sort,
    sortOrder: sort === "rate-asc" ? "asc" : "desc",
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["specialists", queryParams],
    queryFn: () => specialistService.getSpecialists(queryParams),
    placeholderData: (prev) => prev,
  });

  // Reset to page 1 when filters change
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleSpecialization = useCallback((val: string) => {
    setSpecialization(val);
    setPage(1);
  }, []);

  const handleSort = useCallback((val: string) => {
    setSort(val);
    setPage(1);
  }, []);

  const specialists = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Find a Specialist
          </h1>
          <p className="text-muted-foreground">
            Browse and book sessions with learning specialists
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, title..."
              className="pl-9"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <Select value={specialization} onValueChange={handleSpecialization}>
            <SelectTrigger className="w-full sm:w-52">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={handleSort}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {totalCount} specialist{totalCount !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Cards */}
        {isError ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Failed to load specialists. Please try again.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SpecialistCardSkeleton key={i} />
            ))}
          </div>
        ) : specialists.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No specialists found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {specialists.map((s) => (
              <SpecialistCard key={s.id} specialist={s} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}