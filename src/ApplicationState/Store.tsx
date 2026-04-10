import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../components/modules/sales/ModuleStateFiles/AuthSlice";
import salesEmployeeReducer from "../components/modules/sales/ModuleStateFiles/EmployeeSlice";
import salesLeadReducer from "../components/modules/sales/ModuleStateFiles/LeadSlice";
import dashboardReducer from "../components/modules/sales/ModuleStateFiles/DashboardSlice";
import SalesProductReducer from "../components/modules/sales/ModuleStateFiles/ProductSlice";
import OpportunitiesReducer from "../components/modules/sales/ModuleStateFiles/OpportunitySlice";
import QuotationReducer from "../components/modules/sales/ModuleStateFiles/QuotationSlice";
import OrderReducer from "../components/modules/sales/ModuleStateFiles/OrderSlice";
import ProductionReducer from "../components/modules/sales/ModuleStateFiles/ProductionSlice";
import ReportReducer from "../components/modules/sales/ModuleStateFiles/ReportSlice";

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
        SalesQuotation: QuotationReducer,
        SalesOrder: OrderReducer,
        SalesProduction: ProductionReducer,
        SalesReport: ReportReducer, 
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;