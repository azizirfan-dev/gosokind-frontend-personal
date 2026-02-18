'use client';

import { Inbox, History } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import OrderCard from '@/components/workfloor/OrderCard';
import WorkerHistoryCard from '@/components/workfloor/WorkerHistoryCard';
import { NotificationCenter, Notification } from '@/components/workfloor/NotificationCenter';
import { StationOrder, StationType, WorkerHistoryItem } from '@/types/worker';

interface WorkerViewProps {
  activeTab: 'active' | 'history';
  setActiveTab: (tab: 'active' | 'history') => void;
  stationOrders: StationOrder[];
  workerHistory: WorkerHistoryItem[];
  effectiveStation: StationType;
  onProcess: (orderId: string, items: { laundryItemId: string; quantity: number }[]) => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function WorkerView({
  activeTab,
  setActiveTab,
  stationOrders,
  workerHistory,
  effectiveStation,
  onProcess,
  notifications,
  onMarkAsRead,
  onClearAll
}: WorkerViewProps) {
  return (
    <div className="space-y-8">
        {/* Header: Tabs & Notifications */}
        <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
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

            {/* Notification Center */}
            <NotificationCenter 
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onClearAll={onClearAll}
            />
        </div>

        {activeTab === 'active' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stationOrders.length > 0 ? stationOrders.map(order => (
                    <OrderCard 
                        key={order.id} 
                        order={order} 
                        station={effectiveStation || 'WASHING'} 
                        onProcess={onProcess} 
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
}
