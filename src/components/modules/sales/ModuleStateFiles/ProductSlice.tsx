import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";
import { ProductPDFReport } from "../utils/ProductsOverviewReport";
import { pdf } from "@react-pdf/renderer";

const initialState = {
    products: [],
    loading: false,
    error: null,
};

const SalesProduct = createSlice({
    name: "SalesProduct",
    initialState,
    reducers: {
        getSalesProductRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        getSalesProductSuccess: (state, action) => {
            state.loading = false;
            state.products = action.payload?.data || null;
            state.error = null;
        },

        getSalesProductFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.products = [];
        },

        clearSalesErrors: (state) => {
            state.error = null;
        },
    },
});

export const {
    getSalesProductRequest,
    getSalesProductSuccess,
    getSalesProductFailure,
    clearSalesErrors,
} = SalesProduct.actions;

export default SalesProduct.reducer;

// GET PRODUCT THUNK
export const getProductsForLead = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesProductRequest());
    try {
        const token = getState().auth.token || localStorage.getItem("token");
        console.log("Token Before get Employee Request", token);
        const { data } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales/products`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Login response data:", data);
        // SUCCESS
        dispatch(getSalesProductSuccess(data));
        console.log("product data after getProducts:", data);
    } catch (error: any) {
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesProductFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesProductFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesProductFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesProductFailure(message || "No Sales Products found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesProductFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesProductFailure("Server error"));
                break;

            default:
                dispatch(getSalesProductFailure(message));
        }
    }
};


// GET PRODUCT THUNK
export const getProductsForOverviewReport = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesProductRequest());
    Swal.fire({
        title: "Generating Products Overview Report...",
        text: "Please wait while we generate the report.",
        allowOutsideClick: false,
        customClass: {
            loader: 'lead-loader'
        },
        didOpen: () => {
            Swal.showLoading();
        }
    });
    try {
        const token = getState().auth.token || localStorage.getItem("token");
        console.log("Token Before get Employee Request", token);
        const { data } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales/products`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Login response data:", data);
        // SUCCESS
        dispatch(getSalesProductSuccess(data));
        const products = data?.data || data;

        const blob = await pdf(<ProductPDFReport products={products} />).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Products_Overview_Report_${new Date().toISOString().split("T")[0] || 'Report'}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log("product data after getProducts:", data);
        Swal.close();
    } catch (error: any) {
        Swal.close();

        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesProductFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesProductFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesProductFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesProductFailure(message || "No Sales Products found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesProductFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesProductFailure("Server error"));
                break;

            default:
                dispatch(getSalesProductFailure(message));
        }
    }
};

