'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, LogOut, Menu, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/services/auth.service';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r h-screen fixed left-0 top-0 z-10">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary">GosokInd</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton icon={<Home className="h-5 w-5" />} label="Dashboard" active={pathname === '/dashboard'} onClick={() => router.push('/dashboard')} />
          <NavButton icon={<Briefcase className="h-5 w-5" />} label="Workfloor" active={pathname === '/workfloor'} onClick={() => router.push('/workfloor')} />
          <NavButton icon={<User className="h-5 w-5" />} label="Profile" active={pathname === '/profile'} onClick={() => router.push('/profile')} />
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-bold text-lg">GosokInd</h1>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 pb-24 md:p-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-10">
        <MobileNavButton icon={<Home className="h-5 w-5" />} label="Home" active={pathname === '/dashboard'} onClick={() => router.push('/dashboard')} />
        <MobileNavButton icon={<Briefcase className="h-5 w-5" />} label="Workfloor" active={pathname === '/workfloor'} onClick={() => router.push('/workfloor')} />
        <MobileNavButton icon={<User className="h-5 w-5" />} label="Profile" active={pathname === '/profile'} onClick={() => router.push('/profile')} />
      </div>
    </div>
  );
}

// Helpers for Navigation Buttons
const NavButton = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <Button variant={active ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={onClick}>
    <span className="mr-2 h-4 w-4">{icon}</span>
    {label}
  </Button>
);

const MobileNavButton = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center space-y-1 ${active ? 'text-primary' : 'text-gray-500'}`}>
    <div className="h-6 w-6">{icon}</div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);
