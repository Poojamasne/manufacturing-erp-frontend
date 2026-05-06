import { createLocalStorageRepository } from '../../../shared/storage/createLocalStorageRepository';
import type { 
  Material, StockEntry, MaterialIssueRequest, MaterialIssueSlip, 
  InventoryLedger, WarehouseLocation, Batch, Notification, User 
} from '../types';
import { seedMaterials, seedWarehouseLocations, seedUsers, seedIssueRequests } from '../data/seed';

// Define storage keys
const STORAGE_KEYS = {
  USERS: 'inventory_users',
  CURRENT_USER: 'inventory_current_user',
  MATERIALS: 'inventory_materials',
  STOCK_ENTRIES: 'inventory_stock_entries',
  ISSUE_REQUESTS: 'inventory_issue_requests',
  ISSUE_SLIPS: 'inventory_issue_slips',
  LEDGER: 'inventory_ledger',
  WAREHOUSE_LOCATIONS: 'inventory_warehouse_locations',
  BATCHES: 'inventory_batches',
  NOTIFICATIONS: 'inventory_notifications',
};

// Initialize repositories
export const materialRepository = createLocalStorageRepository<Material>({
  storageKey: STORAGE_KEYS.MATERIALS,
  seed: seedMaterials,
  idPrefix: "material",
});
export const stockEntryRepository = createLocalStorageRepository<StockEntry>({
  storageKey: STORAGE_KEYS.STOCK_ENTRIES,
  idPrefix: "stock-entry",
});

export const issueRequestRepository = createLocalStorageRepository<MaterialIssueRequest>({
  storageKey: STORAGE_KEYS.ISSUE_REQUESTS,
  seed: seedIssueRequests,
  idPrefix: "issue-request",
});

export const issueSlipRepository = createLocalStorageRepository<MaterialIssueSlip>({
  storageKey: STORAGE_KEYS.ISSUE_SLIPS,
  idPrefix: "issue-slip",
});

export const ledgerRepository = createLocalStorageRepository<InventoryLedger>({
  storageKey: STORAGE_KEYS.LEDGER,
  idPrefix: "ledger",
});

export const warehouseRepository = createLocalStorageRepository<WarehouseLocation>({
  storageKey: STORAGE_KEYS.WAREHOUSE_LOCATIONS,
  seed: seedWarehouseLocations,
  idPrefix: "warehouse",
});

export const batchRepository = createLocalStorageRepository<Batch>({
  storageKey: STORAGE_KEYS.BATCHES,
  idPrefix: "batch",
});

export const notificationRepository = createLocalStorageRepository<Notification>({
  storageKey: STORAGE_KEYS.NOTIFICATIONS,
  idPrefix: "notification",
});

export const userRepository = createLocalStorageRepository<User>({
  storageKey: STORAGE_KEYS.USERS,
  seed: seedUsers,
  idPrefix: "user",
});

// Initialize seed data
export const initializeInventoryData = () => {
  // Initialize materials
  const existingMaterials = materialRepository.list();
  if (existingMaterials.length === 0) {
    seedMaterials.forEach(material => materialRepository.create(material));
  }

  // Initialize warehouse locations
  const existingLocations = warehouseRepository.list();
  if (existingLocations.length === 0) {
    seedWarehouseLocations.forEach(location => warehouseRepository.create(location));
  }

  // Initialize users
  const existingUsers = userRepository.list();
  if (existingUsers.length === 0) {
    seedUsers.forEach(user => userRepository.create(user));
  }

  // Initialize issue requests
  const existingRequests = issueRequestRepository.list();
  if (existingRequests.length === 0) {
    seedIssueRequests.forEach(request => issueRequestRepository.create(request));
  }
};

