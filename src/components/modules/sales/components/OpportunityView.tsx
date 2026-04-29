import React, { useMemo, useEffect, useState, useRef } from 'react';
import {
    ChevronRight,
    Calendar,
    Building2,
    Package,
    MapPin,
    Edit3,
    Loader2,
    X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { getLead, clearErrors } from "../ModuleStateFiles/LeadSlice";
import { editLead } from "../ModuleStateFiles/LeadSlice";
import type { RootState } from "../../../../ApplicationState/Store";

interface Product {
    id: string;
    product_name: string;
    quantity: string;
    total_price: string;
    variant: string | null;
    unit_price: string;
}

const OpportunityView: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const modalRef = useRef<HTMLDivElement>(null);

    // Redux State
    const { lead, loading } = useAppSelector((state: RootState) => state.SalesLeads);

    // Update Modal States
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        status: "",
        priority: ""
    });

    useEffect(() => {
        if (id) {
            dispatch(getLead(Number(id)));
        }
        return () => {
            dispatch(clearErrors());
        };
    }, [dispatch, id]);

    // Handle outside click for modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isUpdateModalOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsUpdateModalOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isUpdateModalOpen]);

    // Opportunity stages
    const opportunityStages = [
        { name: 'Qualified', key: 'Qualified' },
        { name: 'Contacted', key: 'Contacted' },
        { name: 'In Progress', key: 'In Progress' },
        { name: 'Quotation', key: 'Quotation' },
        { name: 'Converted', key: 'Converted' },
        { name: 'Won', key: 'Won' },
        { name: 'Lost', key: 'Lost' },
    ];

    const pipelineResult = useMemo(() => {
        if (!lead) return { progress: 0, correctedStages: [] };
        const currentIndex = opportunityStages.findIndex(s => s.key === lead.status);
        const progress = currentIndex >= 0 ? ((currentIndex + 1) / opportunityStages.length) * 100 : 0;
        const correctedStages = opportunityStages.map((stage, index) => ({
            name: stage.name,
            completed: index <= currentIndex,
        }));
        return { progress, correctedStages };
    }, [lead]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Not Scheduled";
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const totals = useMemo(() => {
        if (!lead?.products) return { qty: 0, val: 0 };
        const qty = lead.products.reduce((acc: number, p: Product) => acc + parseInt(p.quantity), 0);
        const val = lead.products.reduce((acc: number, p: Product) => acc + parseFloat(p.total_price), 0);
        return { qty, val };
    }, [lead]);

    // --- Modal Handlers ---
    const handleOpenUpdateModal = () => {
        if (!lead) return;
        setUpdateForm({
            status: lead.status,
            priority: lead.priority
        });
        setIsUpdateModalOpen(true);
    };

    const handleeditLead = async () => {
        if (!lead) return;

        // Helper to format dates for payload (YYYY-MM-DD)
        const formatForPayload = (d: string | null) => {
            if (!d) return null;
            try {
                return new Date(d).toISOString().split("T")[0];
            } catch (e) {
                return null;
            }
        };

        const payload = {
            ...lead,
            status: updateForm.status,
            priority: updateForm.priority,
            expected_close_date: formatForPayload(lead.expected_close_date),
            followup_date: formatForPayload(lead.followup_date)
        };

        await dispatch(editLead(Number(lead.id), payload));

        setIsUpdateModalOpen(false);
        // Refresh the lead data
        dispatch(getLead(Number(id)));
    };

    if (loading && !lead) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
                <Loader2 className="animate-spin text-[#F59E0B]" size={40} />
            </div>
        );
    }

    if (!lead) return null;

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <button onClick={() => navigate("/sales/opportunities")} className="hover:text-[#F59E0B] transition-colors">Opportunities</button>
                            <ChevronRight size={14} />
                            <span className="text-slate-600 font-semibold">{lead?.id}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Opportunity Details</h1>
                    </div>
                    <div className="flex flex-wrap gap-3">

                        <button
                            onClick={handleOpenUpdateModal}
                            className="flex items-center gap-1 bg-[#F59E0B] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-[#f67317] transition-all"
                        >
                            <Edit3 size={18} /> Edit Opportunity
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Pipeline Visualizer */}
                    <div className="bg-gray-50/50 p-8 border-b border-gray-100">
                        <div className="flex justify-between items-start relative max-w-3xl mx-auto overflow-x-auto pb-4 sm:pb-0">
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0" />
                            <div className="absolute top-4 left-0 h-0.5 bg-[#F59E0B] z-0 transition-all duration-500" style={{ width: `${pipelineResult.progress}%` }} />
                            {pipelineResult.correctedStages.map((stage, index) => (
                                <div key={index} className="relative z-10 flex flex-col items-center min-w-20">
                                    <div className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${stage.completed ? 'bg-[#F59E0B]' : 'bg-gray-200'}`}>
                                        {stage.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className={`mt-3 text-[10px] sm:text-xs font-semibold uppercase text-center ${stage.completed ? 'text-[#F59E0B]' : 'text-gray-400'}`}>
                                        {stage.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 space-y-12">
                        {/* Customer Info */}
                        <section>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="p-2 bg-[#f3f4e6] text-[#F59E0B] rounded-lg"><Building2 size={18} /></div>
                                <h3 className="text-lg font-semibold text-gray-800">Customer Information</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
                                <DetailItem label="Company" value={lead.company_name} isHighlight />
                                <DetailItem label="Opportunity ID" value={lead.lead_id} />
                                <DetailItem label="Contact Person" value={lead.contact_person} />
                                <DetailItem label="Phone" value={lead.phone} />
                                <DetailItem label="Email" value={lead.email} />
                                <DetailItem label="Lead Source" value={lead.lead_source || "N/A"} />
                                <DetailItem label="Priority" value={lead.priority} isStatus />
                                <DetailItem label="Status" value={lead.status} isStatus />
                            </div>
                        </section>

                        {/* Products */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-[#f3f4e6] text-[#F59E0B] rounded-lg"><Package size={20} /></div>
                                <h3 className="text-lg font-semibold text-gray-800">Products</h3>
                            </div>
                            <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Variant</th>
                                            <th className="p-4 text-center">Qty</th>
                                            <th className="p-4 text-right">Unit Price</th>
                                            <th className="p-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lead.products?.length > 0 ? lead.products.map((p: Product, i: number) => (
                                            <tr key={i} className="border-t border-gray-50">
                                                <td className="p-4 text-sm font-semibold text-gray-800">{p.product_name}</td>
                                                <td className="p-4 text-gray-500">{p.variant || "Standard"}</td>
                                                <td className="p-4 text-center">{p.quantity}</td>
                                                <td className="p-4 text-right">₹ {parseFloat(p.unit_price).toLocaleString()}</td>
                                                <td className="p-4 text-right font-bold text-[#F59E0B]">₹ {parseFloat(p.total_price).toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No products</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="bg-[#F59E0B] p-4 flex justify-between text-white">
                                    <span className="text-xs font-bold uppercase">Deal Summary</span>
                                    <div className="flex gap-8">
                                        <div className="text-right">
                                            <p className="text-xs font-semibold uppercase opacity-70">Total Qty</p>
                                            <p className="font-bold">{totals.qty} Units</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold uppercase opacity-70">Total Value</p>
                                            <p className="font-bold">₹ {totals.val.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Timeline & Location */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar size={18} className="text-[#F59E0B]" />
                                    <h3 className="font-bold text-gray-800">Timeline</h3>
                                </div>
                                <div className="space-y-4 p-6 bg-gray-50 rounded-3xl">
                                    <DetailItem label="Expected Closure" value={formatDate(lead.expected_close_date)} />
                                    <DetailItem label="Next Follow-up" value={formatDate(lead.followup_date)} />
                                    <DetailItem label="Assigned To" value={lead.assigned_to_name || "Unassigned"} />
                                    <DetailItem label="Created" value={formatDate(lead.created_at)} />
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin size={18} className="text-[#F59E0B]" />
                                    <h3 className="font-bold text-gray-800">Location</h3>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl min-h-45">
                                    <p className="text-gray-600">{lead.address ? `${lead.address}, ${lead.city}, ${lead.state}` : "Address not provided"}</p>
                                </div>
                            </section>
                        </div>

                        {/* Notes */}
                        <section>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Notes</h3>
                            <div className="bg-[#f1f8f7] border-l-4 border-[#F59E0B] p-6 rounded-r-2xl">
                                <p className="text-gray-700 italic">{lead.notes || "No notes recorded"}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* --- UPDATE MODAL --- */}
            {isUpdateModalOpen && lead && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
                    <div
                        ref={modalRef}
                        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                        <div className="bg-[#f3f4e6]/50 px-8 py-6 flex justify-between items-center border-b border-amber-300">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-800">Quick Update</h3>
                                <p className="text-[11px] text-[#F59E0B] font-bold uppercase tracking-[0.2em] mt-1">
                                    {lead.lead_id} • {lead.company_name}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
                                <select
                                    value={updateForm.priority}
                                    onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10 focus:border-[#F59E0B] outline-none transition-all text-sm font-bold text-slate-700"
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pipeline Status</label>
                                <select
                                    value={updateForm.status}
                                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10 focus:border-[#F59E0B] outline-none transition-all text-sm font-bold text-slate-700"
                                >
                                    {opportunityStages.map((stage) => (
                                        <option key={stage.key} value={stage.key}>{stage.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-8 pt-0 flex gap-3">
                            <button
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="flex-1 px-6 py-4 rounded-2xl text-[13px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleeditLead}
                                className="flex-1 px-6 py-4 rounded-2xl text-[13px] font-bold text-white bg-[#F59E0B] hover:bg-[#d98b06] shadow-lg shadow-amber-200 transition-all uppercase tracking-widest"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value: string; isHighlight?: boolean; isStatus?: boolean }> = ({ label, value, isHighlight, isStatus }) => (
    <div className="flex flex-col gap-1">
        <span className="font-semibold text-gray-600 text-sm uppercase tracking-wide">{label}</span>
        {isStatus ? (
            <span className={`w-fit px-3 py-1 rounded-lg text-xs font-bold ${value === 'High' || value === 'Lost' ? 'bg-red-50 text-red-600' :
                value === 'Medium' || value === 'Qualified' || value === 'In Progress' ? 'bg-amber-50 text-amber-600' :
                    'bg-green-50 text-green-600'}`}>
                {value || "-"}
            </span>
        ) : (
            <span className={`text-sm font-semibold ${isHighlight ? 'text-[#F59E0B] text-base' : 'text-gray-700'}`}>
                {value || "-"}
            </span>
        )}
    </div>
);

export default OpportunityView;