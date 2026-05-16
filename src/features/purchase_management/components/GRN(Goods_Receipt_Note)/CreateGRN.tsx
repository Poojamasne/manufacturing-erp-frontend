import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import { createGoodsReceiptEntry } from "../../ModuleStateFiles/GoodsReceiptSlice";
import {
    ChevronRight,
    Truck,
    Package,
    CheckCircle2,
 
} from "lucide-react";

const CreateGRN: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { pos } = useAppSelector((state) => state.purchaseOrders);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        po_ref: "",
        material_name: "",
        material_code: "",
        supplier_name: "",
        quantity_ordered: 0,
        quantity_received: 0,
        batch_number: "",
        received_date: new Date().toISOString().split("T")[0],
        warehouse_location: "",
        received_by: "Store User",
    });

    const steps = [
        { id: 1, title: "PO Link" },
        { id: 2, title: "Receipt Info" },
        { id: 3, title: "Log Inward" },
    ];

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/purchase/goods-receipts")}
                        className="outline-none hover:text-[#F59E0B] font-medium"
                    >
                        Goods Receipts
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">New Entry</span>
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight uppercase">
                    Generate GRN
                </h1>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center gap-3 ${currentStep >= step.id ? "text-slate-800" : "text-slate-400"}`}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step.id ? "bg-[#F59E0B] text-white" : "bg-slate-100"}`}
                            >
                                {step.id}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                {currentStep === 1 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <Truck className="text-[#F59E0B]" /> Select Origin PO
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pos
                                .filter(
                                    (p) =>
                                        p.status === "Approved" || p.status === "Sent to Vendor",
                                )
                                .map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                po_ref: p.po_id,
                                                material_name: p.material_name,
                                                material_code: "N/A",
                                                supplier_name: p.vendor_name,
                                                quantity_ordered: p.quantity,
                                            });
                                            setCurrentStep(2);
                                        }}
                                        className="group text-left p-6 border border-slate-300 rounded-4xl hover:border-[#F59E0B] transition-all"
                                    >
                                        <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest">
                                            {p.po_id}
                                        </span>
                                        <h4 className="text-xl font-bold text-slate-800 mt-1">
                                            {p.vendor_name}
                                        </h4>
                                        <p className="text-sm text-slate-500 italic">
                                            Expecting: {p.quantity} Units of {p.material_name}
                                        </p>
                                    </button>
                                ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <Package className="text-[#F59E0B]" /> Receipt Specifications
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400">
                                    Qty Received
                                </label>
                                <input
                                    type="number"
                                    value={formData.quantity_received}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            quantity_received: Number(e.target.value),
                                        })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-black text-slate-800 focus:ring-4 focus:ring-amber-500/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400">
                                    Batch / Lot Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.batch_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, batch_number: e.target.value })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10"
                                    placeholder="e.g. BT-2024-X"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400">
                                    Warehouse Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.warehouse_location}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            warehouse_location: e.target.value,
                                        })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700"
                                    placeholder="e.g. Rack A-1"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="font-bold text-sm text-[#F59E0B] hover:text-rose-500 rounded-xl px-4 py-2 border"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                disabled={!formData.quantity_received || !formData.batch_number}
                                className="outline-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                            >
                                Review Log
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in zoom-in-95 text-center">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F59E0B]">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">
                            Finalize Material Receipt
                        </h2>
                        <p className="text-slate-500 mb-10">
                            Logging inward of <b>{formData.quantity_received} units</b> from{" "}
                            <b>{formData.supplier_name}</b>.
                        </p>
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase">
                                    PO Ref
                                </label>
                                <p className="font-bold">{formData.po_ref}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase">
                                    Material
                                </label>
                                <p className="font-bold leading-tight">
                                    {formData.material_name}
                                </p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase">
                                    Batch
                                </label>
                                <p className="font-bold">{formData.batch_number}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase">
                                    Warehouse
                                </label>
                                <p className="font-bold">{formData.warehouse_location}</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6">
                            <button
                                onClick={() =>
                                    dispatch(createGoodsReceiptEntry(formData, navigate))
                                }
                                className="outline-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-black text-sm shadow-2xl active:scale-95 transition-all"
                            >
                                Register Inward
                            </button>
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="font-bold text-sm text-[#F59E0B] px-4 py-2 border rounded-xl hover:text-red-500 transition-colors"
                            >
                                Modify Specs
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateGRN;
