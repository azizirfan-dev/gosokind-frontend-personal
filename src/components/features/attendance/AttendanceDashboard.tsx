'use client';

import { useEffect, useState } from 'react';
import { Loader2, MapPin, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAttendanceDashboard, useAttendanceHistory, useClockIn, useClockOut } from '@/hooks/useAttendance';
import { TodayStatus, AttendanceRecord } from '@/types/attendance';

export default function AttendanceDashboard() {
  const [time, setTime] = useState(new Date());
  
  // React Query Hooks
  const { data: status, isLoading: isStatusLoading } = useAttendanceDashboard();
  const { data: history = [], isLoading: isHistoryLoading } = useAttendanceHistory();
  const { mutate: clockIn, isPending: isClockInPending } = useClockIn();
  const { mutate: clockOut, isPending: isClockOutPending } = useClockOut();

  const isLoading = isStatusLoading || isHistoryLoading;
  const isActionLoading = isClockInPending || isClockOutPending;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clockIn(
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          {
            onError: (error: any) => alert(error.response?.data?.message || 'Clock In Failed'),
          }
        );
      },
      (err) => {
        console.error(err);
        alert('Could not retrieve location');
      }
    );
  };

  const handleClockOut = () => {
    clockOut(undefined, {
      onError: (error: any) => alert(error.response?.data?.message || 'Clock Out Failed'),
    });
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold tabular-nums text-gray-900">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</h2>
        <p className="text-sm text-gray-500">{time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatBox label="In Time" value={status?.clockInTime} />
            <StatBox label="Out Time" value={status?.clockOutTime} />
          </div>

          <Button 
            className={`w-full h-12 text-lg font-semibold ${status?.isClockedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            onClick={status?.isClockedIn ? handleClockOut : handleClockIn}
            disabled={isActionLoading}
          >
            {isActionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (status?.isClockedIn ? <RefreshCw className="mr-2 h-5 w-5" /> : <MapPin className="mr-2 h-5 w-5" />)}
            {status?.isClockedIn ? 'Check Out' : 'Check In'}
          </Button>

          <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4 text-center">
            <StatFooter label="Working Time" value={status?.duration} />
            <StatFooter label="Total Days" value={`${status?.daysWorked || 0} Days`} />
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {history.length > 0 ? history.map((record) => (
            <AttendanceCard key={record.id} record={record} />
          )) : <p className="text-center text-sm text-gray-500 py-4">No history found.</p>}
        </div>
      </div>
    </div>
  );
}

// Sub-components to respect 15-line limit on main component
const StatBox = ({ label, value }: { label: string, value?: string | null }) => (
  <div className="text-center p-3 bg-gray-50 rounded-lg">
    <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    <p className="text-xl font-bold text-gray-900 mt-1">{value || '--:--'}</p>
  </div>
);

const StatFooter = ({ label, value }: { label: string, value?: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const AttendanceCard = ({ record }: { record: AttendanceRecord }) => (
  <Card className="border border-gray-100 shadow-sm">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{record.date}</p>
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <span>{record.clockIn}</span><span className="text-gray-300">→</span><span>{record.clockOut}</span>
        </p>
      </div>
      <Badge variant={record.status === 'COMPLETED' ? 'default' : 'secondary'}>{record.status}</Badge>
    </CardContent>
  </Card>
);
