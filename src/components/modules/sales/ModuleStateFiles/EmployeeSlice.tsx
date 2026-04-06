import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";
import type { NavigateFunction } from "react-router";
import toast from "react-hot-toast";


const initialState = {
    employees: null,
    employee: {
        "id": "",
        "user_id": "",
        "name": "",
        "email": "",
        "designation": "",
        "role": "",
        "phone": "",
        "is_active": 1,
        "created_at": ""
    },
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "SalesEmployee",
    initialState,
    reducers: {
        getSalesEmployeeRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        getSalesEmployeeSuccess: (state, action) => {
            state.loading = false;
            state.employees = action.payload?.data || null;
            state.error = null;
        },

        getSingleSalesEmployeeSuccess: (state, action) => {
            state.loading = false;
            state.employee = action.payload?.data || null;
            state.error = null;
        },

        getSalesEmployeeFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.employees = null;
            toast.error(action.payload || "Failed to fetch employee data");
        },

        clearSalesErrors: (state) => {
            state.error = null;
        },
    },
});

export const {
    getSalesEmployeeRequest,
    getSalesEmployeeSuccess,
    getSalesEmployeeFailure,
    getSingleSalesEmployeeSuccess,
    clearSalesErrors,
} = authSlice.actions;

export default authSlice.reducer;

// GET EMPLOYEE THUNK
export const getEmployeesForLead = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesEmployeeRequest());
    try {
        const token = getState().auth.token || localStorage.getItem("token");
        console.log("Token Before get Employee Request", token);
        const { data } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/sales/employees`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Login response data:", data);
        // SUCCESS
        dispatch(getSalesEmployeeSuccess(data));
        console.log("employee data after getEmployees:", data);
    } catch (error: any) {
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesEmployeeFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesEmployeeFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesEmployeeFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesEmployeeFailure(message || "No Sales Employees found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesEmployeeFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesEmployeeFailure("Server error"));
                break;

            default:
                dispatch(getSalesEmployeeFailure(message));
        }
    }
};

// GET EMPLOYEES THUNK
export const getEmployees = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesEmployeeRequest());
    try {
        Swal.fire({
            title: "Loading Employees...",
            text: "Please wait while we fetch the employee data.",
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
            `${import.meta.env.VITE_API_BASE_URL}/sales/employees`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Login response data:", data);
        // SUCCESS
        dispatch(getSalesEmployeeSuccess(data));
        console.log("employee data after getEmployees:", data);
        Swal.close();
    } catch (error: any) {
        Swal.close();
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesEmployeeFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesEmployeeFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesEmployeeFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesEmployeeFailure(message || "No Sales Employees found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesEmployeeFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesEmployeeFailure("Server error"));
                break;

            default:
                dispatch(getSalesEmployeeFailure(message));
        }
    }
};

// GET EMPLOYEE THUNK
export const getEmployee = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesEmployeeRequest());
    try {
        Swal.fire({
            title: "Loading Employee Details...",
            text: "Please wait while we fetch the employee data.",
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
            `${import.meta.env.VITE_API_BASE_URL}/sales/employees/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        // SUCCESS
        dispatch(getSingleSalesEmployeeSuccess(data));
        console.log("employee data after getEmployee:", data);
        Swal.close();
    } catch (error: any) {
        Swal.close();
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesEmployeeFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesEmployeeFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesEmployeeFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesEmployeeFailure(message || "No Sales Employees found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesEmployeeFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesEmployeeFailure("Server error"));
                break;

            default:
                dispatch(getSalesEmployeeFailure(message));
        }
    }
};

// Create EMPLOYEE THUNK
export const createEmployee = (payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesEmployeeRequest());
    console.log("Payload for creating employee:", payload);
    try {
        Swal.fire({
            title: "Creating Employee...",
            text: "Please wait while we create the employee.",
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
            `${import.meta.env.VITE_API_BASE_URL}/sales/employees`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Create Employee response data:", data);
        dispatch(getSingleSalesEmployeeSuccess(data));
        // Redirect to employee list after creation
        navigate("/sales/employees");
        Swal.close();
    } catch (error: any) {
        Swal.close();
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesEmployeeFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesEmployeeFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesEmployeeFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesEmployeeFailure(message || "No Sales Employees found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesEmployeeFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesEmployeeFailure("Server error"));
                break;

            default:
                dispatch(getSalesEmployeeFailure(message));
        }
    }
};

// Create EMPLOYEE THUNK
export const editEmployee = (id: number, payload: any, navigate: NavigateFunction) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSalesEmployeeRequest());
    console.log("Payload for editing employee:", payload);
    try {
        Swal.fire({
            title: "Editing Employee...",
            text: "Please wait while we update the employee.",
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
            `${import.meta.env.VITE_API_BASE_URL}/sales/employees/${id}`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        console.log("Edit Employee response data:", data);
        dispatch(getSingleSalesEmployeeSuccess(data));
        // Redirect to employee list after editing
        navigate("/sales/employees");
        Swal.close();
    } catch (error: any) {
        Swal.close();
        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                dispatch(getSalesEmployeeFailure(message || "Invalid request"));
                break;

            case 401: // invalid token or not logged in
                dispatch(getSalesEmployeeFailure(message || "Please provide a valid token"));
                break;

            case 403: // role mismatch or insufficient permissions
                dispatch(getSalesEmployeeFailure(message || "Unauthorized access"));
                break;

            case 404:
                dispatch(getSalesEmployeeFailure(message || "No Sales Employees found"));
                break;

            case 409: //optional (not needed here)
                dispatch(getSalesEmployeeFailure(message || "Conflict error"));
                break;

            case 500:
                dispatch(getSalesEmployeeFailure("Server error"));
                break;

            default:
                dispatch(getSalesEmployeeFailure(message));
        }
    }
};
