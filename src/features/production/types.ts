// Production Types - No external dependencies
export enum ProductionOrderStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  APPROVED = 'APPROVED',
  MATERIALS_PENDING = 'MATERIALS_PENDING',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum WorkOrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

export enum ShiftType {
  MORNING = 'MORNING',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT'
}

export interface ProductionOrder {
  id: string;
  productionOrderId: string;
  salesOrderId: string;
  productId: string;
  productName: string;
  quantity: number;
  deadline: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: ProductionOrderStatus;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}