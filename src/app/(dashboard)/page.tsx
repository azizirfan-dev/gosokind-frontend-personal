'use client';

import { useEffect, useState } from 'react';
import AttendanceDashboard from '@/components/features/attendance/AttendanceDashboard';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setRole(user.role);
        } catch (e) {
          console.error('Failed to parse user role');
        }
      }
    }
  }, []);

  return (
    <div className="max-w-md mx-auto md:max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {role?.replace('_', ' ') || 'Loading...'}
        </span>
      </div>

      {/* 1. Always Render Attendance (Priority) */}
      <section>
        <AttendanceDashboard />
      </section>

      {/* 2. Conditional Role Widgets */}
      {role === 'DRIVER' && (
        <div className="p-4 border rounded-lg bg-blue-50 text-blue-700 animate-pulse">
          <h3 className="font-semibold">Driver Orders</h3>
          <p className="text-sm">Loading active jobs...</p>
        </div>
      )}

      {(role?.startsWith('WORKER_') || role === 'OUTLET_ADMIN') && (
        <div className="p-4 border rounded-lg bg-orange-50 text-orange-700 animate-pulse">
          <h3 className="font-semibold">Station Orders</h3>
          <p className="text-sm">Loading station tasks...</p>
        </div>
      )}
    </div>
  );
}
