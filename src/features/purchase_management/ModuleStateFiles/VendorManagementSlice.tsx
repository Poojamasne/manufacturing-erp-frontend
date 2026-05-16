import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "../../../app/store/store"; // Adjust path
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import type { NavigateFunction } from "react-router-dom";

// ==================== Types (SRS 3.4) ====================
export interface Vendor {
    id: number | string;
    vendor_id: string; // VND-XXXX
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    category: "Raw Materials" | "Hardware" | "Chemicals" | "Logistics" | string;
    rating: number; // 1-5
    status: "Active" | "Under Review" | "Blacklisted";
    address: string;
    supplied_materials: string[]; // Material IDs or Names
    created_at: string; // Required for Time Filtering
}

const initialState = {
    vendor: {
        id: 0,
        vendor_id: "",
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        category: "",
        rating: 0,
        status: "Active",
        address: "",
        supplied_materials: [],
        created_at: "",
    } as Vendor | null,
    vendors: [
        {
            id: 1,
            vendor_id: "VND-2001",
            name: "Tata Steel Ltd",
            contact_person: "Rajesh Kumar",
            email: "sales@tatasteel.com",
            phone: "+91 98765 43210",
            category: "Raw Materials",
            rating: 5,
            status: "Active",
            address: "Jamshedpur, Jharkhand",
            supplied_materials: ["Steel Plate 6mm", "Industrial Bolt M12"],
            created_at: "2024-05-10",
        },
        {
            id: 2,
            vendor_id: "VND-2002",
            name: "YDP Industries",
            contact_person: "Yogesh Pote",
            email: "orders@reliance.com",
            phone: "+91 8765432109",
            category: "Chemicals",
            rating: 4,
            status: "Active",
            address: "Mumbai, Maharashtra",
            supplied_materials: ["Hydraulic Fluid", "Lubricant Oil"],
            created_at: "2024-05-12",
        },
    ] as Vendor[],
    loading: false,
    error: "",
};

const vendorSlice = createSlice({
    name: "vendors",
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
        getVendorsSuccess: (state, action: PayloadAction<Vendor[]>) => {
            state.loading = false;
            state.vendors = action.payload;
        },
        createVendorSuccess: (state, action: PayloadAction<Vendor>) => {
            state.loading = false;
            state.vendors.unshift(action.payload);
        },
        updateVendorSuccess: (state, action: PayloadAction<Vendor>) => {
            state.loading = false;
            state.vendors = state.vendors.map((v) =>
                String(v.id) === String(action.payload.id) ? action.payload : v
            );
            state.vendor = action.payload;
        },
        deleteVendorSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            state.vendors = state.vendors.filter((v) => v.id !== action.payload);
        },
        getVendorSuccess: (state, action: PayloadAction<number | string>) => {
            state.loading = false;
            state.vendor = state.vendors.find((v) => String(v.id) === String(action.payload)) || null;
        },
        clearErrors: (state) => {
            state.error = "";
        }
    },
});

export const {
    request,
    endRequest,
    failure,
    createVendorSuccess,
    updateVendorSuccess,
    deleteVendorSuccess,
    getVendorSuccess,
    clearErrors
} = vendorSlice.actions;

export default vendorSlice.reducer;

// --- STATE-ONLY ASYNC ACTIONS (THUNKS) ---

// 1. GET ALL VENDORS
export const getAllVendors = () => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Loading Suppliers...",
        text: "Fetching vendor master records...",
        allowOutsideClick: false,customClass: {
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

// 2. ONBOARD NEW VENDOR
export const createVendorEntry = (payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Onboarding Vendor...",
        text: "Registering supplier and mapping materials...",
        allowOutsideClick: false,
        customClass: {
            loader:"lead-loader"
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const newVendor: Vendor = {
            ...payload,
            id: Date.now(),
            vendor_id: `VND-${Math.floor(1000 + Math.random() * 9000)}`,
            status: "Active",
            created_at: new Date().toISOString(),
        };

        dispatch(createVendorSuccess(newVendor));
        Swal.close();

        toast.success("Vendor Onboarded Successfully!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Vendor Registered",
            text: `${payload.name} has been added to the master list.`,
            timer: 2000,
            showConfirmButton: false,
        });

        navigate("/purchase/vendors");
    }, 1200);
};

// 3. EDIT VENDOR DETAILS
export const editVendorEntry = (id: string | number, payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Updating Vendor...",
        text: "Saving modifications to supplier record...",
        allowOutsideClick: false,customClass: {
            loader:"lead-loader"
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const updatedVendor: Vendor = { ...payload, id: id, vendor_id: payload?.vendor_id };
        dispatch(updateVendorSuccess(updatedVendor));
        Swal.close();

        toast.success("Vendor Record Updated!");
        Swal.fire({
            icon: "success",
            iconColor: "#F59E0B",
            title: "Changes Saved",
            text: `Information for ${payload.name} updated successfully.`,
            timer: 1500,
            showConfirmButton: false,
        });

        navigate("/purchase/vendors");
    }, 1000);
};

// 4. DELETE VENDOR
export const deleteVendorEntry = (id: number | string) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Remove Vendor?",
        text: "This supplier will be removed from the master database.",
        icon: "warning",
        iconColor: "#F59E0B",
        showCancelButton: true,
        confirmButtonColor: "#F59E0B",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, remove it!"
    });

    if (result.isConfirmed) {
        dispatch(request());
        setTimeout(() => {
            dispatch(deleteVendorSuccess(id));
            toast.success("Vendor removed.");
            Swal.fire({
                icon: "success",
                title: "Deleted",
                iconColor: "#F59E0B",
                text: "The vendor record has been archived.",
                timer: 1000,
                showConfirmButton: false,
            });
        }, 500);
    }
};
// 5. DELETE VENDOR in bulk with confirmation
export const deleteVendorEntries = (ids: (number | string)[]) => async (dispatch: AppDispatch) => {
    const result = await Swal.fire({
        title: "Remove Selected Vendors?",
        text: "Selected vendors will be removed from the master database.",
        icon: "warning",
        iconColor: "#F59E0B",
        showCancelButton: true,
        confirmButtonColor: "#F59E0B",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, remove it!"
    });

    if (result.isConfirmed) {
        dispatch(request());
        
        setTimeout(() => {
            ids.forEach((id) => {
                dispatch(deleteVendorSuccess(id));
            });
            toast.success("Vendor(s) removed.");
            Swal.fire({
                icon: "success",
                title: "Deleted",
                iconColor: "#F59E0B",
                text: "The vendor record(s) have been archived.",
                timer: 1000,
                showConfirmButton: false,
            });
        }, 500);
    }
};

// 6. GET SINGLE VENDOR
export const getVendorEntry = (id: number | string) => async (dispatch: AppDispatch) => {
    dispatch(request());
    Swal.fire({
        title: "Fetching Profile...",
        allowOutsideClick: false,customClass: {
            loader:"lead-loader"
        },
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        dispatch(getVendorSuccess(id));
        dispatch(endRequest());
        Swal.close();
    }, 700);
};