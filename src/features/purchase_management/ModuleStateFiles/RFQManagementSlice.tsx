import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "../../../app/store/store";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import type { NavigateFunction } from "react-router-dom";

// ==================== Types (SRS 3.5) ====================
export interface RFQVendor {
    id: string | number;
    name: string;
    status: "Sent" | "Awaiting" | "Received";
}

export interface RFQ {
    id: number | string;
    rfq_id: string; // RFQ-XXXX
    pr_ref: string; // Linked Purchase Request ID
    material_name: string;
    quantity: number;
    unit: string;
    vendors: RFQVendor[];
    deadline: string;
    status: "Draft" | "Sent" | "Awaiting Response" | "Completed";
    created_at: string;
}

const initialState = {
    rfq: null as RFQ | null,
    rfqs: [
        {
            id: 1,
            rfq_id: "RFQ-5501",
            pr_ref: "PR-2026-001",
            material_name: "Industrial Bolt M12",
            quantity: 5000,
            unit: "pcs",
            vendors: [
                { id: 1, name: "Tata Steel Ltd", status: "Received" },
                { id: 3, name: "Global Fasteners", status: "Awaiting" },
            ],
            deadline: "2026-05-25",
            status: "Awaiting Response",
            created_at: "2026-05-12T09:00:00Z",
        },
    ] as RFQ[],
    loading: false,
    error: "",
};

const rfqSlice = createSlice({
    name: "rfqs",
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
        // ACTION: GET ALL
        getAllRFQSuccess: (state, action: PayloadAction<RFQ[]>) => {
            state.loading = false;
            state.rfqs = action.payload;
        },
        // ACTION: GET ONE
        getRFQSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            const found = state.rfqs.find(
                (r) =>
                    String(r.id) === String(action.payload) ||
                    String(r.rfq_id) === String(action.payload),
            );
            state.rfq = found || null;
        },
        // ACTION: CREATE
        createRFQSuccess: (state, action: PayloadAction<RFQ>) => {
            state.loading = false;
            state.rfqs.unshift(action.payload);
        },
        // ACTION: UPDATE
        updateRFQSuccess: (state, action: PayloadAction<RFQ>) => {
            state.loading = false;
            state.rfqs = state.rfqs.map((r) =>
                String(r.id) === String(action.payload.id) ? action.payload : r,
            );
            state.rfq = action.payload;
        },
        // ACTION: DELETE
        deleteRFQSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            state.rfqs = state.rfqs.filter((r) => r.id !== action.payload);
        },
        clearErrors: (state) => {
            state.error = "";
        },
    },
});

export const {
    request,
    endRequest,
    failure,
    getAllRFQSuccess,
    getRFQSuccess,
    createRFQSuccess,
    updateRFQSuccess,
    deleteRFQSuccess,
    clearErrors,
} = rfqSlice.actions;

export default rfqSlice.reducer;

// ASYNC ACTIONS (THUNKS)

// 1. GET ALL RFQs
export const getAllRFQs = () => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Syncing Sourcing Data...",
        text: "Fetching Request for Quotations...",
        allowOutsideClick: false,
        customClass: {
            loader: "lead-loader",
        },
        didOpen: () => {
            Swal.showLoading();
        },
    });

    setTimeout(() => {
        Swal.close();
        dispatch(endRequest());
        dispatch(clearErrors());
    }, 800);
};

// 2. CREATE RFQ
export const createRFQEntry =
    (payload: any, navigate: NavigateFunction) =>
        async (dispatch: AppDispatch) => {
            dispatch(request());
            Swal.fire({
                title: "Generating RFQ...",
                text: "Building sourcing request and notifying vendors...",
                allowOutsideClick: false,
                customClass: {
                    loader: "lead-loader",
                },
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            setTimeout(() => {
                const newRFQ: RFQ = {
                    ...payload,
                    id: Date.now(),
                    rfq_id: `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
                    status: "Draft",
                    created_at: new Date().toISOString(),
                };

                dispatch(createRFQSuccess(newRFQ));
                Swal.close();

                toast.success("RFQ Draft Generated!");
                Swal.fire({
                    icon: "success",
                    iconColor: "#F59E0B",
                    title: "RFQ Created",
                    text: `Request ${newRFQ.rfq_id} for ${payload.material_name} is ready for dispatch.`,
                    timer: 2000,
                    showConfirmButton: false,
                });

                navigate("/purchase/rfqs");
            }, 1200);
        };

// 3. GET SINGLE RFQ
export const getRFQEntry =
    (id: number | string) => async (dispatch: AppDispatch) => {
        dispatch(request());
        Swal.fire({
            title: "Loading RFQ Document...",
            allowOutsideClick: false,
            customClass: {
                loader: "lead-loader",
            },
            didOpen: () => {
                Swal.showLoading();
            },
        });

        setTimeout(() => {
            dispatch(getRFQSuccess(id));
            dispatch(endRequest());
            Swal.close();
        }, 900);
    };

// 4. EDIT RFQ
export const editRFQEntry =
    (id: string | number, payload: any, navigate: NavigateFunction) =>
        async (dispatch: AppDispatch) => {
            dispatch(request());
            Swal.fire({
                title: "Saving Modifications...",
                text: "Updating RFQ parameters...",
                allowOutsideClick: false,
                customClass: {
                    loader: "lead-loader",
                },
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            setTimeout(() => {
                const updatedRFQ: RFQ = { ...payload, id };
                dispatch(updateRFQSuccess(updatedRFQ));
                Swal.close();

                toast.success("RFQ Updated Successfully!");
                Swal.fire({
                    icon: "success",
                    iconColor: "#F59E0B",
                    title: "Changes Saved",
                    text: `RFQ ${payload.rfq_id} has been modified.`,
                    timer: 1500,
                    showConfirmButton: false,
                });

                navigate("/purchase/rfqs");
            }, 1000);
        };

// 5. DELETE RFQ
export const deleteRFQEntry =
    (id: number | string, navigate?: NavigateFunction) => async (dispatch: AppDispatch) => {
        const result = await Swal.fire({
            title: "Cancel RFQ?",
            text: "This sourcing request will be permanently removed.",
            icon: "warning",
            iconColor: "#F59E0B",
            showCancelButton: true,
            confirmButtonColor: "#F59E0B",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            dispatch(request());
            setTimeout(() => {
                dispatch(deleteRFQSuccess(id));
                toast.success("RFQ Removed.");
                Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    iconColor: "#F59E0B",
                    text: "The RFQ record has been deleted.",
                    timer: 1000,
                    showConfirmButton: false,
                });
                navigate && navigate("/purchase/rfqs");
            }, 500);
        }
    };
