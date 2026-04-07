import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../components/modules/sales/ModuleStateFiles/AuthSlice";
import salesEmployeeReducer from "../components/modules/sales/ModuleStateFiles/EmployeeSlice";
import salesLeadReducer from "../components/modules/sales/ModuleStateFiles/LeadSlice";
import dashboardReducer from "../components/modules/sales/ModuleStateFiles/DashboardSlice";
import SalesProductReducer from "../components/modules/sales/ModuleStateFiles/ProductSlice";
import OpportunitiesReducer from "../components/modules/sales/ModuleStateFiles/OpportunitySlice";
const store = configureStore({
    reducer: {
        // global Login reducer
        auth: authReducer,
        // sales module reducers
        SalesEmployee: salesEmployeeReducer,
        SalesLeads: salesLeadReducer,
        SalesDashboard: dashboardReducer,
        SalesProduct: SalesProductReducer,
        SalesOpportunity: OpportunitiesReducer,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;