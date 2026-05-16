import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import { createPurchaseOrderEntry } from "../../ModuleStateFiles/PurchaseOrderSlice";
import {
    ChevronRight,
    Calendar,
    CheckCircle2,
} from "lucide-react";

const CreatePurchaseOrder: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { quotations } = useAppSelector((state) => state.vendorQuotations);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        rfq_ref: "",
        pr_ref: "",
        vendor_name: "",
        material_name: "",
        quantity: 0,
        unit_price: 0,
        tax_percentage: 18,
        delivery_date: "",
        payment_terms: "",
    });

    const steps = [
        { id: 1, title: "Bid Select" },
        { id: 2, title: "Logistics" },
        { id: 3, title: "Review" },
    ];

    // Auto-calculating Tax and Total
    const tax_amount =
        formData.quantity * formData.unit_price * (formData.tax_percentage / 100);
    const total_amount = formData.quantity * formData.unit_price + tax_amount;

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/purchase/purchase-orders")}
                        className="hover:text-[#F59E0B] font-medium"
                    >
                        Purchase Orders
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">New Order</span>
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight uppercase">
                    Issue Purchase Order
                </h1>

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
                            <CheckCircle2 className="text-[#F59E0B]" /> Select Accepted
                            Quotation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quotations
                                .filter((q) => q.status === "Accepted")
                                .map((q) => (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                rfq_ref: q.rfq_ref,
                                                vendor_name: q.vendor_name,
                                                material_name: q.material_name,
                                                unit_price: q.unit_price,
                                                quantity: 5000 /* should come from PR */,
                                                pr_ref: "PR-SYNC-01",
                                            });
                                            setCurrentStep(2);
                                        }}
                                        className="group text-left p-6 border border-slate-300 rounded-4xl hover:border-[#F59E0B] transition-all"
                                    >
                                        <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest">
                                            Bid: {q.quotation_id}
                                        </span>
                                        <h4 className="text-xl font-bold text-slate-800 mt-1">
                                            {q.vendor_name}
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                            Quoted: ₹{q.unit_price} for {q.material_name}
                                        </p>
                                    </button>
                                ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <Calendar className="text-[#F59E0B]" /> Logistics & Taxation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Target Delivery Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.delivery_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, delivery_date: e.target.value })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold focus:ring-4 focus:ring-amber-500/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Applicable Tax (%)
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
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="font-bold text-[#F59E0B] hover:text-rose-500 border rounded-xl px-4 py-2"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                disabled={!formData.delivery_date || !formData.tax_percentage}
                                className="outline-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                                style={!formData.delivery_date || !formData.tax_percentage ? { cursor: "not-allowed", opacity: 0.6 } : {}}
                            >
                                Review Contract
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in zoom-in-95">
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-2xl font-black text-slate-800 mb-2">
                                Purchase Order Summary
                            </h2>
                            <p className="text-slate-500 mb-10">
                                You are about to issue a formal Purchase Order to{" "}
                                <b>{formData.vendor_name}</b>.
                            </p>
                            <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] text-left grid grid-cols-2 gap-10 shadow-2xl mb-10">
                                <div>
                                    <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                        Base Amount
                                    </label>
                                    <p className="font-bold text-lg">
                                        ₹
                                        {(formData.quantity * formData.unit_price).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                        Tax ({formData.tax_percentage}%)
                                    </label>
                                    <p className="font-bold text-lg">
                                        ₹{tax_amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="col-span-2 border-t border-slate-700 pt-6 flex justify-between items-center">
                                    <span className="font-black text-xs uppercase tracking-widest">
                                        Grand Total (Net Amount)
                                    </span>
                                    <span className="text-3xl font-black text-amber-500">
                                        ₹{total_amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-6">
                                <button
                                    onClick={() =>
                                        dispatch(
                                            createPurchaseOrderEntry(
                                                { ...formData, tax_amount, total_amount },
                                                navigate,
                                            ),
                                        )
                                    }
                                    className="outline-none bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-2xl active:scale-95 transition-all"
                                >
                                    Issue Purchase Order
                                </button>
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="font-bold text-sm border rounded-xl text-[#F59E0B] px-4 py-2 hover:text-red-500 transition-colors"
                                >
                                    Modify
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatePurchaseOrder;
