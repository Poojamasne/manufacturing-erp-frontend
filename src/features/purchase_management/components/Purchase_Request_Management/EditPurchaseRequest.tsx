import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronRight,
    Package,
    Database,
    Building2,
    Calendar,
    Info,
    Hash,
    Activity,
    AlertCircle,
    Save,
} from "lucide-react";

// Import Redux Actions and Types
import { editPurchaseRequest, getPurchaseRequest } from "../../ModuleStateFiles/PurchaseRequestManagementSlice";
import type { RootState } from "../../../../app/store/store";
import { useAppDispatch } from "../../../../app/store/hook";
import { useAppSelector } from "../../../common/ReduxMainHooks";

const EditPurchaseRequest: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Get data from Redux
    const { purchaseRequest, loading } = useAppSelector((state: RootState) => state.purchaseRequests);

    // Local Form State
    const [formData, setFormData] = useState({
        quantity: 0,
        required_date: "",
        department: "",
        priority: "MEDIUM",
        status: "Submitted"
    });

    // 1. Fetch the request details on component mount
    useEffect(() => {
        if (id) {
            dispatch(getPurchaseRequest(id));
        }
    }, [id, dispatch]);

    // 2. Sync Redux data to local state once loaded
    useEffect(() => {
        if (purchaseRequest) {
            setFormData({
                quantity: purchaseRequest.quantity,
                required_date: purchaseRequest.required_date,
                department: purchaseRequest.department,
                priority: purchaseRequest.priority,
                status: purchaseRequest.status
            });
        }
    }, [purchaseRequest]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !purchaseRequest) return;

        // Merge fixed material data with editable form data
        const updatedPayload = {
            ...purchaseRequest,
            ...formData
        };
        console.log("update payload: ", updatedPayload);

        dispatch(editPurchaseRequest(id, updatedPayload, navigate));
    };

    if (!purchaseRequest && !loading) {
        return <div className="p-20 text-center font-bold text-rose-500">Request not found.</div>;
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* Breadcrumbs */}
                <div className="outline-none flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button onClick={() => navigate("/purchase/purchase-requests")} className="outline-none hover:text-[#F59E0B] transition-colors font-medium">
                        Purchase Management
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">Edit {purchaseRequest?.pr_id}</span>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Modify Request</h1>
                        <p className="text-slate-500 font-medium">Update procurement parameters and lifecycle status</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                        <Hash size={16} className="text-[#F59E0B]" />
                        <span className="text-xs font-black text-amber-700 uppercase tracking-widest">{purchaseRequest?.pr_id}</span>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Fixed Material Context (Read Only) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <Package size={120} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-6 flex items-center gap-2">
                                <Package size={14} /> Material Context
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <DetailBox label="Material Name" value={purchaseRequest?.material_name || ""} />
                                <DetailBox label="Material Code" value={purchaseRequest?.material_code || ""} />
                                <DetailBox label="Base Unit" value={purchaseRequest?.unit || ""} />
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="text-amber-400" size={20} />
                                <h4 className="font-bold">Editing Rules</h4>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Material selection is locked once a request is generated. To change the material, please discard this request and raise a new one.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Editable Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">

                            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-8">
                                <div className="p-3 bg-orange-50 rounded-2xl"><Info className="text-[#F59E0B]" /></div>
                                <div>
                                    <h3 className="font-bold text-xl">Editable Parameters</h3>
                                    <p className="text-sm text-slate-400 font-medium">Update quantities, dates, and current status</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Quantity */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
                                        <Database size={14} /> Update Quantity ({purchaseRequest?.unit})
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Required Date */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
                                        <Calendar size={14} /> New Required Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.required_date}
                                        onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Department */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
                                        <Building2 size={14} /> Requesting Department
                                    </label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                                    >
                                        <option value="Production">Production</option>
                                        <option value="Inventory">Inventory</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
                                        <Activity size={14} /> Urgency Level
                                    </label>
                                    <div className="flex gap-2">
                                        {["LOW", "MEDIUM", "HIGH"].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                className={`outline-none flex-1 py-4 rounded-xl text-[10px] font-black transition-all border ${formData.priority === p
                                                    ? 'bg-[#F59E0B] text-white border-transparent shadow-lg shadow-orange-100'
                                                    : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Status Change - SRS 3.3.3 */}
                            <div className="space-y-2 pt-6 border-t border-slate-50">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] flex items-center gap-1.5">
                                    <Activity size={14} /> Current Life-Cycle Status
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {["Draft", "Submitted", "Approved", "In Process", "Completed", "Rejected"].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: s as any })}
                                            className={`outline-none px-4 py-3 rounded-xl text-[11px] font-bold transition-all border ${formData.status === s
                                                ? 'bg-slate-800 text-white border-transparent'
                                                : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-12 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/purchase/purchase-requests")}
                                    className="outline-none px-4 py-2 rounded-xl text-sm font-bold text-slate-400 border  hover:text-red-500 transition-colors flex items-center gap-2"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="outline-none bg-[#F59E0B] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#f67317] transition-all flex items-center gap-2 shadow-xl shadow-orange-100 disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : <><Save size={18} /> Update PR</>}
                                </button>
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==================== Sub-Components ====================

const DetailBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            {label}
        </label>
        <div className="text-slate-800 font-black text-sm wrap-break-word">
            {value || "-"}
        </div>
    </div>
);

export default EditPurchaseRequest;