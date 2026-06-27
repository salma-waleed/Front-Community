import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  BookOpen,
  Target,
  Crown,
  Medal,
  ChevronUp,
  ChevronDown,
  Minus,
  Search,
  Users,
  Star,
  Lock,
  CheckCircle2,
  Zap,
  LogIn,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuthStore } from "@/stores/authStore";
import {
  useLeaderboard,
  useMyStats,
  useMyBadges,
  useMyTransactions,
  useUpdateStreak,
} from "../services/useleaderboard";
import type { Period, LeaderboardEntry, PointTransaction, Badge as BadgeType } from "../services/leaderboardService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PERIOD_LABELS: { key: Period; label: string }[] = [
  { key: "AllTime", label: "All time" },
  { key: "Monthly", label: "This month" },
  { key: "Weekly", label: "This week" },
];

const HOW_TO_EARN = [
  { icon: <BookOpen size={16} />, bg: "bg-purple-50", ic: "text-purple-700", label: "Complete a course", desc: "Finish all lessons in a course", pts: 500 },
  { icon: <CheckCircle2 size={16} />, bg: "bg-green-50", ic: "text-green-700", label: "Complete a lesson", desc: "Watch a video or read a lesson", pts: 20 },
  { icon: <Target size={16} />, bg: "bg-green-50", ic: "text-green-700", label: "Pass a quiz", desc: "Score 70% or higher", pts: 75 },
  { icon: <Flame size={16} />, bg: "bg-amber-50", ic: "text-amber-700", label: "Maintain your streak", desc: "Log in and learn every day", pts: 30 },
  { icon: <LogIn size={16} />, bg: "bg-teal-50", ic: "text-teal-700", label: "Daily login", desc: "Just show up every day", pts: 10 },
  { icon: <Star size={16} />, bg: "bg-pink-50", ic: "text-pink-700", label: "Earn a badge", desc: "Unlock milestones automatically", pts: 150 },
  { icon: <ClipboardList size={16} />, bg: "bg-blue-50", ic: "text-blue-700", label: "Submit an assignment", desc: "Complete and submit coursework", pts: 60 },
];

const REASON_LABELS: Record<string, string> = {
  CourseCompleted: "Course completed",
  LessonCompleted: "Lesson completed",
  QuizPassed: "Quiz passed",
  StreakMaintained: "Streak maintained",
  BadgeEarned: "Badge earned",
  DailyLogin: "Daily login",
  AssignmentSubmitted: "Assignment submitted",
};

