import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboard, getHistory, clockIn, clockOut } from '@/services/attendance.service';
import { TodayStatus, AttendanceRecord } from '@/types/attendance';

export const attendanceKeys = {
  all: ['attendance'] as const,
  dashboard: () => [...attendanceKeys.all, 'dashboard'] as const,
  history: () => [...attendanceKeys.all, 'history'] as const,
};

export function useAttendanceDashboard() {
  return useQuery({
    queryKey: attendanceKeys.dashboard(),
    queryFn: getDashboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAttendanceHistory() {
  return useQuery({
    queryKey: attendanceKeys.history(),
    queryFn: getHistory,
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) => 
      clockIn(latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}
