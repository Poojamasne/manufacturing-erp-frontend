import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";

const initialState = {
    productions: [],
    production: {
        "id": "",
        "job_id": "",
        "product_name": "",
        "status": "",
        "order_id": "",
        "quantity": "",
        "stage": "",
        "assigned_to": "",
        "created_at": "",
        "updated_at": "",
        "started_at": "",
        "completed_at": "",
        "customer_name": "",
        "assigned_to_name": "",
        "notes": ""
    },
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    }
};

const SalesProduction = createSlice({
    name: "SalesProduction",
    initialState,
    reducers: {
        getSalesProductionRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        getSalesProductionSuccess: (state, action) => {
            state.loading = false;
            state.productions = Array.isArray(action.payload?.data) ? action.payload.data : [];
            state.pagination = action.payload?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
            state.error = null;
        },

        getSalesSingleProductionSuccess: (state, action) => {
            state.loading = false;
            state.production = action.payload?.data || initialState.production;
            state.error = null;
        },

        updateSalesProductionSuccess: (state, action) => {
            state.loading = false;
            const updatedData = action.payload?.data;
            if (updatedData) {
                const index = state.productions.findIndex((p: any) => p.id === updatedData.id);
                if (index !== -1) {
                    state.productions[index] = updatedData;
                }
                state.production = updatedData;
            }
            state.error = null;
        },

        deleteSalesProductionSuccess: (state, action) => {
            state.loading = false;
            const deletedId = action.payload;
            state.productions = state.productions.filter((p: any) => p.id !== deletedId);
            if (state.production?.id === deletedId) {
                state.production = initialState.production;
            }
            state.error = null;
        },

        getSalesProductionFailure: (state, action) => {
            state.loading = false;
            const payload = action.payload;
            state.error = typeof payload === "string" ? payload : payload?.message || "Something went wrong";
        },

        clearSalesErrors: (state) => {
            state.error = null;
        },
    },
});

export const {
    getSalesProductionRequest,
    getSalesProductionSuccess,
    getSalesSingleProductionSuccess,
    updateSalesProductionSuccess,
    deleteSalesProductionSuccess,
    getSalesProductionFailure,
    clearSalesErrors,
} = SalesProduction.actions;

export default SalesProduction.reducer;

// GET production jobs with filters and pagination
// In getProductions thunk, add stage parameter
export const getProductions = (params?: { 
    status?: string; 
    stage?: string;     // Add this line
    search?: string; 
    page?: number; 
    limit?: number;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesProductionRequest());
    
    try {
        const token = getState().auth.token || localStorage.getItem("token");
        
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== 'All') queryParams.append('status', params.status);
        if (params?.stage && params.stage !== 'All') queryParams.append('stage', params.stage);  // Add this line
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.dateRange && params.dateRange !== 'All Time') queryParams.append('dateRange', params.dateRange);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        
        const url = `${import.meta.env.VITE_API_BASE_URL}/sales/production/jobs${queryParams.toString() ? `?${queryParams}` : ''}`;
        
        console.log("Fetching productions from:", url);
        
        const { data } = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        dispatch(getSalesProductionSuccess(data));
    } catch (error: any) {
        const message = error.response?.data?.message || "Something went wrong";
        dispatch(getSalesProductionFailure(message));
    }
};

// GET single production job
export const getProduction = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesProductionRequest());
    
    try {
        const token = getState().auth.token || localStorage.getItem("token");
        const { data } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales/production/jobs/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        dispatch(getSalesSingleProductionSuccess(data));
    } catch (error: any) {
        const message = error.response?.data?.message || "Something went wrong";
        dispatch(getSalesProductionFailure(message));
    }
};

// UPDATE production job
export const updateProduction = (id: string, updateData: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesProductionRequest());
    
    try {
        Swal.fire({
            title: "Updating Production Job...",
            text: "Please wait...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = getState().auth.token || localStorage.getItem("token");
        
        const { data } = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/sales/production/jobs/${id}`,
            updateData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        
        Swal.close();
        
        await Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Production job updated successfully',
            timer: 1500,
            showConfirmButton: false
        });
        
        dispatch(updateSalesProductionSuccess(data));
        dispatch(getProductions());
        
        return data;
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || "Something went wrong";
        await Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: message,
            confirmButtonColor: '#d33'
        });
        dispatch(getSalesProductionFailure(message));
        throw error;
    }
};

// DELETE production job
export const deleteProduction = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesProductionRequest());
    
    try {
        const confirmResult = await Swal.fire({
            title: 'Delete Production Job?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        
        if (!confirmResult.isConfirmed) {
            dispatch(getSalesProductionFailure("Delete cancelled"));
            return;
        }
        
        Swal.fire({
            title: "Deleting...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = getState().auth.token || localStorage.getItem("token");
        
        await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/sales/production/jobs/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        Swal.close();
        
        await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Production job has been deleted successfully.',
            timer: 2000,
            showConfirmButton: false
        });
        
        dispatch(deleteSalesProductionSuccess(parseInt(id)));
        dispatch(getProductions());
        
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || "Something went wrong";
        await Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: message,
            confirmButtonColor: '#d33'
        });
        dispatch(getSalesProductionFailure(message));
    }
};