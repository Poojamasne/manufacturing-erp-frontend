import React, { useState, useMemo, useEffect } from "react";
import {
    ChevronRight, Building2, Package, FileText, Plus,
    ChevronDown, Trash2, Save, MapPin, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Redux
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { getProductsForLead } from "../ModuleStateFiles/ProductSlice";
import { getEmployeesForLead } from "../ModuleStateFiles/EmployeeSlice";
import { createLead } from "../ModuleStateFiles/LeadSlice";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Interfaces ---
interface Variant {
    variant_id: number;
    variant_name: string;
    unit_price: string;
}

interface Product {
    product_id: number;
    product_name: string;
    variants: Variant[];
}

interface Employee {
    id: number;
    name: string;
    designation: string;
}

interface ProductRow {
    id: number;
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
}

interface LeadFormData {
    company_name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    gst_number: string;
    lead_source: string;
    priority: string;
    expected_close_date: string;
    followup_date: string;
    notes: string;
    assigned_to: number | "";
}

interface FormErrors {
    [key: string]: string;
}

const LeadForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Select data from Redux
    const { products } = useAppSelector((state: RootState) => state.SalesProduct) as { products: Product[] };
    const { employees } = useAppSelector((state: RootState) => state.SalesEmployee) as { employees: Employee[] | null };

    const [formData, setFormData] = useState<LeadFormData>({
        company_name: "", contact_person: "", phone: "", email: "",
        address: "", city: "", state: "", gst_number: "",
        lead_source: "", priority: "Medium", expected_close_date: "",
        followup_date: "", notes: "", assigned_to: "",
    });

    const [productRows, setProductRows] = useState<ProductRow[]>([
        { id: Date.now(), product_id: "", variant_id: "", quantity: 1, unit_price: 0 }
    ]);

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(getProductsForLead());
        dispatch(getEmployeesForLead());
    }, [dispatch]);

    const summary = useMemo(() => {
        const qty = productRows.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const val = productRows.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.unit_price || 0)), 0);
        return { totalQty: qty, totalValue: val };
    }, [productRows]);

    // --- Validation Logic ---
    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
        if (!formData.contact_person.trim()) newErrors.contact_person = "Contact person is required";
        if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit number";
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.lead_source) newErrors.lead_source = "Select lead source";
        if (!formData.assigned_to) newErrors.assigned_to = "Assign this lead to an employee";

        productRows.forEach((row, _index) => {
            if (!row.product_id) newErrors[`prod_${row.id}`] = "Select product";
            if (!row.variant_id) newErrors[`var_${row.id}`] = "Select variant";
            if (row.quantity <= 0) newErrors[`qty_${row.id}`] = "Qty > 0";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "assigned_to" ? (value === "" ? "" : Number(value)) : value
        }));
        // Clear error when user types
        if (errors[name]) {
            const updatedErrors = { ...errors };
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }
    };

    const handleProductSelect = (id: number, pId: string) => {
        setProductRows(prev => prev.map(row =>
            row.id === id ? { ...row, product_id: pId, variant_id: "", unit_price: 0 } : row
        ));
        setErrors(prev => { const n = { ...prev }; delete n[`prod_${id}`]; return n; });
    };

    const handleVariantSelect = (id: number, vId: string, pId: string) => {
        const productData = products.find(p => p.product_id === Number(pId));
        const variantData = productData?.variants.find(v => v.variant_id === Number(vId));
        const price = variantData ? Number(variantData.unit_price) : 0;

        setProductRows(prev => prev.map(row =>
            row.id === id ? { ...row, variant_id: vId, unit_price: price } : row
        ));
        setErrors(prev => { const n = { ...prev }; delete n[`var_${id}`]; return n; });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const payload = {
            ...formData,
            products: productRows
                .filter(p => p.product_id !== "" && p.variant_id !== "")
                .map(p => ({
                    product_id: p.product_id,
                    variant_id: p.variant_id,
                    quantity: p.quantity,
                    unit_price: p.unit_price
                }))
        };

        console.log("Validation Passed. Final Payload:", payload);
        // Dispatch API Action Here
        dispatch(createLead(payload, navigate))
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <button onClick={() => navigate("/sales/leads")} className="hover:text-[#005d52] transition-colors">Leads</button>
                            <ChevronRight size={14} />
                            <span className="text-gray-800 font-medium">New Lead</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Lead</h1>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button type="button" onClick={() => navigate("/sales/leads")} className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
                        <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#005d52] shadow-lg shadow-teal-900/20 hover:bg-[#004a41] disabled:opacity-70 transition-all flex items-center justify-center gap-2">
                            {isSubmitting ? "Processing..." : <><Save size={18} /> Create Lead</>}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Section 1: Company Info */}
                    <div className="bg-white rounded-4xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                        <SectionTitle icon={<Building2 size={20} />} title="Customer Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormInput label="Company Name" name="company_name" value={formData.company_name} onChange={handleInputChange} required error={errors.company_name} placeholder="e.g. Reliance Ind." />
                            <FormInput label="Contact Person" name="contact_person" value={formData.contact_person} onChange={handleInputChange} required error={errors.contact_person} placeholder="Full Name" />
                            <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required error={errors.phone} placeholder="10 Digit Number" />
                            <FormInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} error={errors.email} placeholder="mail@company.com" />
                            <FormInput label="GST Number" name="gst_number" value={formData.gst_number} onChange={handleInputChange} placeholder="27XXXXX..." />
                            <FormSelect
                                label="Lead Source" name="lead_source" value={formData.lead_source} onChange={handleInputChange} required error={errors.lead_source}
                                options={["Website", "Trade Show", "Referral", "Cold Call", "Existing Client"].map(o => ({ l: o, v: o }))}
                            />
                        </div>
                    </div>

                    {/* Section 2: Products */}
                    <div className="bg-white rounded-4xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                        <SectionTitle icon={<Package size={20} />} title="Requirements & Products" />
                        <div className="space-y-4">
                            {productRows.map((row) => {
                                const selectedProd = products.find(p => p.product_id === Number(row.product_id));
                                return (
                                    <div key={row.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl border transition-all items-end ${errors[`prod_${row.id}`] || errors[`var_${row.id}`] ? 'bg-red-50/30 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
                                        <div className="md:col-span-4">
                                            <FormSelect
                                                label="Product" value={row.product_id} required
                                                error={errors[`prod_${row.id}`]}
                                                onChange={(e) => handleProductSelect(row.id, e.target.value)}
                                                options={products.map(p => ({ l: p.product_name, v: String(p.product_id) }))}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <FormSelect
                                                label="Variant" value={row.variant_id} required
                                                disabled={!row.product_id} error={errors[`var_${row.id}`]}
                                                onChange={(e) => handleVariantSelect(row.id, e.target.value, row.product_id)}
                                                options={selectedProd?.variants.map(v => ({ l: v.variant_name, v: String(v.variant_id) })) || []}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormInput label="Qty" type="number" value={row.quantity} required error={errors[`qty_${row.id}`]} onChange={(e) => setProductRows(prev => prev.map(r => r.id === row.id ? { ...r, quantity: Number(e.target.value) } : r))} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex flex-col gap-1.5 px-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</span>
                                                <div className="h-12 flex items-center bg-white px-4 rounded-xl border border-slate-200 text-sm font-bold text-[#005d52]">
                                                    ₹{row.unit_price.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-1 flex justify-center pb-2">
                                            <button type="button" onClick={() => productRows.length > 1 && setProductRows(prev => prev.filter(r => r.id !== row.id))} className="p-2 text-slate-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                            <button type="button" onClick={() => setProductRows([...productRows, { id: Date.now(), product_id: "", variant_id: "", quantity: 1, unit_price: 0 }])} className="flex items-center gap-2 text-[#005d52] font-black text-xs uppercase tracking-widest px-4 py-2 hover:bg-teal-50 rounded-xl transition-all">
                                <Plus size={16} strokeWidth={3} /> Add Another Item
                            </button>
                        </div>

                        {/* Summary Bar */}
                        <div className="mt-8 bg-[#005d52] rounded-2xl p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl shadow-teal-900/20 border border-white/10">
                            <div className="flex gap-10">
                                <div><p className="text-[10px] uppercase font-black text-teal-200 tracking-tighter mb-1">Items Total</p><p className="text-2xl font-black">{summary.totalQty} <span className="text-sm font-medium opacity-60">Units</span></p></div>
                                <div className="w-px h-10 bg-white/10 hidden sm:block" />
                                <div><p className="text-[10px] uppercase font-black text-teal-200 tracking-tighter mb-1">Deal Value</p><p className="text-2xl font-black">₹{summary.totalValue.toLocaleString()}</p></div>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] font-medium text-teal-100 italic opacity-60">Total includes all variants and quantities selected above.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Section 3: Assignment */}
                        <div className="bg-white rounded-4xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                            <SectionTitle icon={<FileText size={20} />} title="Logistics & Ownership" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <FormSelect
                                    label="Assign Employee" name="assigned_to" value={formData.assigned_to} onChange={handleInputChange} required error={errors.assigned_to}
                                    options={employees?.map(emp => ({ l: `${emp.name} (${emp.designation})`, v: emp.id })) || []}
                                />
                                <FormSelect label="Priority Level" name="priority" value={formData.priority} onChange={handleInputChange} options={[{ l: "High", v: "High" }, { l: "Medium", v: "Medium" }, { l: "Low", v: "Low" }]} />
                                <FormInput label="Follow-up Date" name="followup_date" type="date" value={formData.followup_date} onChange={handleInputChange} />
                                <FormInput label="Closing Date (Est)" name="expected_close_date" type="date" value={formData.expected_close_date} onChange={handleInputChange} />
                            </div>
                            <div className="mt-5">
                                <FormInput label="Internal Notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Special instructions or background info..." />
                            </div>
                        </div>

                        {/* Section 4: Location */}
                        <div className="bg-white rounded-4xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                            <SectionTitle icon={<MapPin size={20} />} title="Location Details" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                                <FormInput label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" />
                                <FormInput label="State" name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Installation Address</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-[#005d52] focus:ring-4 focus:ring-teal-500/5 outline-none transition-all resize-none font-bold placeholder:font-normal" placeholder="Building, Street, Area info..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Atomic Components ---

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-teal-50 text-[#005d52] rounded-xl border border-teal-100 shadow-sm">{icon}</div>
        <h3 className="font-bold text-xl text-slate-800 tracking-tight">{title}</h3>
    </div>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    required?: boolean;
}

const FormInput: React.FC<InputFieldProps> = ({ label, error, required, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <input
                {...props}
                {...("type" in props && props.type === "number" ? { min: 1 } : {})}
                className={`w-full bg-slate-50 border ${error ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm focus:border-[#005d52] focus:ring-4 focus:ring-teal-500/5 outline-none transition-all font-bold group-hover:border-slate-300 placeholder:font-normal`}
            />
            {error && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 animate-pulse" size={16} />}
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold uppercase px-1">{error}</p>}
    </div>
);

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { l: string; v: string | number }[];
    error?: string;
    required?: boolean;
}

const FormSelect: React.FC<SelectFieldProps> = ({ label, options, error, required, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <select
                {...props}
                className={`w-full bg-slate-50 border ${error ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#005d52] focus:ring-4 focus:ring-teal-500/5 transition-all font-bold cursor-pointer group-hover:border-slate-300`}
            >
                <option value="">Select option</option>
                {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold uppercase px-1">{error}</p>}
    </div>
);

export default LeadForm;