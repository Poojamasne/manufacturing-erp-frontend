import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../../../app/store/store";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import type { NavigateFunction } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { GoodsReceiptPDF } from "../utils/GoodsReceiptPDF";

export interface InventoryEntry {
    transaction_id: string;
    material_name: string;
    quantity_added: number;
    grn_ref: string;
    date: string;
}

export interface GoodsReceipt {
    id: number | string;
    grn_id: string; // GRN-XXXX (Auto-generated)
    po_ref: string; // Linked PO ID
    material_name: string;
    material_code: string;
    supplier_name: string;
    batch_number: string;
    quantity_ordered: number;
    quantity_received: number;
    received_date: string;
    qc_status: "Pending" | "Approved" | "Rejected"; // SRS 3.10
    rejection_reason?: string;
    warehouse_location?: string;
    received_by: string;
    created_at: string;
}

const initialState = {
    grn: null as GoodsReceipt | null,
    grns: [
        {
            id: 1,
            grn_id: "GRN-1101",
            po_ref: "PO-9901",
            material_name: "Industrial Bolt M12",
            material_code: "HDW-B-M12",
            supplier_name: "Tata Steel Ltd",
            batch_number: "BT-CH-882",
            quantity_ordered: 5000,
            quantity_received: 5000,
            received_date: "2026-05-25",
            qc_status: "Approved",
            warehouse_location: "Zone-A, Rack 04",
            received_by: "Store Manager",
            created_at: "2026-05-25T10:00:00Z",
        }
    ] as GoodsReceipt[],
    inventoryTransactions: [] as InventoryEntry[],
    loading: false,
    error: "",
};

const grnSlice = createSlice({
    name: "goodsReceipts",
    initialState,
    reducers: {
        request: (state) => { state.loading = true; },
        endRequest: (state) => { state.loading = false; },
        failure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        getAllGRNSuccess: (state, action: PayloadAction<GoodsReceipt[]>) => {
            state.loading = false;
            state.grns = action.payload;
        },
        getGRNSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            const found = state.grns.find(
                g => String(g.id) === String(action.payload) || String(g.grn_id) === String(action.payload)
            );
            state.grn = found || null;
        },
        createGRNSuccess: (state, action: PayloadAction<GoodsReceipt>) => {
            state.loading = false;
            state.grns.unshift(action.payload);
        },
        updateGRNSuccess: (state, action: PayloadAction<GoodsReceipt>) => {
            state.loading = false;
            state.grns = state.grns.map(g => String(g.id) === String(action.payload.id) ? action.payload : g);
            state.grn = action.payload;
        },
        deleteGRNSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            state.grns = state.grns.filter(g => g.id !== action.payload);
        },
        clearErrors: (state) => { state.error = ""; }
    }
});

export const {
    request, endRequest, failure, getAllGRNSuccess,
    getGRNSuccess, createGRNSuccess, updateGRNSuccess,
    deleteGRNSuccess, clearErrors
} = grnSlice.actions;

export default grnSlice.reducer;

// --- THUNKS ---

// 1. GET ALL GRNs
export const getAllGoodsReceipts = () => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Loading Inward Logs...",
        text: "Accessing Goods Receipt Notes...",
        allowOutsideClick: false,
        customClass: { loader: 'lead-loader' },
        didOpen: () => { Swal.showLoading(); }
    });
    setTimeout(() => {
        Swal.close();
        dispatch(endRequest());
    }, 800);
};

// 2. CREATE GRN (SRS 3.9)
export const createGoodsReceiptEntry = (payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Recording Receipt...",
        text: "Verifying PO reference and logging materials...",
        allowOutsideClick: false,
        customClass: { loader: "lead-loader" },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const newGRN: GoodsReceipt = {
            ...payload,
            id: Date.now(),
            grn_id: `GRN-${Math.floor(1000 + Math.random() * 9000)}`,
            qc_status: "Pending", // Initial state for SRS 3.10
            created_at: new Date().toISOString()
        };

        dispatch(createGRNSuccess(newGRN));
        Swal.close();

        toast.success("Goods Receipt Registered!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "GRN Generated",
            text: `Material inward logged under ${newGRN.grn_id}. Pending Quality Verification.`,
            timer: 2000,
            showConfirmButton: false,
        });

        navigate("/purchase/goods-receipts");
    }, 1200);
};

// 3. PROCESS QUALITY CHECK (SRS 3.10)
export const updateQCStatus = (id: string | number, status: "Approved" | "Rejected", reason?: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(request());
    const state = getState();
    const existing = state.goodsReceipts.grns.find(g => String(g.id) === String(id));

    if (!existing) return dispatch(failure("GRN not found"));

    setTimeout(() => {
        const updated: GoodsReceipt = {
            ...existing,
            qc_status: status,
            rejection_reason: reason || ""
        };
        dispatch(updateGRNSuccess(updated));

        toast.success(`Quality Check: ${status}`);
        Swal.fire({
            icon: status === "Approved" ? "success" : "error",
            title: `Material ${status}`,
            text: status === "Approved"
                ? "Items are now eligible for Inventory Transfer."
                : `Items rejected. Reason: ${reason}`,
            confirmButtonColor: "#F59E0B"
        });
    }, 800);
};

