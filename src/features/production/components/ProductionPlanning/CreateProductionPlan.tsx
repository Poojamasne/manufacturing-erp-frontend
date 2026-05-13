import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronRight,
       Package,
    ClipboardCheck,
    Database,
    CheckCircle2,
    User,
    Calendar,
    ArrowRight,
    AlertTriangle,
    Info,
} from "lucide-react";

// ==================== Types & Mock Data ====================
interface RawMaterial {
    id: string;
    materialName: string;
    requiredPerUnit: number;
    availableQuantity: number;
}

interface SalesOrder {
    id: string;
    salesOrderId: string;
    customerName: string;
    productName: string;
    quantityRequired: number;
    deliveryDate: string;
}

const mockSalesOrders: SalesOrder[] = [
    { id: "1", salesOrderId: "SO-2026-001", customerName: "Indus Tech Solutions", productName: "Heavy Duty Gearbox", quantityRequired: 50, deliveryDate: "2026-06-15" },
    { id: "2", salesOrderId: "SO-2026-002", customerName: "Precision Labs", productName: "Control Panel V2", quantityRequired: 10, deliveryDate: "2026-07-01" },
];

const mockBOMs: Record<string, RawMaterial[]> = {
    "Heavy Duty Gearbox": [
        { id: "RM-101", materialName: "Steel Casing", requiredPerUnit: 1, availableQuantity: 60 },
        { id: "RM-102", materialName: "Internal Gears", requiredPerUnit: 4, availableQuantity: 150 },
        { id: "RM-103", materialName: "Lubricant Oil", requiredPerUnit: 2, availableQuantity: 500 },
    ],
    "Control Panel V2": [
        { id: "RM-201", materialName: "Circuit Board", requiredPerUnit: 1, availableQuantity: 50 },
        { id: "RM-202", materialName: "Copper Wiring", requiredPerUnit: 5, availableQuantity: 100 },
    ],
};

