import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Save, Plus, Trash2, 
    IndianRupee, Building2, User, 
    Phone, Mail, FileText, 
    Printer, 
} from 'lucide-react';

interface LineItem {
    id: string;
    product: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    total: number;
}

interface QuotationFormData {
    customerType: 'Business' | 'Individual';
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    billingAddress: string;
    shippingAddress: string;
    gstNumber: string;
    quotationNumber: string;
    quotationDate: string;
    validUntil: string;
    referenceNumber: string;
    paymentTerms: string;
    deliveryTerms: string;
    currency: 'INR' | 'USD' | 'EUR';
    notes: string;
    termsAndConditions: string;
}

const QuotationCreate: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('customer');
    const [lineItems, setLineItems] = useState<LineItem[]>([
        {
            id: '1',
            product: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            tax: 18,
            total: 0
        }
    ]);
    
    const [formData, setFormData] = useState<QuotationFormData>({
        customerType: 'Business',
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        billingAddress: '',
        shippingAddress: '',
        gstNumber: '',
        quotationNumber: `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        quotationDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        referenceNumber: '',
        paymentTerms: 'Net 30',
        deliveryTerms: 'FOB',
        currency: 'INR',
        notes: '',
        termsAndConditions: '1. Payment due within 30 days\n2. Goods once sold cannot be returned\n3. Warranty as per manufacturer terms'
    });

    const [errors, setErrors] = useState<Partial<Record<keyof QuotationFormData, string>> & { lineItems?: string }>({});

    const calculateLineTotal = (item: LineItem): number => {
        const subtotal = item.quantity * item.unitPrice;
        const discountAmount = (subtotal * item.discount) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * item.tax) / 100;
        return afterDiscount + taxAmount;
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                updated.total = calculateLineTotal(updated);
                return updated;
            }
            return item;
        }));
    };

    const addLineItem = () => {
        setLineItems(prev => [...prev, {
            id: Date.now().toString(),
            product: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            tax: 18,
            total: 0
        }]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const getTotals = () => {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalDiscount = lineItems.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * item.discount / 100), 0);
        const taxableValue = subtotal - totalDiscount;
        const totalTax = lineItems.reduce((sum, item) => {
            const itemSubtotal = item.quantity * item.unitPrice;
            const itemDiscount = (itemSubtotal * item.discount) / 100;
            const afterDiscount = itemSubtotal - itemDiscount;
            return sum + (afterDiscount * item.tax / 100);
        }, 0);
        const grandTotal = taxableValue + totalTax;
        
        return { subtotal, totalDiscount, taxableValue, totalTax, grandTotal };
    };

    const totals = getTotals();

    const handleSubmit = () => {
        const newErrors: any = {};
        
        // --- CUSTOMER VALIDATION ---
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        } else if (!/^\d{10,}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
            newErrors.phone = 'Invalid phone number';
        }

        if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';

        if (formData.customerType === 'Business' && !formData.gstNumber.trim()) {
            newErrors.gstNumber = 'GST number is required for business';
        }

        // --- LINE ITEMS VALIDATION ---
        if (lineItems.some(item => !item.product.trim())) {
            newErrors.lineItems = 'Please ensure all products have names';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            
            // Logic to switch tab automatically to show the user where the error is
            if (newErrors.companyName || newErrors.email || newErrors.phone || newErrors.billingAddress || newErrors.gstNumber) {
                setActiveSection('customer');
            } else if (newErrors.lineItems) {
                setActiveSection('items');
            }
            return;
        }
        
        setErrors({});
        console.log('Saving quotation:', { ...formData, lineItems, totals });
        alert('Quotation created successfully!');
        navigate('/sales/quotation');
    };

    const sections = [
        { id: 'customer', label: 'Customer Details', icon: Building2 },
        { id: 'items', label: 'Line Items', icon: FileText },
        { id: 'terms', label: 'Terms & Conditions', icon: FileText },
        { id: 'summary', label: 'Summary', icon: IndianRupee }
    ];

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/sales/quotation')}
                            className="p-2 hover:bg-white rounded-xl transition-colors"
                        >
                            <ChevronLeft size={24} className="text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Create New Quotation</h1>
                            <p className="text-sm text-gray-400 mt-1">#{formData.quotationNumber}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <button 
                            onClick={() => window.print()}
                            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-white text-gray-600 px-5 py-2.5 rounded-xl font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                            <Printer size={18} /> Preview
                        </button>
                        <button 
                            onClick={handleSubmit}
                            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#004a41] transition-all"
                        >
                            <Save size={18} /> Save Quotation
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-2xl p-2 mb-6 shadow-sm border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    activeSection === section.id 
                                        ? 'bg-[#d1e9e7] text-[#005d52]' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <section.icon size={16} />
                                {section.label}
                                {section.id === 'customer' && (errors.companyName || errors.email || errors.phone) && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                                {section.id === 'items' && errors.lineItems && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    
                    {/* Customer Details Section */}
                    {activeSection === 'customer' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Building2 size={20} className="text-[#005d52]" />
                                    Customer Information
                                </h3>
                                {Object.keys(errors).length > 0 && <p className="text-red-500 text-xs mt-1">Please fill in all required fields marked with *</p>}
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Type</label>
                                        <div className="flex gap-3">
                                            {['Business', 'Individual'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setFormData({...formData, customerType: type as any})}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        formData.customerType === type ? 'bg-[#005d52] text-white' : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Company/Business Name"
                                        value={formData.companyName}
                                        onChange={(val) => setFormData({...formData, companyName: val})}
                                        error={errors.companyName}
                                        icon={<Building2 size={16} />}
                                        required={true}
                                    />
                                    <FormField
                                        label="Contact Person"
                                        value={formData.contactPerson}
                                        onChange={(val) => setFormData({...formData, contactPerson: val})}
                                        icon={<User size={16} />}
                                    />
                                    <FormField
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(val) => setFormData({...formData, email: val})}
                                        error={errors.email}
                                        icon={<Mail size={16} />}
                                        required={true}
                                    />
                                    <FormField
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(val) => setFormData({...formData, phone: val})}
                                        error={errors.phone}
                                        icon={<Phone size={16} />}
                                        required={true}
                                    />
                                    <FormField
                                        label="Billing Address"
                                        type="textarea"
                                        value={formData.billingAddress}
                                        onChange={(val) => setFormData({...formData, billingAddress: val})}
                                        error={errors.billingAddress}
                                        required={true}
                                    />
                                    <FormField
                                        label="Shipping Address"
                                        type="textarea"
                                        value={formData.shippingAddress}
                                        onChange={(val) => setFormData({...formData, shippingAddress: val})}
                                    />
                                    {formData.customerType === 'Business' && (
                                        <FormField
                                            label="GST Number"
                                            value={formData.gstNumber}
                                            onChange={(val) => setFormData({...formData, gstNumber: val})}
                                            error={errors.gstNumber}
                                            required={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Line Items Section */}
                    {activeSection === 'items' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <FileText size={20} className="text-[#005d52]" />
                                    Products & Services
                                </h3>
                                <button
                                    onClick={addLineItem}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#d1e9e7] text-[#005d52] rounded-xl text-sm font-medium hover:bg-[#005d52] hover:text-white transition-all"
                                >
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase">Product</th>
                                            <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase">Description</th>
                                            <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Quantity</th>
                                            <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Unit Price</th>
                                            <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Discount %</th>
                                            <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Tax %</th>
                                            <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Total</th>
                                            <th className="p-4 text-center text-xs font-bold text-gray-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {lineItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <input
                                                        type="text"
                                                        value={item.product}
                                                        onChange={(e) => updateLineItem(item.id, 'product', e.target.value)}
                                                        className={`w-48 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005d52] ${errors.lineItems && !item.product ? 'border-red-500' : 'border-gray-200'}`}
                                                        placeholder="Product name"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                        className="w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005d52]"
                                                        placeholder="Description"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#005d52]"
                                                        step="any"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#005d52]"
                                                        step="any"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input
                                                        type="number"
                                                        value={item.discount}
                                                        onChange={(e) => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#005d52]"
                                                        step="any"
                                                        min="0"
                                                        max="100"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input
                                                        type="number"
                                                        value={item.tax}
                                                        onChange={(e) => updateLineItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                                                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#005d52]"
                                                        step="any"
                                                        min="0"
                                                        max="100"
                                                    />
                                                </td>
                                                <td className="p-4 text-right font-bold text-[#005d52]">
                                                    ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button onClick={() => removeLineItem(item.id)} className="p-1 text-red-400 hover:text-red-600 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {errors.lineItems && <div className="p-4 text-red-500 text-sm font-medium">{errors.lineItems}</div>}
                        </div>
                    )}

                    {/* Terms Section */}
                    {activeSection === 'terms' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <FileText size={20} className="text-[#005d52]" />
                                    Terms & Conditions
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Payment Terms" value={formData.paymentTerms} onChange={(val) => setFormData({...formData, paymentTerms: val})} type="select" options={['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt', '50% Advance', '100% Advance']} />
                                    <FormField label="Delivery Terms" value={formData.deliveryTerms} onChange={(val) => setFormData({...formData, deliveryTerms: val})} type="select" options={['FOB', 'CIF', 'Ex-Works', 'COD', 'Free Delivery']} />
                                    <FormField label="Currency" value={formData.currency} onChange={(val) => setFormData({...formData, currency: val as any})} type="select" options={['INR', 'USD', 'EUR']} />
                                </div>
                                <FormField label="Additional Notes" type="textarea" rows={3} value={formData.notes} onChange={(val) => setFormData({...formData, notes: val})} />
                                <FormField label="Terms & Conditions" type="textarea" rows={5} value={formData.termsAndConditions} onChange={(val) => setFormData({...formData, termsAndConditions: val})} />
                            </div>
                        </div>
                    )}

                    {/* Summary Section */}
                    {activeSection === 'summary' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-lg text-gray-800 mb-6">Quotation Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between py-2"><span className="text-gray-600">Subtotal</span><span className="font-medium">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between py-2 text-red-600"><span>Total Discount</span><span>- ₹{totals.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between py-2"><span>Taxable Value</span><span className="font-medium">₹{totals.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between py-2"><span>Total Tax</span><span>₹{totals.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="border-t-2 border-gray-200 pt-4 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-800">Grand Total</span>
                                            <span className="text-2xl font-bold text-[#005d52]">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-lg text-gray-800 mb-6">Quotation Details</h3>
                                <div className="space-y-4">
                                    <FormField label="Quotation Date" type="date" value={formData.quotationDate} onChange={(val) => setFormData({...formData, quotationDate: val})} />
                                    <FormField label="Valid Until" type="date" value={formData.validUntil} onChange={(val) => setFormData({...formData, validUntil: val})} />
                                    <FormField label="Reference Number" value={formData.referenceNumber} onChange={(val) => setFormData({...formData, referenceNumber: val})} placeholder="PO Number / RFQ Number" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons at the end */}
                <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium text-sm border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer size={18} /> Preview Quotation
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#004a41] transition-all"
                    >
                        <Save size={18} /> Save Quotation
                    </button>
                </div>
            </div>
        </div>
    );
};

interface FormFieldProps {
    label: string; 
    value: string; 
    onChange: (value: string) => void; 
    error?: string; 
    icon?: React.ReactNode;
    type?: string; 
    options?: string[]; 
    placeholder?: string; 
    rows?: number; 
    required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ 
    label, 
    value, 
    onChange, 
    error, 
    icon, 
    type = 'text', 
    options, 
    placeholder, 
    rows = 3, 
    required = false 
}) => (
    <div className="flex flex-col gap-1.5">
        <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${error ? 'text-red-500' : 'text-gray-400'}`}>
            {icon} {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'select' && options ? (
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005d52] text-sm ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : type === 'textarea' ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                placeholder={placeholder}
                className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005d52] text-sm resize-none ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005d52] text-sm ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            />
        )}
        {error && <div className="text-[10px] font-bold text-red-500 uppercase mt-0.5">{error}</div>}
    </div>
);

export default QuotationCreate;