// 4. EXPORT GRN PDF
export const exportGRNToPDF = (id: number | string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(request());
    Swal.fire({
        title: "Generating Document...",
        text: "Preparing inward receipt PDF...",
        customClass: { loader: 'lead-loader' },
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const state = getState();
        const grnData = state.goodsReceipts.grns.find(g => String(g.id) === String(id));

        if (!grnData) throw new Error("GRN record not found.");

        const blob = await pdf(<GoodsReceiptPDF data={grnData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `GRN_${grnData.grn_id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        dispatch(endRequest());
        Swal.close();
        toast.success("GRN PDF Exported");
    } catch (error: any) {
        Swal.close();
        dispatch(failure(error.message));
    }
};

// 5. GET SINGLE GRN
export const getGRNEntry = (id: number | string) => async (dispatch: AppDispatch) => {
    dispatch(request());
    setTimeout(() => {
        dispatch(getGRNSuccess(id));
        dispatch(endRequest());
    }, 600);
};

export const finalizeQualityCheck = (
    id: string | number,
    decision: "Approved" | "Rejected",
    reason?: string, navigate?: NavigateFunction
) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(request());

    Swal.fire({
        title: decision === "Approved" ? "Transferring to Inventory..." : "Processing Rejection...",
        text: decision === "Approved" ? "Updating stock levels and inward records." : "Initiating vendor return process.",
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const state = getState();
        const grn = state.goodsReceipts.grns.find(g => String(g.id) === String(id));

        if (!grn) return dispatch(failure("GRN not found"));

        // 1. Update the GRN Record
        const updatedGRN: GoodsReceipt = {
            ...grn,
            qc_status: decision,
            rejection_reason: reason || ""
        };
        dispatch(updateGRNSuccess(updatedGRN));

        // 2. DECISION LOGIC (SRS 3.10 & 3.11)
        if (decision === "Approved") {
            // Logic: Create stock entry and update inventory
            const inventoryLog: InventoryEntry = {
                transaction_id: `STK-${Math.floor(1000 + Math.random() * 9000)}`,
                material_name: grn.material_name,
                quantity_added: grn.quantity_received,
                grn_ref: grn.grn_id,
                date: new Date().toISOString()
            };

            // In a real app, you'd dispatch to InventorySlice here
            console.log("SRS 3.11: Inventory Updated", inventoryLog);
            toast.success("Stock Level Updated Successfully");
            navigate && navigate("/purchase/goods-receipts");
        } else {
            // Logic: Initiate vendor return process
            console.log("SRS 3.10: Rejection recorded. Return process initiated.");
            toast.error("Rejection recorded. Return process initiated.");
            navigate && navigate("/purchase/goods-receipts");
        }

        Swal.close();
        Swal.fire({
            icon: decision === "Approved" ? "success" : "warning",
            title: `QC ${decision}`,
            text: decision === "Approved"
                ? `${grn.quantity_received} units added to Central Inventory.`
                : `Material rejected. Reason: ${reason}`,
            confirmButtonColor: "#F59E0B"
        });
    }, 1500);
};


// 6. DELETE SINGLE GRN
export const deleteGoodsReceiptEntry = (id: number | string) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Discard Inbound Log?",
        text: "This will permanently remove the material receipt and its associated QC history.",
        icon: "warning",
        iconColor: "#F59E0B",
        showCancelButton: true,
        confirmButtonColor: "#F59E0B",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, delete it!",
        customClass: {
            container: 'formal-alert'
        }
    });

    if (result.isConfirmed) {
        dispatch(request());

        // Simulating logic delay
        setTimeout(() => {
            dispatch(deleteGRNSuccess(id));
            toast.success("Inward log deleted.");

            Swal.fire({
                icon: "success",
                title: "Removed",
                iconColor: "#F59E0B",
                text: "The Goods Receipt record has been deleted.",
                timer: 1500,
                showConfirmButton: false,
            });
        }, 500);
    }
};

// 7. DELETE MULTIPLE GRNs (Bulk Action)
export const deleteGoodsReceiptEntries = (ids: (number | string)[]) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Bulk Remove Logs?",
        text: `Are you sure you want to delete ${ids.length} selected inward entries? This action is irreversible.`,
        icon: "warning",
        iconColor: "#F59E0B",
        showCancelButton: true,
        confirmButtonColor: "#F59E0B",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, remove all!",
    });

    if (result.isConfirmed) {
        dispatch(request());

        setTimeout(() => {
            // Logic: Iterate and remove each selected ID
            ids.forEach(id => {
                dispatch(deleteGRNSuccess(id));
            });

            toast.success(`${ids.length} Records removed.`);

            Swal.fire({
                icon: "success",
                title: "Bulk Deletion Complete",
                iconColor: "#F59E0B",
                text: "The selected Goods Receipt records have been archived.",
                timer: 1500,
                showConfirmButton: false,
            });
        }, 800);
    }
};