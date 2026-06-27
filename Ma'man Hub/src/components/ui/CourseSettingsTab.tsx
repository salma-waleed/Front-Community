import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseSettingsData {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  price: number;
  discountPrice: number | null;
  isPublished: boolean;
  ageGroup: string; // e.g. "Adult", "Teen" - matches AgeGroup enum name from backend
}

interface Props {
  course: CourseSettingsData;
  onUpdated?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourseSettingsTab({ course, onUpdated }: Props) {
  const { toast } = useToast();

  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [price, setPrice] = useState(course.price.toString());

  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  // ── Save basic details ───────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/coursecreator/courses/${course.id}`, {
        title,
        description,
        categoryId: course.categoryId,
        ageGroup: course.ageGroup, // carried through unchanged - this tab doesn't edit it
        price: parseFloat(price) || 0,
        isPublished: course.isPublished,
      });
      toast({ title: "Course updated" });
      onUpdated?.();
    } catch {
      toast({ title: "Failed to save changes", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Toggle publish status ────────────────────────────────────────────────

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    try {
      await api.post(`/coursecreator/courses/${course.id}/publish`, {
        publish: !course.isPublished,
      });
      toast({
        title: course.isPublished ? "Course unpublished" : "Course published",
      });
      onUpdated?.();
    } catch {
      toast({ title: "Failed to update publish status", variant: "destructive" });
    } finally {
      setIsTogglingPublish(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Title, description, and pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Publish status */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>
            Published courses are visible to students and can be enrolled in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {course.isPublished ? (
                <Eye className="h-5 w-5 text-success" />
              ) : (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {course.isPublished ? "Published" : "Draft"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {course.isPublished
                    ? "Students can find and enroll in this course."
                    : "Only you can see this course."}
                </p>
              </div>
            </div>
            <Switch
              checked={course.isPublished}
              onCheckedChange={handleTogglePublish}
              disabled={isTogglingPublish}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}