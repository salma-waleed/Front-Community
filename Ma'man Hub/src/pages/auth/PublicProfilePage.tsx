import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BookOpen, Trophy, Clock, Loader2, MapPin, Calendar, ArrowLeft,
  GraduationCap, Award, MessageSquare, Star, Users, Briefcase,
  ExternalLink, Link as LinkIcon, DollarSign, Video, Clock3,
  Download, Eye, FileText, ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { ShareProfileDialog } from "@/components/profile/ShareProfileDialog";
import { cn } from "@/lib/utils";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface SocialLinkDto { id: string; name: string; value: string; }

interface CertificationPublicDto {
  id: string;
  name: string;
  issuer: string;
  year: string;
  documentUrl?: string;
}

interface ExperienceDto {
  id: string;
  title: string;
  place: string;
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
}

interface VisibleCourseDto {
  id: string;
  title: string;
  thumbnail?: string;
  studentsCount: number;
  rating: number;
  category: string;
}

interface RecentAchievementDto { name: string; earnedDate: string; }
interface EnrolledCourseDto { name: string; instructor: string; progress?: number; }
interface AvailabilitySlotPublicDto { day: string; startTime: string; endTime: string; }

interface PublicProfileDto {
  id: string;
  fullName: string;
  profilePictureUrl?: string;
  bio?: string;
  country?: string;
  role: string;
  joinedDate: string;
  socialLinks?: SocialLinkDto[];
  // Student / Parent
  enrolledCourses?: number;
  achievements?: number;
  totalHoursLearned?: number;
  learningGoals?: string;
  recentAchievements?: RecentAchievementDto[];
  enrolledCoursesList?: EnrolledCourseDto[];
  // Creator
  specializations?: string[];
  totalCourses?: number;
  totalStudents?: number;
  averageRating?: number;
  certifications?: CertificationPublicDto[];
  experiences?: ExperienceDto[];
  visibleCourses?: VisibleCourseDto[];
  // Specialist
  professionalTitle?: string;
  yearsOfExperience?: number;
  hourlyRate?: number;
  rating?: number;
  studentsHelped?: number;
  availabilitySlots?: AvailabilitySlotPublicDto[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";
const fmtMonth = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long" });

// ── Sub-components ────────────────────────────────────────────────────────────

function SocialLinksSection({ links }: { links?: SocialLinkDto[] }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2 pt-1">
      {links.map(link => (
        <a key={link.id} href={link.value} target="_blank" rel="noopener noreferrer">
          <Badge variant="outline" className="flex items-center gap-1 cursor-pointer hover:bg-muted transition-colors">
            <LinkIcon className="h-3 w-3" />{link.name}<ExternalLink className="h-3 w-3 ml-0.5" />
          </Badge>
        </a>
      ))}
    </div>
  );
}

// ── Certification viewer modal ────────────────────────────────────────────────

function CertificationViewerModal({
  cert,
  open,
  onClose,
}: {
  cert: CertificationPublicDto | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!cert) return null;

  const isPdf =
    cert.name?.toLowerCase().endsWith(".pdf") ||
    cert.documentUrl?.toLowerCase().includes(".pdf");
  const isImage =
    !!cert.documentUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(cert.documentUrl);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await userService.downloadCertification(cert.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cert.name || `${cert.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Download failed",
        description: "Could not download the certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex flex-row items-start justify-between px-6 py-4 border-b shrink-0">
          <div className="space-y-0.5 pr-8">
            <DialogTitle className="text-lg font-semibold">{cert.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {cert.issuer} · {cert.year}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {cert.documentUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
                className="gap-1.5"
              >
                {isDownloading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Download className="h-3.5 w-3.5" />}
                Download
              </Button>
            )}
            {cert.documentUrl && (
              <Button size="sm" variant="outline" asChild className="gap-1.5">
                <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Viewer body */}
        <div className="flex-1 overflow-auto bg-muted/30 min-h-0">
          {cert.documentUrl && isImage && (
            <div className="flex items-center justify-center p-6 h-full">
              <img
                src={cert.documentUrl}
                alt={cert.name}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {cert.documentUrl && isPdf && (
            <iframe
              src={`${cert.documentUrl}#toolbar=1&navpanes=0`}
              className="w-full h-[65vh] border-0"
              title={cert.name}
            />
          )}

