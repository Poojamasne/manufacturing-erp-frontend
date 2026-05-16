import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../../../app/store/store";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import type { NavigateFunction } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { PurchaseOrderPDF } from "../utils/PurchaseOrderPDF";

// ==================== Types (SRS 3.7) ====================
export interface PurchaseOrder {
    id: number | string;
    po_id: string; // PO-XXXX (Auto-generated)
    rfq_ref: string;
    pr_ref: string;
    vendor_name: string;
    material_name: string;
    quantity: number;
    unit_price: number;
    tax_percentage: number;
    tax_amount: number;
    total_amount: number;
    delivery_date: string;
    payment_terms: string;
    status: "Draft" | "Pending Approval" | "Approved" | "Sent to Vendor" | "Rejected" | "Completed";
    created_at: string;
}

const initialState = {
    po: null as PurchaseOrder | null,
    pos: [
        {
            id: 1,
            po_id: "PO-9901",
            rfq_ref: "RFQ-5501",
            pr_ref: "PR-2024-001",
            vendor_name: "Tata Steel Ltd",
            material_name: "Industrial Bolt M12",
            quantity: 5000,
            unit_price: 15.50,
            tax_percentage: 18,
            tax_amount: 13950,
            total_amount: 91450,
            delivery_date: "2024-06-05",
            payment_terms: "Net 30",
            status: "Approved",
            created_at: "2026-05-10T10:00:00Z",
        },
        {
            id: 2,
            po_id: "PO-9902",
            rfq_ref: "RFQ-5502",
            pr_ref: "PR-2026-005",
            vendor_name: "Reliance Industrial",
            material_name: "Steel Plate 6mm",
            quantity: 1500,
            unit_price: 450.00,
            tax_percentage: 12,
            tax_amount: 81000,
            total_amount: 756000,
            delivery_date: "2026-06-12",
            payment_terms: "Advance",
            status: "Pending Approval",
            created_at: "2024-05-15T14:30:00Z",
        }
    ] as PurchaseOrder[],
    loading: false,
    error: "",
};

const poSlice = createSlice({
    name: "purchaseOrders",
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
        getAllPOSuccess: (state, action: PayloadAction<PurchaseOrder[]>) => {
            state.loading = false;
            state.pos = action.payload;
        },
        // ACTION: GET SINGLE
        getPOSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            const found = state.pos.find(
                p => String(p.id) === String(action.payload) || String(p.po_id) === String(action.payload)
            );
            state.po = found || null;
        },
        // ACTION: CREATE
        createPOSuccess: (state, action: PayloadAction<PurchaseOrder>) => {
            state.loading = false;
            state.pos.unshift(action.payload);
        },
        // ACTION: UPDATE
        updatePOSuccess: (state, action: PayloadAction<PurchaseOrder>) => {
            state.loading = false;
            state.pos = state.pos.map((p) =>
                String(p.id) === String(action.payload.id) ? action.payload : p
            );
            state.po = action.payload;
        },
        // ACTION: DELETE
        deletePOSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            state.pos = state.pos.filter((p) => p.id !== action.payload);
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
    getAllPOSuccess,
    getPOSuccess,
    createPOSuccess,
    updatePOSuccess,
    deletePOSuccess,
    clearErrors
} = poSlice.actions;

export default poSlice.reducer;

// --- STATE-ONLY ASYNC ACTIONS (THUNKS) ---

// 1. GET ALL PURCHASE ORDERS
export const getAllPurchaseOrders = () => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Syncing PO Ledger...",
        text: "Accessing formal procurement contracts...",
        allowOutsideClick: false,
        customClass: {
            loader: 'lead-loader'
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        Swal.close();
        dispatch(endRequest());
        dispatch(clearErrors());
    }, 800);
};

// 2. CREATE PO (SRS 3.7.2 Auto-gen behavior)
export const createPurchaseOrderEntry = (payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Generating Order...",
        text: "Creating formal contract and notifying supplier...",
        allowOutsideClick: false,
        customClass: {
            loader: 'lead-loader'
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const newPO: PurchaseOrder = {
            ...payload,
            id: Date.now(),
            po_id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
            status: "Pending Approval", // SRS 3.7.3 Workflow initial state
            created_at: new Date().toISOString()
        };

        dispatch(createPOSuccess(newPO));
        Swal.close();

        toast.success("Purchase Order Issued!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "PO Generated",
            text: `Order ${newPO.po_id} has been sent for management approval.`,
            timer: 2000,
            showConfirmButton: false,
        });

        navigate("/purchase/purchase-orders");
    }, 1200);
};

