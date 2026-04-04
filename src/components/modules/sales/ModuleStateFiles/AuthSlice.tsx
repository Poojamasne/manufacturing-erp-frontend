import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import type { AppDispatch } from "../../../../ApplicationState/Store";
import type { NavigateFunction } from "react-router-dom";

const initialState = {
    user: localStorage.getItem("token") && localStorage.getItem("name") && localStorage.getItem("email") && localStorage.getItem("role") && localStorage.getItem("designation")
        ? {
            name: localStorage.getItem("name"),
            email: localStorage.getItem("email"),
            role: localStorage.getItem("role"),
            userId: localStorage.getItem("userId"),
            designation: localStorage.getItem("designation"),
        } : null,

    isAuthenticated: !!localStorage.getItem("token"),

    loading: false,
    error: null,
    token: localStorage.getItem("token") || null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        loginSuccess: (state, action) => {
            const user = action.payload?.data?.user;
            const token = action.payload?.data?.token;

            state.loading = false;
            state.isAuthenticated = true;

            state.user = {
                name: user?.name,
                email: user?.email,
                role: user?.role,
                userId: user?.user_id,
                designation: user?.designation,
            };

            state.token = token;

            // localStorage
            localStorage.setItem("name", user?.name);
            localStorage.setItem("email", user?.email);
            localStorage.setItem("role", user?.role);
            localStorage.setItem("userId", user?.user_id);
            localStorage.setItem("designation", user?.designation);
            localStorage.setItem("token", token);
        },

        loginFailure: (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = action.payload;
        },

        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.token = null;

            localStorage.removeItem("userId");
            localStorage.removeItem("name");
            localStorage.removeItem("email");
            localStorage.removeItem("role");
            localStorage.removeItem("designation");
            localStorage.removeItem("token");

            toast.success("Logout successful");
        },

        clearErrors: (state) => {
            state.error = null;
        },
    },
});

export const {
    loginRequest,
    loginSuccess,
    loginFailure,
    logout,
    clearErrors,
} = authSlice.actions;

export default authSlice.reducer;

// LOGIN THUNK
export const loginUser = (payload: { email: string; password: string; }, navigate: NavigateFunction) => async (dispatch: AppDispatch) => {
    dispatch(loginRequest());
    try {
        Swal.fire({
            title: "Logging in...",
            text: "Please wait while we log you in",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
            payload
        );
        console.log("Login response data:", data);
        // SUCCESS
        toast.success(data?.message || "Login successful");
        dispatch(loginSuccess(data));
        console.log("User data after login:", data);
        Swal.close();
        // Redirect based on role
        const user = data?.data?.user;
        switch (user?.designation) {
            case "Sales Manager":
                navigate("/sales/dashboard");
                break;
            case "Inventory Manager":
                navigate("/inventory");
                break;
            case "HR Manager":
                navigate("/hr");
                break;
            default:
                navigate("/role-mismatch");
        }
    } catch (error: any) {
        Swal.close();

        const status = error.response?.status;
        const message =
            error.response?.data?.message || "Something went wrong";

        switch (status) {
            case 400:
                toast.error(message || "Invalid request");
                dispatch(loginFailure(message || "Invalid request"));
                break;

            case 401:
                toast.error("Invalid email or password");
                dispatch(loginFailure(message || "Invalid credentials"));
                break;

            case 403:
                toast.error("Access denied");
                dispatch(loginFailure(message || "Unauthorized access"));
                break;

            case 404:
                toast.error("User not found");
                dispatch(loginFailure(message || "User not found"));
                break;

            case 409:
                toast.error("Conflict occurred");
                dispatch(loginFailure(message || "Conflict error"));
                break;

            case 500:
                toast.error("Server error. Try again later");
                dispatch(loginFailure("Server error"));
                break;

            default:
                toast.error(message);
                dispatch(loginFailure(message));
        }
    }
};