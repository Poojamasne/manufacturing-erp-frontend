import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, Save,  Calendar, 
    Box, Settings, AlertCircle, CheckCircle,
    Clock,  Package, ClipboardList,
    User, Building2, 
} from 'lucide-react';

type ProdStatus = "In Progress" | "On Hold" | "Completed" | "Delayed";
type Stage = "Raw Materials" | "Cutting" | "Assembly" | "Quality Check" | "Packaging";

interface ProductionJob {
    id: string;
    orderRef: string;
    product: string;
    quantity: number;
    stage: Stage;
    status: ProdStatus;
    updatedAt: string;
    // Additional fields for detailed view
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    startDate?: string;
    expectedCompletion?: string;
    assignedTeam?: string;
    supervisor?: string;
    notes?: string;
    materials?: Array<{
        name: string;
        quantity: number;
        unit: string;
        status: 'Available' | 'In-Transit' | 'Required';
    }>;
    qualityChecks?: Array<{
        checkPoint: string;
        status: 'Passed' | 'Pending' | 'Failed';
        date: string;
        inspector: string;
    }>;
}

const ProductionEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('details');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Mock data for existing job (in real app, fetch from API)
    const [job, setJob] = useState<ProductionJob>({
        id: id || "PROD-1029",
        orderRef: "ORD-001",
        product: "Standard Control Panel",
        quantity: 15,
        stage: "Assembly",
        status: "In Progress",
        updatedAt: "2026-03-25",
        customerName: "Rajesh Electronics",
        customerEmail: "contact@rajeshelectronics.com",
        customerPhone: "+91 9876543210",
        startDate: "2026-03-20",
        expectedCompletion: "2026-04-05",
        assignedTeam: "Assembly Team A",
        supervisor: "Rahul Patil",
        notes: "Priority order - Need to expedite assembly process. Customer requested additional quality checks.",
        materials: [
            { name: "Control Board", quantity: 15, unit: "pcs", status: "Available" },
            { name: "Wiring Harness", quantity: 30, unit: "meters", status: "Available" },
            { name: "Casing", quantity: 15, unit: "pcs", status: "In-Transit" },
            { name: "Power Supply Unit", quantity: 15, unit: "pcs", status: "Available" },
        ],
        qualityChecks: [
            { checkPoint: "Raw Material Inspection", status: "Passed", date: "2026-03-20", inspector: "Amit Kumar" },
            { checkPoint: "Component Assembly", status: "Pending", date: "", inspector: "" },
            { checkPoint: "Final Testing", status: "Pending", date: "", inspector: "" },
        ]
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const statuses: ProdStatus[] = ["In Progress", "On Hold", "Completed", "Delayed"];


    const getStatusColor = (status: string) => {
        switch(status) {
            case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
            case "On Hold": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Completed": return "bg-green-100 text-green-700 border-green-200";
            case "Delayed": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!job.product) newErrors.product = 'Product name is required';
        if (!job.quantity || job.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
        if (!job.orderRef) newErrors.orderRef = 'Order reference is required';
        if (!job.expectedCompletion) newErrors.expectedCompletion = 'Expected completion date is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Saving Production Job:', job);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setIsSaving(false);
        
        // In real app, you would navigate back or stay
        navigate('/sales/production');
    };

    const updateJob = (field: keyof ProductionJob, value: any) => {
        setJob(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const { [field]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const updateMaterial = (index: number, field: string, value: any) => {
        const updatedMaterials = [...(job.materials || [])];
        updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
        setJob(prev => ({ ...prev, materials: updatedMaterials }));
    };

    const updateQualityCheck = (index: number, field: string, value: any) => {
        const updatedChecks = [...(job.qualityChecks || [])];
        updatedChecks[index] = { ...updatedChecks[index], [field]: value };
        setJob(prev => ({ ...prev, qualityChecks: updatedChecks }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate('/sales/production')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Edit Production Job</h1>
                                <p className="text-xs text-gray-500">{job.id}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">

                                                <button
                        onClick={() => navigate('/sales/production')}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2 text-white bg-[#005d52] rounded-lg hover:bg-[#004a41] transition-colors disabled:opacity-50 shadow-lg shadow-teal-900/20"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-600" />
                            <p className="text-green-700 font-medium">Production job updated successfully!</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Status Banner */}
                <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                                {job.status}
                            </div>
                            <div className="text-sm text-gray-500">
                                Last updated: {job.updatedAt}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={16} className="text-gray-400" />
                                <span>Started: {job.startDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className="text-gray-400" />
                                <span>Expected: {job.expectedCompletion}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}


                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {[
                            { id: 'details', label: 'Job Details', icon: ClipboardList },
                            { id: 'materials', label: 'Materials', icon: Package },
                            { id: 'quality', label: 'Quality Control', icon: CheckCircle },
                            { id: 'notes', label: 'Notes & Info', icon: Settings },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'text-[#005d52] border-b-2 border-[#005d52]'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Job Details Tab */}
                {activeTab === 'details' && (
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Box size={20} className="text-[#005d52]" />
                                    Basic Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={job.product}
                                            onChange={(e) => updateJob('product', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent ${
                                                errors.product ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.product && (
                                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle size={12} /> {errors.product}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            value={job.quantity}
                                            onChange={(e) => updateJob('quantity', parseInt(e.target.value) || 0)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent ${
                                                errors.quantity ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.quantity && (
                                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle size={12} /> {errors.quantity}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Order Reference *
                                        </label>
                                        <input
                                            type="text"
                                            value={job.orderRef}
                                            onChange={(e) => updateJob('orderRef', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent ${
                                                errors.orderRef ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.orderRef && (
                                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle size={12} /> {errors.orderRef}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={job.status}
                                            onChange={(e) => updateJob('status', e.target.value as ProdStatus)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar size={20} className="text-[#005d52]" />
                                    Timeline
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={job.startDate}
                                            onChange={(e) => updateJob('startDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Expected Completion *
                                        </label>
                                        <input
                                            type="date"
                                            value={job.expectedCompletion}
                                            onChange={(e) => updateJob('expectedCompletion', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent ${
                                                errors.expectedCompletion ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.expectedCompletion && (
                                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle size={12} /> {errors.expectedCompletion}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Building2 size={20} className="text-[#005d52]" />
                                    Customer Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Customer Name
                                        </label>
                                        <input
                                            type="text"
                                            value={job.customerName}
                                            onChange={(e) => updateJob('customerName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={job.customerEmail}
                                            onChange={(e) => updateJob('customerEmail', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={job.customerPhone}
                                            onChange={(e) => updateJob('customerPhone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Team Assignment */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User size={20} className="text-[#005d52]" />
                                    Team Assignment
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assigned Team
                                        </label>
                                        <input
                                            type="text"
                                            value={job.assignedTeam}
                                            onChange={(e) => updateJob('assignedTeam', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Supervisor
                                        </label>
                                        <input
                                            type="text"
                                            value={job.supervisor}
                                            onChange={(e) => updateJob('supervisor', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Materials Tab */}
                {activeTab === 'materials' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Package size={20} className="text-[#005d52]" />
                                Raw Materials & Components
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {job.materials?.map((material, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={material.name}
                                                    onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                                                    className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={material.quantity}
                                                    onChange={(e) => updateMaterial(idx, 'quantity', parseFloat(e.target.value))}
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-left"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={material.unit}
                                                    onChange={(e) => updateMaterial(idx, 'unit', e.target.value)}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={material.status}
                                                    onChange={(e) => updateMaterial(idx, 'status', e.target.value as any)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                >
                                                    <option value="Available">Available</option>
                                                    <option value="In-Transit">In-Transit</option>
                                                    <option value="Required">Required</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Quality Control Tab */}
{/* Quality Control Tab */}
{activeTab === 'quality' && (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle size={20} className="text-[#005d52]" />
                Quality Control Checks
            </h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Point</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {job.qualityChecks?.map((check, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                                {check.checkPoint}
                            </td>
                            <td className="px-4 py-3">
                                <select
                                    value={check.status}
                                    onChange={(e) => updateQualityCheck(idx, 'status', e.target.value as any)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#005d52] outline-none"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Passed">Passed</option>
                                    <option value="Failed">Failed</option>
                                </select>
                             </td>
                            <td className="px-4 py-3">
                                <input
                                    type="date"
                                    value={check.date}
                                    onChange={(e) => updateQualityCheck(idx, 'date', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#005d52] outline-none cursor-pointer"
                                    // Removed disabled attribute so you can add dates to pending items
                                />
                             </td>
                            <td className="px-4 py-3">
                                <input
                                    type="text"
                                    placeholder="Inspector Name"
                                    value={check.inspector}
                                    onChange={(e) => updateQualityCheck(idx, 'inspector', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#005d52] outline-none"
                                />
                             </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <ClipboardList size={20} className="text-[#005d52]" />
                                Production Notes
                            </h2>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Internal Notes
                            </label>
                            <textarea
                                rows={6}
                                value={job.notes}
                                onChange={(e) => updateJob('notes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                                placeholder="Add production notes, special instructions, or customer requirements..."
                            />
                        </div>
                    </div>
                )}
            </div>



        </div>
    );
};

export default ProductionEdit;