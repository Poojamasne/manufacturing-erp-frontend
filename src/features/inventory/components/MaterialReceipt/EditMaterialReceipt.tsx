import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronRight,
    Package,
    Save,
    Truck,

    MapPin,
    AlertCircle,
    ChevronDown
} from "lucide-react";

// Redux
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import {
    getReceiptEntry,
    editReceiptEntry
} from "../../ModuleStateFiles/MaterialReceiptSlice";
import { type RootState } from "../../../../app/store/store";


const EditReceiptEntry: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redux State
    const { receipt, loading } = useAppSelector(
        (state: RootState) => state.inventoryMaterialReceipt
    );

    const [formData, setFormData] = useState({
        material_name: "",
        material_code: "",
        quantity_received: 0,
        measure_unit: "",
        batch_number: "",
        supplier_name: "",
        received_date: "",
        warehouse_location: "",
        rack_number: "",
        notes: ""
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // 1. Load the specific receipt into state
    useEffect(() => {
        if (id) {
            dispatch(getReceiptEntry(id));
        }
    }, [id, dispatch]);

    // 2. Sync local form with Redux receipt when it loads
    useEffect(() => {
        if (receipt) {
            setFormData({
                material_name: receipt.material_name || "",
                material_code: receipt.material_code || "",
                quantity_received: Number(receipt.quantity_received) || 0,
                measure_unit: receipt.measure_unit || "",
                batch_number: receipt.batch_number || "",
                supplier_name: receipt.supplier_name || "",
                received_date: receipt.received_date || "",
                warehouse_location: receipt.warehouse_location || "",
                rack_number: receipt.rack_number || "",
                notes: receipt.notes || ""
            });
        }
    }, [receipt]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.material_name) newErrors.material_name = "Select material";
        if (!formData.quantity_received || formData.quantity_received <= 0) newErrors.quantity_received = "Enter valid qty";
        if (!formData.batch_number) newErrors.batch_number = "Batch # is required";
        if (!formData.warehouse_location) newErrors.warehouse_location = "Select warehouse";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (id) {
            dispatch(editReceiptEntry(id, formData, navigate));
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">LOADING...</div>;

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* Header Section (Matching Lead Theme) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <button onClick={() => navigate("/inventory/material-receipts")} className="hover:text-[#F59E0B] transition-colors font-medium">Material Receipts</button>
                            <ChevronRight size={14} />
                            <span className="text-gray-800 font-bold">Edit Entry</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Edit Receipt</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium font-mono tracking-tighter">
                            RECORD ID: {receipt?.receipt_id}
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => navigate("/inventory/material-receipts")}
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[#F59E0B] shadow-lg shadow-amber-500/10 hover:bg-[#f67317] transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Update Changes
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Section 1: Material Details */}
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                        <SectionTitle icon={<Package size={20} />} title="Material & Quantity" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <FormInput
                                label="Material Name"
                                name="material_name"
                                value={formData.material_name}
                                onChange={handleInputChange}
                                required
                                error={errors.material_name}
                            />
                            <FormInput
                                label="Quantity Received"
                                name="quantity_received"
                                type="number"
                                value={formData.quantity_received.toString()}
                                onChange={handleInputChange}
                                required
                                error={errors.quantity_received}
                            />
                            <FormSelect
                                label="Measure Unit"
                                name="measure_unit"
                                value={formData.measure_unit}
                                onChange={handleInputChange}
                                options={[
                                    { l: "Kilograms (kg)", v: "kg" },
                                    { l: "Meters (m)", v: "meters" },
                                    { l: "Liters (L)", v: "liters" },
                                    { l: "Sheets", v: "sheets" },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Section 2: Supply Chain */}
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                        <SectionTitle icon={<Truck size={20} />} title="Procurement Info" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <FormInput
                                label="Batch Number"
                                name="batch_number"
                                value={formData.batch_number}
                                onChange={handleInputChange}
                                required
                                error={errors.batch_number}
                            />
                            <FormInput
                                label="Supplier"
                                name="supplier_name"
                                value={formData.supplier_name}
                                onChange={handleInputChange}
                            />
                            <FormInput
                                label="Receipt Date"
                                name="received_date"
                                type="date"
                                value={formData.received_date}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Section 3: Storage */}
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                        <SectionTitle icon={<MapPin size={20} />} title="Warehouse Allocation" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <FormSelect
                                label="Location"
                                name="warehouse_location"
                                value={formData.warehouse_location}
                                onChange={handleInputChange}
                                options={[
                                    { l: "Main Warehouse (WH-1)", v: "Warehouse A" },
                                    { l: "Cold Storage (WH-2)", v: "Warehouse B" },
                                ]}
                            />
                            <FormInput
                                label="Rack / Shelf"
                                name="rack_number"
                                value={formData.rack_number}
                                onChange={handleInputChange}
                                placeholder="e.g. R-12"
                            />
                        </div>
                        <div className="mt-6 flex flex-col gap-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Internal Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all resize-none font-medium text-slate-800"
                                placeholder="Damage reports, quality checks, etc..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Atomic Components (Identical to Lead Form) ---

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#f3f4e6] text-[#F59E0B] rounded-xl border border-[#f3f4e6] shadow-sm">
            {icon}
        </div>
        <h3 className="font-bold text-xl text-slate-800 tracking-tight">{title}</h3>
    </div>
);

const FormInput: React.FC<{ label: string; name: string; error?: string; required?: boolean;[key: string]: any }> = ({ label, name, error, required, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
            {label} {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        <div className="relative group">
            <input
                {...props}
                name={name}
                className={`w-full bg-slate-50 border ${error ? "border-rose-300 ring-4 ring-rose-50" : "border-slate-200"} rounded-xl px-4 py-3 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all font-bold text-slate-800`}
            />
            {error && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400" size={16} />}
        </div>
        {error && <p className="text-[10px] font-bold text-rose-600 px-1">{error}</p>}
    </div>
);

const FormSelect: React.FC<{ label: string; name: string; options: { l: string; v: any }[]; error?: string; required?: boolean;[key: string]: any }> = ({ label, name, options, error, required, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
            {label} {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        <div className="relative">
            <select
                {...props}
                name={name}
                className={`w-full bg-slate-50 border ${error ? "border-rose-300 ring-4 ring-rose-50" : "border-slate-200"} rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-slate-800`}
            >
                <option value="">Select option</option>
                {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    </div>
);

export default EditReceiptEntry;