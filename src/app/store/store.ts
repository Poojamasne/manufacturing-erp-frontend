import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/ModuleStateFiles/AuthSlice";
import salesEmployeeReducer from "../../features/sales/ModuleStateFiles/EmployeeSlice";
import salesLeadReducer from "../../features/sales/ModuleStateFiles/LeadSlice";
import dashboardReducer from "../../features/sales/ModuleStateFiles/DashboardSlice";
import salesProductReducer from "../../features/sales/ModuleStateFiles/ProductSlice";
import opportunitiesReducer from "../../features/sales/ModuleStateFiles/OpportunitySlice";
import quotationReducer from "../../features/sales/ModuleStateFiles/QuotationSlice";
import orderReducer from "../../features/sales/ModuleStateFiles/OrderSlice";
import productionReducer from "../../features/sales/ModuleStateFiles/ProductionSlice";
import reportReducer from "../../features/sales/ModuleStateFiles/ReportSlice";
import inventoryMaterialReceiptReducer from "../../features/inventory/ModuleStateFiles/MaterialReceiptSlice";
import inventoryWarehouseReducer from "../../features/inventory/ModuleStateFiles/WarehouseSlice";
import inventoryMaterialIssueAndExecutionReducer from "../../features/inventory/ModuleStateFiles/MaterialIssueAndExecutionSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    SalesEmployee: salesEmployeeReducer,
    SalesLeads: salesLeadReducer,
    SalesDashboard: dashboardReducer,
    SalesProduct: salesProductReducer,
    SalesOpportunity: opportunitiesReducer,
    SalesQuotation: quotationReducer,
    SalesOrder: orderReducer,
    SalesProduction: productionReducer,
    SalesReport: reportReducer,
    inventoryMaterialReceipt: inventoryMaterialReceiptReducer,
    inventoryWarehouse: inventoryWarehouseReducer,
    inventoryMaterialIssueAndExecution:
      inventoryMaterialIssueAndExecutionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["inventory/bootstrap", "inventory/refresh"],
      },
    }),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
