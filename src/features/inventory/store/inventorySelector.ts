import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../app/store/store";

export const selectInventory = (state: RootState) => state.inventory;

// Summary Statistics
export const selectInventorySummary = createSelector([selectInventory], (inventory) => {
  const lowStockCount = inventory.materials.filter(
    (material) => material.currentStock <= material.minStockLevel
  ).length;

  const pendingRequestsCount = inventory.issueRequests.filter(
    (request) => request.status === "PENDING"
  ).length;

const shortageCount = inventory.issueRequests.filter(
  (request) =>
    request.status === "PENDING" &&
    ((inventory.materials.find((m) => m.id === request.materialId)?.currentStock ?? 0) <
      request.quantityRequired)
).length;

  return {
    totalMaterials: inventory.materials.length,
    totalStockValue: inventory.materials.reduce((sum, m) => sum + (m.currentStock * 10), 0), // Placeholder value
    lowStockCount,
    pendingRequestsCount,
    shortageCount,
    totalIssuedThisMonth: inventory.issueSlips.filter(
      slip => new Date(slip.issueDate).getMonth() === new Date().getMonth()
    ).length,
    unreadNotifications: inventory.notifications.filter(n => !n.read).length,
  };
});

// Low Stock Materials with details
export const selectLowStockMaterials = createSelector([selectInventory], (inventory) => {
  return inventory.materials
    .filter((material) => material.currentStock <= material.minStockLevel)
    .map((material) => ({
      ...material,
      shortageAmount: material.minStockLevel - material.currentStock,
      status: material.currentStock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
    }))
    .sort((a, b) => a.currentStock - b.currentStock);
});

// Pending Requests with material availability
export const selectPendingRequests = createSelector([selectInventory], (inventory) => {
  return inventory.issueRequests
    .filter((request) => request.status === "PENDING")
    .map((request) => {
      const material = inventory.materials.find(m => m.id === request.materialId);
      return {
        ...request,
        availableStock: material?.currentStock || 0,
        isAvailable: (material?.currentStock || 0) >= request.quantityRequired,
        shortageAmount: Math.max(0, request.quantityRequired - (material?.currentStock || 0)),
      };
    })
    .sort((a, b) => {
      // Sort by availability first, then by date
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      return new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime();
    });
});

// Recent Stock Receipts
export const selectRecentReceipts = createSelector([selectInventory], (inventory) => {
  return inventory.stockEntries
    .slice()
    .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
    .slice(0, 10);
});

// Unread Notifications
export const selectUnreadNotifications = createSelector([selectInventory], (inventory) => {
  return inventory.notifications
    .filter((item) => !item.read)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// Warehouse Utilization
export const selectWarehouseUtilization = createSelector([selectInventory], (inventory) => {
  const occupied = inventory.warehouseLocations.filter(l => l.isOccupied).length;
  const total = inventory.warehouseLocations.length;
  return {
    totalLocations: total,
    occupiedLocations: occupied,
    availableLocations: total - occupied,
    utilizationRate: total > 0 ? (occupied / total) * 100 : 0,
    locationsByWarehouse: inventory.warehouseLocations.reduce((acc, loc) => {
      acc[loc.warehouseName] = (acc[loc.warehouseName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
});

// Material Transaction History
export const selectMaterialTransactions = (materialId: string) =>
  createSelector([selectInventory], (inventory) => {
    const receipts = inventory.stockEntries
      .filter(entry => entry.materialId === materialId)
      .map(entry => ({
        type: "RECEIPT" as const,
        date: entry.receivedDate,
        quantity: entry.quantityReceived,
        reference: entry.stockEntryId,
        supplier: entry.supplierName,
      }));

    const issues = inventory.issueSlips
      .filter(slip => slip.materialId === materialId)
      .map(slip => ({
        type: "ISSUE" as const,
        date: slip.issueDate,
        quantity: slip.quantityIssued,
        reference: slip.issueSlipId,
        productionOrder: slip.productionOrderId,
      }));

    return [...receipts, ...issues].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

// Dashboard Alert Summary
export const selectDashboardAlerts = createSelector(
  [selectLowStockMaterials, selectPendingRequests],
  (lowStock, pendingRequests) => ({
    criticalAlerts: lowStock.filter(m => m.currentStock === 0).length,
    warningAlerts: lowStock.filter(m => m.currentStock > 0).length,
    pendingActions: pendingRequests.filter(r => r.isAvailable).length,
    shortages: pendingRequests.filter(r => !r.isAvailable).length,
    totalAlerts: lowStock.length + pendingRequests.length,
  })
);