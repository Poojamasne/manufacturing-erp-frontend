import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";

const initialState = {
    opportunities: [],
    opportunity: {
        "lead_id": "",
        "company_name": "",
        "contact_person": "",
        "phone": "",
        "email": "",
        "value": 295000,
        "stage": "",
        "priority": "",
        "source": "",
        "expected_close_date": "",
        "assigned_to": 2,
        "notes": ""
    },
    loading: false,
    error: null,
};

const SalesOpportunity = createSlice({
    name: "SalesOpportunity",
    initialState,
    reducers: {
        getSalesOpportunityRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        getSalesOpportunitiesSuccess: (state, action) => {
            state.loading = false;
            state.opportunities = action.payload?.data || null;
            state.error = null;
        },

        getSalesSingleOpportunitySuccess: (state, action) => {
            state.loading = false;
            state.opportunity = action.payload?.data || null;
            state.error = null;
        },

        getSalesOpportunityFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            // state.products = [];
        },

        clearSalesErrors: (state) => {
            state.error = null;
        },
    },
});

export const {
    getSalesOpportunityRequest,
    getSalesOpportunitiesSuccess,
    getSalesSingleOpportunitySuccess,
    getSalesOpportunityFailure,
    clearSalesErrors,
} = SalesOpportunity.actions;

export default SalesOpportunity.reducer;

// GET opportunity's THUNK
export const getOpportunities = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesOpportunityRequest());
    try {
        const token = getState().auth.token || localStorage.getItem("token");
        console.log("Token Before get Employee Request", token);
        const { data } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales/opportunities`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Opportunities response data:", data);
        // SUCCESS
        dispatch(getSalesOpportunitiesSuccess(data));
        console.log("Opportunities data after getOpportunities:", data);
    } catch (error: any) {
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesOpportunityFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesOpportunityFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesOpportunityFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesOpportunityFailure(message || "No Sales Opportunities found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesOpportunityFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesOpportunityFailure("Server error"));
                break;

            default:
                dispatch(getSalesOpportunityFailure(message));
        }
    }
};

// GET OPPORTUNITY THUNK
export const getOpportunity = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesOpportunityRequest());
    try {
        const token = getState().auth.token || localStorage.getItem("token");
        console.log("Token Before get Employee Request", token);
        const { data } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales/opportunities/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Opportunities response data:", data);
        // SUCCESS
        dispatch(getSalesSingleOpportunitySuccess(data));
        console.log("Opportunities data after getOpportunities:", data);
    } catch (error: any) {
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesOpportunityFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesOpportunityFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesOpportunityFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesOpportunityFailure(message || "No Sales Opportunities found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesOpportunityFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesOpportunityFailure("Server error"));
                break;

            default:
                dispatch(getSalesOpportunityFailure(message));
        }
    }
};

// GET OPPORTUNITY THUNK
export const createOpportunity = (payload: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesOpportunityRequest());
    Swal.fire({
        title: 'Creating Opportunity...',
        text: 'Please wait while we create the opportunity.',
        allowOutsideClick: false,
        customClass: {
            loader: 'lead-loader'
        },
        didOpen: () => {
            Swal.showLoading();
        },
    });
    try {
        const token = getState().auth.token || localStorage.getItem("token");
        console.log("Token Before get Employee Request", token);
        const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/sales/opportunities/`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log(" create Opportunity response data:", data);
        // SUCCESS
        dispatch(getSalesSingleOpportunitySuccess(data));
        console.log("Opportunities data after create opportunity:", data);
    } catch (error: any) {
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesOpportunityFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesOpportunityFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesOpportunityFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesOpportunityFailure(message || "No Sales Opportunities found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesOpportunityFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesOpportunityFailure("Server error"));
                break;

            default:
                dispatch(getSalesOpportunityFailure(message));
        }
    }
};

