import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

import ProtectedRoute from "../../features/auth/ProtectedRoute";
import InventoryLayout from "../../features/purchase_management/layout/PurchaseManagerLayout";
import { withSuspense } from "./routeUtils";
import CreatePurchaseRequest from "../../features/purchase_management/components/Purchase_Request_Management/CreatePurchaseRequest";
import PurchaseRequestList from "../../features/purchase_management/components/Purchase_Request_Management/PurchaseRequestList";
import EditPurchaseRequest from "../../features/purchase_management/components/Purchase_Request_Management/EditPurchaseRequest";
import ViewPurchaseRequest from "../../features/purchase_management/components/Purchase_Request_Management/ViewPurchaseRequest";
import VendorList from "../../features/purchase_management/components/VendorManagement/VendorList";
import CreateVendor from "../../features/purchase_management/components/VendorManagement/CreateVendor";
import ViewVendor from "../../features/purchase_management/components/VendorManagement/ViewVendor";
import EditVendor from "../../features/purchase_management/components/VendorManagement/EditVendor";

// RFQ Components
import RFQList from "../../features/purchase_management/components/RFQ_Management/RFQList";
import CreateRFQ from "../../features/purchase_management/components/RFQ_Management/CreateRFQ";
import EditRFQ from "../../features/purchase_management/components/RFQ_Management/EditRFQ";
import ViewRFQ from "../../features/purchase_management/components/RFQ_Management/ViewRFQ";
import ViewQuotation from "../../features/purchase_management/components/Vendor_Quotation_Management/ViewQuotation";
import QuotationList from "../../features/purchase_management/components/Vendor_Quotation_Management/VendorQuotationList";
import CreateQuotation from "../../features/purchase_management/components/Vendor_Quotation_Management/CreateQuotation";
import EditQuotation from "../../features/purchase_management/components/Vendor_Quotation_Management/EditVendorQuotation";
import PurchaseOrderList from "../../features/purchase_management/components/Purchase_Order_Management/PurchaseOrderList";
import ViewPurchaseOrder from "../../features/purchase_management/components/Purchase_Order_Management/ViewPurchaseOrder";
import EditPurchaseOrder from "../../features/purchase_management/components/Purchase_Order_Management/EditPurchaseOrder";
import CreatePurchaseOrder from "../../features/purchase_management/components/Purchase_Order_Management/CreatePurchaseOrder";
import GoodsReceiptList from "../../features/purchase_management/components/GRN(Goods_Receipt_Note)/GoodsReceiptList";
import CreateGRN from "../../features/purchase_management/components/GRN(Goods_Receipt_Note)/CreateGRN";
import EditGRN from "../../features/purchase_management/components/GRN(Goods_Receipt_Note)/EditGRN";
import ViewGRN from "../../features/purchase_management/components/GRN(Goods_Receipt_Note)/ViewGRN";
import QCVerification from "../../features/purchase_management/components/GRN(Goods_Receipt_Note)/QCVerification";

const PurchaseDashboard = lazy(
  () => import("../../features/purchase_management/components/Dashboard/Dashboard")
);
const PurchaseNotes = lazy(
  () => import("../../features/purchase_management/pages/NotesPage")
);

export const purchaseRoutes: RouteObject[] = [
  {
    path: "/purchase",
    element: <ProtectedRoute requiredRole={["Purchase Manager", "purchase_manager", "Admin"]} />,
    children: [
      {
        element: <InventoryLayout />,
        children: [
          { index: true, element: withSuspense(<PurchaseDashboard />) },
          { path: "dashboard", element: withSuspense(<PurchaseDashboard />) },

          // Purchase Request Routes
          { path: "purchase-requests", element: withSuspense(<PurchaseRequestList />) },
          { path: "purchase-requests/create-purchase-request", element: withSuspense(<CreatePurchaseRequest />) },
          { path: "purchase-requests/edit-purchase-request/:id", element: withSuspense(<EditPurchaseRequest />) },
          { path: "purchase-requests/view-purchase-request/:id", element: withSuspense(<ViewPurchaseRequest />) },

          // Vendor Management Routes
          { path: "vendors", element: withSuspense(<VendorList />) },
          { path: "vendors/create-vendor", element: withSuspense(<CreateVendor />) },
          { path: "vendors/view-vendor/:id", element: withSuspense(<ViewVendor />) },
          { path: "vendors/edit-vendor/:id", element: withSuspense(<EditVendor />) },

          // RFQ Routes
          { path: "rfqs", element: withSuspense(<RFQList />) },
          { path: "rfqs/create-rfq", element: withSuspense(<CreateRFQ />) },
          { path: "rfqs/edit-rfq/:id", element: withSuspense(<EditRFQ />) },
          { path: "rfqs/view-rfq/:id", element: withSuspense(<ViewRFQ />) },

          // Vendor Quotation Routes
          { path: "vendor-quotations", element: withSuspense(<QuotationList />) },
          { path: "vendor-quotations/create-vendor-quotation", element: withSuspense(<CreateQuotation />) },
          { path: "vendor-quotations/edit-vendor-quotation/:id", element: withSuspense(<EditQuotation />) },
          { path: "vendor-quotations/view-vendor-quotation/:id", element: withSuspense(<ViewQuotation />) },

          // Purchase Order Routes
          { path: "purchase-orders", element: withSuspense(<PurchaseOrderList />) },
          { path: "purchase-orders/create-purchase-order", element: withSuspense(<CreatePurchaseOrder />) },
          { path: "purchase-orders/edit-purchase-order/:id", element: withSuspense(<EditPurchaseOrder />) },
          { path: "purchase-orders/view-purchase-order/:id", element: withSuspense(<ViewPurchaseOrder />) },


          // Goods Receipt Routes
          { path: "goods-receipts", element: withSuspense(<GoodsReceiptList />) },
          { path: "goods-receipts/create-goods-receipt", element: withSuspense(<CreateGRN />) },
          { path: "goods-receipts/edit-goods-receipt/:id", element: withSuspense(<EditGRN />) },
          { path: "goods-receipts/view-goods-receipt/:id", element: withSuspense(<ViewGRN />) },
          { path: "goods-receipts/qc-check/:id", element: withSuspense(<QCVerification />) },

          { path: "notes", element: withSuspense(<PurchaseNotes />) },
        ],
      },
    ],
  },
];