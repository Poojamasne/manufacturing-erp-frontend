import React, { useEffect, useState, useRef } from 'react';
import {
    ChevronRight,
    Building2,
    Download,
    List,
    Calendar,
    User,
    FileText,
    Loader2,
    ChevronDown 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuotation, updateQuotationStatus, clearSalesErrors, getQuotationForReport } from "../ModuleStateFiles/QuotationSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

// ... (Interfaces remain the same)
interface QuotationItem {
    id?: number;
    product_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface QuotationData {
    id?: number;
    quote_id?: string;
    company_name?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    quotation_date?: string | null;
    valid_until?: string | null;
    created_at?: string | null;
    created_by_name?: string;
    opportunity_id?: number | null;
    lead_id?: number | null;
    subtotal?: number;
    discount?: number;
    tax?: number;
    total?: number;
    status?: string;
    notes?: string;
    terms_conditions?: string;
    products?: QuotationItem[];
}

const QuotationView: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const { quotation } = useAppSelector((state: RootState) => state.SalesQuotation);

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            dispatch(getQuotation(id));
        }
        return () => {
            dispatch(clearSalesErrors());
        };
    }, [dispatch, id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!id) return;
        setUpdatingStatus(true);
        try {
            await dispatch(updateQuotationStatus({ id, status: newStatus }));
            dispatch(getQuotation(id));
            setIsStatusDropdownOpen(false);
        } catch (err) {
            console.error('Status update failed:', err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const formatINR = (amount: string | number) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(val)) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(val);
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return "N/A";
        try {
            const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return "N/A";
        }
    };

    const quotationData = (quotation && typeof quotation === 'object' && !Array.isArray(quotation)) ? quotation : {} as QuotationData;
    const hasData = quotationData && Object.keys(quotationData).length > 0 && quotationData.id;

    if (!hasData) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-10">
                    {/* Breadcrumbs - Always Top Left */}
                    <div className="flex items-center gap-2 text-slate-400 mb-4 text-[10px] font-black uppercase tracking-widest">
                        <button onClick={() => navigate("/sales/quotation")} className="hover:text-[#F59E0B] transition-colors">Quotations</button>
                        <ChevronRight size={12} />
                        <span className="text-[#F59E0B]">{quotationData.quote_id || 'N/A'}</span>
                    </div>

                    {/* Main Header Action Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        {/* Heading Left */}
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Quotation Details
                        </h1>

                        {/* Buttons Right */}
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* CUSTOM STATUS DROPDOWN */}
                            <div className="relative" ref={statusDropdownRef}>
                                <button
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                    disabled={updatingStatus}
                                    className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold shadow-sm hover:bg-slate-50 transition-all min-w-35"
                                >
                                    <span className={quotationData.status === 'Rejected' ? 'text-rose-600' : 'text-[#F59E0B]'}>
                                        {updatingStatus ? "Updating..." : quotationData.status || 'Draft'}
                                    </span>
                                    {updatingStatus ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />}
                                </button>

                                {isStatusDropdownOpen && (
                                    <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 w-full min-w-35">
                                        {['Draft', 'Sent', 'Accepted', 'Rejected'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(status)}
                                                className={`outline-none w-full text-left px-4 py-2 text-[13px] transition-colors ${quotationData.status === status
                                                    ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50"
                                                    : "text-slate-600 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Export Button */}
                            <button 
                                onClick={() => quotationData?.id && dispatch(getQuotationForReport(quotationData.id))} 
                                className="flex items-center justify-center gap-2 bg-white text-gray-600 hover:text-[#F59E0B] px-4 py-2 rounded-xl font-bold text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap"
                            >
                                <Download size={16} /> Export Quotation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div id="quotation-pdf-content" className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="relative z-10 p-10 md:p-14 space-y-12 bg-white/80 backdrop-blur-[2px]">
                        {/* Document Branding Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-10 gap-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center text-white">
                                        <FileText size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Manufacturing ERP</h2>
                                </div>
                                <div className="text-xs text-slate-500 space-y-1 font-medium">
                                    <p>100 Industry Way, Tech Park</p>
                                    <p>Mumbai, Maharashtra, 400001</p>
                                    <p className="pt-2">GSTIN: 27AAACR1234A1Z5</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right space-y-1">
                                <h1 className="text-5xl font-black text-slate-100 uppercase tracking-tighter mb-4">PROPOSAL</h1>
                                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">No: {quotationData.quote_id || 'N/A'}</p>
                                <p className="text-xs text-slate-500 font-bold">Issue Date: {formatDate(quotationData.created_at)}</p>
                                <p className="text-xs text-rose-500 font-black">Valid Until: {formatDate(quotationData.valid_until)}</p>
                            </div>
                        </div>

                        {/* Customer & Quote Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-slate-50/50 p-8 rounded-4xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-[#f3f4e6] text-[#F59E0B] rounded-lg border border-[#f3f4e6]"><Building2 size={18} /></div>
                                    <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Billing Entity</h3>
                                </div>
                                <h4 className="font-black text-xl text-[#F59E0B] mb-2">{quotationData.company_name || 'N/A'}</h4>
                                <div className="text-sm text-slate-600 space-y-1 font-medium">
                                    <p className="flex items-center gap-2"><User size={14} className="text-slate-300" /> {quotationData.contact_person || "Purchase Dept"}</p>
                                    <p className="text-slate-400">{quotationData.email || "N/A"}</p>
                                    <p className="text-slate-400">{quotationData.phone || "N/A"}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-8 rounded-4xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-[#f3f4e6] text-[#F59E0B] rounded-lg border border-[#f3f4e6]"><Calendar size={18} /></div>
                                    <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Reference Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-y-6">
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Assigned Manager</p>
                                        <p className="text-sm font-bold text-slate-700">{quotationData.created_by_name || "Admin"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Opportunity ID</p>
                                        <p className="text-sm font-bold text-slate-700">#OPP-{quotationData.opportunity_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Lead Ref</p>
                                        <p className="text-sm font-bold text-slate-700">#LD-{quotationData.lead_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Currency</p>
                                        <p className="text-sm font-bold text-slate-700">INR (₹)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-[#f3f4e6] text-[#F59E0B] rounded-lg border border-[#f3f4e6]"><List size={18} /></div>
                                <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Scope of Supply</h3>
                            </div>

                            <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr className="text-[13px] font-black text-slate-500 uppercase tracking-widest">
                                            <th className="p-5">Product Description</th>
                                            <th className="p-5 text-center">Quantity</th>
                                            <th className="p-5 text-right">Unit Price</th>
                                            <th className="p-5 text-right">Total Line Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {quotationData.products?.map((item: QuotationItem, idx: number) => (
                                            <tr key={item.id || idx} className="text-sm group hover:bg-slate-50/50 transition-colors">
                                                <td className="p-5 font-bold text-slate-700">
                                                    {item.product_name}
                                                    {item.description && <span className="text-slate-400 text-xs block">{item.description}</span>}
                                                </td>
                                                <td className="p-5 text-center text-slate-500 font-bold bg-slate-50/30">{item.quantity} Units</td>
                                                <td className="p-5 text-right text-slate-500 font-medium">{formatINR(item.unit_price)}</td>
                                                <td className="p-5 text-right font-black text-slate-800">{formatINR(item.total_price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Financial Breakdown */}
                        <div className="flex justify-end">
                            <div className="w-full lg:w-1/2 bg-[#fafffe] p-10 rounded-[2.5rem] border border-[#f3f4e6]/50 space-y-5 shadow-sm">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-black uppercase tracking-widest">Subtotal (Net)</span>
                                    <span className="font-bold text-slate-700">{formatINR(quotationData.subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-rose-500">
                                    <span className="text-slate-400 font-black uppercase tracking-widest">Trade Discount</span>
                                    <span className="font-black">- {formatINR(quotationData.discount || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-black uppercase tracking-widest">Taxation (GST)</span>
                                    <span className="font-bold text-slate-700">+ {formatINR(quotationData.tax || 0)}</span>
                                </div>
                                <div className="pt-6 border-t border-[#f3f4e6] flex justify-between items-center">
                                    <span className="font-black text-slate-800 text-sm uppercase tracking-widest">Final Amount</span>
                                    <div className="text-right">
                                        <span className={`font-black text-3xl tracking-tighter ${quotationData.status === 'Rejected' ? 'text-rose-500' : 'text-[#F59E0B]'}`}>
                                            {formatINR(quotationData.total || 0)}
                                        </span>
                                        <p className="text-[9px] font-bold text-teal-600/50 uppercase tracking-widest mt-1">Inclusive of all taxes</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Terms */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Internal Notes</h3>
                                <p className="text-xs text-slate-500 italic leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    {quotationData.notes || "No additional strategic notes provided."}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Terms of Business</h3>
                                <p className="text-xs text-slate-500 whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    {quotationData.terms_conditions || "Standard manufacturing terms apply."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotationView;