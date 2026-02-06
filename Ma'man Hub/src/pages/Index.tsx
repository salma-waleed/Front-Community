import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Star,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

const features = [
  {
    icon: BookOpen,
    title: "500+ Courses",
    description: "Learn from expert instructors",
  },
  {
    icon: Users,
    title: "50K+ Students",
    description: "Join our global community",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn recognized credentials",
  },
];

const popularCourses = [
  {
    id: "1",
    title: "Web Development Bootcamp",
    instructor: "Dr. Angela Yu",
    rating: 4.8,
    price: 89.99,
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
  },
  {
    id: "2",
    title: "Machine Learning A-Z",
    instructor: "Kirill Eremenko",
    rating: 4.6,
    price: 79.99,
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400",
  },
  {
    id: "3",
    title: "Digital Marketing",
    instructor: "Rob Percival",
    rating: 4.5,
    price: 69.99,
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
  },
];

export default function Index() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section
        className="relative py-20 lg:py-32 text-primary-foreground overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url('/BG.webp')`,
        }}
      >
        {/* Optional subtle overlay to make text more readable */}
        <div className="absolute inset-0 bg-black/35" />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl lg:text-6xl font-bold font-display mb-6">
              Transform Your Future with Online Learning
            </h1>
            <p className="text-lg lg:text-xl text-white/95 mb-8">
              Access world-class education from anywhere. Join thousands of
              learners advancing their careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 text-lg"
                >
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 text-lg transition-colors hover:bg-primary-foreground/10 hover:text-white"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20 border-b bg-background">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="text-center group cursor-default"
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold font-display">Popular Courses</h2>
            <Link to="/courses">
              <Button variant="ghost">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {popularCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/courses/${course.id}`} className="block group">
                  <div className="bg-card rounded-xl border overflow-hidden shadow-card course-card-hover">
                    <div className="relative aspect-video">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold group-hover:text-accent transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.instructor}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium text-sm">
                            {course.rating}
                          </span>
                        </div>
                        <span className="font-bold">${course.price}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-primary to-accent">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4 text-white">
              Ready to Start Learning?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join our community of learners and take the first step towards
              your goals.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="h-14 px-8 text-lg bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
