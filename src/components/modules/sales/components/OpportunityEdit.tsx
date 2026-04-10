import React, { useState, useMemo, useEffect } from "react";
import { ChevronRight, Building2, Package, FileText, Plus, ChevronDown, Trash2, Save, MapPin, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { getProductsForLead } from "../ModuleStateFiles/ProductSlice";
import { getEmployeesForLead } from "../ModuleStateFiles/EmployeeSlice";
import { getLead, editLead, clearErrors } from "../ModuleStateFiles/LeadSlice";
import type { RootState } from "../../../../ApplicationState/Store";

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
    variant_name: string;
    quantity: number; 
    unit_price: number; 
}

interface FormData {
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
    assigned_to: number; 
    status: string;
}

const statusOptions = ["Qualified", "In Progress", "Quotation", "Won", "Lost"];

const OpportunityEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const { products } = useAppSelector((state: RootState) => state.SalesProduct) as { products: Product[] };
    const { employees } = useAppSelector((state: RootState) => state.SalesEmployee) as { employees: Employee[] | null };
    const { lead } = useAppSelector((state: RootState) => state.SalesLeads);

    const [formData, setFormData] = useState<FormData>({
        company_name: "", contact_person: "", phone: "", email: "", address: "", city: "", state: "", gst_number: "",
        lead_source: "", priority: "Medium", expected_close_date: "", followup_date: "", notes: "", assigned_to: 0, status: ""
    });
    const [productRows, setProductRows] = useState<ProductRow[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingLead, setLoadingLead] = useState(true);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        dispatch(getProductsForLead());
        dispatch(getEmployeesForLead());
        if (id) {
            dispatch(getLead(Number(id))).then(() => setLoadingLead(false));
        }
        return () => { dispatch(clearErrors()); };
    }, [dispatch, id]);

    // Separate useEffect to populate form without causing the warning
    useEffect(() => {
        if (lead && lead.id && !initialized) {
            setFormData({
                company_name: lead.company_name || "", 
                contact_person: lead.contact_person || "", 
                phone: lead.phone || "", 
                email: lead.email || "",
                address: lead.address || "", 
                city: lead.city || "", 
                state: lead.state || "", 
                gst_number: lead.gst_number || "",
                lead_source: lead.lead_source || "", 
                priority: lead.priority || "Medium",
                expected_close_date: lead.expected_close_date ? lead.expected_close_date.split('T')[0] : "",
                followup_date: lead.followup_date ? lead.followup_date.split('T')[0] : "", 
                notes: lead.notes || "",
                assigned_to: typeof lead.assigned_to === 'number' ? lead.assigned_to : Number(lead.assigned_to) || 0, 
                status: lead.status || "Qualified"
            });
            
            if (lead.products && lead.products.length > 0) {
                const rows = lead.products.map((p: any, i: number) => ({
                    id: Date.now() + i, 
                    product_id: p.product_id?.toString() || "", 
                    variant_id: p.variant_id?.toString() || "",
                    variant_name: p.variant || p.variant_name || "Standard",
                    quantity: typeof p.quantity === 'number' ? p.quantity : parseInt(p.quantity) || 1, 
                    unit_price: typeof p.unit_price === 'number' ? p.unit_price : parseFloat(p.unit_price) || 0
                }));
                setProductRows(rows);
            } else {
                setProductRows([{ id: Date.now(), product_id: "", variant_id: "", variant_name: "", quantity: 1, unit_price: 0 }]);
            }
            setInitialized(true);
        }
    }, [lead, initialized]);

    const summary = useMemo(() => {
        const qty = productRows.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const val = productRows.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.unit_price || 0)), 0);
        return { totalQty: qty, totalValue: val };
    }, [productRows]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
        if (!formData.contact_person.trim()) newErrors.contact_person = "Contact person is required";
        if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit number";
        if (!formData.lead_source) newErrors.lead_source = "Select lead source";
        if (!formData.assigned_to) newErrors.assigned_to = "Assign to an employee";
        productRows.forEach((row) => { 
            if (!row.product_id) newErrors[`prod_${row.id}`] = "Select product"; 
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === "assigned_to" ? (value === "" ? 0 : Number(value)) : value 
        }));
        if (errors[name]) { 
            const updated = { ...errors }; 
            delete updated[name]; 
            setErrors(updated); 
        }
    };

    const handleProductSelect = (rowId: number, pId: string) => {
        const selectedProduct = products.find(p => p.product_id === Number(pId));
        const firstVariant = selectedProduct?.variants[0];
        const variantId = firstVariant?.variant_id?.toString() || "";
        const variantName = firstVariant?.variant_name || "Standard";
        const price = firstVariant?.unit_price ? Number(firstVariant.unit_price) : 0;
        
        setProductRows(prev => prev.map(row => 
            row.id === rowId ? { 
                ...row, 
                product_id: pId, 
                variant_id: variantId,
                variant_name: variantName,
                unit_price: price 
            } : row
        ));
        if (errors[`prod_${rowId}`]) { 
            const updated = { ...errors }; 
            delete updated[`prod_${rowId}`]; 
            setErrors(updated); 
        }
    };

    const handleVariantChange = (rowId: number, variantId: string) => {
        const row = productRows.find(r => r.id === rowId);
        if (row && variantId) {
            const selectedProduct = products.find(p => p.product_id === Number(row.product_id));
            const selectedVariant = selectedProduct?.variants.find(v => v.variant_id === Number(variantId));
            
            if (selectedVariant) {
                setProductRows(prev => prev.map(r => 
                    r.id === rowId ? { 
                        ...r, 
                        variant_id: String(selectedVariant.variant_id),
                        variant_name: selectedVariant.variant_name,
                        unit_price: Number(selectedVariant.unit_price)
                    } : r
                ));
            }
        }
    };

    const handleQuantityChange = (rowId: number, quantity: number) => {
        setProductRows(prev => prev.map(row => row.id === rowId ? { ...row, quantity } : row));
    };

    const addLineItem = () => setProductRows([...productRows, { id: Date.now(), product_id: "", variant_id: "", variant_name: "", quantity: 1, unit_price: 0 }]);
    const removeLineItem = (rowId: number) => { if (productRows.length > 1) setProductRows(prev => prev.filter(row => row.id !== rowId)); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        
        const payload = {
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            gst_number: formData.gst_number,
            lead_source: formData.lead_source,
            priority: formData.priority,
            status: formData.status,
            expected_close_date: formData.expected_close_date,
            followup_date: formData.followup_date,
            notes: formData.notes,
            assigned_to: formData.assigned_to,
            products: productRows
                .filter(p => p.product_id !== "")
                .map(p => ({ 
                    product_id: p.product_id, 
                    variant_id: p.variant_id,
                    quantity: p.quantity, 
                    unit_price: p.unit_price 
                }))
        };
        
        console.log("Submitting payload:", payload);
        dispatch(editLead(Number(id), payload, navigate));
    };

    if (loadingLead) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
                <Loader2 className="animate-spin text-[#005d52]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <button onClick={() => navigate("/sales/opportunities")} className="hover:text-[#005d52]">Opportunities</button>
                            <ChevronRight size={14} />
                            <span>Edit Opportunity</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900">Edit Opportunity</h1>
                        <p className="text-sm text-gray-500 mt-1">Update details for {lead?.company_name}</p>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => navigate("/sales/opportunities")} className="px-6 py-3 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50">Cancel</button>
                        <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#005d52] hover:bg-[#004a41] disabled:opacity-70 flex items-center gap-2">
                            {isSubmitting ? "Saving..." : <><Save size={18} /> Update Opportunity</>}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-4xl p-6 sm:p-8 border shadow-sm">
                        <SectionTitle icon={<Building2 size={20} />} title="Customer Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormInput label="Company Name" name="company_name" value={formData.company_name} onChange={handleInputChange} required error={errors.company_name} />
                            <FormInput label="Contact Person" name="contact_person" value={formData.contact_person} onChange={handleInputChange} required error={errors.contact_person} />
                            <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} required error={errors.phone} />
                            <FormInput label="Email" name="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
                            <FormInput label="GST Number" name="gst_number" value={formData.gst_number} onChange={handleInputChange} />
                            <FormSelect label="Lead Source" name="lead_source" value={formData.lead_source} onChange={handleInputChange} required error={errors.lead_source}
                                options={["Website", "Trade Show", "Referral", "Cold Call", "Existing Client"].map(o => ({ l: o, v: o }))} />
                            <FormSelect label="Status" name="status" value={formData.status} onChange={handleInputChange} required
                                options={statusOptions.map(o => ({ l: o, v: o }))} />
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-white rounded-4xl p-6 sm:p-8 border shadow-sm">
                        <SectionTitle icon={<Package size={20} />} title="Products" />
                        <div className="space-y-4">
                            {productRows.map((row) => {
                                const selectedProduct = products.find(p => p.product_id === Number(row.product_id));
                                const variantList = selectedProduct?.variants || [];
                                return (
                                    <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl border bg-slate-50/50">
                                        <div className="md:col-span-4">
                                            <FormSelect 
                                                label="Product" 
                                                name={`product_${row.id}`}
                                                value={row.product_id} 
                                                required 
                                                error={errors[`prod_${row.id}`]}
                                                onChange={(e) => handleProductSelect(row.id, e.target.value)}
                                                options={products.map(p => ({ l: p.product_name, v: String(p.product_id) }))} 
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <FormSelect 
                                                label="Variant" 
                                                name={`variant_${row.id}`}
                                                value={row.variant_id} 
                                                required
                                                onChange={(e) => handleVariantChange(row.id, e.target.value)}
                                                options={variantList.map(v => ({ l: v.variant_name, v: String(v.variant_id) }))}
                                                disabled={!row.product_id}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormInput 
                                                label="Quantity" 
                                                name={`quantity_${row.id}`}
                                                type="number" 
                                                value={row.quantity} 
                                                required
                                                onChange={(e) => handleQuantityChange(row.id, Number(e.target.value))} 
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Unit Price</span>
                                                <div className="h-12 flex items-center bg-white px-4 rounded-xl border text-sm font-bold text-[#005d52]">
                                                    ₹{row.unit_price.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-1 flex justify-center items-end pb-2">
                                            <button type="button" onClick={() => removeLineItem(row.id)} className="p-2 text-slate-300 hover:text-red-500">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <button type="button" onClick={addLineItem} className="flex items-center gap-2 text-[#005d52] font-black text-xs uppercase px-4 py-2 hover:bg-teal-50 rounded-xl">
                                <Plus size={16} /> Add Product
                            </button>
                        </div>
                        <div className="mt-8 bg-[#005d52] rounded-2xl p-6 text-white flex justify-between">
                            <div><p className="text-[10px] uppercase opacity-70">Total Items</p><p className="text-2xl font-black">{summary.totalQty} Units</p></div>
                            <div><p className="text-[10px] uppercase opacity-70">Deal Value</p><p className="text-2xl font-black">₹{summary.totalValue.toLocaleString()}</p></div>
                        </div>
                    </div>

                    {/* Assignment & Location */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-4xl p-6 sm:p-8 border shadow-sm">
                            <SectionTitle icon={<FileText size={20} />} title="Assignment" />
                            <div className="space-y-5">
                                <FormSelect label="Assign To" name="assigned_to" value={formData.assigned_to} onChange={handleInputChange} required error={errors.assigned_to}
                                    options={employees?.map(emp => ({ l: `${emp.name} (${emp.designation})`, v: emp.id })) || []} />
                                <FormSelect label="Priority" name="priority" value={formData.priority} onChange={handleInputChange}
                                    options={[{ l: "High", v: "High" }, { l: "Medium", v: "Medium" }, { l: "Low", v: "Low" }]} />
                                <FormInput label="Follow-up Date" name="followup_date" type="date" value={formData.followup_date} onChange={handleInputChange} />
                                <FormInput label="Expected Closure" name="expected_close_date" type="date" value={formData.expected_close_date} onChange={handleInputChange} />
                                <FormInput label="Notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Internal notes..." />
                            </div>
                        </div>
                        <div className="bg-white rounded-4xl p-6 sm:p-8 border shadow-sm">
                            <SectionTitle icon={<MapPin size={20} />} title="Location" />
                            <div className="space-y-5">
                                <FormInput label="City" name="city" value={formData.city} onChange={handleInputChange} />
                                <FormInput label="State" name="state" value={formData.state} onChange={handleInputChange} />
                                <textarea name="address" value={formData.address} onChange={handleInputChange} rows={4} className="w-full bg-slate-50 border rounded-2xl p-4 text-sm focus:border-[#005d52] outline-none" placeholder="Full address..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-teal-50 text-[#005d52] rounded-xl">{icon}</div>
        <h3 className="font-bold text-xl">{title}</h3>
    </div>
);

interface FormInputProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    error?: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, error, required, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
        <input {...props} className={`w-full bg-slate-50 border ${error ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm outline-none focus:border-[#005d52]`} />
        {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
);

interface FormSelectProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { l: string; v: string | number }[];
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, options, error, required, disabled, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            <select {...props} disabled={disabled} className={`w-full bg-slate-50 border ${error ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#005d52] cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <option value="">Select {label}</option>
                {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
);

export default OpportunityEdit;