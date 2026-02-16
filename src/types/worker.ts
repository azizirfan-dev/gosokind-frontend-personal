export type StationType = 'WASHING' | 'IRONING' | 'PACKING';

// DTO: Raw response
export interface StationOrderDTO {
  id: string;
  orderNumber: string;
  status: string; 
  orderItems: {
    id: string;
    quantity: number;
    laundryItem: {
      id: string;
      name: string;
    };
  }[];
}

// UI Interface
export interface StationItem {
  id: string; 
  name: string;
  qty: number;
}

export interface StationOrder {
  id: string; 
  orderId: string; 
  items: StationItem[];
  totalQty: number;
  status: StationType;
}

// Payloads
export interface ProcessPayload {
  orderId: string;
  station: StationType;
  actualQty: number;
  items: {
    laundryItemId: string;
    quantity: number;
  }[];
}

export interface BypassPayload {
  orderId: string;
  station: StationType;
  expectedQty: number;
  actualQty: number;
  reason: string;
}
