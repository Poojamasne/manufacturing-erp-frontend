import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import { createVendorEntry } from "../../ModuleStateFiles/VendorManagementSlice";
import {
    ChevronRight,
    Building2,
    //   User,
    Mail,
    //   Phone,
    //   MapPin,
    Star,
    Tag,
    CheckCircle2,
    ArrowRight,
    //   Info,
    //   Search,
} from "lucide-react";

const CreateVendor: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.vendorManagement);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        category: "Raw Materials",
        rating: 5,
        supplied_materials: [] as string[],
    });

    const steps = [
        { id: 1, title: "Identity" },
        { id: 2, title: "Contact" },
        { id: 3, title: "Mapping" },
        { id: 4, title: "Finalize" },
    ];

    const handleFinish = () => {
        dispatch(createVendorEntry(formData, navigate));
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/purchase/vendors")}
                        className="hover:text-[#F59E0B] transition-colors font-medium"
                    >
                        Vendor Management
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">New Vendor Onboarding</span>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
                    Register Supplier
                </h1>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div
                                className={`flex items-center gap-3 ${currentStep >= step.id ? "cursor-pointer" : "cursor-not-allowed"}`}
                                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep >= step.id
                                        ? "bg-[#F59E0B] text-white shadow-lg shadow-orange-200"
                                        : "bg-slate-100 text-slate-400"
                                        }`}
                                >
                                    {step.id}
                                </div>
                                <span
                                    className={`text-xs font-black uppercase tracking-widest ${currentStep >= step.id ? "text-slate-800" : "text-slate-400"}`}
                                >
                                    {step.title}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="h-px bg-slate-100 flex-1 mx-4" />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Basic Identity */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <Building2 className="text-[#F59E0B]" /> Corporate Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Vendor / Company Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
                                    placeholder="e.g. Tata Steel Ltd"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Primary Contact Person
                                </label>
                                <input
                                    type="text"
                                    value={formData.contact_person}
                                    onChange={(e) =>
                                        setFormData({ ...formData, contact_person: e.target.value })
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
                                    placeholder="Full Name"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-10">
                            <button
                                onClick={() => setCurrentStep(2)}
                                disabled={!formData.name || !formData.contact_person}
                                className="outline-none bg-slate-900 disabled:opacity-30 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2"
                            >
                                Contact Details <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Contact Info */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <Mail className="text-[#F59E0B]" /> Communication Channels
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
                                    placeholder="sales@company.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
                                    placeholder="+91"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Registered Office Address
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 h-32 resize-none"
                                placeholder="Full business address..."
                            />
                        </div>
                        <div className="flex justify-end gap-4 mt-10">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="px-4 py-2 rounded-xl font-bold text-[#F59E0B] border hover:text-rose-500 "
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                disabled={!formData.email || !formData.phone || !formData.address}
                                className="outline-none bg-slate-900 disabled:opacity-30 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl"
                            >
                                Category & Rating
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Mapping */}
                {currentStep === 3 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <Tag className="text-[#F59E0B]" /> Categorization
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-30">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Industry Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
                                >
                                    <option>Raw Materials</option>
                                    <option>Hardware</option>
                                    <option>Chemicals</option>
                                    <option>Logistics</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Initial Rating
                                </label>
                                <div className="flex gap-4 bg-slate-50 px-4 py-4 rounded-xl border border-slate-200">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="outline-none"
                                        >
                                            <Star
                                                size={24}
                                                className={
                                                    star <= formData.rating
                                                        ? "fill-[#F59E0B] text-[#F59E0B]"
                                                        : "text-slate-300"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-10">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="px-4 py-2 rounded-xl font-bold text-[#F59E0B] border hover:text-rose-500 text-sm"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep(4)}
                                disabled={!formData.category || !formData.rating}
                                className="outline-none bg-slate-900 disabled:opacity-30 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm"
                            >
                                Review
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Finalize */}
                {currentStep === 4 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm text-center animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F59E0B] animate-pulse">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">
                            Review Supplier Profile
                        </h2>
                        <p className="text-slate-500 mb-10 max-w-lg mx-auto">
                            Confirm all vendor details. Once onboarded, the supplier will be
                            available for RFQ and Purchase Order processes.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left bg-slate-50 p-8 rounded-4xl border border-slate-100 mb-10">
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400">
                                    Vendor
                                </label>
                                <p className="font-bold text-sm">{formData.name}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400">
                                    Contact
                                </label>
                                <p className="font-bold text-sm">{formData.contact_person}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400">
                                    Category
                                </label>
                                <p className="font-bold text-sm">{formData.category}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400">
                                    Rating
                                </label>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={10}
                                            className={
                                                i < formData.rating
                                                    ? "fill-[#F59E0B] text-[#F59E0B]"
                                                    : "text-slate-200"
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-6">
                            <button
                                onClick={handleFinish}
                                disabled={loading}
                                className="outline-none bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-2xl disabled:opacity-50"
                            >
                                {loading ? "Registering..." : "Onboard Vendor"}
                            </button>
                            <button
                                onClick={() => navigate("/purchase/vendors")}
                                className="font-bold text-sm text-[#F59E0B] hover:text-red-500 border hover:border-red-500 py-2 px-4 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateVendor;
