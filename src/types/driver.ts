// DTO: Raw response from Backend
export interface DriverJobDTO {
  id: string;
  orderNumber: string;
  type: 'PICKUP' | 'DELIVERY';
  status: 'WAITING_FOR_PICKUP' | 'delivery_on_the_way' | 'completed'; // Add specific backend enums
  customer: {
    fullName: string;
  };
  address: {
    address: string;
    latitude: number;
    longitude: number;
  };
  orderItems: {
    id: string;
    quantity: number;
  }[];
  createdAt: string;
}

// UI Interface: Cleaned up for consumption
export interface DriverJob {
  id: string;
  orderId: string;
  type: 'PICKUP' | 'DELIVERY';
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | string; // Allow string fallback but encourage params
  customerName: string;
  address: string;
  itemCount: number;
  date: string;
  distance?: string;
}
