import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";

const initialState = {
    quotations: [] as any[],
    quotation: {
        "id": "",
        "quote_id": "",
        "company_name": "",
        "total": "",
        "opportunity_id": null,
        "lead_id": null,
        "contact_person": "",
        "email": "",
        "phone": "",
        "quotation_date": null,
        "valid_until": "",
        "subtotal": "",
        "discount": "",
        "tax": "",
        "status": "",
        "notes": "",
        "created_by": "",
        "created_at": "",
        "updated_at": "",
        "created_by_name": "",
        "billing_address": "",
        "shipping_address": "",
        "gst_number": "",
        "payment_terms": "",
        "delivery_terms": "",
        "currency": "INR",
        "terms_conditions": "",
        "products": []
    },
    loading: false,
    error: null as string | null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    }
};

const SalesQuotation = createSlice({
    name: "SalesQuotation",
    initialState,
    reducers: {
        getSalesQuotationRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        getSalesQuotationsSuccess: (state, action) => {
            state.loading = false;
            let quotationsData = [];
            let paginationData = { page: 1, limit: 10, total: 0, pages: 0 };
            
            if (action.payload?.data) {
                quotationsData = Array.isArray(action.payload.data) ? action.payload.data : [];
                paginationData = action.payload.pagination || paginationData;
            } else if (Array.isArray(action.payload)) {
                quotationsData = action.payload;
            } else {
                quotationsData = [];
            }
            
            state.quotations = quotationsData;
            state.pagination = paginationData;
            state.error = null;
        },

        // In getSalesSingleQuotationSuccess reducer, add:
getSalesSingleQuotationSuccess: (state, action) => {
    state.loading = false;
    const quotationData = action.payload?.data;
    if (quotationData && typeof quotationData === 'object' && !Array.isArray(quotationData)) {
        state.quotation = {
            ...state.quotation,
            ...quotationData,
            products: quotationData.products || []
        };
    } else {
        state.quotation = initialState.quotation;
    }
    state.error = null;
},

        createSalesQuotationSuccess: (state, action) => {
            state.loading = false;
            if (action.payload?.data) {
                state.quotations = [action.payload.data, ...state.quotations];
            }
            state.error = null;
        },

        updateSalesQuotationSuccess: (state, action) => {
            state.loading = false;
            const updatedData = action.payload?.data;
            if (updatedData) {
                const index = state.quotations.findIndex((q: typeof initialState.quotation) => q.id === updatedData.id);
                if (index !== -1) {
                    state.quotations[index] = updatedData;
                }
                state.quotation = updatedData;
            }
            state.error = null;
        },

        deleteSalesQuotationSuccess: (state, action) => {
            state.loading = false;
            const deletedId = action.payload;
            // eslint-disable-next-line eqeqeq
            state.quotations = state.quotations.filter((q: typeof initialState.quotation) => q.id !== deletedId);
            if (state.quotation?.id === deletedId) {
                state.quotation = initialState.quotation;
            }
            state.error = null;
        },

        getSalesQuotationFailure: (state, action) => {
            state.loading = false;
            const payload = action.payload;
            // CRITICAL FIX: Handle null/undefined properly
            if (!payload) {
                state.error = null;
            } else if (typeof payload === 'string') {
                state.error = payload;
            } else if (payload instanceof Error) {
                state.error = payload.message;
            } else if (payload && typeof payload === 'object' && 'message' in payload) {
                state.error = String(payload.message);
            } else {
                state.error = 'An unexpected error occurred';
            }
        },

        clearSalesErrors: (state) => {
            state.error = null;
        },
    },
});

export const {
    getSalesQuotationRequest,
    getSalesQuotationsSuccess,
    getSalesSingleQuotationSuccess,
    createSalesQuotationSuccess,
    updateSalesQuotationSuccess,
    deleteSalesQuotationSuccess,
    getSalesQuotationFailure,
    clearSalesErrors,
} = SalesQuotation.actions;

export default SalesQuotation.reducer;

// ==================== THUNKS ====================

export const getQuotations = (params?: { status?: string; search?: string; page?: number; limit?: number }) => 
    async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesQuotationRequest());
    try {
        Swal.fire({
            title: "Loading Quotations...",
            text: "Please wait while we fetch the data.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = getState().auth.token || localStorage.getItem("token");
        
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== 'All') queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        
        const url = `${import.meta.env.VITE_API_BASE_URL}/sales/quotations${queryParams.toString() ? `?${queryParams}` : ''}`;
        
        const { data } = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        dispatch(getSalesQuotationsSuccess(data));
        Swal.close();
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || error.message || "Something went wrong";
        dispatch(getSalesQuotationFailure(message));
    }
};