const CreateProductionPlan: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
    const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

    // Logic for Step 3: BOM & Inventory Check
    const bomAnalysis = useMemo(() => {
        if (!selectedOrder) return [];
        const materials = mockBOMs[selectedOrder.productName] || [];
        return materials.map(m => {
            const required = m.requiredPerUnit * selectedOrder.quantityRequired;
            return {
                ...m,
                requiredQuantity: required,
                shortage: Math.max(0, required - m.availableQuantity),
                status: m.availableQuantity >= required ? "Sufficient" : "Shortage"
            };
        });
    }, [selectedOrder]);

    const isMaterialAvailable = bomAnalysis.every(item => item.status === "Sufficient");

    const handleFinalAction = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const msg = isMaterialAvailable
                ? `Production Order Created Successfully!`
                : `Purchase Request Raised (Priority: ${priority})`;
            alert(msg);
            navigate("/production/planning");
        }, 1500);
    };

    const steps = [
        { id: 1, title: "Order Selection" },
        { id: 2, title: "Plan Overview" },
        { id: 3, title: "Material Analysis" },
        { id: 4, title: "Decision" },
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
                    <span className="text-gray-800 font-bold">New Production Plan</span>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Create Plan</h1>

                {/* Step Progress Bar */}
                <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div className={`flex items-center gap-3 ${currentStep >= step.id ? "cursor-pointer" : "cursor-not-allowed"}`}
                                onClick={() => {
                                    if (currentStep > step.id) {
                                        setCurrentStep(step.id)
                                    }
                                }}
                            >
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

                {/* Step 1: Select Sales Order */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700">
                                <Package size={20} className="text-[#F59E0B]" />
                                Select Confirmed Sales Order
                            </h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mockSalesOrders.map((so) => (
                                <button
                                    key={so.id}
                                    onClick={() => { setSelectedOrder(so); setCurrentStep(2); }}
                                    className="group text-left p-6 border border-slate-300 rounded-4xl hover:border-[#F59E0B] hover:bg-orange-50/20 transition-all relative overflow-hidden"
                                >
                                    <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-[0.2em]">{so.salesOrderId}</span>
                                    <h4 className="text-xl font-bold text-slate-800 mt-1">{so.productName}</h4>
                                    <p className="text-sm text-slate-500 mb-4">{so.customerName}</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                        <span className="text-sm font-bold text-slate-700">{so.quantityRequired} Units</span>
                                        <ArrowRight size={18} className="text-slate-300 group-hover:text-[#F59E0B] transition-transform group-hover:translate-x-1" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Plan Overview (Details) */}
                {currentStep === 2 && selectedOrder && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 space-y-10 animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <div className="p-3 bg-orange-50 rounded-2xl"><Info className="text-[#F59E0B]" /></div>
                            <div>
                                <h3 className="font-bold text-xl">Plan Overview</h3>
                                <p className="text-sm text-slate-400 font-medium">Verify production details before analysis</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            <DetailBox label="Product" value={selectedOrder.productName} icon={<Package size={14} />} />
                            <DetailBox label="Production Qty" value={`${selectedOrder.quantityRequired} Units`} icon={<Database size={14} />} />
                            <DetailBox label="Deadline" value={selectedOrder.deliveryDate} icon={<Calendar size={14} />} />
                            <DetailBox label="Customer" value={selectedOrder.customerName} icon={<User size={14} />} />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setCurrentStep(1)} className="px-4 py-2 rounded-xl font-bold text-[#F59E0B] hover:text-[#f67317] border hover:border-amber-500 transition-colors">Back</button>
                            <button onClick={() => setCurrentStep(3)} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">Check Materials</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Material Analysis (Compulsory) */}
                {currentStep === 3 && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ClipboardCheck size={20} className="text-[#F59E0B]" /> Mandatory BOM & Inventory Check
                            </h3>
                        </div>
                        <div className="p-8 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="pb-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Material</th>
                                        <th className="pb-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">In Stock</th>
                                        <th className="pb-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">Needed</th>
                                        <th className="pb-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">Status</th>
                                        <th className="pb-4 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center">Shortage</th>
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
                                                    <span className="text-rose-500 font-black text-[10px] uppercase px-2 py-1 rounded">Shortage</span>
                                                ) : (
                                                    <span className="text-emerald-500 font-black text-[10px] uppercase px-2 py-1 rounded">Available</span>
                                                )}
                                            </td>
                                            <td className="py-5 text-center">
                                                {item.shortage > 0 ? (
                                                    <span className="text-rose-500 font-bold">{item.shortage}</span>
                                                ) : (
                                                    <span className="text-emerald-500 font-bold">0</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-10 flex justify-end gap-4">
                                <button onClick={() => setCurrentStep(2)} className="px-4 py-2 rounded-xl font-bold  text-[#F59E0B] hover:text-[#f67317] border hover:border-amber-500">Back</button>
                                <button onClick={() => setCurrentStep(4)} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm">Proceed</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Decision & Finalize */}
                {currentStep === 4 && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in fade-in zoom-in-95">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${isMaterialAvailable ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-[#F59E0B]'}`}>
                                {isMaterialAvailable ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">
                                {isMaterialAvailable ? "Ready for Production" : "Materials Shortage Detected"}
                            </h2>
                            <p className="text-slate-500 mb-10 font-medium">
                                {isMaterialAvailable
                                    ? "All raw materials are sufficient in the inventory. You can now generate the production Plan for Production Order."
                                    : "Some materials are missing. The system will create a Purchase Request for the the Required Materials."}
                            </p>

                            {!isMaterialAvailable && (
                                <div className="bg-slate-50 p-6 rounded-4xl mb-8 text-left border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Set Request Priority</label>
                                    <div className="flex gap-3">
                                        {["LOW", "MEDIUM", "HIGH"].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPriority(p as any)}
                                                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${priority === p ? 'bg-[#F59E0B] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-6">
                                <button
                                    onClick={handleFinalAction}
                                    disabled={loading}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm  hover:bg-slate-800 transition-all flex items-center justify-center gap-1 shadow-xl"
                                >
                                    {isMaterialAvailable ? "Confirm Production Plan" : "Confirm Purchase Request"}
                                </button>
                                <button onClick={() => setCurrentStep(3)} className=" font-bold text-sm rounded-xl px-4 py-2 text-[#F59E0B] hover:text-red-500 border hover:border-red-500 transition-colors">Review Materials Again</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== Sub-Components ====================

const DetailBox: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 flex items-center gap-1.5">
            {icon} {label}
        </label>
        <div className="text-slate-800 font-bold text-sm bg-slate-50/50 px-1.5 py-2 rounded-3xl border border-slate-50">
            {value}
        </div>
    </div>
);

export default CreateProductionPlan;