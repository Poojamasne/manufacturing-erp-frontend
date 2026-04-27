import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import type { NavigateFunction } from "react-router-dom";

const initialState = {
    opportunities: [],
    opportunity: {
        "id": "",
        "opp_id": "",
        "lead_id": "",
        "company_name": "",
        "value": "",
        "stage": "",
        "contact_person": null,
        "phone": null,
        "email": null,
        "priority": null,
        "source": null,
        "expected_close_date": null,
        "assigned_to": null,
        "created_by": null,
        "created_by_name": null,
        "notes": null,
        "status": "",
        "created_at": "",
        "updated_at": "",
        "assigned_to_name": null
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
            toast.error(action.payload || "Failed to fetch opportunities");
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
        Swal.fire({
            title: "Loading Opportunities...",
            text: "Please wait while we fetch the data.",
            allowOutsideClick: false,
            customClass: {
                loader: 'lead-loader'
            },
            didOpen: () => {
                Swal.showLoading();
            }
        });
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
        Swal.close();
    } catch (error: any) {
        Swal.close();

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
        Swal.fire({
            title: "Loading Opportunity Details...",
            text: "Please wait while we fetch the data.",
            allowOutsideClick: false,
            customClass: {
                loader: 'lead-loader'
            },
            didOpen: () => {
                Swal.showLoading();
            }
        });
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
        Swal.close();
    } catch (error: any) {
        Swal.close();
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
export const updateOpportunity = (id: string | number, payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesOpportunityRequest());
    Swal.fire({
        title: 'Updating Opportunity...',
        text: 'Please wait while we update the opportunity.',
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
        const { data } = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/sales/opportunities/${id}`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log(" update Opportunity response data:", data);
        // SUCCESS
        Swal.close();
        dispatch(getSalesSingleOpportunitySuccess(data));
        console.log("Opportunities data after update opportunity:", data);
        await Swal.fire({
            icon: 'success',
            iconColor: "#F59E0B",
            title: 'Updated!',
            text: 'Opportunity updated successfully',
            timer: 1500,
            timerProgressBar: true,
            showCloseButton: false,

        });
        navigate("/sales/opportunities");
    } catch (error: any) {
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            showConfirmButton: true,
        });

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

