import api from '@/lib/axios';
import { 
  StationOrder, 
  StationOrderDTO, 
  ProcessPayload, 
  BypassPayload, 
  StationType 
} from '@/types/worker';

const WORKER_ENDPOINT = '/worker';

// --- Helpers ---
const mapDtoToStationOrder = (dto: StationOrderDTO): StationOrder => {
  return {
    id: dto.id,
    orderId: dto.orderNumber,
    items: dto.orderItems.map((item) => ({
      id: item.laundryItem.id,
      name: item.laundryItem.name,
      qty: item.quantity,
    })),
    totalQty: dto.orderItems.reduce((acc, i) => acc + i.quantity, 0),
    status: dto.status as StationType,
  };
};

// --- Services ---
export const getStationOrders = async (station: StationType): Promise<StationOrder[]> => {
  const { data } = await api.get<StationOrderDTO[]>(`${WORKER_ENDPOINT}/orders/${station}`);
  return data.map(mapDtoToStationOrder);
};

export const processOrder = async (payload: ProcessPayload): Promise<void> => {
  await api.post(`${WORKER_ENDPOINT}/process`, payload);
};

export const requestBypass = async (payload: BypassPayload): Promise<void> => {
  await api.post(`${WORKER_ENDPOINT}/bypass`, payload);
};
