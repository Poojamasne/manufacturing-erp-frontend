import React, { useMemo, useEffect } from 'react';
import { ChevronRight, Calendar, Building2, Package, MapPin, Edit3, Download, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
// 1. Redux Imports
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { getLead, clearErrors } from "../ModuleStateFiles/LeadSlice";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Updated Types based on JSON ---
interface Product {
    id: string;
    product_name: string;
    quantity: string;
    total_price: string;
    variant: string | null;
    unit_price: string;
}

const LeadView: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // 2. Redux State & Dispatch
    const dispatch = useAppDispatch();
    const { lead, loading } = useAppSelector((state: RootState) => state.SalesLeads);

    // 3. Fetch Lead Data on mount
    useEffect(() => {
        if (id) {
            dispatch(getLead(Number(id)));
        }
        return () => {
            dispatch(clearErrors());
        };
    }, [dispatch, id]);

    // --- Dynamic Pipeline Logic ---
    const pipelineStages = [
        { name: 'New', key: 'New' },
        { name: 'Contacted', key: 'Contacted' },
        { name: 'Qualified', key: 'Qualified' },
        { name: 'Quotation', key: 'Quotation' },
        { name: 'Won', key: 'Won' },
        { name: 'Lost', key: 'Lost' },
    ];

    const pipelineResult = useMemo(() => {
        if (!lead) return { progress: 0, correctedStages: [] };

        const currentIndex = pipelineStages.findIndex(s => s.key === lead.status);
        const progress = ((currentIndex + 1) / pipelineStages.length) * 100;

        const correctedStages = pipelineStages.map((stage, index) => ({
            name: stage.name,
            completed: index <= currentIndex,
            progress: ((index + 1) / pipelineStages.length) * 100
        }));

        return { progress, correctedStages };
    }, [lead]);

    // --- Helper for Date Formatting ---
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Not Scheduled";
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // --- Totals Calculation ---
    const totals = useMemo(() => {
        if (!lead?.products) return { qty: 0, val: 0 };
        const qty = lead.products.reduce((acc: number, p: Product) => acc + parseInt(p.quantity), 0);
        const val = lead.products.reduce((acc: number, p: Product) => acc + parseFloat(p.total_price), 0);
        return { qty, val };
    }, [lead]);

    // 4. Loading State UI
    if (loading && !lead) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-[#005d52]" size={40} />
                    <p className="text-sm font-bold text-[#005d52] uppercase tracking-widest">Fetching intelligence...</p>
                </div>
            </div>
        );
    }

    if (!lead) return null;

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
            <div className="max-w-5xl mx-auto">

                {/* Header & Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <button onClick={() => navigate("/sales/leads")} className="hover:text-[#005d52] transition-colors">Leads</button>
                            <ChevronRight size={14} />
                            <span className="text-gray-800 font-medium">{lead.lead_id}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Lead Intelligence Detail</h1>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white text-gray-600 px-5 py-2.5 rounded-full font-bold text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
                            <Download size={18} /> Export
                        </button>
                        <button
                            onClick={() => navigate(`/sales/leads/edit-lead/${lead.id}`)}
                            className="flex items-center gap-2 bg-[#005d52] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#004a41] transition-all">
                            <Edit3 size={18} /> Edit Lead
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Pipeline Visualizer */}
                    <div className="bg-gray-50/50 p-8 border-b border-gray-100">
                        <div className="flex justify-between items-start relative max-w-3xl mx-auto">
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0" />
                            <div
                                className="absolute top-4 left-0 h-0.5 bg-[#005d52] z-0 transition-all duration-500"
                                style={{ width: `${pipelineResult.progress}%` }}
                            />
                            {pipelineResult.correctedStages.map((stage, index) => (
                                <div key={index} className="relative z-10 flex flex-col items-center group">
                                    <div className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all ${stage.completed ? 'bg-[#005d52] scale-110' : 'bg-gray-200'}`} />
                                    <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${stage.completed ? 'text-[#005d52]' : 'text-gray-400'}`}>
                                        {stage.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 space-y-12">

                        {/* Section 1: Customer Info */}
                        <section>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><Building2 size={20} /></div>
                                <h3 className="font-bold text-lg text-gray-800">Entity Information</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
                                <DetailItem label="Company name" value={lead.company_name} isHighlight />
                                <DetailItem label="Lead ID" value={lead.lead_id} />
                                <DetailItem label="Contact person" value={lead.contact_person} />
                                <DetailItem label="City" value={lead.city} />
                                <DetailItem label="Phone Number" value={lead.phone} />
                                <DetailItem label="Email Address" value={lead.email} />
                                <DetailItem label="GST Number" value={lead.gst_number || "Not Provided"} />
                                <DetailItem label="Lead Source" value={lead.lead_source || "N/A"} />
                            </div>
                        </section>

                        {/* Section 2: Products */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><Package size={20} /></div>
                                <h3 className="font-bold text-lg text-gray-800">Inventory Interest</h3>
                            </div>

                            <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <th className="p-4">Product Name</th>
                                            <th className="p-4">Variant</th>
                                            <th className="p-4 text-center">Quantity</th>
                                            <th className="p-4 text-right">Unit Price</th>
                                            <th className="p-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {lead.products?.length > 0 ? lead.products.map((p: Product, i: number) => (
                                            <tr key={i} className="text-sm">
                                                <td className="p-4 font-bold text-gray-700">{p.product_name}</td>
                                                <td className="p-4 text-gray-500">{p.variant || "Standard"}</td>
                                                <td className="p-4 text-center font-medium text-gray-800">{p.quantity} Units</td>
                                                <td className="p-4 text-right text-gray-500">₹ {parseFloat(p.unit_price).toLocaleString()}</td>
                                                <td className="p-4 text-right font-extrabold text-[#005d52]">₹ {parseFloat(p.total_price).toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-400 italic">No products associated.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="bg-[#005d52] p-4 flex justify-between items-center text-white">
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Aggregate Deal Summary</span>
                                    <div className="flex gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase opacity-70">Total Qty</p>
                                            <p className="font-bold">{totals.qty} Units</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase opacity-70">Deal Value</p>
                                            <p className="font-bold text-lg">₹ {totals.val.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><Calendar size={20} /></div>
                                    <h3 className="font-bold text-lg text-gray-800">Lead Logistics</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl">
                                    <DetailItem label="Priority" value={lead.priority} isStatus />
                                    <DetailItem label="Assigned To" value={lead.assigned_to_name || "Unassigned"} />
                                    <DetailItem label="Expected Closure" value={formatDate(lead.expected_close_date)} />
                                    <DetailItem label="Next Follow-up" value={formatDate(lead.followup_date)} />
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><MapPin size={20} /></div>
                                    <h3 className="font-bold text-lg text-gray-800">Deployment Site</h3>
                                </div>
                                <div className="p-6 border border-gray-100 rounded-3xl text-sm text-gray-600 leading-relaxed min-h-35 flex items-center italic">
                                    {lead.address ? `${lead.address}, ${lead.city}, ${lead.state}` : `Details not provided. Defaulting to ${lead.city}`}
                                </div>
                            </section>
                        </div>

                        {/* Section 5: Notes */}
                        <section>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Internal Intelligence</h3>
                            <div className="bg-[#f1f8f7] border-l-4 border-[#005d52] p-6 rounded-r-2xl">
                                <p className="text-sm text-gray-700 italic leading-loose">
                                    {lead.notes ? `"${lead.notes}"` : "No specific notes recorded for this lead strategy."}
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Component ---
const DetailItem: React.FC<{ label: string; value: string; isHighlight?: boolean; isStatus?: boolean }> = ({
    label, value, isHighlight, isStatus
}) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        {isStatus ? (
            <span className={`w-fit px-3 py-1 rounded-lg text-xs font-bold ${value === 'High' ? 'bg-red-50 text-red-600' : 'bg-[#d1e9e7] text-[#005d52]'
                }`}>
                {value}
            </span>
        ) : (
            <span className={`text-sm font-medium ${isHighlight ? 'text-[#005d52] font-bold text-base' : 'text-gray-700'}`}>
                {value}
            </span>
        )}
    </div>
);

export default LeadView;