'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AttendanceGuard from '@/components/workfloor/AttendanceGuard';
import OrderCard from '@/components/workfloor/OrderCard';
import DriverJobCard from '@/components/workfloor/DriverJobCard'; 
import BypassModal from '@/components/workfloor/BypassModal';
import WorkerHistoryCard from '@/components/workfloor/WorkerHistoryCard';
import { WorkfloorSkeleton } from '@/components/workfloor/WorkfloorSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Inbox, Truck, History } from 'lucide-react';
import { useStationOrders, useProcessOrder, useSubmitBypass, useWorkerHistory } from '@/hooks/useWorkfloor';
import { useAvailableJobs, useActiveJob, useAcceptJob, useCompleteJob, useDriverHistory } from '@/hooks/useDriver';
import { StationType } from '@/types/worker';
import { DriverJob } from '@/types/driver';

// Helper to map role to station
const mapRoleToStation = (role: string): StationType | null => {
    if (role === 'WORKER_WASHING') return 'WASHING';
    if (role === 'WORKER_IRONING') return 'IRONING';
    if (role === 'WORKER_PACKING') return 'PACKING';
    return null;
};

export default function WorkfloorPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [bypassData, setBypassData] = useState<{ isOpen: boolean, orderId: string, orderNumber: string, details: any[] }>({
    isOpen: false, orderId: '', orderNumber: '', details: []
  });
  
  const { toast } = useToast();

  // 1. Load User Context
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
        setUser(JSON.parse(stored));
    }
  }, []);

  const isDriver = user?.role === 'DRIVER';
  const station = user ? mapRoleToStation(user.role) : null;
  // Fallback for admins to see Washing if needed, though usually they have their own dashboard.
  // We keep existing logic: if admin, use 'WASHING' (mapped from original code fallback)
  const effectiveStation = station || (user?.role === 'SUPER_ADMIN' || user?.role === 'OUTLET_ADMIN' ? 'WASHING' : null);

  // 2. React Query Hooks
  const { 
    data: driverJobs = [], 
    isLoading: isDriverJobsLoading 
  } = useAvailableJobs(!!isDriver);
  
  const { 
    data: activeDriverJob, 
    isLoading: isActiveJobLoading 
  } = useActiveJob(!!isDriver);

  const { data: historyJobs = [] } = useDriverHistory(!!isDriver && activeTab === 'history');
  const { data: workerHistory = [] } = useWorkerHistory(!isDriver && activeTab === 'history');

  const {
      data: stationOrders = [],
      isLoading: isStationOrdersLoading
  } = useStationOrders(isDriver ? null : effectiveStation);

  const { mutate: processOrderMutate } = useProcessOrder();
  const { mutate: acceptJobMutate } = useAcceptJob();
  const { mutate: completeJobMutate } = useCompleteJob();
  const { mutate: submitBypassMutate } = useSubmitBypass();

  const isLoading = !user || (isDriver ? (isDriverJobsLoading || isActiveJobLoading) : isStationOrdersLoading);

  // HANDLERS
  const handleProcess = (orderId: string, items: { laundryItemId: string; quantity: number }[]) => {
    const currentStation = effectiveStation || 'WASHING';
    processOrderMutate({
        orderId,
        station: currentStation,
        items,
        actualQty: 0
    }, {
        onSuccess: () => {
            toast({ title: 'Success', description: 'Order processed successfully' });
        },
        onError: (error: any) => {
             if (error.response?.data?.message === 'QTY_MISMATCH') {
                const order = stationOrders.find(o => o.id === orderId);
                setBypassData({
                  isOpen: true,
                  orderId,
                  orderNumber: order?.orderNumber || 'Unknown',
                  details: error.response.data.details || [] 
                });
              } else {
                toast({ title: 'Error', description: error.response?.data?.message || 'Failed to process', variant: 'destructive' });
              }
        }
    });
  };

  const handleAcceptJob = (jobId: string) => {
      acceptJobMutate({ jobId }, {
          onSuccess: () => toast({ title: 'Job Accepted', description: 'You have accepted the job.' }),
          onError: (error: any) => {
              if (error.response?.data?.message === 'DRIVER_BUSY') {
                  toast({ title: 'Cannot Accept Job', description: 'You already have an active job. Please complete it first.', variant: 'destructive' });
              } else {
                  toast({ title: 'Error', description: 'Failed to accept job', variant: 'destructive' });
              }
          }
      });
  };

  const handleCompleteJob = (jobId: string, type: string) => {
    completeJobMutate({ jobId, type }, {
        onSuccess: () => toast({ title: 'Job Completed', description: 'Great work! You are now available for new jobs.' }),
        onError: () => toast({ title: 'Error', description: 'Failed to complete job', variant: 'destructive' })
    });
  };

  const handleBypassSubmit = (reason: string) => {
    const currentStation = effectiveStation || 'WASHING';
    submitBypassMutate({
        orderId: bypassData.orderId,
        station: currentStation,
        reason,
        expectedQty: 0,
        actualQty: 0
    }, {
        onSuccess: () => {
            toast({ title: 'Request Sent', description: 'Bypass request submitted for approval.' });
            setBypassData(prev => ({ ...prev, isOpen: false }));
        },
        onError: () => toast({ title: 'Error', description: 'Failed to submit bypass request', variant: 'destructive' })
    });
  };

  // RENDERING
  const renderContent = () => {
    if (isLoading) {
        return <WorkfloorSkeleton />;
    }

    if (isDriver) {
        const availableJobs = driverJobs.filter(j => j.id !== activeDriverJob?.id);
            
        return (
            <div className="space-y-8">
                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-lg w-fit mb-6">
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

                {activeTab === 'active' ? (
                    <>
                        {/* Active Job Section */}
                        {activeDriverJob && (
                            <section>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-700">
                                     Current Active Job
                                </h2>
                                <div className="max-w-md">
                                    <DriverJobCard 
                                        job={activeDriverJob} 
                                        onAccept={handleAcceptJob}
                                        onComplete={handleCompleteJob}
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
                                        onAccept={handleAcceptJob}
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

    // Default: Worker View
    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg w-fit mb-6">
                <button 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${!activeTab || activeTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Tasks
                </button>
                <button 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('history')}
                >
                    Task History
                </button>
            </div>

            {activeTab === 'active' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stationOrders.length > 0 ? stationOrders.map(order => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            station={effectiveStation || 'WASHING'} 
                            onProcess={handleProcess} 
                        />
                    )) : (
                        <div className="col-span-full">
                            <EmptyState 
                                icon={Inbox}
                                title="All Caught Up!"
                                description="There are no active orders waiting at this station."
                            />
                        </div>
                    )}
                </div>
            ) : (
                /* Worker History Section */
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
                        Completed Tasks
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workerHistory?.length > 0 ? workerHistory.map((job) => (
                            <WorkerHistoryCard key={job.id} job={job} />
                        )) : (
                            <div className="col-span-full">
                                <EmptyState 
                                    icon={History}
                                    title="No History Found"
                                    description="You haven't completed any tasks yet."
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
  };

  return (
    <AttendanceGuard>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
                {isDriver ? 'Driver Jobs' : `Workfloor: ${effectiveStation || 'Overview'}`}
            </h1>
            <span className="text-sm text-gray-500">
                {isDriver 
                    ? `Available: ${driverJobs.length}` 
                    : `Active Orders: ${stationOrders.length}`
                }
            </span>
        </div>

        {renderContent()}

        <BypassModal 
          isOpen={bypassData.isOpen}
          onClose={() => setBypassData(prev => ({ ...prev, isOpen: false }))}
          onSubmit={handleBypassSubmit}
          details={bypassData.details}
          orderNumber={bypassData.orderNumber}
        />
      </div>
    </AttendanceGuard>
  );
}
