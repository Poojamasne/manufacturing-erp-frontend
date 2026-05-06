import React, { useState } from "react";
import {
    Package, Layers, Truck,
    MapPin, ChevronRight, Save,
    ChevronDown,
    NotebookPen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../common/ReduxMainHooks";
import { createReceiptEntry } from "../../ModuleStateFiles/MaterialReceiptSlice";

const NewMaterialReceipt: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState({
        material_code: "",
        material_name: "",
        quantity_received: "",
        measure_unit: "",
        supplier_name: "",
        batch_number: "",
        received_date: new Date().toISOString().split('T')[0],
        warehouse_location: "WH-1",
        rack_number: "",
        notes: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving Receipt:", formData);
        dispatch(createReceiptEntry(formData, navigate));
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">

                {/* --- Header Section (Matching Lead Form) --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <button onClick={() => navigate("/inventory/material-receipts")} className="hover:text-[#F59E0B] transition-colors font-medium">Material Receipts</button>
                            <ChevronRight size={14} />
                            <span className="text-gray-800 font-bold">New Entry</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Stock Entry</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Record incoming materials to warehouse_location</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => navigate("/inventory/material-receipts")}
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[#F59E0B] shadow-lg shadow-amber-500/10 hover:bg-[#f67317] transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Complete Entry
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Section 1: Material Details */}
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                        <SectionTitle icon={<Package size={20} />} title="Material & Quantity" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Select Material Name</label>
                                <div className="relative group">
                                    <select
                                        required
                                        value={formData.material_name}
                                        onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm appearance-none outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-slate-800 cursor-pointer"
                                    >
                                        <option value="">Choose from Master...</option>
                                        <option value="Steel Grade A">Steel Grade A</option>
                                        <option value="Copper Wire 2mm">Copper Wire 2mm</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Select Material Code</label>
                                <div className="relative group">
                                    <select
                                        required
                                        value={formData.material_code}
                                        onChange={(e) => setFormData({ ...formData, material_code: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm appearance-none outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-slate-800 cursor-pointer"
                                    >
                                        <option value="">Choose from Master...</option>
                                        <option value="MAT-001">MAT-001</option>
                                        <option value="MAT-042">MAT-042</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Quantity Unit</label>
                                <div className="relative group">
                                    <Layers
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                        size={18}
                                    />

                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all font-bold text-slate-800 appearance-none"
                                        value={formData.measure_unit}
                                        onChange={(e) =>
                                            setFormData({ ...formData, measure_unit: e.target.value })
                                        }
                                    >
                                        <option value="">Select Unit</option>
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="g">Gram (g)</option>
                                        <option value="ltr">Liter (L)</option>
                                        <option value="ml">Milliliter (ml)</option>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="box">Box</option>
                                        <option value="pack">Pack</option>
                                        <option value="meter">Meter (m)</option>
                                        <option value="cm"> Centi Meter (cm)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">

                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Quantity Unit</label>
                                <div className="relative group">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all font-bold text-slate-800"
                                        value={formData.quantity_received}
                                        onChange={(e) => setFormData({ ...formData, quantity_received: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Note</label>
                                <div className="relative group">
                                    <NotebookPen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        min={1}
                                        required
                                        placeholder="Enter note"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all font-bold text-slate-800"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Supply Chain */}
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                        <SectionTitle icon={<Truck size={20} />} title="Procurement Info" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Batch Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. B-9920"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none font-bold"
                                    value={formData.batch_number}
                                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Supplier</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Vendor Name"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none font-bold"
                                    value={formData.supplier_name}
                                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Receipt Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none font-bold"
                                    value={formData.received_date}
                                    onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Storage */}
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
                        <SectionTitle icon={<MapPin size={20} />} title="Warehouse Allocation" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Location</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none font-bold"
                                    value={formData.warehouse_location}
                                    onChange={(e) => setFormData({ ...formData, warehouse_location: e.target.value })}
                                >
                                    <option value="WH-1">Main Warehouse (WH-1)</option>
                                    <option value="WH-2">Cold Storage (WH-2)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Rack / Shelf</label>
                                <input
                                    type="text"
                                    placeholder="e.g. R-12 / B-04"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none font-bold"
                                    value={formData.rack_number}
                                    onChange={(e) => setFormData({ ...formData, rack_number: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Internal Atomic Component
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#f3f4e6] text-[#F59E0B] rounded-xl border border-[#f3f4e6] shadow-sm">
            {icon}
        </div>
        <h3 className="font-bold text-xl text-slate-800 tracking-tight">{title}</h3>
    </div>
);

export default NewMaterialReceipt;