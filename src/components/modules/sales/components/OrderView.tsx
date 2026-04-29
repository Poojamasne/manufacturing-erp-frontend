import React, { useEffect, useState, useMemo } from 'react';
import {
    ChevronRight,
    Building2,
    Truck,
    Loader2,
    Download,
    MapPin,
    Package,
    Clock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { getOrder, clearSalesErrors, updateOrderStatus, getOrderForReport } from "../ModuleStateFiles/OrderSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

const OrderView: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const [isUpdating, setIsUpdating] = useState(false);

    const { order } = useAppSelector((state: RootState) => state.SalesOrder);

    useEffect(() => {
        if (id) {
            dispatch(getOrder(id));
        }
        return () => { dispatch(clearSalesErrors()); };
    }, [dispatch, id]);

    // Your specific Stage Logic
    const getOrderStages = (status: string) => {
        const stages = [
            { name: 'Order Placed', completed: true },
            { name: 'Processing', completed: false },
            { name: 'Dispatched', completed: false },
            { name: 'Delivered', completed: false },
        ];

        if (status === "Processing") {
            stages[1].completed = true;
        } else if (status === "Dispatched") {
            stages[1].completed = true;
            stages[2].completed = true;
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

    // Pipeline Calculation
    const pipelineResult = useMemo(() => {
        const status = order?.status || 'Pending';
        const stages = getOrderStages(status);

        // Find last completed index to calculate progress bar width
        const lastCompletedIndex = [...stages].reverse().findIndex(s => s.completed);
        const currentIndex = lastCompletedIndex >= 0 ? (stages.length - 1) - lastCompletedIndex : 0;

        const progress = (currentIndex / (stages.length - 1)) * 100;

        return {
            progress,
            stages,
            isCancelled: status === "Cancelled"
        };
    }, [order]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!id || newStatus === order?.status) return;
        setIsUpdating(true);
        try {
            await dispatch(updateOrderStatus(id, newStatus));
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

    const handleExport = (orderID: string | number) => {
        dispatch(getOrderForReport(orderID));

    };


    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <button onClick={() => navigate("/sales/orders")} className="hover:text-[#F59E0B] transition-colors">Orders</button>
                            <ChevronRight size={14} />
                            <span className="text-slate-600 font-semibold">{order.order_id}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={() => handleExport(order?.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-white text-gray-600  hover:text-[#F59E0B] px-4 py-2 rounded-xl font-bold text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
                            <Download size={18} /> Download Report
                        </button>

                        <div className="relative flex-1 sm:flex-none outline-none">
                            <select
                                value={order.status || 'Pending'}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                disabled={isUpdating}
                                className="outline-none w-full bg-[#F59E0B] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-[#f67317] transition-all disabled:opacity-50 cursor-pointer appearance-none pr-10"
                            >
                                <option value="Pending">Order Place</option>
                                <option value="Processing">Processing</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} className="rotate-90" />}
                            </div>
                        </div>
                    </div>
                </div>

                <div id="order-pdf-content" className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Integrated Pipeline Visualizer using getOrderStages */}
                    <div className="bg-gray-50/50 p-10 border-b border-gray-100">
                        <div className="relative max-w-2xl mx-auto">
                            {/* Track Background */}
                            <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 z-0 rounded-full" />

                            {/* Progress Track */}
                            <div
                                className={`absolute top-4 left-0 h-1 z-0 transition-all duration-700 rounded-full ${pipelineResult.isCancelled ? 'bg-red-500' : 'bg-[#F59E0B]'}`}
                                style={{ width: `${pipelineResult.progress}%` }}
                            />

                            <div className="flex justify-between items-start relative z-10">
                                {pipelineResult.stages.map((stage, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-colors duration-500 ${stage.completed
                                            ? (pipelineResult.isCancelled && stage.name === "Cancelled" ? 'bg-red-500' : 'bg-[#F59E0B]')
                                            : 'bg-gray-200'
                                            }`}>
                                            {stage.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${stage.completed
                                            ? (pipelineResult.isCancelled && stage.name === "Cancelled" ? 'text-red-500' : 'text-[#F59E0B]')
                                            : 'text-gray-400'
                                            }`}>
                                            {stage.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 space-y-12">
                        {/* Customer & Logistics Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-[#f3f4e6] text-[#F59E0B] rounded-lg"><Building2 size={18} /></div>
                                    <h3 className="text-lg font-semibold text-gray-800">Customer Details</h3>
                                </div>
                                <div className="space-y-4">
                                    <DetailItem label="Customer Name" value={order.customer_name} />
                                    <div className="flex items-start gap-2 text-gray-500 text-sm">
                                        <MapPin size={16} className="mt-1 shrink-0 text-[#F59E0B]" />
                                        <p className="italic leading-relaxed">{order.shipping_address || "No shipping address provided"}</p>
                                    </div>
                                    <div className="pt-4 grid grid-cols-2 gap-4 border-t border-gray-50">
                                        <DetailItem label="Email" value={order.email} />
                                        <DetailItem label="Phone" value={order.phone} />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-[#f3f4e6] text-[#F59E0B] rounded-lg"><Truck size={18} /></div>
                                    <h3 className="text-lg font-semibold text-gray-800">Order Intelligence</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-y-8">
                                    <DetailItem label="Order Date" value={formatDate(order.order_date)} />
                                    <DetailItem label="Quote Ref" value={`#QT-${order.quotation_id}`} />
                                    <DetailItem label="Sales Rep" value={order.sales_rep_name} />
                                    <DetailItem label="Fulfillment" value={order.status} isStatus />
                                </div>
                            </section>
                        </div>

                        {/* Manifest */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-[#f3f4e6] text-[#F59E0B] rounded-lg"><Package size={20} /></div>
                                <h3 className="text-lg font-semibold text-gray-800">Product Manifest</h3>
                            </div>
                            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <th className="p-4">SKU Description</th>
                                            <th className="p-4 text-center">Qty</th>
                                            <th className="p-4 text-right">Unit Rate</th>
                                            <th className="p-4 text-right">Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {order.items?.map((item, idx) => (
                                            <tr key={idx} className="text-sm hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 font-semibold text-gray-800">{item.product_name}</td>
                                                <td className="p-4 text-center text-gray-600">{item.quantity}</td>
                                                <td className="p-4 text-right text-gray-600">{formatINR(item.unit_price)}</td>
                                                <td className="p-4 text-right font-bold text-[#F59E0B]">{formatINR(item.total_price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="bg-[#F59E0B] p-6 flex justify-end text-white">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Total Payable Amount</p>
                                        <p className="text-2xl font-bold">{formatINR(order.total_amount)}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Notes Section */}
                        <section>
                            <div className="bg-[#fafffe] border-l-4 border-[#F59E0B] p-6 rounded-r-2xl flex items-start gap-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-orange-50">
                                    <Clock className="text-[#F59E0B]" size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fulfillment Intelligence</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed italic">
                                        {order.notes || (
                                            pipelineResult.isCancelled
                                                ? "Record marked as cancelled. Logistic processes and inventory allocation halted."
                                                : "Inventory check and quality audit in progress. Consignment is scheduled for dispatch shortly."
                                        )}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value: string | null; isStatus?: boolean }> = ({ label, value, isStatus }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        {isStatus ? (
            <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold border ${value === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                value === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                {value || "-"}
            </span>
        ) : (
            <span className="text-sm font-semibold text-gray-800">{value || "-"}</span>
        )}
    </div>
);

export default OrderView;