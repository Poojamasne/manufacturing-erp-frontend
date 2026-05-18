import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch, RootState } from "../../../app/store/store";
import Swal from "sweetalert2";

const initialState = {
    pipeline: [],
    recentLeads: [],
    salesByCategory: [],
    stats: {
        totalLeads: 0,
        dealsWon: 0,
        totalRevenue: 0,
        winRate: 0
    },
    loading: false,
    error: "",
};

const dashboardSlice = createSlice({
    name: "SalesDashboard",
    initialState,
    reducers: {
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
        getSuccess: (state, action) => {
            state.loading = false;
            state.salesByCategory = action.payload?.data?.salesByCategory || action.payload?.salesByCategory || [];
            state.pipeline = action.payload?.data?.pipeline || action.payload?.pipeline || [];
            state.recentLeads = action.payload?.data?.recentLeads || action.payload?.recentLeads || [];
            state.stats = action.payload?.data?.stats || action.payload?.stats || {
                totalLeads: 0,
                dealsWon: 0,
                totalRevenue: 0,
                winRate: 0
            };
            state.error = "";
        },
    },
});

export const { request, failure, clearErrors, getSuccess } = dashboardSlice.actions;
export default dashboardSlice.reducer;

// GET DASHBOARD DATA WITH FILTERS
export const getDashboardData = (filter?: string, customRange?: { start: string; end: string }) => 
    async (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(request());
        
        try {
            Swal.fire({
                        title: "Loading Dashboard Stats...",
                        text: "Please wait while we fetch the latest data for you.",
                        allowOutsideClick: false,
                        customClass: {
                            loader: 'lead-loader'
                        },
                        didOpen: () => {
                            Swal.showLoading();
                        },
                    });

            const token = getState().auth.token || localStorage.getItem("token");
            
            // Build URL with query parameters
            let url = `${import.meta.env.VITE_API_BASE_URL}/sales/dashboard`;
            const params = new URLSearchParams();
            
            if (filter && filter !== 'Weekly') { // Don't send Weekly as it's default
                params.append('filter', filter);
            }
            
            if (filter === 'Custom' && customRange && customRange.start && customRange.end) {
                params.append('startDate', customRange.start);
                params.append('endDate', customRange.end);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            dispatch(getSuccess(data));
            Swal.close();
        } catch (error: any) {
            Swal.close();
            console.error('Error fetching dashboard data:', error);
            dispatch(failure(error.response?.data?.message || "Something went wrong"));
        }
    };