function getPointsByPeriod(entry: LeaderboardEntry, period: Period) {
  if (period === "Weekly") return entry.weeklyPoints;
  if (period === "Monthly") return entry.monthlyPoints;
  return entry.totalPoints;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const diff = previous - current; // positive = moved up in rank
  if (diff > 0)
    return (
      <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
        <ChevronUp className="h-3.5 w-3.5" />
        {diff}
      </span>
    );
  if (diff < 0)
    return (
      <span className="flex items-center gap-0.5 text-xs text-red-500 font-medium">
        <ChevronDown className="h-3.5 w-3.5" />
        {Math.abs(diff)}
      </span>
    );
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function PodiumCard({
  entry,
  rank,
  isMe,
  maxPts,
  period,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
  maxPts: number;
  period: Period;
}) {
  const pts = getPointsByPeriod(entry, period);
  const rankStyles: Record<number, string> = {
    1: "ring-2 ring-yellow-400/40 border-yellow-300/50",
    2: "border-slate-200/50",
    3: "border-amber-200/50",
  };
  const rankTopBar: Record<number, string> = {
    1: "from-yellow-400 to-amber-500",
    2: "from-slate-300 to-slate-400",
    3: "from-amber-400 to-orange-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: rank === 1 ? -12 : 0 }}
      transition={{ delay: rank * 0.1 }}
    >
      <Card className={`text-center relative overflow-hidden ${rankStyles[rank]}`}>
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${rankTopBar[rank]}`} />
        <CardContent className="pt-7 pb-5">
          <div className="flex justify-center mb-3">
            <RankIcon rank={rank} />
          </div>
          <Avatar className="h-16 w-16 mx-auto mb-2 ring-4 ring-background">
            <AvatarImage src={entry.userAvatar ?? undefined} />
            <AvatarFallback className="font-semibold bg-primary/10 text-primary text-sm">
              {getInitials(entry.userName)}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold text-sm truncate px-1">
            {entry.userName}
            {isMe && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] py-0">
                You
              </Badge>
            )}
          </p>
          <p className="text-2xl font-bold mt-1.5 text-primary">{pts.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mb-3">points</p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {entry.coursesCompleted}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" />
              {entry.currentStreak}d
            </span>
            <TrendBadge current={entry.rank} previous={entry.previousRank} />
          </div>
          {maxPts > 0 && (
            <Progress
              value={Math.round((pts / maxPts) * 100)}
              className="mt-3 h-1"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SkeletonPodium() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="pt-7 pb-5 flex flex-col items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-1 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-none">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-14" />
        </div>
      ))}
    </>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function RankingSection({
  period,
  setPeriod,
  userId,
}: {
  period: Period;
  setPeriod: (p: Period) => void;
  userId: string | undefined;
}) {
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useLeaderboard(period);

  const filtered = useMemo(
    () =>
      data.filter((e) =>
        e.userName.toLowerCase().includes(search.toLowerCase())
      ),
    [data, search]
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => getPointsByPeriod(b, period) - getPointsByPeriod(a, period)
      ),
    [filtered, period]
  );

  const topThree = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const maxPts = getPointsByPeriod(sorted[0] ?? { totalPoints: 1, weeklyPoints: 1, monthlyPoints: 1 } as any, period);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];
  const podiumRanks = [2, 1, 3];

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search learners…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            {PERIOD_LABELS.map(({ key, label }) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Podium */}
      {isLoading ? (
        <SkeletonPodium />
      ) : topThree.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4 items-end">
          {podiumOrder.map((entry, vi) => {
            if (!entry) return <div key={vi} />;
            return (
              <PodiumCard
                key={entry.userId}
                entry={entry}
                rank={podiumRanks[vi]}
                isMe={entry.userId === userId}
                maxPts={maxPts}
                period={period}
              />
            );
          })}
        </div>
      ) : null}

      {/* Rest of list */}
      {rest.length > 0 && (
        <Card>
          <CardHeader className="pb-0 pt-4 px-5">
            <CardTitle className="text-base font-semibold">Rankings</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="divide-y divide-border">
              {isLoading ? (
                <SkeletonRows />
              ) : (
                rest.map((entry, i) => {
                  const rank = i + 4;
                  const isMe = entry.userId === userId;
                  const pts = getPointsByPeriod(entry, period);
                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025 }}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors ${
                        isMe ? "bg-primary/5 border-l-2 border-primary" : ""
                      }`}
                    >
                      <div className="w-8 flex justify-center">
                        <RankIcon rank={rank} />
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.userAvatar ?? undefined} />
                        <AvatarFallback className="text-xs font-semibold bg-muted">
                          {getInitials(entry.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {entry.userName}
                          {isMe && (
                            <Badge variant="secondary" className="ml-2 text-[10px] py-0">
                              You
                            </Badge>
                          )}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {entry.coursesCompleted} courses
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-400" />
                            {entry.currentStreak}d streak
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{pts.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">pts</p>
                      </div>
                      <TrendBadge
                        current={entry.rank}
                        previous={entry.previousRank}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Trophy className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-semibold">No learners found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? "Try a different name" : "Start learning to appear on the leaderboard!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BadgesSection() {
  const { data: badges = [], isLoading } = useMyBadges();

  const earned = badges.filter((b) => b.isEarned);
  const locked = badges.filter((b) => !b.isEarned);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-5 pb-4 flex flex-col items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {earned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Earned · {earned.length}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earned.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}
      {locked.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Locked · {locked.length}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {locked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}
      {badges.length === 0 && (
        <Card>
          <CardContent className="py-14 text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-semibold">No badges yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete courses and maintain streaks to earn badges.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BadgeCard({ badge }: { badge: BadgeType }) {
  const progress = getProgressTowardBadge(badge);
  return (
    <Card className={`text-center transition-opacity ${badge.isEarned ? "" : "opacity-50"}`}>
      <CardContent className="pt-5 pb-4">
        <div className="text-3xl mb-2">{badge.icon}</div>
        <p className="font-semibold text-sm">{badge.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {badge.description}
        </p>
        <div className="mt-2.5">
          {badge.isEarned ? (
            <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="h-3 w-3" /> Earned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              <Lock className="h-3 w-3" /> {badge.requirement.description}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper – compute progress text from requirement (frontend only, rough estimate)
function getProgressTowardBadge(badge: BadgeType): number {
  return 0; // real progress needs userStats cross-ref; extend if you expose it from backend
}

function HistorySection({ streak }: { streak: number }) {
  const { data: transactions = [], isLoading } = useMyTransactions(20);

  // Build a 30-day activity grid from transactions
  const activityMap = useMemo(() => {
    const map = new Set<string>();
    transactions.forEach((tx) => {
      const d = new Date(tx.createdAt).toDateString();
      map.add(d);
    });
    return map;
  }, [transactions]);

  const days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return { date: d, active: activityMap.has(d.toDateString()), isToday: i === 29 };
    });
  }, [activityMap]);

  const txIconMap: Record<string, React.ReactNode> = {
    CourseCompleted: <BookOpen size={15} className="text-purple-600" />,
    LessonCompleted: <CheckCircle2 size={15} className="text-green-600" />,
    QuizPassed: <Target size={15} className="text-green-600" />,
    StreakMaintained: <Flame size={15} className="text-amber-600" />,
    BadgeEarned: <Star size={15} className="text-pink-600" />,
    DailyLogin: <LogIn size={15} className="text-teal-600" />,
    AssignmentSubmitted: <ClipboardList size={15} className="text-blue-600" />,
  };

  const txBgMap: Record<string, string> = {
    CourseCompleted: "bg-purple-50",
    LessonCompleted: "bg-green-50",
    QuizPassed: "bg-green-50",
    StreakMaintained: "bg-amber-50",
    BadgeEarned: "bg-pink-50",
    DailyLogin: "bg-teal-50",
    AssignmentSubmitted: "bg-blue-50",
  };

  return (
    <div className="space-y-5">
      {/* Streak heatmap */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            Streak — last 30 days
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {streak} day{streak !== 1 ? "s" : ""} current
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="flex gap-1.5 flex-wrap">
            {days.map((d, i) => (
              <div
                key={i}
                title={d.date.toDateString()}
                className={`h-3.5 w-3.5 rounded-sm transition-colors ${
                  d.isToday
                    ? "bg-primary"
                    : d.active
                    ? "bg-green-400"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-green-400 inline-block" /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-primary inline-block" /> Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-muted inline-block" /> Inactive
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-5">
          <CardTitle className="text-sm font-semibold">Recent points</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          {isLoading ? (
            <div className="space-y-0 divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-44" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No point activity yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      txBgMap[tx.reason] ?? "bg-muted"
                    }`}
                  >
                    {txIconMap[tx.reason] ?? <Zap size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description || REASON_LABELS[tx.reason]}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.createdAt)}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    +{tx.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HowToEarnSection() {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-semibold">Ways to earn points</CardTitle>
        <p className="text-xs text-muted-foreground">Complete actions to climb the leaderboard.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {HOW_TO_EARN.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}
              >
                <span className={item.ic}>{item.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <span className="text-sm font-semibold text-primary">+{item.pts} pts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── My Stats Card ────────────────────────────────────────────────────────────

function MyStatsCard({ userId }: { userId: string }) {
  const { data: stats, isLoading } = useMyStats();
  const { mutate: triggerStreak } = useUpdateStreak();

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const rankDiff = stats.previousRank - stats.rank;
  const totalParticipants = 100; // ideally passed down from leaderboard total count

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/25 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">#{stats.rank}</span>
              </div>
              <div>
                <p className="font-semibold">Your ranking</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {rankDiff > 0 ? (
                    <span className="text-green-600 font-medium flex items-center gap-0.5">
                      <ChevronUp className="h-3.5 w-3.5" /> Up {rankDiff} from last time
                    </span>
                  ) : rankDiff < 0 ? (
                    <span className="text-red-500 font-medium flex items-center gap-0.5">
                      <ChevronDown className="h-3.5 w-3.5" /> Down {Math.abs(rankDiff)} from last time
                    </span>
                  ) : (
                    <span>No change from last time</span>
                  )}
                </div>
              </div>
            </div>

            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full sm:ml-auto w-fit">
                <Flame className="h-3.5 w-3.5" />
                {stats.currentStreak}-day streak
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {[
              { label: "Points", value: stats.totalPoints.toLocaleString() },
              { label: "Courses", value: stats.coursesCompleted },
              { label: "Badges", value: stats.badgesEarned.length },
              { label: "Best streak", value: `${stats.longestStreak}d` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-background/60 rounded-lg px-3 py-2.5 text-center border border-border/50"
              >
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Section = "ranking" | "badges" | "history" | "earn";

export default function LeaderboardPage() {
  const [section, setSection] = useState<Section>("ranking");
  const [period, setPeriod] = useState<Period>("AllTime");
  const { user } = useAuthStore();
  const { data: myStats } = useMyStats();

  const SECTIONS: { key: Section; label: string }[] = [
    { key: "ranking", label: "Ranking" },
    { key: "badges", label: "Badges" },
    { key: "history", label: "Points history" },
    { key: "earn", label: "How to earn" },
  ];

  return (
    <MainLayout>
      <div className="container py-8 max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5">
              <Trophy className="h-7 w-7 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              See how you rank among fellow learners
            </p>
          </div>
        </div>

        {/* My stats */}
        {user?.id && <MyStatsCard userId={user.id} />}

        {/* Section tabs */}
        <div className="border-b border-border">
          <div className="flex gap-0 -mb-px">
            {SECTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`px-4 py-2.5 text-sm border-b-2 transition-colors font-medium ${
                  section === key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Section content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {section === "ranking" && (
              <RankingSection
                period={period}
                setPeriod={setPeriod}
                userId={user?.id}
              />
            )}
            {section === "badges" && <BadgesSection />}
            {section === "history" && (
              <HistorySection streak={myStats?.currentStreak ?? 0} />
            )}
            {section === "earn" && <HowToEarnSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}