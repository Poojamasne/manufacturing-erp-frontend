import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import { createRFQEntry } from "../../ModuleStateFiles/RFQManagementSlice";
import {
    ChevronRight,
    FileText,
    Users,
    Tag,
    CheckCircle2,
    ArrowRight,
    // Package,
    // Calendar,
} from "lucide-react";

const CreateRFQ: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { purchaseRequests } = useAppSelector(
        (state) => state.purchaseRequests,
    );
    const { vendors } = useAppSelector((state) => state.vendorManagement);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        pr_ref: "",
        material_name: "",
        quantity: 0,
        unit: "",
        vendors: [] as any[],
        deadline: "",
    });

    const steps = [
        { id: 1, title: "Source" },
        { id: 2, title: "Vendors" },
        { id: 3, title: "Terms" },
        { id: 4, title: "Finalize" },
    ];

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/purchase/rfqs")}
                        className="hover:text-[#F59E0B] font-medium"
                    >
                        RFQ Management
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold tracking-tight">
                        Generate RFQ
                    </span>
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
                    New RFQ Wizard
                </h1>

                <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div
                                className={`flex items-center gap-3 ${currentStep >= step.id ? "cursor-pointer" : "cursor-not-allowed"}`}
                                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep >= step.id ? "bg-[#F59E0B] text-white shadow-lg" : "bg-slate-100 text-slate-400"}`}
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

                {currentStep === 1 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <FileText className="text-[#F59E0B]" /> Select Approved Source
                            (PR)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {purchaseRequests
                                .filter((pr) => pr.status === "Approved")
                                .map((pr) => (
                                    <button
                                        key={pr.id}
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                pr_ref: pr.pr_id,
                                                material_name: pr.material_name,
                                                quantity: pr.quantity,
                                                unit: pr.unit,
                                            });
                                            setCurrentStep(2);
                                        }}
                                        className="outline-none group text-left p-6 border border-slate-300 rounded-4xl hover:border-[#F59E0B] transition-all relative overflow-hidden"
                                    >
                                        <span className="text-[12px] font-black text-[#F59E0B] uppercase tracking-widest">
                                            {pr.pr_id}
                                        </span>
                                        <h4 className="text-xl font-bold text-slate-800 mt-1">
                                            {pr.material_name}
                                        </h4>
                                        <p className="text-[18px] text-slate-500 italic">
                                            Qty: {pr.quantity} {pr.unit}
                                        </p>
                                        <ArrowRight className="absolute bottom-6 right-6 text-slate-200 group-hover:text-[#F59E0B] group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <Users className="text-[#F59E0B]" /> Multi-Vendor Invitation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            {vendors
                                .filter((v) => v.status === "Active")
                                .map((v) => (
                                    <label
                                        key={v.id}
                                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${formData.vendors.find((sv) => sv.id === v.id) ? "border-[#F59E0B] bg-orange-50 shadow-lg shadow-orange-100" : "border-slate-100 hover:border-slate-300"}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 text-sm">
                                                {v.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                {v.category}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                                            onChange={(e) => {
                                                if (e.target.checked)
                                                    setFormData({
                                                        ...formData,
                                                        vendors: [
                                                            ...formData.vendors,
                                                            { id: v.id, name: v.name, status: "Awaiting" },
                                                        ],
                                                    });
                                                else
                                                    setFormData({
                                                        ...formData,
                                                        vendors: formData.vendors.filter(
                                                            (sv) => sv.id !== v.id,
                                                        ),
                                                    });
                                            }}
                                            checked={!!formData.vendors.find((sv) => sv.id === v.id)}
                                        />
                                    </label>
                                ))}
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="outline-none font-bold text-[#F59E0B] hover:text-rose-500 text-sm border px-4 py-2 rounded-xl transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                disabled={formData.vendors.length === 0}
                                className="outline-none bg-slate-900 disabled:opacity-30 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl"
                            >
                                Define Deadline
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <Tag className="text-[#F59E0B]" /> Sourcing Timeline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Response Deadline
                                </label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) =>
                                        setFormData({ ...formData, deadline: e.target.value })
                                    }
                                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold focus:ring-4 focus:ring-amber-500/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Material Specification
                                </label>
                                <div className="bg-slate-100 px-6 py-4 rounded-3xl font-black text-slate-400 border border-slate-100">
                                    {formData.material_name} ({formData.quantity} {formData.unit})
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="outline-none text-sm font-bold text-[#F59E0B] border hover:border-amber-300 px-4 py-2 rounded-xl transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep(4)}
                                disabled={!formData.deadline}
                                className={`${formData.deadline ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-400'} outline-none text-white px-4 py-2 rounded-xl font-bold text-sm`}
                            >
                                Review RFQ
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in zoom-in-95 text-center">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F59E0B]">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">
                            Review & Submit
                        </h2>
                        <p className="text-slate-500 mb-10">
                            The RFQ will be Generated for <b>{formData.material_name}</b> {" "}
                            for the <b>{formData.vendors.length} vendors</b>.
                        </p>
                        <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100 mb-10 text-left grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase">
                                    Linked PR
                                </label>
                                <p className="font-bold">{formData.pr_ref}</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase">
                                    Vendors Invited
                                </label>
                                <p className="font-bold">
                                    {formData.vendors.map((v) => v.name).join(", ")}
                                </p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase">
                                    Deadline
                                </label>
                                <p className="font-bold">{formData.deadline}</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6">
                            <button
                                onClick={() => dispatch(createRFQEntry(formData, navigate))}
                                className="outline-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-2xl active:scale-95 transition-all"
                            >
                                Submit RFQ
                            </button>
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="outline-none font-bold text-sm text-[#F59E0B] px-4 py-2 hover:text-red-500 border rounded-xl transition-all"
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

export default CreateRFQ;
