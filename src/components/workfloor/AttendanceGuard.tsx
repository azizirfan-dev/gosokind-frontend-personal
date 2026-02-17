'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAttendanceStatus } from '@/services/attendance.service';

export default function AttendanceGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const status = await getAttendanceStatus();
      setIsClockedIn(status.isClockedIn);
    } catch (error) {
      console.error('Failed to check attendance', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!isClockedIn) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-red-100 p-4 rounded-full">
          <Lock className="w-12 h-12 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-gray-500 mt-2">You must clock in before accessing the workfloor.</p>
        </div>
        <Button onClick={() => router.push('/dashboard')} size="lg" className="w-full max-w-xs">
          Go to Attendance
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
