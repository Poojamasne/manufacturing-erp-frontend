import React, { useMemo, useEffect } from 'react';
import { ChevronRight, Calendar, Building2, Package, MapPin, Edit3, Loader2, IndianRupee } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { getLead, clearErrors } from "../ModuleStateFiles/LeadSlice";
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
    const { lead, loading } = useAppSelector((state: RootState) => state.SalesLeads);

    useEffect(() => {
        if (id) {
            dispatch(getLead(Number(id)));
        }
        return () => {
            dispatch(clearErrors());
        };
    }, [dispatch, id]);

    // Opportunity stages
    const opportunityStages = [
        { name: 'Qualified', key: 'Qualified' },
        { name: 'In Progress', key: 'In Progress' },
        { name: 'Quotation', key: 'Quotation' },
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

    if (loading && !lead) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
                <Loader2 className="animate-spin text-[#005d52]" size={40} />
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
                            <button onClick={() => navigate("/sales/opportunities")} className="hover:text-[#005d52] transition-colors">Opportunities</button>
                            <ChevronRight size={14} />
                            <span className="text-slate-600 font-semibold">{lead.lead_id}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Opportunity Details</h1>
                    </div>
                    <div className="flex gap-3">
                        {lead.status === "Won" && (
                            <button className="flex items-center gap-2 bg-white text-gray-600 px-5 py-2.5 rounded-full font-bold text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
                                <IndianRupee size={18} /> Create Order
                            </button>
                        )}
                        <button
                            onClick={() => navigate(`/sales/opportunities/opportunity-edit/${lead.id}`)}
                            className="flex items-center gap-2 bg-[#005d52] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-[#004a41] transition-all"
                        >
                            <Edit3 size={18} /> Edit
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Pipeline Visualizer */}
                    <div className="bg-gray-50/50 p-8 border-b border-gray-100">
                        <div className="flex justify-between items-start relative max-w-3xl mx-auto">
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0" />
                            <div className="absolute top-4 left-0 h-0.5 bg-[#005d52] z-0 transition-all duration-500" style={{ width: `${pipelineResult.progress}%` }} />
                            {pipelineResult.correctedStages.map((stage, index) => (
                                <div key={index} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${stage.completed ? 'bg-[#005d52]' : 'bg-gray-200'}`}>
                                        {stage.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className={`mt-3 text-[10px] font-bold uppercase ${stage.completed ? 'text-[#005d52]' : 'text-gray-400'}`}>
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
                                <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><Building2 size={20} /></div>
                                <h3 className="font-bold text-lg text-gray-800">Customer Information</h3>
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
                                <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><Package size={20} /></div>
                                <h3 className="font-bold text-lg text-gray-800">Products</h3>
                            </div>
                            <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
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
                                                <td className="p-4 font-bold">{p.product_name}</td>
                                                <td className="p-4 text-gray-500">{p.variant || "Standard"}</td>
                                                <td className="p-4 text-center">{p.quantity}</td>
                                                <td className="p-4 text-right">₹ {parseFloat(p.unit_price).toLocaleString()}</td>
                                                <td className="p-4 text-right font-bold text-[#005d52]">₹ {parseFloat(p.total_price).toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No products</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="bg-[#005d52] p-4 flex justify-between text-white">
                                    <span className="text-[10px] font-bold uppercase">Deal Summary</span>
                                    <div className="flex gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase opacity-70">Total Qty</p>
                                            <p className="font-bold">{totals.qty} Units</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase opacity-70">Total Value</p>
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
                                    <Calendar size={18} className="text-[#005d52]" />
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
                                    <MapPin size={18} className="text-[#005d52]" />
                                    <h3 className="font-bold text-gray-800">Location</h3>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl min-h-[180px]">
                                    <p className="text-gray-600">{lead.address ? `${lead.address}, ${lead.city}, ${lead.state}` : "Address not provided"}</p>
                                </div>
                            </section>
                        </div>

                        {/* Notes */}
                        <section>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4">Notes</h3>
                            <div className="bg-[#f1f8f7] border-l-4 border-[#005d52] p-6 rounded-r-2xl">
                                <p className="text-gray-700 italic">{lead.notes || "No notes recorded"}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value: string; isHighlight?: boolean; isStatus?: boolean }> = ({ label, value, isHighlight, isStatus }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
        {isStatus ? (
            <span className={`w-fit px-3 py-1 rounded-lg text-xs font-bold ${value === 'High' ? 'bg-red-50 text-red-600' : value === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                {value || "-"}
            </span>
        ) : (
            <span className={`text-sm font-medium ${isHighlight ? 'text-[#005d52] font-bold text-base' : 'text-gray-700'}`}>
                {value || "-"}
            </span>
        )}
    </div>
);

export default OpportunityView;