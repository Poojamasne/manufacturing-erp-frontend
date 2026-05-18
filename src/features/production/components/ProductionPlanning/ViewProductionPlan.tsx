import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronRight,
    Edit,
    Package,
    ClipboardCheck,
    Database,
    CheckCircle2,
    User,
    AlertTriangle,
    ArrowUpRight,
    Download,
} from "lucide-react";

// ==================== Types & Mock Data ====================
interface RawMaterial {
    id: string;
    materialName: string;
    requiredQuantity: number;
    availableQuantity: number;
    status: "Sufficient" | "Shortage";
}

interface ProductionPlan {
    id: string;
    planId: string;
    salesOrderId: string;
    customerName: string;
    productName: string;
    quantityRequired: number;
    deliveryDate: string;
    status: "DRAFT" | "PLANNED" | "IN_PROGRESS" | "COMPLETED";
    createdAt: string;
    materials: RawMaterial[];
}

const mockPlan: ProductionPlan = {
    id: "1",
    planId: "PLN-9901",
    salesOrderId: "SO-2026-001",
    customerName: "Indus Tech Solutions",
    productName: "Heavy Duty Gearbox",
    quantityRequired: 50,
    deliveryDate: "2026-06-15",
    status: "PLANNED",
    createdAt: "2026-05-01",
    materials: [
        { id: "RM-101", materialName: "Steel Casing", requiredQuantity: 50, availableQuantity: 60, status: "Sufficient" },
        { id: "RM-102", materialName: "Internal Gears", requiredQuantity: 200, availableQuantity: 150, status: "Shortage" },
        { id: "RM-103", materialName: "Lubricant Oil", requiredQuantity: 100, availableQuantity: 500, status: "Sufficient" },
    ],
};

const ViewProductionPlan: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Helper for Status Badge
    const getStatusStyle = (status: string) => {
        const base = "px-3 py-1 rounded-lg text-[10px] font-black uppercase border ";
        switch (status) {
            case "PLANNED": return base + "bg-blue-50 text-blue-600 border-blue-100";
            case "IN_PROGRESS": return base + "bg-orange-50 text-orange-600 border-orange-100";
            case "COMPLETED": return base + "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return base + "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};
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
                    <span className="text-gray-800 font-bold">View Plan Details</span>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{mockPlan.planId}</h1>
                            <span className={getStatusStyle(mockPlan.status)}>{mockPlan.status}</span>
                        </div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Created on {formatDate(mockPlan.createdAt)}</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => window.print()} className="outline-none flex-1 md:flex-initial flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-amber-500 px-6 py-3 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">
                            <Download size={18} /> Download Plan
                        </button>
                        <button
                            onClick={() => navigate(`/production/planning/edit-plan/${ id}`)}
                            className="outline-none flex-1 md:flex-initial flex items-center justify-center gap-2 bg-[#F59E0B] text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-200 hover:bg-[#f67317] transition-all"
                        >
                            <Edit size={18} /> Edit Plan
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: General Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 3.4.1 Production Overview */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <Package size={18} className="text-[#F59E0B]" /> Production Overview
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-6">
                                <DataPoint label="Target Product" value={mockPlan.productName} />
                                <DataPoint label="Quantity to Produce" value={`${mockPlan.quantityRequired} Units`} />
                                <DataPoint label="Expected Completion" value={formatDate(mockPlan.deliveryDate)} />
                                <DataPoint label="Originating Sales Order" value={mockPlan.salesOrderId} isLink />
                            </div>
                        </div>

                        {/* 3.4.2 & 3.4.3 Material & Inventory Analysis */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ClipboardCheck size={18} className="text-[#F59E0B]" /> Bill of Materials Check
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/30">
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Name</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Required</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">In-Stock</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {mockPlan.materials.map((mat) => (
                                            <tr key={mat.id} className="hover:bg-slate-50/20 transition-colors">
                                                <td className="px-8 py-5 font-bold text-slate-700">{mat.materialName}</td>
                                                <td className="px-8 py-5 text-center font-black text-slate-800">{mat.requiredQuantity}</td>
                                                <td className="px-8 py-5 text-center text-slate-500">{mat.availableQuantity}</td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className={`inline-flex items-center gap-1.5 font-black text-[10px] uppercase px-2 py-1 rounded ${mat.status === "Sufficient" ? "text-emerald-500 " : "text-rose-500"
                                                        }`}>
                                                        {mat.status === "Sufficient" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                                        {mat.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Insights */}
                    <div className="space-y-8">

                        {/* Customer Details */}
                        <div className="bg-amber-900 rounded-[2.5rem] shadow-xl p-8 text-white relative overflow-hidden">
                            <User className="absolute -right-4 -top-1 w-32 h-32 text-white/5" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <User size={16} /> Customer Details
                            </h3>
                            <h4 className="text-xl font-bold mb-1">{mockPlan.customerName}</h4>
                            <p className="text-gray-200 text-sm mb-6 font-medium">B2B Manufacturing Client</p>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-200">Account Type</span>
                                    <span className="font-bold">Premium</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-200">Location</span>
                                    <span className="font-bold">Indore, MP</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Database size={16} className="text-[#F59E0B]" /> Plan Health
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-black uppercase tracking-tighter mb-2">
                                        <span>Material Readiness</span>
                                        <span className="text-rose-500">66%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 rounded-full" style={{ width: '66%' }} />
                                    </div>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-[10px] text-orange-700 font-bold leading-relaxed italic">
                                        "A purchase request is currently active for Internal Gears to meet the required 200 units."
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== Sub-Components ====================

const DataPoint: React.FC<{ label: string; value: string; isLink?: boolean }> = ({ label, value, isLink }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{label}</label>
        <div className={`text-slate-800 font-bold text-base flex items-center gap-2 ${isLink ? "text-[#F59E0B] cursor-pointer hover:underline" : ""}`}>
            {value} {isLink && <ArrowUpRight size={14} />}
        </div>
    </div>
);

export default ViewProductionPlan;