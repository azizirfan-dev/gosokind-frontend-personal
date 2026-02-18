'use client';

import { Truck, History } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import DriverJobCard from '@/components/workfloor/DriverJobCard'; 
import { NotificationCenter, Notification } from '@/components/workfloor/NotificationCenter';
import { DriverJob } from '@/types/driver';

interface DriverViewProps {
  activeTab: 'active' | 'history';
  setActiveTab: (tab: 'active' | 'history') => void;
  driverJobs: DriverJob[];
  activeJob: DriverJob | null;
  historyJobs: DriverJob[];
  onAccept: (jobId: string) => void;
  onComplete: (jobId: string, type: string) => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function DriverView({
  activeTab,
  setActiveTab,
  driverJobs,
  activeJob,
  historyJobs,
  onAccept,
  onComplete,
  notifications,
  onMarkAsRead,
  onClearAll
}: DriverViewProps) {
  
  // Filter out the active job from the available list if it exists there
  const availableJobs = driverJobs.filter(j => j.id !== activeJob?.id);

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between gap-4 py-2 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                <button 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${!activeTab || activeTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active & Available
                </button>
                <button 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('history')}
                >
                    Job History
                </button>
            </div>

            {/* Notification Center */}
            <NotificationCenter 
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onClearAll={onClearAll}
            />
        </div>

        {activeTab === 'active' ? (
            <>
                {/* Active Job Section */}
                {activeJob && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-700">
                                Current Active Job
                        </h2>
                        <div className="max-w-md">
                            <DriverJobCard 
                                job={activeJob} 
                                onAccept={onAccept} // Won't be clicked but required by prop type usually, or handled internally
                                onComplete={onComplete}
                            />
                        </div>
                    </section>
                )}

                {/* Available Jobs Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
                        Available Jobs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableJobs.length > 0 ? availableJobs.map(job => (
                            <DriverJobCard 
                                key={job.id} 
                                job={job} 
                                onAccept={onAccept}
                            />
                        )) : (
                            <div className="col-span-full">
                                <EmptyState 
                                    icon={Truck}
                                    title="No Available Jobs"
                                    description="There are no jobs currently available for pickup or delivery."
                                />
                            </div>
                        )}
                    </div>
                </section>
            </>
        ) : (
            /* History Section */
            <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
                    Completed Jobs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {historyJobs?.length > 0 ? historyJobs.map((job) => (
                        <DriverJobCard 
                            key={job.id} 
                            job={job} 
                            onAccept={() => {}} // Read-only
                        />
                    )) : (
                        <div className="col-span-full">
                            <EmptyState 
                                icon={History}
                                title="No History Found"
                                description="You haven't completed any jobs yet."
                            />
                        </div>
                    )}
                </div>
            </section>
        )}
    </div>
  );
}
