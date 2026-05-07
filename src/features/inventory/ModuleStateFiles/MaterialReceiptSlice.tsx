import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "../../../app/store/store";
import Swal from "sweetalert2";
import type { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";

export interface ReceiptEntry {
    notes: string;
    id: number | string;
    receipt_id: string;
    material_name: string;
    material_code: string;
    batch_number: string;
    supplier_name: string;
    quantity_received: number;
    measure_unit: string; // kg, meters, liters, sheets, etc.
    received_date: string;
    warehouse_location: string;
    rack_number: string;
    received_by: string;
}

const initialState = {
    receipt: {
        id: 0,
        receipt_id: "",
        material_name: "",
        material_code: "",
        batch_number: "",
        supplier_name: "",
        quantity_received: 0,
        measure_unit: "",
        received_date: "",
    } as ReceiptEntry | null,

    // Dummy Data for the List View
    receipts: [
        {
            id: 1,
            receipt_id: "REC-1001",
            material_name: "Steel Grade A",
            material_code: "MAT-001",
            batch_number: "BT-9901",
            supplier_name: "Tata Steel",
            quantity_received: 5000,
            measure_unit: "kg",
            received_date: "2024-05-10",

        },
        {
            id: 2,
            receipt_id: "REC-1002",
            material_name: "Copper Wire 2mm",
            material_code: "MAT-042",
            batch_number: "BT-8820",
            supplier_name: "Reliance Ind.",
            quantity_received: 200,
            measure_unit: "meters",
            received_date: "2024-05-12",
        },
    ] as ReceiptEntry[],

    loading: false,
    error: "",
};

const receiptSlice = createSlice({
    name: "receipts",
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
        createReceiptSuccess: (state, action: PayloadAction<ReceiptEntry>) => {
            state.loading = false;
            state.receipts.unshift(action.payload); // Add new entry to the top
        },
        // ACTION: DELETE
        deleteReceiptSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            state.receipts = state.receipts.filter(r => r.id !== action.payload);
        },
        // ACTION: GET SINGLE
        getReceiptSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;

            const found = state.receipts.find(
                r => String(r.id) === String(action.payload)
            );

            state.receipt = found || null;

            console.log("receipt found:", found);
        },
        updateReceiptSuccess: (state, action: PayloadAction<ReceiptEntry>) => {
            state.loading = false;

            state.receipts = state.receipts.map((receipt) =>
                String(receipt.id) === String(action.payload.id)
                    ? action.payload
                    : receipt
            );

            // also update single receipt view
            state.receipt = action.payload;
        },
        clearErrors: (state) => {
            state.error = "";
        }
    }
});

export const {
    request,
    failure,
    createReceiptSuccess,
    deleteReceiptSuccess,
    getReceiptSuccess,
    updateReceiptSuccess,
    clearErrors,
    endRequest
} = receiptSlice.actions;

export default receiptSlice.reducer;

// --- STATE-ONLY ASYNC ACTIONS (THUNKS) ---

// 1. SIMULATE GET ALL RECEIPTS
export const getAllReceiptEntries = () => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Loading Material Logs...",
        text: "Fetching Material Receipts...",
        allowOutsideClick: false,
        customClass: {
            loader: "lead-loader"
        },
        didOpen: () => { Swal.showLoading(); }
    });
    // Artificial delay to simulate real-world feel
    setTimeout(() => {
        Swal.close();
        dispatch(endRequest());
        dispatch(clearErrors());
        // Data is already in state, we just finish loading
        // console.log("State-only: Receipts loaded from local storage/state");
    }, 900);
};

// 2. SIMULATE CREATE RECEIPT
export const createReceiptEntry = (payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Recording Receipt...",
        text: "Updating stock levels and warehouse mapping...",
        allowOutsideClick: false,
        customClass: {
            loader: "lead-loader"
        },
        didOpen: () => { Swal.showLoading(); }
    });

    console.log("Payload from crete receipt: ", payload);

    setTimeout(() => {
        // Generate a random ID and Receipt ID for local flow
        const newEntry: ReceiptEntry = {
            ...payload,
            id: Date.now(),
            receipt_id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        };

        dispatch(createReceiptSuccess(newEntry));
        Swal.close();

        toast.success("Material Receipt Added Successfully!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Stock Updated",
            text: `Material ${payload.material_name} registered in ${payload.warehouse_location}`,
            timer: 1500,
            showConfirmButton: false,
        });

        navigate("/inventory/material-receipts");
    }, 1000);
};

// 3. SIMULATE EDIT RECEIPT
export const editReceiptEntry = (id: string | number, payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Updating Receipt...",
        text: "Updating stock levels and warehouse mapping...",
        allowOutsideClick: false,
        customClass: {
            loader: "lead-loader"
        },
        didOpen: () => {
            Swal.showLoading();
        }
    });

    setTimeout(() => {

        const updatedEntry: ReceiptEntry = {
            ...payload,
            id,
        };

        dispatch(updateReceiptSuccess(updatedEntry));

        Swal.close();

        toast.success("Receipt Updated Successfully!");

        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Receipt Updated",
            text: `${payload.material_name} updated successfully`,
            timer: 1500,
            showConfirmButton: false,
        });

        navigate("/inventory/material-receipts");

    }, 1000);
};

// 3. SIMULATE DELETE RECEIPT
export const deleteReceiptEntry = (id: number | string) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "This record will be removed from the inventory logs.",
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
            dispatch(deleteReceiptSuccess(id));
            toast.success("Receipt entry deleted.");
            Swal.fire({
                icon: "success",
                title: "Deleted",
                iconColor: "#F59E0B",
                text: "The receipt record has been removed.",
                timer: 1000,
                showConfirmButton: false,
            });
        }, 500);
    }
};

// 4. SIMULATE GET SINGLE RECEIPT
export const getReceiptEntry = (id: number | string) => async (dispatch: AppDispatch) => {
    console.log("form signal recipe: view receipt: ", id);
    dispatch(request());
    Swal.fire({
        title: "Loading Receipt Details...",
        text: "Fetching detailed information for this material receipt.",
        allowOutsideClick: false,
        customClass: {
            loader: "lead-loader"
        },
        didOpen: () => { Swal.showLoading(); }
    });
    setTimeout(() => {
        dispatch(getReceiptSuccess(id));
    }, 1000);
    setTimeout(() => {
        dispatch(endRequest());
        Swal.close();
    }, 1100);


};