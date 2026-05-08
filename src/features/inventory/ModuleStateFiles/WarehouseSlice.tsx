import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "../../../app/store/store";
import Swal from "sweetalert2";
import type { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";

// Interface based on SRS 3.4 & physical storage requirements
export interface StorageAllocation {
    id: number | string;
    receipt_id: string;      // Reference to the source receipt
    material_name: string;
    material_code: string;
    batch_number: string;
    warehouse_name: string;  // Manual Selection
    rack_number: string;     // Manual Input
    storage_area: string;    // Manual Selection
    quantity: number;
    measure_unit: string;
    notes: string;
    allocated_at: string;
}

const initialState = {
    // Current allocation being viewed or edited
    allocation: {
        id: 0,
        receipt_id: "",
        material_name: "",
        material_code: "",
        batch_number: "",
        warehouse_name: "",
        rack_number: "",
        storage_area: "",
        quantity: 0,
        measure_unit: "",
        notes: "",
        allocated_at: ""
    } as StorageAllocation | null,

    // Initial Dummy Data for Warehouse List
    allocations: [
        {
            id: 1,
            receipt_id: "REC-1001",
            material_name: "Steel Grade A",
            material_code: "MAT-001",
            batch_number: "BT-9901",
            warehouse_name: "Main Warehouse",
            rack_number: "R-101",
            storage_area: "Raw Area Zone",
            quantity: 5000,
            measure_unit: "kg",
            notes: "Stored in high-load shelf",
            allocated_at: "2024-05-10T10:00:00Z"
        },
    ] as StorageAllocation[],

    loading: false,
    error: "",
};

const warehouseSlice = createSlice({
    name: "warehouse",
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
        // ACTION: ALLOCATE NEW STORAGE
        createAllocationSuccess: (state, action: PayloadAction<StorageAllocation>) => {
            state.loading = false;
            state.allocations.unshift(action.payload);
        },
        // ACTION: REMOVE ALLOCATION
        deleteAllocationSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            state.allocations = state.allocations.filter(a => a.id !== action.payload);
        },
        // ACTION: GET SINGLE ALLOCATION
        getAllocationSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            const found = state.allocations.find(
                a => String(a.id) === String(action.payload)
            );
            state.allocation = found || null;
        },
        // ACTION: UPDATE LOCATION (Move stock)
        updateAllocationSuccess: (state, action: PayloadAction<StorageAllocation>) => {
            state.loading = false;
            state.allocations = state.allocations.map((item) =>
                String(item.id) === String(action.payload.id) ? action.payload : item
            );
            state.allocation = action.payload;
        },
        clearErrors: (state) => {
            state.error = "";
        }
    }
});

export const {
    request,
    failure,
    createAllocationSuccess,
    deleteAllocationSuccess,
    getAllocationSuccess,
    updateAllocationSuccess,
    clearErrors,
    endRequest
} = warehouseSlice.actions;

export default warehouseSlice.reducer;

// --- STATE-ONLY ASYNC ACTIONS (THUNKS) ---

// 1. GET ALL STORAGE RECORDS
export const getAllAllocations = () => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Scanning Warehouse...",
        text: "Fetching physical storage logs...",
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

// 2. ALLOCATE NEW STORAGE (Create)
export const createStorageAllocation = (payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Finalizing Allocation...",
        text: "Updating physical inventory map...",
        allowOutsideClick: false,
        customClass: { loader: "lead-loader" },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const newRecord: StorageAllocation = {
            ...payload,
            id: Date.now(),
            created_at: new Date().toISOString(),
        };

        dispatch(createAllocationSuccess(newRecord));
        Swal.close();

        toast.success("Storage Allocated Successfully!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Stock Placed",
            text: `Batch ${payload.batch_number} is now in ${payload.warehouse_name} (${payload.rack_number})`,
            timer: 1500,
            showConfirmButton: false,
        });

        navigate("/inventory/warehouse");
    }, 1000);
};

// 3. EDIT ALLOCATION (Move Material)
export const editStorageAllocation = (id: string | number, payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Updating Location...",
        text: "Recording internal stock movement...",
        allowOutsideClick: false,
        customClass: { loader: "lead-loader" },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const updatedRecord: StorageAllocation = { ...payload, id };
        dispatch(updateAllocationSuccess(updatedRecord));
        Swal.close();

        toast.success("Storage Location Updated!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Movement Recorded",
            text: `Location changed to ${payload.warehouse_name} - ${payload.rack_number}`,
            timer: 1500,
            showConfirmButton: false,
        });

        navigate("/inventory/warehouse/view-storage/" + id);
    }, 1000);
};

// 4. DELETE ALLOCATION RECORD
export const deleteAllocation = (id: number | string) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Remove from Warehouse?",
        text: "This will remove the physical location record from the system.",
        icon: "warning",
        iconColor: "#F59E0B",
        showCancelButton: true,
        confirmButtonColor: "#F59E0B",
        confirmButtonText: "Yes, remove it!"
    });

    if (result.isConfirmed) {
        dispatch(request());
        setTimeout(() => {
            dispatch(deleteAllocationSuccess(id));
            toast.success("Allocation record removed.");
            Swal.fire({
                icon: "success",
                title: "Removed",
                iconColor: "#F59E0B",
                text: "The physical record has been cleared.",
                timer: 1000,
                showConfirmButton: false,
            });
        }, 500);
    }
};

// 5. GET SINGLE ALLOCATION
export const getStorageAllocation = (id: number | string) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Inspecting Storage...",
        text: "Fetching location details...",
        allowOutsideClick: false,
        customClass: { loader: "lead-loader" },
        didOpen: () => { Swal.showLoading(); }
    });
    setTimeout(() => {
        dispatch(getAllocationSuccess(id));
        dispatch(endRequest());
        Swal.close();
    }, 800);
};