import api from '@/lib/axios';
import { AttendanceDTO, DashboardDTO, TodayStatus, AttendanceRecord } from '@/types/attendance';

const ATTENDANCE_ENDPOINT = '/attendance';

// --- Helpers ---
const formatTime = (iso?: string | null) => 
  iso ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : null;

const formatDate = (iso: string) => 
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const mapToTodayStatus = (dto: DashboardDTO): TodayStatus => ({
  clockInTime: formatTime(dto.todayAttendance?.clockIn),
  clockOutTime: formatTime(dto.todayAttendance?.clockOut),
  duration: dto.shiftDuration || '--',
  daysWorked: dto.daysWorked,
  isClockedIn: !!dto.todayAttendance && !dto.todayAttendance.clockOut,
});

const mapToRecord = (dto: AttendanceDTO): AttendanceRecord => ({
  id: dto.id,
  date: formatDate(dto.date),
  clockIn: formatTime(dto.clockIn) || '--:--',
  clockOut: formatTime(dto.clockOut) || '--:--',
  status: dto.clockOut ? 'COMPLETED' : 'PRESENT',
});

// --- Services ---
export const clockIn = async (latitude: number, longitude: number) => {
  await api.post(`${ATTENDANCE_ENDPOINT}/clock-in`, { latitude, longitude });
};

export const clockOut = async () => {
  await api.post(`${ATTENDANCE_ENDPOINT}/clock-out`);
};

export const getDashboard = async (): Promise<TodayStatus> => {
  const { data } = await api.get<{ data: DashboardDTO }>(`${ATTENDANCE_ENDPOINT}/dashboard`);
  return mapToTodayStatus(data.data);
};

export const getHistory = async (): Promise<AttendanceRecord[]> => {
  const { data } = await api.get<{ data: AttendanceDTO[] }>(ATTENDANCE_ENDPOINT);
  return data.data.map(mapToRecord);
};
