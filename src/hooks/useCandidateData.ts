import { useQuery } from "@tanstack/react-query";

import {
  getCurrentUser,
  getErrorTypeStats,
  getExamHistory,
  getTaskMastery,
} from "@/services/userService";
import { getPerformanceBreakdown } from "@/services/performanceService";

export function useCurrentUser() {
  return useQuery({ queryKey: ["current-user"], queryFn: getCurrentUser, staleTime: 60_000 });
}

export function useExamHistory() {
  return useQuery({ queryKey: ["exam-history"], queryFn: getExamHistory, staleTime: 60_000 });
}

export function useTaskMastery() {
  return useQuery({ queryKey: ["task-mastery"], queryFn: getTaskMastery, staleTime: 60_000 });
}

export function useErrorTypeStats() {
  return useQuery({ queryKey: ["error-type-stats"], queryFn: getErrorTypeStats, staleTime: 60_000 });
}

export function usePerformanceBreakdown() {
  return useQuery({
    queryKey: ["performance-breakdown"],
    queryFn: getPerformanceBreakdown,
    staleTime: 60_000,
  });
}
