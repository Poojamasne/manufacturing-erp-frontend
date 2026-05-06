import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronRight,
    Save,
    Loader2,
    Package,
    ClipboardCheck,
    Database,
    CheckCircle2,
    User,
    Calendar,
    AlertTriangle,
    Info,
    RefreshCw,
} from "lucide-react";

// ==================== Types & Mock Data ====================
interface RawMaterial {
    id: string;
    materialName: string;
    requiredPerUnit: number;
    availableQuantity: number;
}

interface ProductionPlan {
    id: string;
    planId: string;
    salesOrderId: string;
    customerName: string;
    productName: string;
    quantityRequired: number;
    deliveryDate: string;
    status: string;
}

const mockBOMs: Record<string, RawMaterial[]> = {
    "Heavy Duty Gearbox": [
        { id: "RM-101", materialName: "Steel Casing", requiredPerUnit: 1, availableQuantity: 60 },
        { id: "RM-102", materialName: "Internal Gears", requiredPerUnit: 4, availableQuantity: 150 },
        { id: "RM-103", materialName: "Lubricant Oil", requiredPerUnit: 2, availableQuantity: 500 },
    ],
};

const EditProductionPlan: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Plan ID from URL
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Initial Plan Data State (Pre-filled)
    const [planData, setPlanData] = useState<ProductionPlan>({
        id: "1",
        planId: "PLN-9901",
        salesOrderId: "SO-2026-001",
        customerName: "Indus Tech Solutions",
        productName: "Heavy Duty Gearbox",
        quantityRequired: 50,
        deliveryDate: "2026-06-15",
        status: "DRAFT",
    });


    // Step 3 Logic: Re-calculate BOM based on EDITED quantity
    const bomAnalysis = useMemo(() => {
        const materials = mockBOMs[planData.productName] || [];
        return materials.map(m => {
            const required = m.requiredPerUnit * planData.quantityRequired;
            return {
                ...m,
                requiredQuantity: required,
                shortage: Math.max(0, required - m.availableQuantity),
                status: m.availableQuantity >= required ? "Sufficient" : "Shortage"
            };
        });
    }, [planData.quantityRequired, planData.productName]);

    const isMaterialAvailable = bomAnalysis.every(item => item.status === "Sufficient");

    const handleUpdate = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert(`Production Plan ${planData.planId} Updated Successfully!`);
            navigate("/production/planning/view-plan/" + (planData.id || id));
        }, 1500);
    };
    const handleUpdatePR = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert(`Purchase Request Submitted Successfully!`);
            navigate("/production/planning");
        }, 1500);
    };

    const steps = [
        { id: 1, title: "Review Details" },
        { id: 2, title: "Modify Plan" },
        { id: 3, title: "BOM & Inventory Check" },
        { id: 4, title: "Finalize" },
    ];

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* Breadcrumbs Navigation */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/production/planning")}
                        className="hover:text-[#F59E0B] transition-colors font-medium"
                    >
                        Production planning
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">Edit Production Plan</span>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Plan</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{planData.planId} • {planData.salesOrderId}</p>
                    </div>

                </div>

                {/* Step Progress Bar */}
                <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div className={`flex items-center gap-3 ${currentStep >= step.id ? "cursor-pointer" : "cursor-not-allowed"}`} 
                            onClick={() => {
                                if (currentStep > step.id) {
                                    setCurrentStep(step.id);
                                }
                            }}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep >= step.id ? "bg-[#F59E0B] text-white shadow-lg shadow-orange-200" : "bg-slate-100 text-slate-400"
                                    }`}>
                                    {step.id}
                                </div>
                                <span className={`text-xs font-black uppercase tracking-widest ${currentStep >= step.id ? "text-slate-800" : "text-slate-400"}`}>
                                    {step.title}
                                </span>
                            </div>
                            {idx < steps.length - 1 && <div className="h-px bg-slate-100 flex-1 mx-4" />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Review Original Details */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-8">
                            <div className="p-3 bg-slate-50 rounded-2xl"><Info className="text-slate-400" /></div>
                            <div>
                                <h3 className="font-bold text-xl">Current Plan Status</h3>
                                <p className="text-sm text-slate-400 font-medium">Review current information before making changes</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            <DisplayField label="Product" value={planData.productName} icon={<Package size={14} />} />
                            <DisplayField label="Current Qty" value={`${planData.quantityRequired} Units`} icon={<Database size={14} />} />
                            <DisplayField label="Delivery Date" value={planData.deliveryDate} icon={<Calendar size={14} />} />
                            <DisplayField label="Customer" value={planData.customerName} icon={<User size={14} />} />
                        </div>
                        <div className="flex justify-end mt-10">
                            <button onClick={() => setCurrentStep(2)} className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">Edit Quantities</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Modify Quantities / Deadlines */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in fade-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-8 flex items-center gap-2"><RefreshCw size={20} className="text-[#F59E0B]" /> Adjust Plan Requirements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Adjust Quantity</label>
                                <input
                                    type="number"
                                    value={planData.quantityRequired}
                                    onChange={(e) => setPlanData({ ...planData, quantityRequired: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#F59E0B] outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Adjust Delivery Date</label>
                                <input
                                    type="date"
                                    value={planData.deliveryDate}
                                    onChange={(e) => setPlanData({ ...planData, deliveryDate: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#F59E0B] outline-none text-slate-700"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-12">
                            <button onClick={() => setCurrentStep(1)} className="px-8 py-3 rounded-xl font-bold text-slate-400">Cancel</button>
                            <button onClick={() => setCurrentStep(3)} className="bg-[#F59E0B] text-white px-10 py-3 rounded-xl font-bold text-sm shadow-lg">Re-Check Materials</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Mandatory Material Re-verification */}
                {currentStep === 3 && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ClipboardCheck size={20} className="text-[#F59E0B]" /> Compulsory Availability Check
                            </h3>
                        </div>
                        <div className="p-8">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="pb-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                                        <th className="pb-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">In Stock</th>
                                        <th className="pb-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">New Requirement</th>
                                        <th className="pb-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {bomAnalysis.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/30">
                                            <td className="py-5 font-bold text-slate-700">{item.materialName}</td>
                                            <td className="py-5 text-center text-slate-600">{item.availableQuantity}</td>
                                            <td className="py-5 text-center font-black text-slate-800">{item.requiredQuantity}</td>
                                            <td className="py-5 text-center">
                                                {item.shortage > 0 ? (
                                                    <span className="text-rose-500 font-black">-{item.shortage}</span>
                                                ) : (
                                                    <span className="text-emerald-500 font-black text-[10px] uppercase bg-emerald-50 px-2 py-1 rounded">Available</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-10 flex justify-end gap-4">
                                <button onClick={() => setCurrentStep(2)} className="px-8 py-3 rounded-xl font-bold text-slate-400">Back</button>
                                <button onClick={() => setCurrentStep(4)} className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold text-sm">Finalize Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Decision & Finalize Edit */}
                {currentStep === 4 && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in fade-in zoom-in-95">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${isMaterialAvailable ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-[#F59E0B]'}`}>
                                {isMaterialAvailable ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">
                                {isMaterialAvailable ? "Changes Verified" : "Material Shortage Detected After Edit"}
                            </h2>
                            <p className="text-slate-500 mb-10 font-medium">
                                {isMaterialAvailable
                                    ? "The updated quantities are supported by current stock. You can safely update the plan."
                                    : "The new quantities exceed current stock. Updating will trigger an updated Purchase Request."}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleUpdatePR}
                                    disabled={loading}
                                    className=" bg-amber-500 text-white py-2 px-4 rounded-xl font-bold text-sm uppercase  hover:bg-amber-600 transition-all flex items-center justify-center gap-1 shadow-xl"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    Create Purchase Request
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className=" bg-slate-900 text-white py-2 px-4 rounded-xl font-bold text-sm uppercase  hover:bg-slate-800 transition-all flex items-center justify-center gap-1 shadow-xl"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    Update Production Plan
                                </button>
                                <button onClick={() => setCurrentStep(2)} className="text-amber-500 font-bold text-sm hover:text-rose-600 transition-colors border-amber-500 border hover:border-rose-500 py-2 px-4 rounded-xl">Adjust Quantity Again</button>
                                <button onClick={() => navigate('/production/planning')} className="text-rose-500 font-bold text-sm hover:text-rose-400 transition-colors border-rose-500 border hover:border-rose-600 py-2 px-4 rounded-xl">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== Sub-Components ====================

const DisplayField: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
            {icon} {label}
        </label>
        <div className="text-slate-800 font-bold text-sm bg-slate-50/50 px-5 py-4 rounded-3xl border border-slate-50">
            {value}
        </div>
    </div>
);

export default EditProductionPlan;