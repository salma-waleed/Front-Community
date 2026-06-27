import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLeaderboard,
  getMyStats,
  getMyBadges,
  getMyTransactions,
  updateStreak,
  awardPoints,
  recalculateRanks,
  type Period,
  type AwardPointsDto,
} from "./leaderboardService";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  list: (period: Period, limit: number) =>
    ["leaderboard", "list", period, limit] as const,
  myStats: () => ["leaderboard", "me"] as const,
  myBadges: () => ["leaderboard", "badges"] as const,
  myTransactions: (limit: number) =>
    ["leaderboard", "transactions", limit] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useLeaderboard(period: Period = "AllTime", limit = 100) {
  return useQuery({
    queryKey: leaderboardKeys.list(period, limit),
    queryFn: () => getLeaderboard(period, limit),
    staleTime: 1000 * 60 * 2, // 2 min — leaderboard doesn't need to be real-time
  });
}

export function useMyStats() {
  return useQuery({
    queryKey: leaderboardKeys.myStats(),
    queryFn: getMyStats,
    staleTime: 1000 * 60 * 1,
  });
}

export function useMyBadges() {
  return useQuery({
    queryKey: leaderboardKeys.myBadges(),
    queryFn: getMyBadges,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyTransactions(limit = 20) {
  return useQuery({
    queryKey: leaderboardKeys.myTransactions(limit),
    queryFn: () => getMyTransactions(limit),
    staleTime: 1000 * 60 * 1,
  });
}

export function useUpdateStreak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateStreak,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaderboardKeys.myStats() });
      qc.invalidateQueries({ queryKey: leaderboardKeys.all });
    },
  });
}

export function useAwardPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AwardPointsDto) => awardPoints(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaderboardKeys.all });
    },
  });
}

export function useRecalculateRanks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recalculateRanks,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaderboardKeys.all });
    },
  });
}