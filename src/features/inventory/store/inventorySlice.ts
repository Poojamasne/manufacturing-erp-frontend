import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Batch,
  InventoryLedger,
  InventoryStats,
  Material,
  MaterialIssueRequest,
  MaterialIssueSlip,
  Notification,
  StockEntry,
  User,
  WarehouseLocation,
} from "../types";
import { batchRepository, userRepository } from "../services/inventoryService";
import { initializeInventoryData, inventoryService } from "../services/inventoryService";

interface InventorySnapshot {
  materials: Material[];
  stockEntries: StockEntry[];
  issueRequests: MaterialIssueRequest[];
  issueSlips: MaterialIssueSlip[];
  ledgerEntries: InventoryLedger[];
  warehouseLocations: WarehouseLocation[];
  batches: Batch[];
  notifications: Notification[];
  users: User[];
  stats: InventoryStats;
}

interface InventoryState extends InventorySnapshot {
  isLoading: boolean;
  error: string | null;
}

const getSnapshot = (): InventorySnapshot => ({
  materials: inventoryService.getAllMaterials(),
  stockEntries: inventoryService.getAllStockEntries(),
  issueRequests: inventoryService.getAllIssueRequests(),
  issueSlips: inventoryService.getAllIssueSlips(),
  ledgerEntries: inventoryService.getAllLedgerEntries(),
  warehouseLocations: inventoryService.getAllWarehouseLocations(),
  batches: batchRepository.list(),
  notifications: inventoryService.getAllNotifications(),
  users: userRepository.list(),
  stats: inventoryService.getDashboardStats(),
});

const initialState: InventoryState = {
  ...getSnapshot(),
  isLoading: false,
  error: null,
};

// Async Thunks
export const bootstrapInventory = createAsyncThunk(
  "inventory/bootstrap",
  async () => {
initializeInventoryData();
    return getSnapshot();
  }
);

export const refreshInventory = createAsyncThunk(
  "inventory/refresh",
  async () => getSnapshot()
);

export const createStockEntry = createAsyncThunk(
  "inventory/createStockEntry",
  async (entry: Parameters<typeof inventoryService.createStockEntry>[0]) => {
    inventoryService.createStockEntry(entry);
    return getSnapshot();
  }
);

export const createIssueRequest = createAsyncThunk(
  "inventory/createIssueRequest",
  async (request: Parameters<typeof inventoryService.createIssueRequest>[0]) => {
    inventoryService.createIssueRequest(request);
    return getSnapshot();
  }
);

export const updateIssueRequest = createAsyncThunk(
  "inventory/updateIssueRequest",
  async ({
    id,
    updates,
  }: {
    id: string;
    updates: Parameters<typeof inventoryService.updateIssueRequest>[1];
  }) => {
    inventoryService.updateIssueRequest(id, updates);
    return getSnapshot();
  }
);

export const createIssueSlip = createAsyncThunk(
  "inventory/createIssueSlip",
  async (slip: Parameters<typeof inventoryService.createIssueSlip>[0]) => {
    inventoryService.createIssueSlip(slip);
    return getSnapshot();
  }
);

export const assignMaterialToLocation = createAsyncThunk(
  "inventory/assignMaterialToLocation",
  async ({
    locationId,
    materialId,
    batchId,
  }: {
    locationId: string;
    materialId: string;
    batchId: string;
  }) => {
    inventoryService.assignMaterialToLocation(locationId, materialId, batchId);
    return getSnapshot();
  }
);

export const markNotificationRead = createAsyncThunk(
  "inventory/markNotificationRead",
  async (id: string) => {
    inventoryService.markNotificationRead(id);
    return getSnapshot();
  }
);

// The Slice
const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearInventoryError(state) {
      state.error = null;
    },
    // Optimistic updates for better UX
    addStockEntryOptimistic(state, action: PayloadAction<StockEntry>) {
      state.stockEntries.unshift(action.payload);
      const material = state.materials.find(m => m.id === action.payload.materialId);
      if (material) {
        material.currentStock += action.payload.quantityReceived;
      }
    },
    updateRequestStatusOptimistic(state, action: PayloadAction<{ id: string; status: string }>) {
      const request = state.issueRequests.find(r => r.id === action.payload.id);
      if (request) {
        request.status = action.payload.status as any;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Bootstrap
      .addCase(bootstrapInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bootstrapInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(bootstrapInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to load inventory";
      })
      // Refresh
      .addCase(refreshInventory.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      // All other mutations just refresh the entire state
      .addCase(createStockEntry.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(createIssueRequest.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(updateIssueRequest.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(createIssueSlip.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(assignMaterialToLocation.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

export const { clearInventoryError, addStockEntryOptimistic, updateRequestStatusOptimistic } = inventorySlice.actions;
export default inventorySlice.reducer;