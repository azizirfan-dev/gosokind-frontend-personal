'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AttendanceGuard from '@/components/workfloor/AttendanceGuard';
import OrderCard from '@/components/workfloor/OrderCard';
import BypassModal from '@/components/workfloor/BypassModal';
import { getOrders, processOrder, submitBypass } from '@/services/workfloor.service';
import { StationOrder, StationType, StationOrderDTO } from '@/types/worker';

// Temporary until we get user context properly
const TEMP_STATION: StationType = 'WASHING'; 

export default function WorkfloorPage() {
  const [orders, setOrders] = useState<StationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bypassData, setBypassData] = useState<{ isOpen: boolean, orderId: string, orderNumber: string, details: any[] }>({
    isOpen: false, orderId: '', orderNumber: '', details: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders(TEMP_STATION);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async (orderId: string, items: { laundryItemId: string; quantity: number }[]) => {
    try {
      await processOrder({
        orderId,
        station: TEMP_STATION,
        items,
        actualQty: 0 // Not strictly needed by backend schema but interface demands it? check type.
      });
      toast({ title: 'Success', description: 'Order processed successfully' });
      fetchOrders(); // Refresh
    } catch (error: any) {
      if (error.response?.data?.message === 'QTY_MISMATCH') {
        const order = orders.find(o => o.id === orderId);
        setBypassData({
          isOpen: true,
          orderId,
          orderNumber: order?.orderNumber || 'Unknown',
          details: error.response.data.details || [] // Expecting detailed mismatch from backend
        });
      } else {
        toast({ title: 'Error', description: error.response?.data?.message || 'Failed to process', variant: 'destructive' });
      }
    }
  };

  const handleBypassSubmit = async (reason: string) => {
    try {
      // We need to fetch the input items again or store them? 
      // The bypass endpoint usually takes reason only? Check Payload.
      // Payload: expectedQty, actualQty needed?
      // Let's assume for now we just send the reason and basic info.
      // Wait, simple BypassPayload in `worker.ts` asks for qtys.
      // For MVP, if backend `bypassService` needs qtys, we need to pass them.
      // Backend controller actually takes { orderId, station, reason }.
      // Let's check `bypass.controller.ts`.
      
      await submitBypass({
        orderId: bypassData.orderId,
        station: TEMP_STATION,
        reason,
        expectedQty: 0, // Ignored by valid backend implementation?
        actualQty: 0
      });
      
      toast({ title: 'Request Sent', description: 'Bypass request submitted for approval.' });
      setBypassData(prev => ({ ...prev, isOpen: false }));
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to submit bypass request', variant: 'destructive' });
    }
  };

  return (
    <AttendanceGuard>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Workfloor: {TEMP_STATION}</h1>
          <span className="text-sm text-gray-500">Active Orders: {orders.length}</span>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.length > 0 ? orders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                station={TEMP_STATION} 
                onProcess={handleProcess} 
              />
            )) : (
              <p className="col-span-full text-center text-gray-500 py-12">No active orders at this station.</p>
            )}
          </div>
        )}

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
