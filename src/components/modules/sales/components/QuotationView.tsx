import React, { useEffect, useState } from 'react';
import { 
    ChevronRight, 
    Building2, 
    Edit3, 
    Download, 
    List, 
    Calendar, 
    User, 
    FileText,
    Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { getQuotation, updateQuotationStatus, clearSalesErrors } from "../ModuleStateFiles/QuotationSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

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
    const { quotation, loading, error } = useAppSelector((state: RootState) => state.SalesQuotation);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(getQuotation(id));
        }
        return () => { 
            dispatch(clearSalesErrors()); 
        };
    }, [dispatch, id]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!id) return;
        setUpdatingStatus(true);
        try {
            await dispatch(updateQuotationStatus({ id, status: newStatus })).unwrap();
            dispatch(getQuotation(id));
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
        // Handle both string and Date objects
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        // Check if date is valid
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return "N/A";
    }
};

    const getStatusStyle = (status: string) => {
        const base = "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ";
        switch (status) {
            case 'Accepted': return base + 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Sent': return base + 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Rejected': return base + 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Expired': return base + 'bg-amber-50 text-amber-700 border-amber-100';
            default: return base + 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    const handleExport = () => {
        const element = document.getElementById('quotation-pdf-content');
        if (element && quotation) {
            const opt = {
                margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
                filename: `Quotation_${quotation.quote_id || 'document'}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
            };
            html2pdf().set(opt).from(element).save();
        }
    };

    // Safe error message extraction
    const getErrorMessage = (): string | null => {
        if (!error) return null;
        if (typeof error === 'string') return error;
        if (error && typeof error === 'object' && 'message' in error) return String((error as any).message);
        return 'An unexpected error occurred';
    };

    const errorMessage = getErrorMessage();

    // Safe data extraction - prevent "Cannot read property of undefined"
    const quotationData = (quotation && typeof quotation === 'object' && !Array.isArray(quotation)) ? quotation : {} as QuotationData;
    const hasData = quotationData && Object.keys(quotationData).length > 0 && quotationData.id;

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-[#005d52]" />
            </div>
        );
    }

    // Error state
    if (errorMessage) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Quotation</h2>
                    <p className="text-red-600 break-words">{errorMessage}</p>
                    <button
                        onClick={() => navigate('/sales/quotation')}
                        className="mt-6 px-6 py-2 bg-[#005d52] text-white rounded-xl hover:bg-[#004a41] transition-colors"
                    >
                        Back to Quotations
                    </button>
                </div>
            </div>
        );
    }

    // No data state
    if (!hasData) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 max-w-md text-center">
                    <div className="text-yellow-500 text-6xl mb-4">📄</div>
                    <h2 className="text-xl font-bold text-yellow-700 mb-2">Quotation Not Found</h2>
                    <p className="text-yellow-600">The requested quotation could not be found.</p>
                    <button
                        onClick={() => navigate('/sales/quotation')}
                        className="mt-6 px-6 py-2 bg-[#005d52] text-white rounded-xl hover:bg-[#004a41] transition-colors"
                    >
                        Back to Quotations
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-2 text-[10px] font-black uppercase tracking-widest">
                            <button onClick={() => navigate("/sales/quotation")} className="hover:text-[#005d52] transition-colors">Quotations</button>
                            <ChevronRight size={12} />
                            <span className="text-[#005d52]">{quotationData.quote_id || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quotation Details</h1>
                            <div className="flex items-center gap-2">
                                <select
                                    value={quotationData.status || 'Draft'}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                    disabled={updatingStatus}
                                    className="px-3 py-1.5 rounded-lg border text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#005d52]"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Sent">Sent</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                {updatingStatus && <Loader2 size={16} className="animate-spin text-[#005d52]" />}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-600 px-6 py-3.5 rounded-2xl font-bold text-xs border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                            <Download size={16} /> Export PDF
                        </button>
                    </div>
                </div>

                <div id="quotation-pdf-content" className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="p-10 md:p-14 space-y-12">
                        {/* Document Branding Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-10 gap-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-10 h-10 bg-[#005d52] rounded-xl flex items-center justify-center text-white">
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
                                    <div className="p-2 bg-teal-50 text-[#005d52] rounded-lg border border-teal-100"><Building2 size={18}/></div>
                                    <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Billing Entity</h3>
                                </div>
                                <h4 className="font-black text-xl text-[#005d52] mb-2">{quotationData.company_name || 'N/A'}</h4>
                                <div className="text-sm text-slate-600 space-y-1 font-medium">
                                    <p className="flex items-center gap-2"><User size={14} className="text-slate-300"/> {quotationData.contact_person || "Purchase Dept"}</p>
                                    <p className="text-slate-400">{quotationData.email || "N/A"}</p>
                                    <p className="text-slate-400">{quotationData.phone || "N/A"}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-8 rounded-4xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-teal-50 text-[#005d52] rounded-lg border border-teal-100"><Calendar size={18}/></div>
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
                                <div className="p-2 bg-teal-50 text-[#005d52] rounded-lg border border-teal-100"><List size={18}/></div>
                                <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Scope of Supply</h3>
                            </div>
                            
                            <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <th className="p-5">Product Description</th>
                                            <th className="p-5 text-center">Quantity</th>
                                            <th className="p-5 text-right">Unit Price</th>
                                            <th className="p-5 text-right">Total Line Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {quotationData.products && quotationData.products.length > 0 ? (
                                            quotationData.products.map((item: QuotationItem, idx: number) => (
                                                <tr key={item.id || idx} className="text-sm group hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-5 font-bold text-slate-700">
                                                        {item.product_name}
                                                        {item.description && <span className="text-slate-400 text-xs block">{item.description}</span>}
                                                    </td>
                                                    <td className="p-5 text-center text-slate-500 font-bold bg-slate-50/30">{item.quantity} Units</td>
                                                    <td className="p-5 text-right text-slate-500 font-medium">{formatINR(item.unit_price)}</td>
                                                    <td className="p-5 text-right font-black text-slate-800">{formatINR(item.total_price)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-400">
                                                    No products found in this quotation
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Financial Breakdown */}
                        <div className="flex justify-end">
                            <div className="w-full lg:w-1/2 bg-[#fafffe] p-10 rounded-[2.5rem] border border-teal-100/50 space-y-5 shadow-sm">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-black uppercase tracking-widest">Subtotal (Net)</span>
                                    <span className="font-bold text-slate-700">{formatINR(quotationData.subtotal || 0)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-black uppercase tracking-widest">Trade Discount</span>
                                    <span className="font-black text-rose-500">- {formatINR(quotationData.discount || 0)}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-black uppercase tracking-widest">Taxation (GST)</span>
                                    <span className="font-bold text-slate-700">+ {formatINR(quotationData.tax || 0)}</span>
                                </div>

                                <div className="pt-6 border-t border-teal-100 flex justify-between items-center">
                                    <span className="font-black text-slate-800 text-sm uppercase tracking-widest">Final Amount</span>
                                    <div className="text-right">
                                        <span className="font-black text-3xl text-[#005d52] tracking-tighter">
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
                                    {quotationData.notes || "No additional strategic notes provided for this proposal."}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Terms of Business</h3>
                                <p className="text-xs text-slate-500 whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    {quotationData.terms_conditions || "1. Payment due within 30 days\n2. Goods once sold cannot be returned\n3. Warranty as per manufacturer terms"}
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