export const getQuotation = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesQuotationRequest());
    try {
        Swal.fire({
            title: "Loading Quotation Details...",
            text: "Please wait while we fetch the data.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = getState().auth.token || localStorage.getItem("token");
        const { data } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales/quotations/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        dispatch(getSalesSingleQuotationSuccess(data));
        Swal.close();
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || error.message || "Failed to fetch quotation";
        dispatch(getSalesQuotationFailure(message));
    }
};

export const createQuotation = (quotationData: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesQuotationRequest());
    try {
        Swal.fire({
            title: "Creating Quotation...",
            text: "Please wait while we save the data.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = getState().auth.token || localStorage.getItem("token");
        const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/sales/quotations`,
            quotationData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        
        dispatch(createSalesQuotationSuccess(data));
        
        // Close the loading modal
        Swal.close();
        
        // Show success message
        await Swal.fire({
            title: "Success!",
            text: "Quotation created successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });
        
        return data;
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || error.message || "Failed to create quotation";
        
        await Swal.fire({
            title: "Error!",
            text: message,
            icon: "error",
            confirmButtonText: "OK"
        });

        dispatch(getSalesQuotationFailure(message));
        throw new Error(message);
    }
};

export const updateQuotation = (id: string, updateData: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesQuotationRequest());
    try {
        Swal.fire({
            title: "Updating Quotation...",
            text: "Please wait while we update the data.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = getState().auth.token || localStorage.getItem("token");
        const { data } = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/sales/quotations/${id}`,
            updateData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        
        dispatch(updateSalesQuotationSuccess(data));
        Swal.fire({
            title: "Success!",
            text: "Quotation updated successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });
        return data;
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || error.message || "Failed to update quotation";
        Swal.fire({
            title: "Error!",
            text: message,
            icon: "error",
            confirmButtonText: "OK"
        });
        dispatch(getSalesQuotationFailure(message));
        throw error;
    }
};

export const deleteQuotation = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesQuotationRequest());
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) {
            dispatch(clearSalesErrors());
            return;
        }

        Swal.fire({
            title: "Deleting Quotation...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = getState().auth.token || localStorage.getItem("token");
        await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/sales/quotations/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        dispatch(deleteSalesQuotationSuccess(parseInt(id)));
        
        // Close loading modal
        Swal.close();
        
        // Show success message and wait for it
        await Swal.fire({
            title: "Deleted!",
            text: "Quotation has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });
        
        return true;
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || error.message || "Failed to delete quotation";
        await Swal.fire({
            title: "Error!",
            text: message,
            icon: "error",
            confirmButtonText: "OK"
        });
        dispatch(getSalesQuotationFailure(message));
        throw error;
    }
};

export const updateQuotationStatus = ({ id, status }: { id: string; status: string }) => 
    async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesQuotationRequest());
    try {
        Swal.fire({
            title: "Updating Status...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = getState().auth.token || localStorage.getItem("token");
        
        // CHANGE THIS: Use PUT instead of PATCH, and use the correct endpoint
        const { data } = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/sales/quotations/${id}`,  // ← Changed from PATCH to PUT, removed /status
            { status },  // ← Send status in body
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        
        dispatch(updateSalesQuotationSuccess(data));
        
        Swal.close();
        Swal.fire({
            title: "Success!",
            text: `Quotation status updated to ${status}`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });
        
        return data;
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || error.message || "Failed to update status";
        Swal.fire({
            title: "Error!",
            text: message,
            icon: "error",
            confirmButtonText: "OK"
        });
        dispatch(getSalesQuotationFailure(message));
        throw error;
    }
};

export const bulkDeleteQuotations = (ids: string[]) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesQuotationRequest());
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You are about to delete ${ids.length} quotation(s). This action cannot be undone!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete them!"
        });

        if (!result.isConfirmed) {
            dispatch(clearSalesErrors());
            return;
        }

        Swal.fire({
            title: "Deleting Quotations...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = getState().auth.token || localStorage.getItem("token");
        
        for (const id of ids) {
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/sales/quotations/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            dispatch(deleteSalesQuotationSuccess(parseInt(id)));
        }
        
        Swal.fire({
            title: "Deleted!",
            text: `${ids.length} quotation(s) have been deleted.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || error.message || "Failed to delete quotations";
        Swal.fire({
            title: "Error!",
            text: message,
            icon: "error",
            confirmButtonText: "OK"
        });
        dispatch(getSalesQuotationFailure(message));
        throw error;
    }
};