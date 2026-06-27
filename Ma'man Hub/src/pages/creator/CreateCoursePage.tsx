import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  id: string;
  name: string;
  displayOrder: number;
}

// Exact AgeGroup enum values from Domain.Enums.Content.AgeGroup
const AGE_GROUPS = [
  { value: "ForParents", label: "For Parents" },
  { value: "ForEducators", label: "For Educators" },
  { value: "Toddlers", label: "Toddlers (1–3 years)" },
  { value: "Preschool", label: "Preschool (3–5 years)" },
  { value: "EarlyPrimary", label: "Early Primary (5–8 years)" },
  { value: "LatePrimary", label: "Late Primary (8–12 years)" },
  { value: "Tweens", label: "Tweens (10–13 years)" },
  { value: "Teenagers", label: "Teenagers (13–18 years)" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [price, setPrice] = useState("");

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch categories ─────────────────────────────────────────────────────

  useEffect(() => {
    api
      .get("/category", { params: { page: 1, pageSize: 50 } })
      .then((res) => setCategories(res.data?.data?.items ?? []))
      .catch(() => setCategoriesError("Could not load categories."))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // ── Validation ───────────────────────────────────────────────────────────

  const isValid =
    title.trim().length > 0 &&
    categoryId.length > 0 &&
    ageGroup.length > 0 &&
    price.trim().length > 0 &&
    !isNaN(parseFloat(price));

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!isValid) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/coursecreator/courses", {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        ageGroup,
        price: parseFloat(price),
      });

      const newCourseId = res.data?.data?.id;
      toast({ title: "Course created!", description: "Now add a thumbnail, sections, and content." });

      if (newCourseId) {
        navigate(`/creator/courses/${newCourseId}`);
      } else {
        navigate("/creator/my-courses");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to create course. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => navigate("/creator/my-courses")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        My Courses
      </Button>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Create a New Course
        </h1>
        <p className="text-muted-foreground">
          Start with the basics — you can add sections, lessons, and video
          content once the course is created.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>All fields are required to create a course.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Introduction to Phonics for Kids"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What will students learn in this course?"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            {categoriesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading categories…
              </div>
            ) : categoriesError ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {categoriesError}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories available yet.</p>
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Age Group */}
          <div className="space-y-2">
            <Label>Age Group *</Label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Who is this course for?" />
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Course
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}