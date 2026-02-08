import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Star,
  Clock,
  Users,
  Heart,
  ShoppingCart,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

// Mock data
const mockCourses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp 2024",
    instructor: "Dr. Angela Yu",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
    rating: 4.8,
    reviewsCount: 12543,
    price: 89.99,
    originalPrice: 199.99,
    level: "Beginner",
    duration: "52 hours",
    studentsCount: 234567,
    category: "Development",
  },
  {
    id: "2",
    title: "Machine Learning A-Z: AI, Python & R",
    instructor: "Kirill Eremenko",
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400",
    rating: 4.6,
    reviewsCount: 8921,
    price: 79.99,
    originalPrice: 149.99,
    level: "Intermediate",
    duration: "44 hours",
    studentsCount: 156789,
    category: "Data Science",
  },
  {
    id: "3",
    title: "The Complete Digital Marketing Course",
    instructor: "Rob Percival",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    rating: 4.5,
    reviewsCount: 6543,
    price: 69.99,
    originalPrice: 129.99,
    level: "Beginner",
    duration: "28 hours",
    studentsCount: 98765,
    category: "Marketing",
  },
  {
    id: "4",
    title: "iOS & Swift - The Complete iOS App Development",
    instructor: "Angela Yu",
    thumbnail:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
    rating: 4.9,
    reviewsCount: 15234,
    price: 99.99,
    originalPrice: 249.99,
    level: "Intermediate",
    duration: "60 hours",
    studentsCount: 345678,
    category: "Development",
  },
  {
    id: "5",
    title: "UX Design Fundamentals",
    instructor: "Sarah Anderson",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
    rating: 4.7,
    reviewsCount: 4321,
    price: 59.99,
    originalPrice: 99.99,
    level: "Beginner",
    duration: "18 hours",
    studentsCount: 67890,
    category: "Design",
  },
  {
    id: "6",
    title: "Advanced React and Redux",
    instructor: "Stephen Grider",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    rating: 4.8,
    reviewsCount: 9876,
    price: 84.99,
    originalPrice: 169.99,
    level: "Advanced",
    duration: "36 hours",
    studentsCount: 123456,
    category: "Development",
  },
];

const categories = [
  "All Categories",
  "Development",
  "Business",
  "Design",
  "Marketing",
  "Data Science",
  "Photography",
  "Music",
];

const levels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["English", "Spanish", "French", "German", "Japanese"];

export default function CoursesCatalogPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { addItem, isInCart } = useCartStore();

  const toggleFavorite = (courseId: string) => {
    setFavorites((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const handleAddToCart = (course: (typeof mockCourses)[0]) => {
    addItem({
      id: course.id,
      title: course.title,
      instructor: course.instructor,
      price: course.price,
      originalPrice: course.originalPrice,
      thumbnail: course.thumbnail,
      level: course.level,
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedLanguages([]);
    setPriceRange([0, 200]);
    setMinRating(0);
  };

  const filteredCourses = mockCourses.filter((course) => {
    if (
      searchQuery &&
      !course.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (course.price < priceRange[0] || course.price > priceRange[1]) {
      return false;
    }
    if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) {
      return false;
    }
    if (course.rating < minRating) {
      return false;
    }
    return true;
  });

  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn("space-y-6", isMobile && "p-4")}>
      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-semibold">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={200}
          step={10}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}+</span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-semibold">Category</h3>
        {categories.slice(1).map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={`cat-${category}`}
              checked={selectedCategories.includes(category)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedCategories([...selectedCategories, category]);
                } else {
                  setSelectedCategories(
                    selectedCategories.filter((c) => c !== category),
                  );
                }
              }}
            />
            <Label htmlFor={`cat-${category}`} className="text-sm font-normal">
              {category}
            </Label>
          </div>
        ))}
      </div>

      {/* Level */}
      <div className="space-y-3">
        <h3 className="font-semibold">Level</h3>
        {levels.map((level) => (
          <div key={level} className="flex items-center space-x-2">
            <Checkbox
              id={`level-${level}`}
              checked={selectedLevels.includes(level)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedLevels([...selectedLevels, level]);
                } else {
                  setSelectedLevels(selectedLevels.filter((l) => l !== level));
                }
              }}
            />
            <Label htmlFor={`level-${level}`} className="text-sm font-normal">
              {level}
            </Label>
          </div>
        ))}
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h3 className="font-semibold">Rating</h3>
        {[4.5, 4.0, 3.5, 3.0].map((rating) => (
          <button
            key={rating}
            onClick={() => setMinRating(rating)}
            className={cn(
              "flex items-center gap-2 w-full text-left py-1 text-sm transition-colors",
              minRating === rating
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(rating)
                      ? "fill-warning text-warning"
                      : "text-muted",
                  )}
                />
              ))}
            </div>
            <span>{rating}+</span>
          </button>
        ))}
      </div>

      {/* Language */}
      <div className="space-y-3">
        <h3 className="font-semibold">Language</h3>
        {languages.map((language) => (
          <div key={language} className="flex items-center space-x-2">
            <Checkbox
              id={`lang-${language}`}
              checked={selectedLanguages.includes(language)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedLanguages([...selectedLanguages, language]);
                } else {
                  setSelectedLanguages(
                    selectedLanguages.filter((l) => l !== language),
                  );
                }
              }}
            />
            <Label htmlFor={`lang-${language}`} className="text-sm font-normal">
              {language}
            </Label>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">
            Explore Courses
          </h1>
          <p className="text-muted-foreground">
            Discover over 500+ courses from expert instructors
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <FilterSidebar isMobile />
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden sm:flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Course Grid */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredCourses.length} of {mockCourses.length} courses
            </p>

            {isLoading ? (
              <div
                className={cn(
                  "gap-6",
                  viewMode === "grid"
                    ? "grid sm:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4",
                )}
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters}>Clear all filters</Button>
              </div>
            ) : (
              <motion.div
                layout
                className={cn(
                  "gap-6",
                  viewMode === "grid"
                    ? "grid sm:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4",
                )}
              >
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group bg-card rounded-xl border border-border overflow-hidden shadow-card course-card-hover",
                      viewMode === "list" && "flex",
                    )}
                  >
                    <Link
                      to={`/courses/${course.id}`}
                      className={cn(
                        "block",
                        viewMode === "list" && "w-64 flex-shrink-0",
                      )}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(course.id);
                          }}
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center transition-colors hover:bg-white"
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4",
                              favorites.includes(course.id)
                                ? "fill-destructive text-destructive"
                                : "text-muted-foreground",
                            )}
                          />
                        </button>
                        <Badge
                          className="absolute top-3 left-3"
                          variant="secondary"
                        >
                          {course.level}
                        </Badge>
                      </div>
                    </Link>

                    <div className="p-4 flex-1">
                      <Link to={`/courses/${course.id}`}>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-accent transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.instructor}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="font-medium text-sm">
                              {course.rating}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-sm">
                            ({course.reviewsCount.toLocaleString()})
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {course.studentsCount.toLocaleString()}
                          </span>
                        </div>
                      </Link>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">
                            ${course.price}
                          </span>
                          {course.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${course.originalPrice}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(course)}
                          disabled={isInCart(course.id)}
                        >
                          {isInCart(course.id) ? (
                            "In Cart"
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {filteredCourses.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <Button
                    key={page}
                    variant={page === 1 ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
