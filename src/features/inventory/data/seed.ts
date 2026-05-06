import type{ Material, WarehouseLocation, User, MaterialIssueRequest } from '../types';

export const seedMaterials: Material[] = [
  {
    id: 'mat-1',
    code: 'RAW001',
    name: 'Steel Sheet',
    unit: 'kg',
    minStockLevel: 100,
    currentStock: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mat-2',
    code: 'RAW002',
    name: 'Aluminum Rod',
    unit: 'kg',
    minStockLevel: 50,
    currentStock: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mat-3',
    code: 'RAW003',
    name: 'Copper Wire',
    unit: 'm',
    minStockLevel: 1000,
    currentStock: 3000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mat-4',
    code: 'RAW004',
    name: 'Plastic Granules',
    unit: 'kg',
    minStockLevel: 200,
    currentStock: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const seedWarehouseLocations: WarehouseLocation[] = [
  {
    id: 'loc-1',
    warehouseName: 'Main Warehouse',
    rackNumber: 'A-01',
    storageArea: 'Raw Materials Section',
    isOccupied: false,
    createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

  },
  {
    id: 'loc-2',
    warehouseName: 'Main Warehouse',
    rackNumber: 'A-02',
    storageArea: 'Raw Materials Section',
    isOccupied: false,
    createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

  },
  {
    id: 'loc-3',
    warehouseName: 'Secondary Warehouse',
    rackNumber: 'B-01',
    storageArea: 'Bulk Storage',
    isOccupied: false,
    createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

  },
  {
    id: 'loc-4',
    warehouseName: 'Secondary Warehouse',
    rackNumber: 'B-02',
    storageArea: 'Bulk Storage',
    isOccupied: false,
    createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

  },
];

export const seedUsers: User[] = [
  {
    id: 'user-1',
    email: 'manager@inventory.com',
    name: 'John Manager',
    role: 'INVENTORY_MANAGER',
        createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

  },
  {
    id: 'user-2',
    email: 'staff@inventory.com',
    name: 'Jane Staff',
    role: 'WAREHOUSE_STAFF',
        createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

  },

  {
    id: 'user-3',
    email: 'production@company.com',
    name: 'Bob Production',
    role: 'PRODUCTION_TEAM',
        createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

  },
];

export const seedIssueRequests: MaterialIssueRequest[] = [
  {
    id: 'req-1',
    productionOrderId: 'PO-1001',
    materialId: 'mat-1',
    materialCode: 'RAW001',
    materialName: 'Steel Sheet',
    quantityRequired: 150,
    requestedDate: new Date().toISOString(),
    status: 'PENDING',
        createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

  },
  {
    id: 'req-2',
    productionOrderId: 'PO-1002',
    materialId: 'mat-4',
    materialCode: 'RAW004',
    materialName: 'Plastic Granules',
    quantityRequired: 100,
    requestedDate: new Date().toISOString(),
    status: 'PENDING',
        createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

  },
];