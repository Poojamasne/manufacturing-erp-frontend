import React, { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
    getPurchaseOrderEntry,
    exportPOToPDF,
    updatePOSuccess,
    deletePurchaseOrderEntry,
} from "../../ModuleStateFiles/PurchaseOrderSlice";
import {
    ChevronRight,
    Package,
    FileText,
    Printer,
    Activity,
    CheckCircle2,
    XCircle,
    Edit,
    IndianRupeeIcon,
    IndianRupee,
    Trash2,
} from "lucide-react";

const ViewPurchaseOrder: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { po, loading } = useAppSelector((state) => state.purchaseOrders);

    useEffect(() => {
        if (id) dispatch(getPurchaseOrderEntry(id));
    }, [id, dispatch]);

    const handleStatusUpdate = (newStatus: any) => {
        if (po) dispatch(updatePOSuccess({ ...po, status: newStatus }));
    };

    if (loading || !po)
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] font-bold text-slate-400">
                Loading Order...
            </div>
        );

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/purchase/purchase-orders")}
                        className="outline-none hover:text-[#F59E0B] font-medium"
                    >
                        Purchase Orders
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold tracking-tight">
                        {po.po_id}
                    </span>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            Purchase Order
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Legal procurement contract and scheduling
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => dispatch(deletePurchaseOrderEntry(po.id))}
                            className="outline-none flex items-center gap-1 px-4 py-2 rounded-xl text-[#F59E0B] border font-bold text-sm hover:text-rose-500 transition-all active:scale-95"
                        >
                            <Trash2 size={18} className="" /> Delete
                        </button>
                        <Link
                            to={`/purchase/purchase-orders/edit-purchase-order/${po.id}`}
                            className="outline-none flex items-center gap-1 px-4 py-2 bg-[#F59E0B] text-white rounded-xl font-bold text-sm shadow-xl shadow-orange-100 transition-all hover:bg-[#f67317]"
                        >
                            <Edit size={18} /> Edit
                        </Link>
                        <button
                            onClick={() => dispatch(exportPOToPDF(po.id))}
                            className="outline-none flex items-center gap-1 px-4 py-2 rounded-xl bg-[#f67317] text-white font-bold text-sm hover:bg-amber-500 transition-all shadow-lg active:scale-95"
                        >
                            <Printer size={18} className="" /> Export PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Context */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden h-fit">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <FileText size={120} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                                <Package size={14} /> Contract Context
                            </h3>
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Supplier
                                    </label>
                                    <p className="text-slate-800 font-black text-base leading-tight">
                                        {po.vendor_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Material Description
                                    </label>
                                    <p className="text-slate-800 font-black text-base leading-tight">
                                        {po.material_name}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                            RFQ Ref
                                        </label>
                                        <p className="text-slate-700 font-bold text-sm">
                                            {po.rfq_ref}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                            PR Ref
                                        </label>
                                        <p className="text-slate-700 font-bold text-sm">
                                            {po.pr_ref}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Parameters & Approval */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                            {/* Financial Section */}
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                                <div className="p-3 bg-orange-50 rounded-2xl">
                                    <IndianRupeeIcon className="text-[#F59E0B]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Financial Summary</h3>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Billed amount and taxation breakdown
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                        <IndianRupee size={14} /> Unit Price
                                    </label>
                                    <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800 text-lg">
                                        ₹{po.unit_price.toLocaleString()}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                        <Activity size={14} /> Total Qty
                                    </label>
                                    <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800 text-lg">
                                        {po.quantity.toLocaleString()} Units
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-8 rounded-4xl flex justify-between items-center shadow-2xl mb-10">
                                <div>
                                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 block">
                                        Grand Total (Incl. {po.tax_percentage}% Tax)
                                    </label>
                                    <p className="text-3xl font-black">
                                        ₹{po.total_amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                                        Expected Delivery
                                    </label>
                                    <p className="font-bold text-lg">{po.delivery_date}</p>
                                </div>
                            </div>

                            {/* Approval Workflow (SRS 3.7.3) */}
                            <div className="pt-10 border-t border-slate-50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] flex items-center gap-1.5 mb-6">
                                    <Activity size={14} /> Approval Workflow Status
                                </label>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-3 h-3 rounded-full animate-pulse ${po.status === "Approved" ? "bg-emerald-500" : "bg-amber-500"}`}
                                        ></div>
                                        <span className="font-black text-sm uppercase tracking-widest text-slate-700">
                                            {po.status}
                                        </span>
                                    </div>

                                    {po.status === "Pending Approval" && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate("Rejected")}
                                                className="outline-none flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-50 transition-all"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate("Approved")}
                                                className="outline-none flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                                            >
                                                <CheckCircle2 size={16} /> Approve Order
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* <div className="mt-12 flex justify-end">
                <button onClick={() => navigate("/purchase/purchase-orders")} className="outline-none px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"><ArrowLeft size={18} /> Back to Directory</button>
              </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPurchaseOrder;
