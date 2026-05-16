import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import { createQuotationEntry } from "../../ModuleStateFiles/VendorQuotationSlice";
import {
    ChevronRight,
    Truck,
    FileText,
    CheckCircle2,
    ArrowRight,
    IndianRupee,
} from "lucide-react";

const CreateQuotation: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { rfqs } = useAppSelector((state) => state.rfqManagement);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        rfq_ref: "",
        vendor_name: "",
        material_name: "",
        unit_price: 0,
        delivery_lead_time: 0,
        payment_terms: "",
        validity_date: "",
    });

    const steps = [
        { id: 1, title: "Sourcing" },
        { id: 2, title: "Pricing" },
        { id: 3, title: "Review" },
    ];

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/purchase/vendor-quotations")}
                        className="hover:text-[#F59E0B] font-medium"
                    >
                        Bids & Quotations
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold tracking-tight">
                        Record Bid
                    </span>
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
                    New Quotation Entry
                </h1>

                <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    {steps.map((step) => (
                        <React.Fragment key={step.id}>
                            <div
                                className={`flex items-center gap-3 ${currentStep >= step.id ? "cursor-pointer" : "cursor-not-allowed"}`}
                                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step.id ? "bg-[#F59E0B] text-white" : "bg-slate-100 text-slate-400"}`}
                                >
                                    {step.id}
                                </div>
                                <span
                                    className={`text-xs font-black uppercase tracking-widest ${currentStep >= step.id ? "text-slate-800" : "text-slate-400"}`}
                                >
                                    {step.title}
                                </span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {currentStep === 1 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <FileText className="text-[#F59E0B]" /> Sourcing Reference
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Link Source RFQ
                                </label>
                                <select
                                    value={formData.rfq_ref}
                                    onChange={(e) => {
                                        const rfq = rfqs.find((r) => r.rfq_id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            rfq_ref: e.target.value,
                                            material_name: rfq?.material_name || "",
                                        });
                                    }}
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold"
                                >
                                    <option value="">Select RFQ Reference...</option>
                                    {rfqs.map((r) => (
                                        <option key={r.id} value={r.rfq_id}>
                                            {r.rfq_id} ({r.material_name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Supplier Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.vendor_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, vendor_name: e.target.value })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold"
                                    placeholder="Official Company Name"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-10">
                            <button
                                onClick={() => setCurrentStep(2)}
                                disabled={!formData.rfq_ref || !formData.vendor_name}
                                className="outline-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl flex items-center gap-1 active:scale-95 transition-all"
                                style={!formData.rfq_ref || !formData.vendor_name ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                            >
                                Terms <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <IndianRupee className="text-[#F59E0B]" /> Commercials & Timeline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Unit Price (₹)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={formData.unit_price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            unit_price: Number(e.target.value),
                                        })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Delivery Lead Time(Days)
                                </label>
                                <input
                                    type="number"
                                    value={formData.delivery_lead_time}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            delivery_lead_time: Number(e.target.value),
                                        })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold"
                                    placeholder="e.g. 5 Days"
                                    min={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Bid Validity
                                </label>
                                <input
                                    type="date"
                                    value={formData.validity_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, validity_date: e.target.value })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Payment Terms
                                </label>

                                <select
                                    value={formData.payment_terms}
                                    onChange={(e) =>
                                        setFormData({ ...formData, payment_terms: e.target.value })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700"
                                >
                                    <option value="">Select Payment Terms</option>
                                    <option value="Net 15">Net 15</option>
                                    <option value="Net 30">Net 30</option>
                                    <option value="Net 45">Net 45</option>
                                    <option value="Net 60">Net 60</option>
                                    <option value="Advance">Advance</option>
                                    <option value="50% Advance">50% Advance</option>
                                    <option value="Cash on Delivery">Cash on Delivery</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-10">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="outline-none font-bold text-[#F59E0B] border border-[#F59E0B] px-4 py-2 rounded-xl hover:text-rose-500 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                disabled={!formData.unit_price || !formData.delivery_lead_time || !formData.validity_date || !formData.payment_terms}
                                onClick={() => setCurrentStep(3)}
                                className="outline-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl"
                                style={!formData.unit_price || !formData.delivery_lead_time || !formData.validity_date || !formData.payment_terms ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                            >
                                Review
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
                            Record Submission
                        </h2>
                        <p className="text-slate-500 mb-10">
                            Record quotation for <b>{formData.material_name}</b> from supplier{" "}
                            <b>{formData.vendor_name}</b>.
                        </p>
                        <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100 mb-10 text-left grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 block">
                                    Quoted Price
                                </label>
                                <p className="font-black text-slate-900 text-2xl">
                                    ₹{formData.unit_price.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 block">
                                    Expected Delivery
                                </label>
                                <p className="font-black text-slate-800 text-lg flex items-center gap-2">
                                    <Truck size={18} className="text-[#F59E0B]" />{" "}
                                    {formData.delivery_lead_time}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6">
                            <button
                                onClick={() =>
                                    dispatch(createQuotationEntry(formData, navigate))
                                }
                                className="outline-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-2xl active:scale-95 transition-all"
                            >
                                Confirm Bid
                            </button>
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="outline-none font-bold text-sm text-[#F59E0B] px-4 py-2 hover:text-red-500 border rounded-xl transition-colors"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateQuotation;
