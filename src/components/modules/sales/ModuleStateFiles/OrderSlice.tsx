import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";

const initialState = {
    orders: [],
    order: {
        "id": "",
        "order_id": "",
        "customer_name": "",
        "total_amount": "",
        "quotation_id": "",
        "email": "",
        "phone": "",
        "shipping_address": "",
        "notes": "",
        "sales_rep_id": "",
        "status": "",
        "order_date": "",
        "created_at": "",
        "updated_at": "",
        "sales_rep_name": "",
        "items": [
            {
                "id": "",
                "order_id": "",
                "product_name": "",
                "quantity": "",
                "unit_price": "",
                "total_price": ""
            }
        ]
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

const SalesOrder = createSlice({
    name: "SalesOrder",
    initialState,
    reducers: {
        getSalesOrderRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        getSalesOrdersSuccess: (state, action) => {
            state.loading = false;
            state.orders = Array.isArray(action.payload?.data) ? action.payload.data : [];
            state.pagination = action.payload?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
            state.error = null;
        },

        getSalesSingleOrderSuccess: (state, action) => {
            state.loading = false;
            state.order = action.payload?.data || initialState.order;
            state.error = null;
        },

        getSalesOrderFailure: (state, action) => {
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
    getSalesOrderRequest,
    getSalesOrdersSuccess,
    getSalesSingleOrderSuccess,
    getSalesOrderFailure,
    clearSalesErrors,
} = SalesOrder.actions;

export default SalesOrder.reducer;

// GET order's THUNK with filters and pagination
export const getOrders = (params?: { 
    status?: string; 
    search?: string; 
    page?: number; 
    limit?: number;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
}) => async (dispatch: AppDispatch, _getState: () => RootState) => {
    dispatch(getSalesOrderRequest());
    
    try {
        const token = _getState().auth.token || localStorage.getItem("token");
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== 'All') queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.dateRange && params.dateRange !== 'All Time') queryParams.append('dateRange', params.dateRange);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        
        const url = `${import.meta.env.VITE_API_BASE_URL}/sales/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
        
        const { data } = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        dispatch(getSalesOrdersSuccess(data));
    } catch (error: any) {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesOrderFailure(message || "Invalid request"));
                break;
            case 401:
                dispatch(getSalesOrderFailure(message || "Please provide a valid token"));
                break;
            case 403:
                dispatch(getSalesOrderFailure(message || "Unauthorized access"));
                break;
            case 404:
                dispatch(getSalesOrderFailure(message || "No Sales Orders found"));
                break;
            case 409:
                dispatch(getSalesOrderFailure(message || "Conflict error"));
                break;
            case 500:
                dispatch(getSalesOrderFailure("Server error"));
                break;
            default:
                dispatch(getSalesOrderFailure(message));
        }
    }
};

// GET ORDER THUNK
export const getOrder = (id: string) => async (dispatch: AppDispatch, _getState: () => RootState) => {
    dispatch(getSalesOrderRequest());
    
    try {
        const token = _getState().auth.token || localStorage.getItem("token");
        const { data } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales/orders/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        dispatch(getSalesSingleOrderSuccess(data));
    } catch (error: any) {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesOrderFailure(message || "Invalid request"));
                break;
            case 401:
                dispatch(getSalesOrderFailure(message || "Please provide a valid token"));
                break;
            case 403:
                dispatch(getSalesOrderFailure(message || "Unauthorized access"));
                break;
            case 404:
                dispatch(getSalesOrderFailure(message || "No Sales Orders found"));
                break;
            case 409:
                dispatch(getSalesOrderFailure(message || "Conflict error"));
                break;
            case 500:
                dispatch(getSalesOrderFailure("Server error"));
                break;
            default:
                dispatch(getSalesOrderFailure(message));
        }
    }
};

// --- CREATE ORDER THUNK ---
export const createOrder = (orderData: any) => async (dispatch: AppDispatch, _getState: () => RootState) => {
    dispatch(getSalesOrderRequest());
    
    try {
        Swal.fire({
            title: "Creating Order...",
            text: "Please wait while we create the order.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const token = _getState().auth.token || localStorage.getItem("token");
        
        const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/sales/orders`,
            orderData,
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
            title: 'Success!',
            text: 'Order created successfully',
            timer: 2000,
            showConfirmButton: false
        });
        
        return data;
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || "Something went wrong";
        await Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: message,
            confirmButtonColor: '#d33'
        });
        throw message;
    }
};

// --- UPDATE ORDER THUNK ---
export const updateOrder = (id: string, updateData: { status?: string; shipping_address?: string; notes?: string }) => async (dispatch: AppDispatch, _getState: () => RootState) => {
    dispatch(getSalesOrderRequest());
    
    try {
        Swal.fire({
            title: "Updating Order...",
            text: "Please wait...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        const token = _getState().auth.token || localStorage.getItem("token");
        
        const { data } = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/sales/orders/${id}`,
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
            text: 'Order updated successfully',
            timer: 1500,
            showConfirmButton: false
        });
        
        dispatch(getOrder(id));
        dispatch(getOrders());
        
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
        throw message;
    }
};

// --- DELETE ORDER THUNK ---
export const deleteOrder = (id: string) => async (dispatch: AppDispatch, _getState: () => RootState) => {
    dispatch(getSalesOrderRequest());
    
    try {
        const confirmResult = await Swal.fire({
            title: 'Delete Order?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        
        if (!confirmResult.isConfirmed) {
            dispatch(getSalesOrderFailure("Delete cancelled"));
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
        
        const token = _getState().auth.token || localStorage.getItem("token");
        
        await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/sales/orders/${id}`,
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
            text: 'Order has been deleted successfully.',
            timer: 2000,
            showConfirmButton: false
        });
        
        dispatch(getOrders());
        
    } catch (error: any) {
        Swal.close();
        const message = error.response?.data?.message || "Something went wrong";
        await Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: message,
            confirmButtonColor: '#d33'
        });
        dispatch(getSalesOrderFailure(message));
    }
};

// --- UPDATE ORDER STATUS ONLY THUNK ---
export const updateOrderStatus = (id: string, status: string) => async (dispatch: AppDispatch, _getState: () => RootState) => {
    return dispatch(updateOrder(id, { status }));
};