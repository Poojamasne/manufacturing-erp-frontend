import React, { useEffect } from 'react';
import {
    ChevronRight,
    Calendar,
    Building2,
    MapPin,
    Edit3,

    IndianRupee,
    Loader2,
    Mail,
    Phone,
    Info,
    Hash,
    Briefcase
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// --- Redux Imports ---
import { getOpportunity, clearSalesErrors } from "../ModuleStateFiles/OpportunitySlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

const OpportunityView: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useAppDispatch();

    // Redux State
    const { opportunity, loading } = useAppSelector((state: RootState) => state.SalesOpportunity);

    useEffect(() => {
        if (id) {
            dispatch(getOpportunity(id));
        }
        return () => { dispatch(clearSalesErrors()); };
    }, [dispatch, id]);

    // Export PDF Logic
    // const handleExport = async () => {
    //     const element = document.getElementById('opportunity-pdf-content');
    //     if (element) {
    //         const opt = {
    //             // Fix 1: Cast the margin as a specific 4-number tuple
    //             margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
    //             filename: `Deal_Report_${opportunity?.opp_id || 'Detail'}.pdf`,
    //             image: { 
    //                 type: 'jpeg' as const, // Fix 2: Use 'as const' for literal types
    //                 quality: 0.98 
    //             },
    //             html2canvas: { 
    //                 scale: 2, 
    //                 useCORS: true, 
    //                 letterRendering: true 
    //             },
    //             jsPDF: { 
    //                 unit: 'in', 
    //                 format: 'a4', 
    //                 orientation: 'portrait' as const // Fix 3: Use 'as const' here too
    //             }
    //         };

    //         try {
    //             // @ts-ignore - html2pdf types can sometimes be finicky even with proper casting
    //             await html2pdf().set(opt).from(element).save();
    //         } catch (error) {
    //             console.error('PDF generation error:', error);
    //         }
    //     }
    // };

    // Pipeline Stage Logic
    const stages = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won'];
    const currentStageIndex = stages.indexOf(opportunity?.stage || 'Discovery');

    // Handle Loading State (UI Spinner)
    if (loading && !opportunity?.opp_id) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="animate-spin text-[#005d52] mb-4" size={48} />
                <p className="text-sm font-black text-[#005d52] uppercase tracking-[0.2em]">Synchronizing Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <button onClick={() => navigate("/sales/opportunities")} className="hover:text-[#005d52] transition-colors">Opportunities</button>
                            <ChevronRight size={14} />
                            <span className="text-slate-500 font-medium">{opportunity?.opp_id}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Opportunity Overview</h1>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-600 px-6 py-3.5 rounded-2xl font-bold text-xs border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                            <Download size={16} /> Export PDF
                        </button> */}
                        <button
                            onClick={() => navigate(`/sales/opportunities/opportunity-edit/${id}`)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#005d52] text-white px-8 py-3.5 rounded-2xl font-bold text-xs shadow-xl shadow-teal-900/20 hover:bg-[#004a41] transition-all"
                        >
                            <Edit3 size={16} /> Edit Opportunity
                        </button>
                    </div>
                </div>

                {/* PDF Content Container */}
                <div id="opportunity-pdf-content" className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">

                    {/* Visual Stepper */}
                    <div className="bg-slate-50/80 p-10 border-b border-slate-100">
                        <div className="relative max-w-3xl mx-auto">
                            {/* Track */}
                            <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 rounded-full z-0" />
                            {/* Progress */}
                            <div
                                className="absolute top-5 left-0 h-1 bg-[#005d52] transition-all duration-700 ease-in-out z-0 rounded-full"
                                style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                            />

                            <div className="flex justify-between items-start relative z-10">
                                {stages.map((stage, index) => {
                                    const isReached = index <= currentStageIndex;
                                    return (
                                        <div key={stage} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center transition-all duration-500 ${isReached ? 'bg-[#005d52] text-white scale-110' : 'bg-slate-200 text-slate-400'
                                                }`}>
                                                <span className="text-xs font-black">{index + 1}</span>
                                            </div>
                                            <span className={`mt-4 text-[9px] font-black uppercase tracking-widest ${isReached ? 'text-[#005d52]' : 'text-slate-300'
                                                }`}>
                                                {stage}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-14 space-y-14">

                        {/* Section 1: Core Identification */}
                        <section>
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 bg-teal-50 text-[#005d52] rounded-xl flex items-center justify-center border border-teal-100">
                                    <Building2 size={20} />
                                </div>
                                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Customer Profile</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-12">
                                <DetailItem label="Company Name" value={opportunity?.company_name} isHighlight />
                                <DetailItem label="Opportunity ID" value={opportunity?.opp_id} icon={<Hash size={12} />} />
                                <DetailItem label="Lead Source" value={opportunity?.source || "Direct Search"} />
                                <DetailItem label="Account Status" value={opportunity?.status} isStatus />

                                <DetailItem label="Contact Person" value={opportunity?.contact_person || "Not Assigned"} />
                                <DetailItem label="Mobile Number" icon={<Phone size={12} />} value={opportunity?.phone || "N/A"} />
                                <DetailItem label="Email Identity" icon={<Mail size={12} />} value={opportunity?.email || "N/A"} />
                                <DetailItem label="Lead Reference" value={`#${opportunity?.lead_id}`} />
                            </div>
                        </section>

                        {/* Section 2: Financial & Ownership */}
                        <section className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 bg-teal-50 text-[#005d52] rounded-xl flex items-center justify-center border border-teal-100">
                                    <IndianRupee size={20} />
                                </div>
                                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Deal Valuation</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Expected Revenue</p>
                                    <p className="text-3xl font-black text-[#005d52] tracking-tight">
                                        <span className="text-lg mr-1 opacity-60">₹</span>
                                        {opportunity?.value ? Number(opportunity.value).toLocaleString('en-IN') : "0.00"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Closure</p>
                                    <p className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                        <Calendar size={18} className="text-[#005d52] opacity-40" />
                                        {opportunity?.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "TBD"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Deal Owner</p>
                                    <div className="flex items-center gap-3 pt-1">
                                        <div className="w-8 h-8 rounded-full bg-[#005d52] text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-teal-900/20">
                                            {opportunity?.assigned_to_name?.[0] || "?"}
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">{opportunity?.assigned_to_name || "Unassigned"}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Intelligence Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <Info size={16} className="text-[#005d52]" />
                                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Current Classification</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pipeline Stage</p>
                                        <p className="text-sm font-bold text-slate-800">{opportunity?.stage}</p>
                                    </div>
                                    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority Level</p>
                                        <p className={`text-xs font-black uppercase ${opportunity?.priority === 'High' ? 'text-rose-600' : 'text-teal-600'}`}>
                                            {opportunity?.priority || "Medium"}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <MapPin size={16} className="text-[#005d52]" />
                                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Business Location</h3>
                                </div>
                                <div className="p-8 bg-slate-50/50 rounded-4xl text-xs text-slate-500 font-medium leading-relaxed italic border border-slate-100 min-h-25 flex items-center">
                                    Address details are currently linked to Lead Reference #{opportunity?.lead_id}. Primary region information pending from account manager.
                                </div>
                            </section>
                        </div>

                        {/* Section 4: Notes */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <Briefcase size={16} className="text-[#005d52]" />
                                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Internal Deal Intelligence</h3>
                            </div>
                            <div className="bg-[#fafffe] border-l-4 border-[#005d52] p-8 rounded-r-3xl shadow-sm">
                                <p className="text-slate-600 italic leading-loose text-sm font-medium">
                                    {opportunity?.notes ? `"${opportunity.notes}"` : "No internal intelligence notes or strategic follow-ups have been logged for this opportunity yet."}
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* ERP Footer Branding */}
                    <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            Automated ERP System • Sales Opportunity Intelligence
                        </p>
                        <p className="text-[9px] font-black text-slate-300 uppercase">
                            Generated: {new Date().toLocaleDateString('en-GB')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Professional Detail Item Component ---
const DetailItem: React.FC<{ label: string; value: string | null; isHighlight?: boolean; isStatus?: boolean; icon?: React.ReactNode }> = ({
    label, value, isHighlight, isStatus, icon
}) => (
    <div className="flex flex-col gap-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        {isStatus ? (
            <span className={`w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${value === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                {value || 'In Pipeline'}
            </span>
        ) : (
            <div className={`flex items-center gap-2 text-[13px] font-bold ${isHighlight ? 'text-[#005d52] text-lg' : 'text-slate-700'}`}>
                {icon && <span className="text-slate-300">{icon}</span>}
                {value || "-"}
            </div>
        )}
    </div>
);

export default OpportunityView;