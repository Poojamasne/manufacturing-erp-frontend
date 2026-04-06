import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";
import type { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";

const initialState = {
    lead: {
        "id": "",
        "lead_id": "",
        "company_name": "",
        "contact_person": "",
        "phone": "",
        "email": "",
        "city": "",
        "status": "",
        "priority": "",
        "address": "",
        "state": "",
        "gst_number": "",
        "lead_source": "",
        "expected_close_date": "",
        "followup_date": "",
        "notes": "",
        "assigned_to": "",
        "created_by": "",
        "created_at": "",
        "updated_at": "",
        "assigned_to_name": "",
        "products": [
            {
                "id": "",
                "lead_id": "",
                "product_name": "",
                "quantity": "",
                "total_price": "",
                "product_id": "",
                "variant": "",
                "unit_price": ""
            }
        ]
    },     // single
    leads: [],    // list
    loading: false,
    error: "",
};

const leadSlice = createSlice({
    name: "leads",
    initialState,
    reducers: {
        // Common
        request: (state) => {
            state.loading = true;
            state.error = "";
        },

        failure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        clearErrors: (state) => {
            state.error = "";
        },

        // GET ALL LEADS
        getLeadsSuccess: (state, action) => {
            state.loading = false;
            state.leads = action.payload?.data || action.payload;
        },

        // GET SINGLE LEAD
        getLeadSuccess: (state, action) => {
            state.loading = false;
            state.lead = action.payload?.data || action.payload;
        },

        // CREATE LEAD
        createLeadSuccess: (state, action) => {
            state.loading = false;
            state.lead = action.payload?.data || action.payload;
        },
        // EDIT LEAD
        editLeadSuccess: (state, action) => {
            state.loading = false;
            state.lead = action.payload?.data || action.payload;
        },
        // DELETE LEAD
        deleteLeadSuccess: (state, _action) => {
            state.loading = false;
            state.lead = {
                "id": "",
                "lead_id": "",
                "company_name": "",
                "contact_person": "",
                "phone": "",
                "email": "",
                "city": "",
                "status": "",
                "priority": "",
                "address": "",
                "state": "",
                "gst_number": "",
                "lead_source": "",
                "expected_close_date": "",
                "followup_date": "",
                "notes": "",
                "assigned_to": "",
                "created_by": "",
                "created_at": "",
                "updated_at": "",
                "assigned_to_name": "",
                "products": [
                    {
                        "id": "",
                        "lead_id": "",
                        "product_name": "",
                        "quantity": "",
                        "total_price": "",
                        "product_id": "",
                        "variant": "",
                        "unit_price": ""
                    }
                ]
            };
        },
    }
});

export const {
    request,
    failure,
    clearErrors,
    getLeadsSuccess,
    getLeadSuccess,
    createLeadSuccess,
    editLeadSuccess,
    deleteLeadSuccess,
} = leadSlice.actions;

export default leadSlice.reducer;

// GET ALL LEADS
export const getLeads =
    () => async (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(request());
        Swal.fire({
            title: "Loading Leads...",
            text: "Please wait while we fetch the lead data.",
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

            const { data } = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/sales/leads`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            dispatch(getLeadsSuccess(data));
            Swal.close();
        } catch (error: any) {
            Swal.close();
            handleError(error, dispatch);
        }
    };

// GET SINGLE LEAD
export const getLead =
    (id: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(request());
        Swal.fire({
            title: "Loading Lead...",
            text: "Please wait while we fetch the lead details.",
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

            const { data } = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/sales/leads/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            dispatch(getLeadSuccess(data));
            Swal.close();
        } catch (error: any) {
            Swal.close();
            handleError(error, dispatch);
        }
    };


// CREATE LEAD
export const createLead = (payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(request());
    try {
        Swal.fire({
            title: "Creating Lead...",
            text: "Please wait while we create the lead.",
            allowOutsideClick: false,
            customClass: {
                loader: 'lead-loader'
            },
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const token = getState().auth.token || localStorage.getItem("token");

        const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/sales/leads`,
            payload,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        dispatch(createLeadSuccess(data));
        toast.success("Lead created successfully!");
        Swal.fire({
            icon: "success",
            iconColor: "#005d52",
            title: "Lead Created",
            text: data.message || "Success",
            timer: 1500,
            showConfirmButton: false,
        });
        navigate("/sales/leads");
        Swal.close();
    } catch (error: any) {
        Swal.close();
        handleError(error, dispatch);
    }
};

// EDIT LEAD
export const editLead = (id: number, payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(request());
    try {
        Swal.fire({
            title: "Updating Lead...",
            text: "Please wait while we update the lead.",
            allowOutsideClick: false,
            customClass: {
                loader: 'lead-loader'
            },
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const token = getState().auth.token || localStorage.getItem("token");

        const { data } = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/sales/leads/${id}`,
            payload,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        dispatch(editLeadSuccess(data));
        toast.success("Lead updated successfully!");
        Swal.fire({
            icon: "success",
            iconColor: "#005d52",
            title: "Lead Created",
            text: data.message || "Success",
            timer: 1500,
            showConfirmButton: false,
        });
        navigate("/sales/leads");
        Swal.close();
    } catch (error: any) {
        Swal.close();
        handleError(error, dispatch);
    }
};

export const deleteLead = (id: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(request());

    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            iconColor: "#005d52",
            showCancelButton: true,
            confirmButtonColor: "#005d52",
            cancelButtonColor: "#eb0000",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) return;

        // Loader
        Swal.fire({
            title: "Deleting Lead...",
            text: "Please wait...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const token = getState().auth.token || localStorage.getItem("token");

        const { data } = await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/sales/leads/${id}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        dispatch(deleteLeadSuccess(data));
        dispatch(getLeads());


        toast.success("Lead deleted successfully!");

        Swal.fire({
            icon: "success",
            iconColor: "#005d52",
            title: "Lead Deleted",
            text: data.message || "Success",
            timer: 1500,
            showConfirmButton: false,
        });

        Swal.close();
    } catch (error: any) {
        Swal.close();
        handleError(error, dispatch);
    }
};

// COMMON ERROR HANDLER
const handleError = (error: any, dispatch: any) => {
    const status = error.response?.status;
    const message =
        error.response?.data?.message || "Something went wrong";

    switch (status) {
        case 400:
            Swal.fire("Error", message || "Invalid request", "error");
            break;

        case 401:
            Swal.fire("Error", "Unauthorized - Login again", "error");
            break;

        case 403:
            Swal.fire("Error", "Access denied", "error");
            break;

        case 404:
            Swal.fire("Error", "Data not found", "error");
            break;

        case 409:
            Swal.fire("Error", message || "Conflict", "error");
            break;

        case 500:
            Swal.fire("Error", "Server error", "error");
            break;

        default:
            Swal.fire("Error", message, "error");
    }

    dispatch(failure(message));
};

