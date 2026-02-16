// DTO: Raw Backend Response
export interface AttendanceDTO {
  id: string;
  employeeId: string;
  date: string; // ISO String
  clockIn: string; // ISO String
  clockOut?: string | null; // ISO String
  employee?: {
    fullName: string;
  };
}

export interface DashboardDTO {
  todayAttendance: AttendanceDTO | null;
  shiftDuration: string | null;
  daysWorked: number;
}

// UI: Clean Interfaces
export interface AttendanceRecord {
  id: string;
  date: string; 
  clockIn: string; 
  clockOut: string; 
  status: 'PRESENT' | 'COMPLETED';
}

export interface TodayStatus {
  clockInTime: string | null; 
  clockOutTime: string | null; 
  duration: string;
  daysWorked: number;
  isClockedIn: boolean;
}
