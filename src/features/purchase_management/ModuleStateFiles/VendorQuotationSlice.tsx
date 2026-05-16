import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "../../../app/store/store";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import type { NavigateFunction } from "react-router-dom";

// ==================== Types (SRS 3.6) ====================
export interface Quotation {
    id: number | string;
    quotation_id: string; // VQT-XXXX
    rfq_ref: string; // Linked RFQ ID
    vendor_name: string;
    material_name: string;
    unit_price: number;
    total_amount: number;
    delivery_lead_time: number; // e.g., "5 Days"
    payment_terms: string; // e.g., "Net 30"
    validity_date: string;
    status: "Draft" | "Submitted" | "Under Review" | "Accepted" | "Rejected";
    created_at: string; // Required for Time Filtering
}

const initialState = {
    quotation: null as Quotation | null,
    quotations: [
        {
            id: 1,
            quotation_id: "VQT-7701",
            rfq_ref: "RFQ-5501",
            vendor_name: "Tata Steel Ltd",
            material_name: "Industrial Bolt M12",
            unit_price: 15.50,
            total_amount: 77500,
            delivery_lead_time: 3,
            payment_terms: "Net 30",
            validity_date: "2024-06-30",
            status: "Accepted",
            created_at: "2024-05-10T09:00:00Z",
        },
        {
            id: 2,
            quotation_id: "VQT-7702",
            rfq_ref: "RFQ-5501",
            vendor_name: "Global Fasteners",
            material_name: "Industrial Bolt M12",
            unit_price: 14.20,
            total_amount: 71000,
            delivery_lead_time: 7,
            payment_terms: "Advance",
            validity_date: "2024-06-15",
            status: "Under Review",
            created_at: "2024-05-12T11:30:00Z",
        }
    ] as Quotation[],
    loading: false,
    error: "",
};

const quotationSlice = createSlice({
    name: "quotations",
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
        getAllQuotationSuccess: (state, action: PayloadAction<Quotation[]>) => {
            state.loading = false;
            state.quotations = action.payload;
        },
        // ACTION: GET SINGLE
        getQuotationSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            const found = state.quotations.find(
                q => String(q.id) === String(action.payload) || String(q.quotation_id) === String(action.payload)
            );
            state.quotation = found || null;
        },
        // ACTION: CREATE
        createQuotationSuccess: (state, action: PayloadAction<Quotation>) => {
            state.loading = false;
            state.quotations.unshift(action.payload);
        },
        // ACTION: UPDATE
        updateQuotationSuccess: (state, action: PayloadAction<Quotation>) => {
            state.loading = false;
            state.quotations = state.quotations.map((q) =>
                String(q.id) === String(action.payload.id) ? action.payload : q
            );
            state.quotation = action.payload;
        },
        // ACTION: DELETE
        deleteQuotationSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            state.quotations = state.quotations.filter((q) => q.id !== action.payload);
        },
        clearErrors: (state) => {
            state.error = "";
        }
    }
});

export const {
    request,
    endRequest,
    failure,
    getAllQuotationSuccess,
    getQuotationSuccess,
    createQuotationSuccess,
    updateQuotationSuccess,
    deleteQuotationSuccess,
    clearErrors
} = quotationSlice.actions;

export default quotationSlice.reducer;

// --- STATE-ONLY ASYNC ACTIONS (THUNKS) ---

// 1. GET ALL QUOTATIONS
export const getAllQuotations = () => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Syncing Bids...",
        text: "Analyzing vendor quotations...",
        allowOutsideClick: false,
        customClass:{
            loader:"lead-loader"
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        Swal.close();
        dispatch(endRequest());
        dispatch(clearErrors());
    }, 800);
};

// 2. CREATE VENDOR QUOTATION (SRS 3.6.1)
export const createQuotationEntry = (payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Recording Bid...",
        text: "Uploading supplier commercials to RFQ...",
        allowOutsideClick: false,
        customClass:{
            loader:"lead-loader"
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const newQT: Quotation = {
            ...payload,
            id: Date.now(),
            quotation_id: `VQT-${Math.floor(1000 + Math.random() * 9000)}`,
            status: "Submitted",
            created_at: new Date().toISOString()
        };

        dispatch(createQuotationSuccess(newQT));
        Swal.close();

        toast.success("Vendor Quotation Recorded!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Bid Received",
            text: `Quotation ${newQT.quotation_id} from ${payload.vendor_name} has been saved.`,
            timer: 2000,
            showConfirmButton: false,
        });

        navigate("/purchase/vendor-quotations");
    }, 1200);
};

// 3. EDIT QUOTATION (SRS 3.6.3 - Finalization Prep)
export const editQuotationEntry = (id: string | number, payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Updating Bid...",
        text: "Applying commercial modifications...",
        customClass:{
            loader:"lead-loader"
        },
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const updatedQT: Quotation = { ...payload, id };
        dispatch(updateQuotationSuccess(updatedQT));
        Swal.close();

        toast.success("Quotation Updated.");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Quotation Updated",
            text: `Bid details for ${payload.quotation_id} saved.`,
            timer: 1500,
            showConfirmButton: false,
        });

        navigate("/purchase/vendor-quotations");
    }, 1000);
};

// 4. DELETE QUOTATION
export const deleteQuotationEntry = (id: number | string, navigate?: NavigateFunction) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Discard Quotation?",
        text: "This bid will be removed from the comparison matrix.",
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
            dispatch(deleteQuotationSuccess(id));
            toast.success("Quotation removed.");
            Swal.fire({
                icon: "success",
                title: "Removed",
                iconColor: "#F59E0B",
                text: "The vendor bid has been deleted.",
                timer: 1000,
                showConfirmButton: false,
            });
            navigate && navigate("/purchase/vendor-quotations");
        }, 500);
    }
};
// 5. DELETE QUOTATION
export const deleteQuotationEntries = (ids: (number | string)[]) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title:  "Discard Selected Quotations?",
        text: "Selected bids will be removed from the comparison matrix.",
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
            ids.forEach((id) => {
                dispatch(deleteQuotationSuccess(id));
            });
            toast.success("Quotations removed.");
            Swal.fire({
                icon: "success",
                title: "Selected Quotations Removed",
                iconColor: "#F59E0B",
                text: "The selected vendor quotations have been deleted.",
                timer: 1000,
                showConfirmButton: false,
            });
        }, 500);
    }
};

// 5. GET SINGLE QUOTATION
export const getQuotationEntry = (id: number | string) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Loading Commercials...",
        allowOutsideClick: false,
        customClass:{
            loader:"lead-loader"
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        dispatch(getQuotationSuccess(id));
        dispatch(endRequest());
        Swal.close();
    }, 700);
};