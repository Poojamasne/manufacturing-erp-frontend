import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store/hook";
import {
  bootstrapInventory,
  refreshInventory,
  createStockEntry,
  createIssueRequest,
  updateIssueRequest,
  createIssueSlip,
  assignMaterialToLocation,
  markNotificationRead,
  addStockEntryOptimistic,
  updateRequestStatusOptimistic,
} from "../store/inventorySlice";
import {
  selectInventory,
  selectInventorySummary,
  selectLowStockMaterials,
  selectPendingRequests,
  selectRecentReceipts,
  selectUnreadNotifications,
  selectWarehouseUtilization,
  selectDashboardAlerts,
} from "../store/inventorySelector";

export function useInventoryStore() {
  const dispatch = useAppDispatch();

  // Selectors
  const inventory = useAppSelector(selectInventory);
  const summary = useAppSelector(selectInventorySummary);
  const lowStockMaterials = useAppSelector(selectLowStockMaterials);
  const pendingRequests = useAppSelector(selectPendingRequests);
  const recentReceipts = useAppSelector(selectRecentReceipts);
  const unreadNotifications = useAppSelector(selectUnreadNotifications);
  const warehouseUtilization = useAppSelector(selectWarehouseUtilization);
  const dashboardAlerts = useAppSelector(selectDashboardAlerts);

  // Auto-bootstrap on first use
  useEffect(() => {
    if (inventory.materials.length === 0 && !inventory.isLoading) {
      dispatch(bootstrapInventory());
    }
  }, [dispatch, inventory.materials.length, inventory.isLoading]);

  return {
    // State
    inventory,
    summary,
    lowStockMaterials,
    pendingRequests,
    recentReceipts,
    unreadNotifications,
    warehouseUtilization,
    dashboardAlerts,
    isLoading: inventory.isLoading,
    error: inventory.error,

    // Actions
    actions: {
      refresh: () => dispatch(refreshInventory()),
      
      createStockEntry: (payload: Parameters<typeof createStockEntry>[0]) => {
        dispatch(createStockEntry(payload));
      },
      
      createIssueRequest: (payload: Parameters<typeof createIssueRequest>[0]) => {
        dispatch(createIssueRequest(payload));
      },
      
      updateIssueRequest: (payload: Parameters<typeof updateIssueRequest>[0]) => {
        dispatch(updateIssueRequest(payload));
      },
      
      createIssueSlip: (payload: Parameters<typeof createIssueSlip>[0]) => {
        dispatch(createIssueSlip(payload));
      },
      
      assignMaterialToLocation: (payload: Parameters<typeof assignMaterialToLocation>[0]) => {
        dispatch(assignMaterialToLocation(payload));
      },
      
      markNotificationRead: (id: string) => {
        dispatch(markNotificationRead(id));
      },

      // Optimistic updates
      optimisticAddStockEntry: (entry: any) => {
        dispatch(addStockEntryOptimistic(entry));
      },
      
      optimisticUpdateRequest: (id: string, status: string) => {
        dispatch(updateRequestStatusOptimistic({ id, status }));
      },
    },
  };
}