// 3. EDIT/UPDATE PO (Financial or Logistic adjustments)
export const editPurchaseOrderEntry = (id: string | number, payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Updating Contract...",
        text: "Applying modifications to Purchase Order...",
        allowOutsideClick: false,
        customClass: {
            loader: 'lead-loader'
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const updatedPO: PurchaseOrder = { ...payload, id };
        dispatch(updatePOSuccess(updatedPO));
        Swal.close();

        toast.success("Purchase Order Updated.");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Changes Saved",
            text: `Purchase Order ${payload.po_id} has been successfully modified.`,
            timer: 1500,
            showConfirmButton: false,
        });

        navigate("/purchase/purchase-orders");
    }, 1000);
};

// 4. DELETE/CANCEL PO
export const deletePurchaseOrderEntry = (id: number | string) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Cancel Purchase Order?",
        text: "This will permanently remove the contract from the system.",
        icon: "warning",
        iconColor: "#F59E0B",
        showCancelButton: true,
        confirmButtonColor: "#F59E0B",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, cancel it!"
    });

    if (result.isConfirmed) {
        dispatch(request());
        setTimeout(() => {
            dispatch(deletePOSuccess(id));
            toast.success("PO Cancelled.");
            Swal.fire({
                icon: "success",
                title: "Removed",
                iconColor: "#F59E0B",
                text: "The Purchase Order record has been deleted.",
                timer: 1000,
                showConfirmButton: false,
            });
        }, 500);
    }
};

// 5. DELETE/CANCEL PO
export const deletePurchaseOrderEntries = (ids: (number | string)[]) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Cancel Selected Orders?",
        text: "This will permanently remove the selected orders from the system.",
        icon: "warning",
        iconColor: "#F59E0B",
        showCancelButton: true,
        confirmButtonColor: "#F59E0B",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, cancel it!"
    });

    if (result.isConfirmed) {
        dispatch(request());
        setTimeout(() => {
            ids.forEach(id => {
                dispatch(deletePOSuccess(id));
            });
            toast.success("PO's Cancelled.");
            Swal.fire({
                icon: "success",
                title: "Removed",
                iconColor: "#F59E0B",
                text: "The Purchase Order record has been deleted.",
                timer: 1000,
                showConfirmButton: false,
            });
        }, 500);
    }
};

// 5. GET SINGLE PO
export const getPurchaseOrderEntry = (id: number | string) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Loading Order...",
        text: "Fetching order details...",
        allowOutsideClick: false,
        customClass: {
            loader: 'lead-loader'
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        dispatch(getPOSuccess(id));
        dispatch(endRequest());
        Swal.close();
    }, 700);
};

// 6. EXPORT PO PDF (Using local state data)
export const exportPOToPDF = (id: number | string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(request());

    Swal.fire({
        title: "Generating Document...",
        text: "Preparing formal Purchase Order PDF...",
        allowOutsideClick: false,
        customClass: {
            loader: 'lead-loader'
        },
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const state = getState();
        // Accessing via state.purchaseOrders.pos based on your slice name
        const poData = state.purchaseOrders.pos.find(
            p => String(p.id) === String(id) || String(p.po_id) === String(id)
        );
        console.log("Po data : ", poData);
        let ref = state?.rfqManagement?.rfqs?.find(
            (q: any) => String(poData && poData.rfq_ref) === String(q.rfq_id)
        )
        console.log("Ref: ", ref);

        if (!poData) throw new Error("Purchase Order record not found.");
        let updatedPoData = { ...poData, unit: ref ? ref.unit : "Units" };
        const blob = await pdf(<PurchaseOrderPDF data={updatedPoData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `PO_${poData.po_id}_Formal.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        dispatch(endRequest());
        Swal.close();

        toast.success("PO Exported Successfully");

    } catch (error: any) {
        Swal.close();
        const message = error.message || "Failed to generate PDF";
        dispatch(failure(message));

        Swal.fire({
            icon: 'error',
            title: 'Export Error',
            text: message,
            confirmButtonColor: '#F59E0B'
        });
    }
};