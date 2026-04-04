import React, { useState, useEffect } from 'react';
import { ChevronRight, Building2, Download, List, Truck, CheckCircle, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

// Define the Order type matching the OrderList
type OrderStatus = "Pending" | "Processing" | "Delivered" | "Cancelled";

type Order = {
    id: string;
    customer: string;
    date: string;
    amount: string;
    status: OrderStatus;
    salesRep: string;
};

// This should match the data from OrderList or come from an API
const ORDERS_DATA: Order[] = [
    { id: "ORD-001", customer: "Rajesh Electronics", date: "25-03-2026", amount: "₹ 25.5L", status: "Processing", salesRep: "Rahul Patil" },
    { id: "ORD-002", customer: "Modern Appliances", date: "10-03-2026", amount: "₹ 5.5L", status: "Pending", salesRep: "Sneha P." },
    { id: "ORD-003", customer: "Kitchen Hub", date: "15-02-2026", amount: "₹ 11.2L", status: "Delivered", salesRep: "Rahul Patil" },
    { id: "ORD-004", customer: "Elite Tech Solutions", date: "19-03-2026", amount: "₹ 18.75L", status: "Pending", salesRep: "Amit S." },
    { id: "ORD-005", customer: "Global Traders", date: "05-01-2026", amount: "₹ 42.0L", status: "Cancelled", salesRep: "Sneha P." },
    { id: "ORD-006", customer: "Oceanic Resorts", date: "20-03-2026", amount: "₹ 14.2L", status: "Processing", salesRep: "Rahul Patil" },
    { id: "ORD-007", customer: "Sunshine Schools", date: "15-01-2026", amount: "₹ 8.1L", status: "Delivered", salesRep: "Amit S." },
];

const OrderView: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        // Find the order by ID from the URL parameter
        const foundOrder = ORDERS_DATA.find(o => o.id === id);
        if (foundOrder) {
            setOrder(foundOrder);
        }
    }, [id]);

    // Function to get order stages based on status
    const getOrderStages = (status: OrderStatus) => {
        switch(status) {
            case "Delivered":
                return [
                    { name: 'Order Placed', completed: true },
                    { name: 'Processing', completed: true },
                    { name: 'Dispatched', completed: true },
                    { name: 'Delivered', completed: true },
                ];
            case "Processing":
                return [
                    { name: 'Order Placed', completed: true },
                    { name: 'Processing', completed: true },
                    { name: 'Dispatched', completed: false },
                    { name: 'Delivered', completed: false },
                ];
            case "Pending":
                return [
                    { name: 'Order Placed', completed: true },
                    { name: 'Processing', completed: false },
                    { name: 'Dispatched', completed: false },
                    { name: 'Delivered', completed: false },
                ];
            case "Cancelled":
                return [
                    { name: 'Order Placed', completed: true },
                    { name: 'Processing', completed: false },
                    { name: 'Dispatched', completed: false },
                    { name: 'Cancelled', completed: true },
                ];
            default:
                return [
                    { name: 'Order Placed', completed: true },
                    { name: 'Processing', completed: false },
                    { name: 'Dispatched', completed: false },
                    { name: 'Delivered', completed: false },
                ];
        }
    };

    // Function to get status color
    const getStatusColor = (status: OrderStatus) => {
        switch(status) {
            case "Pending": return "bg-orange-50 text-orange-600 border-orange-200";
            case "Processing": return "bg-blue-50 text-blue-600 border-blue-200";
            case "Delivered": return "bg-green-50 text-green-600 border-green-200";
            case "Cancelled": return "bg-red-50 text-red-600 border-red-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    };

    // Get the progress percentage for the pipeline
    const getProgressPercentage = (status: OrderStatus) => {
        switch(status) {
            case "Delivered": return 100;
            case "Processing": return 50;
            case "Pending": return 25;
            case "Cancelled": return 25;
            default: return 0;
        }
    };

    const orderStages = order ? getOrderStages(order.status) : [];
    const progressPercentage = order ? getProgressPercentage(order.status) : 0;

    const lineItems = [
        { id: '1', description: 'Advanced Manufacturing Unit V2', quantity: 1, unitPrice: 1500000 },
        { id: '2', description: 'Annual Maintenance Contract (1 Yr)', quantity: 1, unitPrice: 120000 },
    ];

    const handleExport = () => {
        const element = document.getElementById('order-pdf-content');
        if (element && order) {
            const opt = {
                margin:       0.2,
                filename:     `Order_${order.id}.pdf`,
                image:        { type: 'jpeg' as const, quality: 0.98 },
                html2canvas:  { scale: 1 },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
            };
            html2pdf().set(opt).from(element).save();
        }
    };

    const formatINR = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <p className="text-gray-400">Order not found</p>
                    <button 
                        onClick={() => navigate("/sales/orders")}
                        className="mt-4 text-[#005d52] hover:underline"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <button onClick={() => navigate("/sales/orders")} className="hover:text-[#005d52] transition-colors">Sales Orders</button>
                            <ChevronRight size={14} />
                            <span className="text-gray-800 font-medium">{order.id}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-800">Order Information</h1>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleExport} className="flex items-center gap-2 bg-white text-gray-600 px-5 py-2.5 rounded-full font-bold text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
                            <Download size={18} /> Download Target
                        </button>
                    </div>
                </div>

                <div id="order-pdf-content" className="bg-white rounded-4xl shadow-sm border border-gray-100">
                    
                    {/* Pipeline Visualizer */}
                    <div className="bg-gray-50/50 p-8 border-b border-gray-100 rounded-t-4xl">
                        <div className="flex justify-between items-start relative max-w-2xl mx-auto">
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0" />
                            <div className="absolute top-4 left-0 h-0.5 bg-[#005d52] z-0 transition-all duration-500" 
                                 style={{ width: `${progressPercentage}%` }} />

                            {orderStages.map((stage, index) => (
                                <div key={index} className="relative z-10 flex flex-col items-center group">
                                    <div className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all ${
                                        stage.completed ? 'bg-[#005d52] scale-110' : 'bg-gray-200'
                                    }`}>
                                        {stage.completed && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${
                                        stage.completed ? 'text-[#005d52]' : 'text-gray-400'
                                    }`}>
                                        {stage.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 space-y-10">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-[#fcfdfdf0] p-6 rounded-3xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><Building2 size={18}/></div>
                                    <h3 className="font-bold text-gray-800">Bill To / Deliver To</h3>
                                </div>
                                <h4 className="font-bold text-lg text-[#005d52] mb-1">{order.customer}</h4>
                                <p className="text-gray-600 text-sm">Industrial Estate Road, Building B</p>
                                <p className="text-gray-600 text-sm mb-4">Navi Mumbai, Maharashtra, 400708</p>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-800">Contact: Rakesh Patil</p>
                                    <p className="text-gray-600">+91 98692 26825</p>
                                </div>
                            </div>

                            <div className="bg-[#fcfdfdf0] p-6 rounded-3xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><Truck size={18}/></div>
                                    <h3 className="font-bold text-gray-800">Fulfillment Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-y-6 mt-4">
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Order Date</p>
                                        <p className="font-medium text-gray-800">{order.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Target Dispatch</p>
                                        <p className="font-bold text-orange-500">
                                            {order.status === "Delivered" ? "Delivered" : 
                                             order.status === "Processing" ? "2026-04-05" : 
                                             order.status === "Pending" ? "Pending confirmation" : "Cancelled"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Sales Rep</p>
                                        <p className="font-medium text-gray-800">{order.salesRep}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Payment Term</p>
                                        <p className="font-medium text-gray-800">Net 30/Advance</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><List size={18}/></div>
                                <h3 className="font-bold text-gray-800">Line Items</h3>
                            </div>
                            
                            <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/80 border-b border-gray-100">
                                        <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                            <th className="p-4 rounded-tl-2xl">Description</th>
                                            <th className="p-4 text-center">Qty</th>
                                            <th className="p-4 text-right">Unit Price</th>
                                            <th className="p-4 text-right rounded-tr-2xl">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {lineItems.map(item => (
                                            <tr key={item.id} className="text-sm">
                                                <td className="p-4 font-medium text-gray-800">{item.description}</td>
                                                <td className="p-4 text-center text-gray-600">{item.quantity}</td>
                                                <td className="p-4 text-right text-gray-600">{formatINR(item.unitPrice)}</td>
                                                <td className="p-4 text-right font-bold text-gray-800">{formatINR(item.quantity * item.unitPrice)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end mt-4">
                                <span className="font-black text-2xl text-[#005d52]">Total: {order.amount}</span>
                            </div>
                        </div>

                        <div className="bg-[#f1f8f7] border-l-4 border-[#005d52] p-6 rounded-r-2xl">
                            <div className="flex items-start gap-3">
                                <Clock className="text-[#005d52] mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">
                                        {order.status === "Cancelled" ? "Cancellation Note" : "Production Queue Note"}
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {order.status === "Cancelled" 
                                            ? "This order has been cancelled as requested by the customer."
                                            : order.status === "Delivered"
                                            ? "Order has been successfully delivered and confirmed by the customer."
                                            : order.status === "Processing"
                                            ? "Order has been verified. Factory floor has scheduled assembly for early next week. Dispatch ETA is on track."
                                            : "Order is pending verification and payment confirmation."}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderView;