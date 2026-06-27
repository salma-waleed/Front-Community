import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://localhost:7220/api";

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Period = "AllTime" | "Monthly" | "Weekly";
export type PointReason =
  | "CourseCompleted"
  | "LessonCompleted"
  | "QuizPassed"
  | "StreakMaintained"
  | "BadgeEarned"
  | "DailyLogin"
  | "AssignmentSubmitted";

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string | null;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentStreak: number;
  longestStreak: number;
  coursesCompleted: number;
  badgesEarned: string[];
  rank: number;
  previousRank: number;
}

export interface UserStats {
  userId: string;
  userName: string;
  userAvatar: string | null;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentStreak: number;
  longestStreak: number;
  coursesCompleted: number;
  badgesEarned: string[];
  rank: number;
  previousRank: number;
  lastActivityDate: string;
}

export interface BadgeRequirement {
  type: "CoursesCompleted" | "StreakDays" | "TotalPoints";
  value: number;
  description: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: BadgeRequirement;
  isActive: boolean;
  isEarned: boolean;
}

export interface PointTransaction {
  id: string;
  userId: string;
  points: number;
  reason: PointReason;
  description: string;
  relatedEntityId: string | null;
  createdAt: string;
}

export interface AwardPointsDto {
  userId: string;
  points: number;
  reason: PointReason;
  description?: string;
  relatedEntityId?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/leaderboard?period=AllTime&limit=100
 * Returns ranked list of all users for a given time period.
 */
export async function getLeaderboard(
  period: Period = "AllTime",
  limit = 100
): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<{ data: LeaderboardEntry[]; success: boolean }>(
    "/leaderboard",
    { params: { period, limit } }
  );
  return data.data;
}

/**
 * GET /api/leaderboard/me
 * Returns the authenticated user's own stats and rank.
 */
export async function getMyStats(): Promise<UserStats> {
  const { data } = await api.get<{ data: UserStats; success: boolean }>(
    "/leaderboard/me"
  );
  return data.data;
}

/**
 * GET /api/leaderboard/user/:userId
 * Returns any user's stats by ID (public profile view).
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const { data } = await api.get<{ data: UserStats; success: boolean }>(
    `/leaderboard/user/${userId}`
  );
  return data.data;
}

/**
 * GET /api/leaderboard/badges/me
 * Returns all badges with isEarned flag for the current user.
 * ── Requires new backend endpoint (see note below) ──
 */
export async function getMyBadges(): Promise<Badge[]> {
  const { data } = await api.get<{ data: Badge[]; success: boolean }>(
    "/leaderboard/badges/me"
  );
  return data.data;
}

/**
 * GET /api/leaderboard/transactions?limit=20
 * Returns the current user's recent point transactions.
 * ── Requires new backend endpoint (see note below) ──
 */
export async function getMyTransactions(limit = 20): Promise<PointTransaction[]> {
  const { data } = await api.get<{ data: PointTransaction[]; success: boolean }>(
    "/leaderboard/transactions",
    { params: { limit } }
  );
  return data.data;
}

/**
 * POST /api/leaderboard/update-streak
 * Triggers a streak update for the current user (call on login/daily activity).
 */
export async function updateStreak(): Promise<boolean> {
  const { data } = await api.post<{ message: string; success: boolean }>(
    "/leaderboard/update-streak"
  );
  return data.success;
}

/**
 * POST /api/leaderboard/award-points   [Admin only]
 * Awards points to a user for a specific reason.
 */
export async function awardPoints(dto: AwardPointsDto): Promise<boolean> {
  const { data } = await api.post<{ message: string; success: boolean }>(
    "/leaderboard/award-points",
    dto
  );
  return data.success;
}

/**
 * POST /api/leaderboard/recalculate-ranks   [Admin only]
 * Triggers a full rank recalculation across all users.
 */
export async function recalculateRanks(): Promise<boolean> {
  const { data } = await api.post<{ message: string; success: boolean }>(
    "/leaderboard/recalculate-ranks"
  );
  return data.success;
}

