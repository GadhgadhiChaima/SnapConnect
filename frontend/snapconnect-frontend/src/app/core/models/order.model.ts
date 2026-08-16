/* Order domain model — Model B (service purchase) */
export type OrderStatus = 'PENDING' | 'ACTIVE' | 'DELIVERY_SUBMITTED' | 'REVISION' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Order {
  id: string;
  clientId: string;
  clientName?: string;
  creatorId: string;
  creatorName?: string;
  serviceId: string;
  serviceTitle?: string;
  packageId?: string;
  packageTier?: string;
  contractId?: string;
  requirements?: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderCreateRequest {
  serviceId: string;
  packageId?: string;
  requirements?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}
