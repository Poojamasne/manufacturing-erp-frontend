import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "../../../app/store/store";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

// ==================== Types ====================
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "PURCHASE_NOTIFIED";
export type ExecutionStatus = "APPROVED" | "ISSUED" | "DELIVERED" | "REJECTED";

export interface IssueRequest {
    id: string;
    requestId: string;
    productionOrderId: string;
    materialName: string;
    materialCode: string;
    qtyRequired: number;
    qtyAvailable: number;
    unit: string;
    status: RequestStatus;
    createdAt: string;
}

export interface MaterialIssue {
    id: string;
    requestId: string;
    productionOrderId: string;
    materialName: string;
    materialCode: string;
    quantity: number;
    unit: string;
    warehouseLocation: string;
    batchNumber: string;
    status: ExecutionStatus;
    createdAt: string;
}

interface MaterialIssueState {
    requests: IssueRequest[];
    executions: MaterialIssue[];
    loading: boolean;
    error: string;
}

// ==================== Initial State ====================
const initialState: MaterialIssueState = {
    requests: [
        { id: "1", requestId: "REQ-4001", productionOrderId: "PO-7721", materialName: "Steel Sheet 2mm", materialCode: "MAT-001", qtyRequired: 150, qtyAvailable: 500, unit: "kg", status: "PENDING", createdAt: new Date().toISOString() },
        { id: "2", requestId: "REQ-4005", productionOrderId: "PO-7725", materialName: "Aluminum Rod", materialCode: "MAT-088", qtyRequired: 2000, qtyAvailable: 450, unit: "m", status: "PENDING", createdAt: new Date().toISOString() },
    ],
    executions: [
        // Pre-existing approved items
        { id: "exec-1", requestId: "REQ-3009", productionOrderId: "PO-7000", materialName: "Copper Wire", materialCode: "MAT-042", quantity: 500, unit: "m", warehouseLocation: "WH-A / R-12", batchNumber: "BT-7741", status: "ISSUED", createdAt: new Date().toISOString() },
    ],
    loading: false,
    error: "",
};

// ==================== Slice ====================
const materialIssueSlice = createSlice({
    name: "materialIssues",
    initialState,
    reducers: {
        requestStart: (state) => {
            state.loading = true;
        },
        requestEnd: (state) => {
            state.loading = false;
        },

        updateRequestStatusSuccess: (state, action: PayloadAction<{ id: string; status: RequestStatus }>) => {
            const { id, status } = action.payload;
            const index = state.requests.findIndex(r => r.id === id);
            if (index !== -1) {
                state.requests[index].status = status;

                // LOGIC: If approved, move/create in Execution list
                if (status === "APPROVED") {
                    const req = state.requests[index];
                    // Check if it already exists in executions to avoid duplicates
                    if (!state.executions.find(e => e.requestId === req.requestId)) {
                        state.executions.unshift({
                            id: `exec-${Date.now()}`,
                            requestId: req.requestId,
                            productionOrderId: req.productionOrderId,
                            materialName: req.materialName,
                            materialCode: req.materialCode,
                            quantity: req.qtyRequired,
                            unit: req.unit,
                            warehouseLocation: "PENDING ASSIGNMENT", // Default for warehouse to fill
                            batchNumber: "BT-AUTO",
                            status: "APPROVED",
                            createdAt: new Date().toISOString(),
                        });
                    }
                }
            }
            state.loading = false;
        },
        updateExecutionStatusSuccess: (state, action: PayloadAction<{ id: string; status: ExecutionStatus }>) => {
            const { id, status } = action.payload;
            const index = state.executions.findIndex(e => e.id === id);
            if (index !== -1) {
                state.executions[index].status = status;
            }
            state.loading = false;
        },
        failure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    requestStart,
    requestEnd,
    updateRequestStatusSuccess,
    updateExecutionStatusSuccess,
    failure,
} = materialIssueSlice.actions;

export default materialIssueSlice.reducer;

// ==================== Thunks (Async Actions) ====================

// 1. Update Request Status (Handling/Decision)
export const updateRequestStatus = (id: string, status: RequestStatus) => async (dispatch: AppDispatch) => {
    dispatch(requestStart());

    Swal.fire({
        title: "Processing Decision...",
        text: `Updating request to ${status.replace("_", " ")}`,
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        dispatch(updateRequestStatusSuccess({ id, status }));
        Swal.close();

        toast.success(`Request ${status.toLowerCase()} successfully!`);

        if (status === "APPROVED") {
            Swal.fire({
                icon: "success",
                iconColor:"#f59e0b",
                title: "Request Approved",
                text: "The item has been sent to the Warehouse Execution list.",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    }, 800);
};

// 2. Update Execution Status (Warehouse Flow)
export const updateExecutionStatus = (id: string, status: ExecutionStatus) => async (dispatch: AppDispatch) => {
    dispatch(requestStart());

    Swal.fire({
        title: "Updating Dispatch...",
        text: `Marking material as ${status}`,
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        dispatch(updateExecutionStatusSuccess({ id, status }));
        Swal.close();

        toast.success(`Status updated to ${status}`);

        const icon = status === "REJECTED" ? "error" : "success";
        Swal.fire({
            icon: icon,
            iconColor: icon === "error" ? "#ef4444" : "#f59e0b",
            title: `Execution ${status}`,
            text: status === "DELIVERED" ? "Material flow completed." : "Dispatch record updated.",
            timer: 1500,
            showConfirmButton: false,
        });
    }, 800);
};

// 3. Fetch All (Simulated)
export const fetchAllMaterialFlows = () => async (dispatch: AppDispatch) => {
    dispatch(requestStart());
    setTimeout(() => {
        dispatch(requestEnd());
    }, 500);
};
