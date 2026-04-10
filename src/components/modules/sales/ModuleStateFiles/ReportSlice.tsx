import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";

// Types
export interface RevenueData {
    name: string;
    val: number;
}

export interface SourceData {
    name: string;
    value: number;
}

export interface KPIData {
    rev: string;
    leads: string;
    conv: string;
    avg: string;
}

export interface ProductData {
    name: string;
    target: number;
    sold: number;
    prod: number;
}

export interface LeaderboardData {
    name: string;
    leads: number;
    conversion: string;
    revenue: string;
}

export interface ReportData {
    revenue: RevenueData[];
    sources: SourceData[];
    kpis: KPIData;
    products: ProductData[];
    leaderboard: LeaderboardData[];
}

interface ReportState {
    data: ReportData;
    loading: boolean;
    error: string | null;
}

// Initial state with default/empty values
const initialState: ReportState = {
    data: {
        revenue: [{ name: "No Data", val: 0 }],
        sources: [{ name: "No Data", value: 100 }],
        kpis: {
            rev: "₹0",
            leads: "0",
            conv: "0%",
            avg: "₹0"
        },
        products: [{ name: "No Data", sold: 0, target: 0, prod: 0 }],
        leaderboard: [{ name: "No Data", leads: 0, conversion: "0%", revenue: "₹0" }]
    },
    loading: false,
    error: null
};

// Async Thunks
export const fetchReportData = createAsyncThunk(
    "reports/fetchReportData",
    async (params: { range: string; startDate?: string; endDate?: string }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.token || localStorage.getItem("token");
            
            // Adjust URL based on your backend route
            let url = `${import.meta.env.VITE_API_BASE_URL}/sales/data?range=${params.range}`;
            if (params.range === "Custom" && params.startDate && params.endDate) {
                url += `&startDate=${params.startDate}&endDate=${params.endDate}`;
            }
            
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.data.success) {
                return response.data.data;
            } else {
                return rejectWithValue(response.data.message || "Failed to fetch report data");
            }
        } catch (error: any) {

        
            return rejectWithValue(error.response?.data?.message || "Error fetching report data");
        }
    }
);

export const exportReportCSV = createAsyncThunk(
    "reports/exportReportCSV",
    async (params: { range: string; startDate?: string; endDate?: string }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.token || localStorage.getItem("token");
            
            let url = `${import.meta.env.VITE_API_BASE_URL}/sales/export?range=${params.range}`;
            if (params.range === "Custom" && params.startDate && params.endDate) {
                url += `&startDate=${params.startDate}&endDate=${params.endDate}`;
            }
            
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            
            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' });
            const link = document.createElement('a');
            const url_ = window.URL.createObjectURL(blob);
            link.href = url_;
            link.setAttribute('download', `report_${params.range}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url_);
            
            Swal.fire({
                icon: 'success',
                title: 'Exported!',
                text: 'Report exported successfully',
                timer: 1500,
                showConfirmButton: false
            });
            
            return true;
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: error.response?.data?.message || "Error exporting report",
            });
            return rejectWithValue(error.response?.data?.message || "Error exporting report");
        }
    }
);

const reportSlice = createSlice({
    name: "reports",
    initialState,
    reducers: {
        clearReportErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Report Data
            .addCase(fetchReportData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReportData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchReportData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Export Report
            .addCase(exportReportCSV.pending, (state) => {
                state.loading = true;
            })
            .addCase(exportReportCSV.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(exportReportCSV.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearReportErrors } = reportSlice.actions;
export default reportSlice.reducer;