          {!cert.documentUrl && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="p-4 bg-muted rounded-full">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No file attached</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This certification doesn't have a file uploaded yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Certifications section ────────────────────────────────────────────────────

function CertificationsSection({
  certifications,
  delay,
}: {
  certifications?: CertificationPublicDto[];
  delay: number;
}) {
  const [selected, setSelected] = useState<CertificationPublicDto | null>(null);

  if (!certifications || certifications.length === 0) return null;

  const getFileType = (cert: CertificationPublicDto) => {
    if (!cert.documentUrl && !cert.name) return null;
    const name = cert.name || cert.documentUrl || "";
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(name)) return "image";
    if (/\.pdf$/i.test(name)) return "pdf";
    return "file";
  };

  return (
    <>
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certifications.map((cert) => {
              const fileType = getFileType(cert);
              const hasFile = !!cert.documentUrl;

              return (
                <motion.div
                  key={cert.id}
                  whileHover={{ x: 2 }}
                  className={cn(
                    "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                    hasFile
                      ? "cursor-pointer hover:border-primary/40 hover:shadow-sm hover:bg-muted/30"
                      : "cursor-default"
                  )}
                  onClick={() => hasFile && setSelected(cert)}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
                    hasFile ? "bg-primary/10 group-hover:bg-primary/15" : "bg-muted"
                  )}>
                    {fileType === "image"
                      ? <ImageIcon className="h-5 w-5 text-primary" />
                      : fileType === "pdf"
                      ? <FileText className="h-5 w-5 text-primary" />
                      : <GraduationCap className="h-5 w-5 text-muted-foreground" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.issuer} · {cert.year}
                    </p>
                  </div>

                  {/* Hover hint */}
                  {hasFile && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Eye className="h-3 w-3" />
                        View
                      </Badge>
                    </div>
                  )}
                  {!hasFile && (
                    <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                      No file
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <CertificationViewerModal
        cert={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

// ── Experience section ────────────────────────────────────────────────────────

function ExperienceSection({ experiences, delay }: { experiences?: ExperienceDto[]; delay: number }) {
  if (!experiences || experiences.length === 0) return null;
  return (
    <motion.div {...fadeUp} transition={{ duration: 0.5, delay }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {experiences.map(exp => (
            <div key={exp.id} className="p-4 rounded-lg border">
              <h3 className="font-semibold">{exp.title}</h3>
              <p className="text-muted-foreground">{exp.place}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {fmtMonth(exp.startDate)} — {exp.isCurrentRole ? "Present" : fmtMonth(exp.endDate!)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Availability section ──────────────────────────────────────────────────────

function AvailabilitySection({ slots, delay }: { slots?: AvailabilitySlotPublicDto[]; delay: number }) {
  if (!slots || slots.length === 0) return null;

  const byDay = DAYS_ORDER
    .map(day => ({ day, slots: slots.filter(s => s.day === day) }))
    .filter(d => d.slots.length > 0);

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.5, delay }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="h-5 w-5" />Available Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {byDay.map(({ day, slots }) => (
              <div key={day} className="rounded-lg border p-4">
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">{day}</h3>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-3">
                      <Clock className="h-3.5 w-3.5" />
                      {slot.startTime} — {slot.endTime}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PublicProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) { navigate("/"); return; }
    (async () => {
      try {
        setIsLoading(true);
        const data = await userService.getPublicProfile(userId);
        setProfile(data as PublicProfileDto);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load profile",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  const getInitials = () => {
    if (!profile?.fullName) return "U";
    const parts = profile.fullName.trim().split(" ");
    return parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0][0];
  };

  const role = profile?.role?.toLowerCase();
  const isStudent = role === "student";
  const isParent = role === "parent";
  const isCreator = role === "contentcreator" || role === "creator";
  const isSpecialist = role === "specialist";

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Profile not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Profile Header ── */}
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.profilePictureUrl} alt={profile.fullName} />
                  <AvatarFallback className="text-4xl">{getInitials()}</AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                {isSpecialist && profile.professionalTitle
  ? <p className="text-muted-foreground mt-1 break-words max-w-xl">{profile.professionalTitle}</p>
  : <p className="text-muted-foreground capitalize mt-1">{profile.role}</p>}
                </div>

                {profile.specializations && profile.specializations.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {profile.specializations.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
                )}

                {profile.bio && <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>}

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {profile.country && (
                    <Badge variant="secondary"><MapPin className="mr-1 h-3 w-3" />{profile.country}</Badge>
                  )}
                  <Badge variant="secondary">
                    <Calendar className="mr-1 h-3 w-3" />Joined {fmt(profile.joinedDate)}
                  </Badge>
                  {isSpecialist && profile.yearsOfExperience != null && (
                    <Badge variant="secondary">
                      <Briefcase className="mr-1 h-3 w-3" />{profile.yearsOfExperience} years exp.
                    </Badge>
                  )}
                  {isSpecialist && profile.hourlyRate != null && (
                    <Badge variant="secondary">
                      <DollarSign className="mr-1 h-3 w-3" />${profile.hourlyRate}/hr
                    </Badge>
                  )}
                </div>

                <SocialLinksSection links={profile.socialLinks} />

                <div className="flex gap-3 pt-2">
                  <Button onClick={() => navigate(`/messages?userId=${userId}`)}>
                    <MessageSquare className="mr-2 h-4 w-4" />Send Message
                  </Button>
                  <ShareProfileDialog userId={profile.id} userName={profile.fullName} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── SPECIALIST ── */}
        {isSpecialist && (
          <>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Star,     label: "Rating",           value: profile.rating?.toFixed(1) || "—", color: "text-yellow-500", bg: "bg-yellow-500/10" },
                { icon: Users,    label: "Students Helped",  value: profile.studentsHelped || 0,        color: "text-primary",    bg: "bg-primary/10"    },
                { icon: Briefcase,label: "Years Experience", value: profile.yearsOfExperience || 0,     color: "text-purple-500", bg: "bg-purple-500/10" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <Card key={label}>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className={`p-3 ${bg} rounded-lg`}><Icon className={`h-6 w-6 ${color}`} /></div>
                    <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <AvailabilitySection slots={profile.availabilitySlots} delay={0.15} />
            <CertificationsSection certifications={profile.certifications} delay={0.2} />
            <ExperienceSection experiences={profile.experiences} delay={0.3} />
          </>
        )}

        {/* ── CREATOR ── */}
        {isCreator && (
          <>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Video, label: "Courses",    value: profile.totalCourses || 0,                      color: "text-primary",    bg: "bg-primary/10"    },
                { icon: Users, label: "Students",   value: (profile.totalStudents || 0).toLocaleString(),  color: "text-blue-500",   bg: "bg-blue-500/10"   },
                { icon: Star,  label: "Avg Rating", value: profile.averageRating?.toFixed(1) || "—",       color: "text-yellow-500", bg: "bg-yellow-500/10" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <Card key={label}>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className={`p-3 ${bg} rounded-lg`}><Icon className={`h-6 w-6 ${color}`} /></div>
                    <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <CertificationsSection certifications={profile.certifications} delay={0.2} />
            <ExperienceSection experiences={profile.experiences} delay={0.25} />

            {profile.visibleCourses && profile.visibleCourses.length > 0 && (
              <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />Courses ({profile.visibleCourses.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.visibleCourses.map((course, i) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
                        >
                          {course.thumbnail
                            ? <img src={course.thumbnail} alt={course.title} className="h-14 w-20 rounded-md object-cover flex-shrink-0" />
                            : <div className="h-14 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                              </div>}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{course.title}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.studentsCount.toLocaleString()}</span>
                              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500" />{course.rating.toFixed(1)}</span>
                              <Badge variant="outline" className="text-xs">{course.category}</Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {/* ── STUDENT / PARENT ── */}
        {(isStudent || isParent) && (
          <>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="grid gap-4 md:grid-cols-3">
              {[
                { icon: BookOpen, label: "Courses Enrolled", value: profile.enrolledCourses || 0,    color: "text-primary",    bg: "bg-primary/10"    },
                { icon: Trophy,   label: "Achievements",     value: profile.achievements || 0,        color: "text-yellow-600", bg: "bg-yellow-500/10" },
                { icon: Clock,    label: "Hours Learned",    value: profile.totalHoursLearned || 0,   color: "text-green-600",  bg: "bg-green-500/10"  },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <Card key={label}>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className={`p-3 ${bg} rounded-lg`}><Icon className={`h-6 w-6 ${color}`} /></div>
                    <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />Achievements ({profile.recentAchievements?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.recentAchievements && profile.recentAchievements.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {profile.recentAchievements.map((a, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="flex items-center gap-3 p-4 rounded-lg border hover:shadow-md transition-shadow"
                        >
                          <div className="p-2 bg-yellow-500/10 rounded-full">
                            <Trophy className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{fmt(a.earnedDate)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Trophy className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No achievements yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />Current Courses ({profile.enrolledCoursesList?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.enrolledCoursesList && profile.enrolledCoursesList.length > 0 ? (
                    <div className="space-y-3">
                      {profile.enrolledCoursesList.map((course, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{course.name}</p>
                            <p className="text-sm text-muted-foreground">{course.instructor}</p>
                          </div>
                          {course.progress !== undefined && (
                            <div className="flex items-center gap-2 ml-4">
                              <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-10 text-right">{course.progress}%</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No courses enrolled yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>This is a public profile on Ma'man</p>
        </div>
      </div>
    </div>
  );
}