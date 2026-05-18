import React, { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    ChevronRight,
    Package,
    Database,
    Building2,
    Calendar,
    Info,
    Hash,
    Activity,

    Trash2,
    Edit
} from "lucide-react";

// Redux Integration
import { deletePurchaseRequest, getPurchaseRequest } from "../../ModuleStateFiles/PurchaseRequestManagementSlice";
import type { RootState } from "../../../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";

const ViewPurchaseRequest: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { purchaseRequest } = useAppSelector((state: RootState) => state.purchaseRequests);

    useEffect(() => {
        if (id) {
            dispatch(getPurchaseRequest(id));
        }
    }, [id, dispatch]);


    if (!purchaseRequest) {
        return <div className="p-20 text-center font-bold text-slate-400 font-sans">Request not found.</div>;
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* Breadcrumbs */}
                <div className="outline-none focus:outline-none flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button onClick={() => navigate("/purchase/purchase-requests")} className="hover:text-[#F59E0B] transition-colors font-medium">
                        Purchase Management
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold tracking-tight">View {purchaseRequest.pr_id}</span>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Request Details</h1>
                        <p className="text-slate-500 font-medium">Reviewing procurement requirements and current status</p>
                    </div>
                    <div className="flex gap-3">

                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                            <Hash size={16} className="text-[#F59E0B]" />
                            <span className="text-xs font-black text-amber-700 uppercase tracking-widest">{purchaseRequest.pr_id}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Fixed Material Context (Same Style as Edit) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden h-fit">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <Package size={120} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                                <Package size={14} /> Material Details
                            </h3>
                            <div className="space-y-8 relative z-10">
                                <DetailBox label="Material Name" value={purchaseRequest.material_name} />
                                <DetailBox label="Material Code" value={purchaseRequest.material_code} />
                                <DetailBox label="Base Unit" value={purchaseRequest.unit} />
                                <DetailBox label="Creation Date" value={new Date(purchaseRequest.created_at).toLocaleDateString()} />
                                {/* Status Section */}
                                <div className="border-t border-slate-50">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] flex items-center gap-1 mb-4">
                                        <Activity size={14} /> Current Life-Cycle Status
                                    </label>
                                    <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl shadow-slate-200">
                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                                        <span className="font-bold text-sm uppercase tracking-widest">{purchaseRequest.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Parameters (Read-Only Detail Boxes) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">

                            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                                <div className="p-3 bg-orange-50 rounded-2xl"><Info className="text-[#F59E0B]" /></div>
                                <div>
                                    <h3 className="font-bold text-xl">Order Parameters</h3>
                                    <p className="text-sm text-slate-400 font-medium">Quantities and deadlines</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                {/* Quantity */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                                        <Database size={14} /> Total Quantity Required
                                    </label>
                                    <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800 text-lg">
                                        {purchaseRequest.quantity} <span className="text-slate-400 font-bold ml-1 text-sm">{purchaseRequest.unit}</span>
                                    </div>
                                </div>

                                {/* Required Date */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                                        <Calendar size={14} /> Target Deadline
                                    </label>
                                    <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800 text-lg">
                                        {purchaseRequest.required_date}
                                    </div>
                                </div>


                                {/* Department */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                                        <Building2 size={14} /> Originating Department
                                    </label>
                                    <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800">
                                        {purchaseRequest.department}
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                                        <Activity size={14} /> Priority Level
                                    </label>
                                    <div className={`px-6 py-4 rounded-3xl font-black text-center text-sm border shadow-sm ${purchaseRequest.priority === 'HIGH'
                                        ? 'bg-red-50 text-red-600 border-red-100'
                                        : 'bg-amber-50 text-[#F59E0B] border-amber-100'
                                        }`}>
                                        {purchaseRequest.priority} URGENCY
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => dispatch(deletePurchaseRequest(purchaseRequest.id))}
                                    className="outline-none text-sm px-4 py-2 rounded-xl font-bold text-rose-500 border hover:text-rose-400 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={18} /> Delete
                                </button>
                                <Link
                                    to={`/purchase/purchase-requests/edit-purchase-request/${purchaseRequest.id}`}
                                    className="outline-none bg-[#F59E0B] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#f67317] transition-all flex items-center gap-2 shadow-xl shadow-orange-100"
                                >
                                    <Edit size={18} /> Modify Request
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== Sub-Components ====================

const DetailBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="space-y-1 group">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-[#F59E0B] transition-colors">
            {label}
        </label>
        <div className="text-slate-800 font-black text-base wrap-break-word leading-tight">
            {value || "-"}
        </div>
    </div>
);

export default ViewPurchaseRequest;