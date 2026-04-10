import React, { useEffect, useState } from 'react';
import { 
    ChevronRight, 
    Building2, 
    List, 
    Truck, 
    CheckCircle, 
    Clock, 
    Loader2, 
    Download, 
    User, 
    MapPin, 
    Package,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

import { getOrder, clearSalesErrors, updateOrderStatus } from "../ModuleStateFiles/OrderSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

const OrderView: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const [isUpdating, setIsUpdating] = useState(false);

    const { order, loading } = useAppSelector((state: RootState) => state.SalesOrder);

    useEffect(() => {
        if (id) {
            dispatch(getOrder(id));
        }
        return () => { dispatch(clearSalesErrors()); };
    }, [dispatch, id]);

    // ✅ Status Update Handler
    const handleStatusUpdate = async (newStatus: string) => {
        if (!id || newStatus === order?.status) return;
        
        setIsUpdating(true);
        try {
            await dispatch(updateOrderStatus(id, newStatus));
            // Refresh order details
            dispatch(getOrder(id));
        } catch (error) {
            console.error("Status update failed:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatINR = (amount: string | number) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-IN', { 
            style: 'currency', 
            currency: 'INR', 
            maximumFractionDigits: 0 
        }).format(val || 0);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const getOrderStages = (status: string) => {
        const stages = [
            { name: 'Order Placed', completed: true },
            { name: 'Processing', completed: false },
            { name: 'Dispatched', completed: false },
            { name: 'Delivered', completed: false },
        ];

        if (status === "Processing") {
            stages[1].completed = true;
        } else if (status === "Delivered") {
            stages[1].completed = true;
            stages[2].completed = true;
            stages[3].completed = true;
        } else if (status === "Cancelled") {
            return [
                { name: 'Order Placed', completed: true },
                { name: 'Processing', completed: false },
                { name: 'Cancelled', completed: true },
            ];
        }
        return stages;
    };

    const getProgressPercentage = (status: string) => {
        switch(status) {
            case "Delivered": return 100;
            case "Processing": return 50;
            case "Pending": return 25;
            case "Cancelled": return 100;
            default: return 25;
        }
    };

    const handleExport = () => {
        const element = document.getElementById('order-pdf-content');
        if (element && order) {
            const opt = {
                margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
                filename: `Order_${order.order_id}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
            };
            html2pdf().set(opt).from(element).save();
        }
    };

    if (loading && !order?.order_id) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="animate-spin text-[#005d52] mb-4" size={48} />
                <p className="text-sm font-black text-[#005d52] uppercase tracking-widest">Loading Shipment Data...</p>
            </div>
        );
    }

    const stages = getOrderStages(order?.status || 'Pending');

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-2 text-[10px] font-black uppercase tracking-widest">
                            <button onClick={() => navigate("/sales/orders")} className="hover:text-[#005d52] transition-colors">Order Registry</button>
                            <ChevronRight size={12} />
                            <span className="text-[#005d52]">{order?.order_id}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Order Lifecycle</h1>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                order?.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                order?.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                order?.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                                {order?.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-600 px-6 py-3.5 rounded-2xl font-bold text-xs border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                            <Download size={16} /> Export PDF
                        </button>
                        
                        {/* ✅ Status Update Dropdown */}
                        <div className="relative">
                            <select
                                value={order?.status || 'Pending'}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                disabled={isUpdating}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-3.5 rounded-2xl font-bold text-xs shadow-xl shadow-teal-900/20 hover:bg-[#004a41] transition-all disabled:opacity-50 cursor-pointer appearance-none pr-10"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                {isUpdating ? (
                                    <Loader2 size={14} className="animate-spin text-white" />
                                ) : (
                                    <ChevronRight size={14} className="text-white rotate-90" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div id="order-pdf-content" className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    
                    <div className="bg-slate-50/80 p-10 border-b border-slate-100">
                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 rounded-full z-0" />
                            <div 
                                className={`absolute top-5 left-0 h-1 transition-all duration-1000 z-0 rounded-full ${order?.status === 'Cancelled' ? 'bg-rose-500' : 'bg-[#005d52]'}`} 
                                style={{ width: `${getProgressPercentage(order?.status || 'Pending')}%` }} 
                            />

                            <div className="flex justify-between items-start relative z-10">
                                {stages.map((stage, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center transition-all ${
                                            stage.completed 
                                            ? (order?.status === 'Cancelled' && stage.name === 'Cancelled' ? 'bg-rose-500 text-white' : 'bg-[#005d52] text-white') 
                                            : 'bg-slate-200 text-slate-400'
                                        }`}>
                                            {stage.completed ? <CheckCircle size={18} /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                                        </div>
                                        <span className={`mt-4 text-[9px] font-black uppercase tracking-widest ${
                                            stage.completed ? (order?.status === 'Cancelled' ? 'text-rose-500' : 'text-[#005d52]') : 'text-slate-300'
                                        }`}>
                                            {stage.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 md:p-14 space-y-14">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="bg-slate-50/50 p-8 rounded-4xl border border-slate-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-teal-50 text-[#005d52] rounded-xl border border-teal-100"><Building2 size={18}/></div>
                                    <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Shipping & Billing</h3>
                                </div>
                                <h4 className="font-black text-xl text-[#005d52] mb-3">{order?.customer_name}</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2 text-slate-500">
                                        <MapPin size={16} className="mt-0.5 shrink-0" />
                                        <p className="text-sm font-medium leading-relaxed italic">{order?.shipping_address || "No shipping address provided in records."}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200/60 text-xs font-bold text-slate-400 space-y-2 uppercase tracking-tight">
                                        <p className="flex items-center gap-2"><User size={14} className="text-teal-600"/> Contact: {order?.sales_rep_name || "N/A"}</p>
                                        <p>Email: {order?.email || "N/A"}</p>
                                        <p>Phone: {order?.phone || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-8 rounded-4xl border border-slate-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-teal-50 text-[#005d52] rounded-xl border border-teal-100"><Truck size={18}/></div>
                                    <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Order Logistics</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-y-8">
                                    <DetailItem label="Booking Date" value={formatDate(order?.order_date || null)} />
                                    <DetailItem label="Quote Reference" value={`#QT-${order?.quotation_id}`} />
                                    <DetailItem label="Sales Representative" value={order?.sales_rep_name} />
                                    <DetailItem label="Fulfillment" value={order?.status} isStatus />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-50 text-[#005d52] rounded-xl border border-teal-100"><List size={18}/></div>
                                <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Product manifest</h3>
                            </div>
                            
                            <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <th className="p-5">SKU Description</th>
                                            <th className="p-5 text-center">Qty</th>
                                            <th className="p-5 text-right">Unit Rate</th>
                                            <th className="p-5 text-right">Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {order?.items?.map((item, idx) => (
                                            <tr key={item.id || idx} className="text-sm hover:bg-slate-50/50 transition-colors">
                                                <td className="p-5 font-bold text-slate-700 flex items-center gap-3">
                                                    <Package size={14} className="text-slate-300" />
                                                    {item.product_name}
                                                </td>
                                                <td className="p-5 text-center text-slate-500 font-bold">{item.quantity}</td>
                                                <td className="p-5 text-right text-slate-500">{formatINR(item.unit_price)}</td>
                                                <td className="p-5 text-right font-black text-slate-800">{formatINR(item.total_price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end p-6 bg-slate-50 rounded-4xl border border-slate-100">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable Amount</p>
                                    <span className="font-black text-3xl text-[#005d52] flex items-baseline gap-1">
                                        <span className="text-lg font-bold">₹</span>
                                        {Number(order?.total_amount).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#fafffe] border-l-4 border-[#005d52] p-8 rounded-r-3xl shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-teal-50">
                                    <Clock className="text-[#005d52]" size={18} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-2">
                                        Status Update & Intelligence
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        {order?.notes ? `"${order.notes}"` : (
                                            order?.status === "Cancelled" 
                                            ? "Record marked as cancelled. Fulfillment process halted."
                                            : order?.status === "Delivered"
                                            ? "Consignment has been confirmed as received by client site representative."
                                            : "Inventory allocated. Order is currently undergoing quality checks prior to dispatch scheduling."
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-slate-50 border-t border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            Official ERP Document • Order Lifecycle Registry • {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value: string | null; isStatus?: boolean }> = ({ 
    label, value, isStatus 
}) => (
    <div className="flex flex-col gap-1">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        {isStatus ? (
            <span className="text-[11px] font-black text-[#005d52] uppercase tracking-wider">
                {value || "Processing"}
            </span>
        ) : (
            <span className="text-[13px] font-bold text-slate-700">
                {value || "N/A"}
            </span>
        )}
    </div>
);

export default OrderView;