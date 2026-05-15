import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "../../../app/store/store";
import Swal from "sweetalert2";
import type { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";

export interface PurchaseRequest {
    id: number | string;
    pr_id: string;
    material_name: string;
    material_code: string;
    quantity: number;
    unit: string;
    required_date: string;
    department: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    status: "Draft" | "Submitted" | "Approved" | "In Process" | "Completed" | "Rejected";
    // requested_by: string;
    // notes?: string;
    created_at: string;
}

const initialState = {
    purchaseRequest: {
        id: 0,
        pr_id: "",
        material_name: "",
        material_code: "",
        quantity: 0,
        unit: "",
        required_date: "",
        department: "",
        priority: "MEDIUM",
        status: "Draft",
        requested_by: "",
        created_at: "",
    } as PurchaseRequest | null,

    // Dummy Data for PR List View (SRS 3.3.3)
    purchaseRequests: [
        {
            id: 1,
            pr_id: "PR-2026-001",
            material_name: "Industrial Bolt M12",
            material_code: "HDW-B-M12",
            quantity: 5000,
            unit: "pcs",
            required_date: "2026-05-20",
            department: "Production",
            priority: "HIGH",
            status: "Submitted",
            requested_by: "Admin User",
            created_at: "2026-05-10",
        },
        {
            id: 2,
            pr_id: "PR-2026-002",
            material_name: "Aluminum Frame 4x4",
            material_code: "AL-F-44",
            quantity: 250,
            unit: "units",
            required_date: "2026-05-18",
            department: "Inventory",
            priority: "HIGH",
            status: "Approved",
            // requested_by: "Logistics Head",
            created_at: "2026-05-11",
        }
    ] as PurchaseRequest[],

    loading: false,
    error: "",
};

const purchaseRequestSlice = createSlice({
    name: "purchaseRequests",
    initialState,
    reducers: {
        request: (state) => {
            state.loading = true;
        },
        endRequest: (state) => {
            state.loading = false;
        },
        failure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        // ACTION: CREATE
        createPRSuccess: (state, action: PayloadAction<PurchaseRequest>) => {
            state.loading = false;
            state.purchaseRequests.unshift(action.payload);
        },
        // ACTION: DELETE
        deletePRSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            state.purchaseRequests = state.purchaseRequests.filter(pr => pr.id !== action.payload);
        },
        // ACTION: GET SINGLE
        getPRSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            const found = state.purchaseRequests.find(
                pr => String(pr.id) === String(action.payload) || String(pr.pr_id) === String(action.payload)
            );
            state.purchaseRequest = found || null;
        },
        // ACTION: UPDATE
        updatePRSuccess: (state, action: PayloadAction<PurchaseRequest>) => {
            state.loading = false;
            state.purchaseRequests = state.purchaseRequests.map((pr) =>
                String(pr.id) === String(action.payload.id) ? action.payload : pr
            );
            state.purchaseRequest = action.payload;
        },
        clearErrors: (state) => {
            state.error = "";
        }
    }
});

export const {
    request,
    failure,
    createPRSuccess,
    deletePRSuccess,
    getPRSuccess,
    updatePRSuccess,
    clearErrors,
    endRequest
} = purchaseRequestSlice.actions;

export default purchaseRequestSlice.reducer;

// STATE-ONLY ASYNC ACTIONS

// 1. GET ALL PURCHASE REQUESTS
export const getAllPurchaseRequests = () => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Loading Procurement Data...",
        text: "Fetching Purchase Requests...",
        allowOutsideClick: false,
        customClass: { loader: "lead-loader" },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        Swal.close();
        dispatch(endRequest());
        dispatch(clearErrors());
    }, 800);
};

// 2. CREATE PURCHASE REQUEST
export const createPurchaseRequest = (payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Submitting Request...",
        text: "Generating PR ID and notifying departments...",
        allowOutsideClick: false,
        customClass: { loader: "lead-loader" },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const newPR: PurchaseRequest = {
            ...payload,
            id: Date.now(),
            pr_id: `PR-${Math.floor(1000 + Math.random() * 9000)}`, // Auto-behavior
            status: "Submitted", // Default status
            created_at: new Date().toISOString(),
        };

        dispatch(createPRSuccess(newPR));
        Swal.close();

        toast.success("Purchase Request Created!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Request Submitted",
            text: `Purchase Request ${newPR.pr_id} for ${payload.material_name} has been raised.`,
            timer: 2000,
            showConfirmButton: false,
        });

        navigate("/purchase/purchase-requests");
    }, 1200);
};

// 3. EDIT PURCHASE REQUEST
export const editPurchaseRequest = (id: string | number, payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Updating PR...",
        text: "Modifying procurement details...",
        allowOutsideClick: false,
        customClass: { loader: "lead-loader" },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const updatedPR: PurchaseRequest = {
            ...payload,
            id,
        };

        dispatch(updatePRSuccess(updatedPR));
        Swal.close();

        toast.success("Purchase Request Updated!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "PR Modified",
            text: `Request details for ${payload.pr_id} have been updated.`,
            timer: 1500,
            showConfirmButton: false,
        });

        navigate("/purchase/purchase-requests");
    }, 1000);
};

// 4. DELETE PURCHASE REQUEST
export const deletePurchaseRequest = (id: number | string) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Discard Request?",
        text: "Are you sure you want to delete this purchase request?",
        icon: "warning",
        iconColor: "#F59E0B",
        showCancelButton: true,
        confirmButtonColor: "#F59E0B",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
        dispatch(request());
        setTimeout(() => {
            dispatch(deletePRSuccess(id));
            toast.success("PR Deleted Successfully.");
            Swal.fire({
                icon: "success",
                title: "Removed",
                iconColor: "#F59E0B",
                text: "The request has been removed from the system.",
                timer: 1000,
                showConfirmButton: false,
            });
        }, 500);
    }
};

// 5. GET SINGLE PURCHASE REQUEST
export const getPurchaseRequest = (id: number | string) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Fetching Details...",
        text: "Accessing PR document details...",
        allowOutsideClick: false,
        customClass: { loader: "lead-loader" },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        dispatch(getPRSuccess(id));
        dispatch(endRequest());
        Swal.close();
    }, 900);
};