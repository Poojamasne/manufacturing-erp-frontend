export interface User {
  id: string;
  email: string;
  name: string;
  role: 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF' | 'PRODUCTION_TEAM';
    createdAt: string;
      updatedAt: string;


}

export interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  minStockLevel: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  batchNumber: string;
  materialId: string;
  quantity: number;
  receivedDate: string;
  expiryDate?: string;
  warehouseLocationId: string;
  createdAt: string;
    updatedAt: string;

}

export interface WarehouseLocation {
  id: string;
  warehouseName: string;
  rackNumber: string;
  storageArea: string;
  materialId?: string;
  batchId?: string;
  isOccupied: boolean;
  createdAt: string;
    updatedAt: string;

}

export interface StockEntry {
  id: string;
  stockEntryId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  quantityReceived: number;
  supplierName: string;
  batchNumber: string;
  receivedDate: string;
  warehouseLocationId: string;
  purchaseOrderRef?: string;
  createdBy: string;
  createdAt: string;
    updatedAt: string;

}

export interface MaterialIssueRequest {
  id: string;
  productionOrderId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  quantityRequired: number;
  requestedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'DELIVERED';
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
    updatedAt: string;

}

export interface MaterialIssueSlip {
  id: string;
  issueSlipId: string;
  requestId: string;
  productionOrderId: string;
  materialId: string;
  materialName: string;
  quantityIssued: number;
  issueDate: string;
  issuedBy: string;
  status: 'ISSUED' | 'DELIVERED';
  deliveredAt?: string;
  receivedBy?: string;
  createdAt: string;
    updatedAt: string;

}

export interface InventoryLedger {
  id: string;
  transactionId: string;
  materialId: string;
  materialName: string;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceId: string;
  referenceType: 'STOCK_ENTRY' | 'ISSUE_SLIP';
  notes: string;
  createdBy: string;
  createdAt: string;
    updatedAt: string;

}

export interface Notification {
  id: string;
  type: 'LOW_STOCK' | 'SHORTAGE' | 'PENDING_REQUEST' | 'ISSUE_COMPLETED';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
    updatedAt: string;

}


export interface InventoryStats {
  totalMaterials: number;
  totalStockValue: number;
  lowStockCount: number;
  pendingRequestsCount: number;
  totalIssuedThisMonth: number;
}