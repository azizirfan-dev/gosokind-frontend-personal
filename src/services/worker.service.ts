import api from '@/lib/axios';
import { 
  StationOrder, 
  StationOrderDTO, 
  ProcessPayload, 
  BypassPayload, 
  StationType,
  WorkerHistoryDTO,
  WorkerHistoryItem
} from '@/types/worker';

const WORKER_ENDPOINT = '/worker';

// --- Helpers ---
const mapDtoToStationOrder = (dto: StationOrderDTO): StationOrder => {
  return {
    id: dto.id,
    orderId: dto.id, // Fixed: Use ID as ID
    orderNumber: dto.orderNumber, // Added
    items: dto.orderItems.map((item) => ({
      id: item.laundryItem.id,
      name: item.laundryItem.name,
      qty: item.quantity,
    })),
    totalQty: dto.orderItems.reduce((acc, i) => acc + i.quantity, 0),
    status: dto.status as StationType | 'ON_HOLD',
    isLocked: dto.status === 'ON_HOLD', // Added
  };
};

// --- Services ---
////////////////////////////////////////////////////////////////////////////////
// CRITICAL FIX: Reverting to Version that matches Backend Routes
// Backend: router.get("/orders", ...) -> Infers station from User Token
////////////////////////////////////////////////////////////////////////////////
export const getStationOrders = async (station: StationType): Promise<StationOrder[]> => {
  const { data } = await api.get<{ data: StationOrderDTO[] }>(`${WORKER_ENDPOINT}/orders`, {
    params: { station } // Optional: Keep for clarity, though backend ignores it
  });
  return data.data.map(mapDtoToStationOrder); // Correctly access .data wrapper
};

export const processOrder = async (payload: ProcessPayload): Promise<void> => {
  await api.post(`${WORKER_ENDPOINT}/process`, payload);
};

export const requestBypass = async (payload: BypassPayload): Promise<void> => {
  // CRITICAL FIX: Backend endpoint is /api/bypass, NOT /api/worker/bypass
  await api.post(`/bypass`, payload); 
};

export const getWorkerHistory = async (): Promise<WorkerHistoryItem[]> => {
  const { data } = await api.get<{ data: WorkerHistoryDTO[] }>(`${WORKER_ENDPOINT}/history`);
  return data.data.map((dto) => ({
    id: dto.id,
    orderNumber: dto.order.orderNumber,
    items: dto.order.orderItems.map((i) => `${i.quantity} ${i.laundryItem.name}`).join(', '),
    date: new Date(dto.completedAt).toLocaleDateString() + ' ' + new Date(dto.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: dto.order.status.replace(/_/g, ' ')
  }));
};
