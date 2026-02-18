'use client';

import { NewOrderAlert } from '@/components/workfloor/NewOrderAlert';

import { Notification, NotificationCenter } from '@/components/workfloor/NotificationCenter';
// Include useRef in imports
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import AttendanceGuard from '@/components/workfloor/AttendanceGuard';
import BypassModal from '@/components/workfloor/BypassModal';
import { WorkfloorSkeleton } from '@/components/workfloor/WorkfloorSkeleton';
import { useStationOrders, useProcessOrder, useSubmitBypass, useWorkerHistory } from '@/hooks/useWorkfloor';
import { useAvailableJobs, useActiveJob, useAcceptJob, useCompleteJob, useDriverHistory } from '@/hooks/useDriver';
import { StationType } from '@/types/worker';

// Helper to map role to station
// Helper to map role to station
const mapRoleToStation = (role: string): StationType | null => {
    if (role === 'WORKER_WASHING') return 'WASHING';
    if (role === 'WORKER_IRONING') return 'IRONING';
    if (role === 'WORKER_PACKING') return 'PACKING';
    return null;
};

import DriverView from '@/components/workfloor/DriverView';
import WorkerView from '@/components/workfloor/WorkerView';

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

  // Notification Logic
  const [newOrderAlert, setNewOrderAlert] = useState<{ isOpen: boolean, orderNumber: string }>({
    isOpen: false,
    orderNumber: ''
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Persistent State Refs
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  // 1. Initialize Notifs from LocalStorage
  useEffect(() => {
    if (user?.id && !isInitializedRef.current) {
        const storedNotifs = localStorage.getItem(`gosokind_notifs_${user.id}`);
        const storedSeen = localStorage.getItem(`gosokind_seen_${user.id}`);
        
        if (storedNotifs) {
            try {
                const parsed = JSON.parse(storedNotifs);
                const rehydrated = parsed.map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }));
                setNotifications(rehydrated);
            } catch (e) {
                console.error("Failed to parse notifications", e);
                setNotifications([]);
            }
        }
        if (storedSeen) {
            seenIdsRef.current = new Set(JSON.parse(storedSeen));
        }
        isInitializedRef.current = true;
    }
  }, [user]);

  // 2. Watch for New Orders
  useEffect(() => {
    if (!user?.id || !isInitializedRef.current) return;
    if (activeTab === 'active' && stationOrders.length > 0) {
        let hasNew = false;
        const currentSeen = seenIdsRef.current;
        const newNotifs: Notification[] = [];

        stationOrders.forEach(order => {
            if (!currentSeen.has(order.id)) {
                hasNew = true;
                currentSeen.add(order.id); // Mark as seen
                
                newNotifs.push({
                    id: crypto.randomUUID(),
                    orderNumber: order.orderNumber,
                    timestamp: new Date(),
                    read: false
                });
            }
        });

        if (hasNew) {
            const updatedNotifs = [...newNotifs, ...notifications];
            setNotifications(updatedNotifs);
            localStorage.setItem(`gosokind_notifs_${user.id}`, JSON.stringify(updatedNotifs));
            localStorage.setItem(`gosokind_seen_${user.id}`, JSON.stringify(Array.from(currentSeen)));

            setNewOrderAlert({
                isOpen: true,
                orderNumber: newNotifs[0].orderNumber
            });
        }
    }
  }, [stationOrders, activeTab, user, notifications]);

  const handleMarkAsRead = (id: string) => {
    if (!user?.id) return;
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem(`gosokind_notifs_${user.id}`, JSON.stringify(updated));
  };

  const handleClearNotifications = () => {
    if (!user?.id) return;
    setNotifications([]);
    localStorage.removeItem(`gosokind_notifs_${user.id}`);
  };


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
        return (
            <DriverView 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                driverJobs={driverJobs}
                activeJob={activeDriverJob || null} 
                historyJobs={historyJobs}
                onAccept={handleAcceptJob}
                onComplete={handleCompleteJob}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearNotifications}
            />
        );
    }

    // Worker View
    return (
        <WorkerView 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stationOrders={stationOrders}
            workerHistory={workerHistory}
            effectiveStation={effectiveStation || 'WASHING'}
            onProcess={handleProcess}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearNotifications}
        />
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

        <NewOrderAlert 
            isOpen={newOrderAlert.isOpen}
            onClose={() => setNewOrderAlert(prev => ({ ...prev, isOpen: false }))}
            orderNumber={newOrderAlert.orderNumber}
        />
      </div>
    </AttendanceGuard>
  );
}