// Business logic methods
export const inventoryService = {
  // Material Management
  getAllMaterials: () => materialRepository.list(),
  getMaterialById: (id: string) => materialRepository.getById(id),
  createMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    return materialRepository.create({
      ...material,
      id: crypto.randomUUID(),
    });
  },
  updateMaterialStock: (materialId: string, quantityChange: number, isInward: boolean) => {
    const material = materialRepository.getById(materialId);
    if (material) {
      const newStock = isInward 
        ? material.currentStock + quantityChange 
        : material.currentStock - quantityChange;
      
      materialRepository.update(materialId, {
        currentStock: newStock,
        updatedAt: new Date().toISOString(),
      });
      
      return material;
    }
    return null;
  },

  // Stock Entry Management
  getAllStockEntries: () => stockEntryRepository.list(),
  createStockEntry: (entry: Omit<StockEntry, 'id' | 'createdAt'>) => {
    const stockEntry = stockEntryRepository.create({
      ...entry,
      id: crypto.randomUUID(),
    });
    
    // Update material stock
    inventoryService.updateMaterialStock(entry.materialId, entry.quantityReceived, true);
    
    // Create ledger entry
    const material = materialRepository.getById(entry.materialId);
    if (material) {
      ledgerRepository.create({
        id: crypto.randomUUID(),
        transactionId: `LEDGER-${Date.now()}`,
        materialId: entry.materialId,
        materialName: entry.materialName,
        transactionType: 'IN',
        quantity: entry.quantityReceived,
        previousStock: material.currentStock - entry.quantityReceived,
        newStock: material.currentStock,
        referenceId: stockEntry.id,
        referenceType: 'STOCK_ENTRY',
        notes: `Stock received from ${entry.supplierName}`,
        createdBy: entry.createdBy,
      });
    }
    
    return stockEntry;
  },

  // Issue Request Management
  getAllIssueRequests: () => issueRequestRepository.list(),
  getPendingRequests: () => issueRequestRepository.list().filter(r => r.status === 'PENDING'),
  createIssueRequest: (request: Omit<MaterialIssueRequest, 'id' | 'createdAt'>) => {
    const newRequest = issueRequestRepository.create({
      ...request,
      id: crypto.randomUUID(),
    });
    
    // Check for shortage
    const material = materialRepository.getById(request.materialId);
    if (material && material.currentStock < request.quantityRequired) {
      notificationRepository.create({
        id: crypto.randomUUID(),
        type: 'SHORTAGE',
        title: 'Material Shortage Alert',
        message: `${material.name} shortage: requires ${request.quantityRequired} but only ${material.currentStock} available`,
        read: false,
        data: { requestId: newRequest.id, materialId: request.materialId },
      });
    }
    
    return newRequest;
  },
  
  updateIssueRequest: (id: string, updates: Partial<MaterialIssueRequest>) => {
    return issueRequestRepository.update(id, updates);
  },

  // Issue Slip Management
  getAllIssueSlips: () => issueSlipRepository.list(),
  createIssueSlip: (slip: Omit<MaterialIssueSlip, 'id' | 'createdAt'>) => {
    const issueSlip = issueSlipRepository.create({
      ...slip,
      id: crypto.randomUUID(),
    });
    
    // Update material stock
    inventoryService.updateMaterialStock(slip.materialId, slip.quantityIssued, false);
    
    // Create ledger entry
    const material = materialRepository.getById(slip.materialId);
    if (material) {
      ledgerRepository.create({
        id: crypto.randomUUID(),
        transactionId: `LEDGER-${Date.now()}`,
        materialId: slip.materialId,
        materialName: slip.materialName,
        transactionType: 'OUT',
        quantity: slip.quantityIssued,
        previousStock: material.currentStock + slip.quantityIssued,
        newStock: material.currentStock,
        referenceId: issueSlip.id,
        referenceType: 'ISSUE_SLIP',
        notes: `Issued for Production Order: ${slip.productionOrderId}`,
        createdBy: slip.issuedBy,
      });
    }
    
    // Update request status
    issueRequestRepository.update(slip.requestId, { status: 'ISSUED' });
    
    return issueSlip;
  },

  // Warehouse Management
  getAllWarehouseLocations: () => warehouseRepository.list(),
  assignMaterialToLocation: (locationId: string, materialId: string, batchId: string) => {
    return warehouseRepository.update(locationId, {
      materialId,
      batchId,
      isOccupied: true,
    });
  },

  // Ledger Management
  getAllLedgerEntries: () => ledgerRepository.list(),
  getLedgerByMaterial: (materialId: string) => {
    return ledgerRepository.list().filter(l => l.materialId === materialId);
  },

  // Notifications
  getAllNotifications: () => notificationRepository.list(),
  getUnreadNotifications: () => notificationRepository.list().filter(n => !n.read),
  markNotificationRead: (id: string) => {
    return notificationRepository.update(id, { read: true });
  },
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    return notificationRepository.create({
      ...notification,
      id: crypto.randomUUID(),
    });
  },

  // Dashboard Stats
getDashboardStats: () => {
  const materials = materialRepository.list();
  const pendingRequests = issueRequestRepository
    .list()
    .filter((r) => r.status === "PENDING");
  const lowStockMaterials = materials.filter(
    (m) => m.currentStock <= m.minStockLevel
  );

  const totalIssuedThisMonth = issueSlipRepository
    .list()
    .filter((slip) => {
      const slipDate = new Date(slip.issueDate);
      const now = new Date();
      return (
        slipDate.getMonth() === now.getMonth() &&
        slipDate.getFullYear() === now.getFullYear()
      );
    }).length;

  return {
    totalMaterials: materials.length,
    totalStockValue: 0,
    lowStockCount: lowStockMaterials.length,
    pendingRequestsCount: pendingRequests.length,
    totalIssuedThisMonth,
    lowStockMaterials,
    pendingRequests,
  };
},

};