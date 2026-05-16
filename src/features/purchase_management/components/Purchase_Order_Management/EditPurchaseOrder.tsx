import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
    getPurchaseOrderEntry,
    updatePOSuccess,
} from "../../ModuleStateFiles/PurchaseOrderSlice";
import {
    ChevronRight,
    FileText,
    Info,
    Calendar,
    Save,
    Activity,
    Percent,
} from "lucide-react";
import Swal from "sweetalert2";

const EditPurchaseOrder: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { po, loading } = useAppSelector((state) => state.purchaseOrders);

    const [formData, setFormData] = useState({
        tax_percentage: 0,
        delivery_date: "",
        status: "",
    });

    useEffect(() => {
        if (id) dispatch(getPurchaseOrderEntry(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (po) {
            setFormData({
                tax_percentage: po.tax_percentage,
                delivery_date: po.delivery_date,
                status: po.status,
            });
        }
    }, [po]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!po) return;

        // Recalculate Totals
        const base = po.quantity * po.unit_price;
        const tax_amount = base * (formData.tax_percentage / 100);
        const total_amount = base + tax_amount;

        const payload = {
            ...po,
            ...formData,
            tax_amount,
            total_amount,
            status: formData.status as
                | "Draft"
                | "Rejected"
                | "Approved"
                | "Completed"
                | "Pending Approval"
                | "Sent to Vendor",
        };

        dispatch(updatePOSuccess(payload));
        Swal.fire({
            icon: "success",
            title: "PO Updated",
            text: "Financials and logistics updated.",
            confirmButtonColor: "#F59E0B",
        });
        navigate("/purchase/purchase-orders");
    };

    if (!po)
        return (
            <div className="p-20 text-center font-bold text-slate-400">
                Loading Order Data...
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
                        Edit: {po.po_id}
                    </span>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
                    Modify PO Parameters
                </h1>

                <form
                    onSubmit={handleUpdate}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative h-fit overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Activity size={100} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                                <FileText size={14} /> Fixed Contract
                            </h3>
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400">
                                        Vendor
                                    </label>
                                    <p className="text-slate-800 font-black text-base">
                                        {po.vendor_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400">
                                        Material
                                    </label>
                                    <p className="text-slate-800 font-black text-base leading-tight">
                                        {po.material_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400">
                                        Base Unit Price
                                    </label>
                                    <p className="text-slate-800 font-black text-base">
                                        ₹{po.unit_price.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                                <div className="p-3 bg-orange-50 rounded-2xl">
                                    <Info className="text-[#F59E0B]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Logistics & Tax</h3>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Adjust delivery schedules and applicable taxes
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                        <Percent size={14} /> Tax Percentage (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.tax_percentage}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                tax_percentage: Number(e.target.value),
                                            })
                                        }
                                        min={0}
                                        className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-black text-slate-800 focus:ring-4 focus:ring-amber-500/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                        <Calendar size={14} /> Delivery Deadline
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                delivery_date: e.target.value,
                                            })
                                        }
                                        className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-8 items-center justify-between">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-[#F59E0B] mb-2 block">
                                        PO Workflow State
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value })
                                        }
                                        className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10  transition-all"
                                    >
                                        <option>Draft</option>
                                        <option>Pending Approval</option>
                                        <option>Approved</option>
                                        <option>Sent to Vendor</option>
                                    </select>
                                </div>
                                <div className="text-right">
                                    <span className="text-[13px] font-bold text-slate-400 uppercase mr-4">
                                        Estimated Total:
                                    </span>
                                    <span className="text-2xl font-black text-slate-800">
                                        ₹
                                        {(
                                            po.quantity *
                                            po.unit_price *
                                            (1 + formData.tax_percentage / 100)
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/purchase/purchase-orders")}
                                    className="outline-none px-4 py-2 text-sm font-bold text-slate-400 hover:text-red-500 transition-all flex items-center border rounded-xl"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="outline-none bg-[#F59E0B] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#f67317] transition-all flex items-center gap-1 shadow-xl shadow-orange-100 disabled:opacity-50"
                                >
                                    <Save size={18} /> Update
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPurchaseOrder;
