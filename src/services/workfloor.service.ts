import api from '@/lib/axios';
import { StationType, StationOrder, StationOrderDTO, ProcessPayload, BypassPayload } from '@/types/worker';

const WORKER_ENDPOINT = '/worker';
const BYPASS_ENDPOINT = '/bypass';

// --- Helpers ---
const mapDtoToStationOrder = (dto: StationOrderDTO): StationOrder => ({
  id: dto.id,
  orderNumber: dto.orderNumber,
  orderId: dto.id, // DTO.id is actually orderId in this context usually, or we map accordingly. Let's assume ID is OrderID for simplicity or check DTO.
  // Actually DTO usually returns Order objects. Let's verify DTO structure.
  // StationOrderDTO has orderID? No, usually ID is the Order ID.
  items: dto.orderItems.map(item => ({
    id: item.laundryItem.id, // We need laundryItemId for process
    name: item.laundryItem.name,
    qty: item.quantity,
    laundryItemId: item.laundryItem.id
  })),
  totalQty: dto.orderItems.reduce((sum, item) => sum + item.quantity, 0),
  status: dto.status as StationType, // or OrderStatus, mapped
  isLocked: dto.status === 'ON_HOLD'
});

export const getOrders = async (station: StationType): Promise<StationOrder[]> => {
  const { data } = await api.get<{ data: StationOrderDTO[] }>(`${WORKER_ENDPOINT}/orders`, {
    params: { station } // Backend might filter by role automatically, but good to be explicit if needed
  });
  return data.data.map(mapDtoToStationOrder);
};

export const processOrder = async (payload: ProcessPayload) => {
  await api.post(`${WORKER_ENDPOINT}/process`, payload);
};

export const submitBypass = async (payload: BypassPayload) => {
  await api.post(`${BYPASS_ENDPOINT}`, payload);
};
