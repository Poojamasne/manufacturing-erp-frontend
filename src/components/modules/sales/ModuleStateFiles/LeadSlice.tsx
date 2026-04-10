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
        deleteLeadSuccess: (state, ) => {
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

// COMMON ERROR HANDLER - IMPROVED VERSION WITH USER-FRIENDLY MESSAGES
const handleError = (error: any, dispatch: any) => {
    const status = error.response?.status;
    let message = error.response?.data?.message || "Something went wrong";
    
    // ✅ Check for variant-related errors and make them user-friendly
    if (message.includes("Variant with ID")) {
        // Extract variant name from message if possible
        const variantMatch = message.match(/Variant with ID (.+?) not found/);
        const variantName = variantMatch ? variantMatch[1] : "selected";
        message = `The variant "${variantName}" is no longer available in the system.\n\nPlease remove this product row and re-add it with a valid variant selection.`;
    }
    
    // ✅ Check for product-related errors
    else if (message.includes("Product with ID")) {
        const productMatch = message.match(/Product with ID (.+?) not found/);
        const productName = productMatch ? productMatch[1] : "selected";
        message = `The product "${productName}" is no longer available in the system.\n\nPlease remove this product row and select a valid product.`;
    }
    
    // ✅ Check for duplicate entry errors
    else if (message.includes("Duplicate entry")) {
        message = "A lead with this information already exists. Please check for duplicates.";
    }
    
    // ✅ Check for validation errors
    else if (message.includes("validation failed")) {
        message = "Please check all required fields are filled correctly.";
    }

    switch (status) {
        case 400:
            Swal.fire({
                title: "Validation Error",
                html: message.replace(/\n/g, '<br/>'),
                icon: "error",
                confirmButtonColor: "#005d52",
                confirmButtonText: "OK, I'll fix it"
            });
            break;

        case 401:
            Swal.fire({
                title: "Session Expired",
                text: "Your session has expired. Please login again to continue.",
                icon: "error",
                confirmButtonColor: "#005d52",
                confirmButtonText: "Login Again"
            }).then(() => {
                // Optional: Redirect to login page
                window.location.href = "/";
            });
            break;

        case 403:
            Swal.fire({
                title: "Access Denied",
                text: "You don't have permission to perform this action.",
                icon: "error",
                confirmButtonColor: "#005d52"
            });
            break;

        case 404:
            Swal.fire({
                title: "Not Found",
                text: message,
                icon: "error",
                confirmButtonColor: "#005d52"
            });
            break;

        case 409:
            Swal.fire({
                title: "Conflict Error",
                text: message,
                icon: "error",
                confirmButtonColor: "#005d52"
            });
            break;

        case 500:
            Swal.fire({
                title: "Server Error",
                text: "Something went wrong on our server. Please try again later.",
                icon: "error",
                confirmButtonColor: "#005d52"
            });
            break;

        default:
            Swal.fire({
                title: "Error",
                html: message.replace(/\n/g, '<br/>'),
                icon: "error",
                confirmButtonColor: "#005d52"
            });
    }

    dispatch(failure(message));
};

