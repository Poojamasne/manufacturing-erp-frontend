import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  IndianRupee,
  Building2,
  User,
  FileText,
  Printer,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import {
  createQuotation,
  clearSalesErrors,
} from "../ModuleStateFiles/QuotationSlice";

import type { RootState } from "../../../../ApplicationState/Store";
import { getProductsForLead } from "../ModuleStateFiles/ProductSlice";

// --- Types ---
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
  customerType: "Business" | "Individual";
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
  currency: "INR" | "USD" | "EUR";
  notes: string;
  termsAndConditions: string;
}

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

interface ProductVariant {
  variant_id: string;
  variant_name: string;
  unit_price: string;
}

interface Product {
  product_id: string;
  product_name: string;
  variants?: ProductVariant[];
}

// --- Helpers ---
const generateQuotationNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000);
  return `QT-${year}-${random}`;
};

const getTodayDate = (): string => new Date().toISOString().split("T")[0];
const getFutureDate = (daysToAdd: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  error,
  icon,
  type = "text",
  options,
  placeholder,
  rows = 3,
  required = false,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${error ? "text-red-500" : "text-gray-400"}`}>
      {icon} {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "select" && options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B] text-sm ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
      >
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B] text-sm resize-none ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B] text-sm ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
      />
    )}
    {error && <div className="text-[10px] font-bold text-red-500 uppercase mt-0.5">{error}</div>}
  </div>
);

const QuotationCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state: RootState) => state.SalesQuotation); 
  const products = useAppSelector((state: RootState) => state.SalesProduct.products as Product[]);

  const [activeSection, setActiveSection] = useState("customer");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", product: "", description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 18, total: 0 },
  ]);

  const [formData, setFormData] = useState<QuotationFormData>({
    customerType: "Business",
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
    gstNumber: "",
    quotationNumber: generateQuotationNumber(),
    quotationDate: getTodayDate(),
    validUntil: getFutureDate(30),
    referenceNumber: "",
    paymentTerms: "Net 30",
    deliveryTerms: "FOB",
    currency: "INR",
    notes: "",
    termsAndConditions: "1. Payment due within 30 days\n2. Goods once sold cannot be returned\n3. Warranty as per manufacturer terms",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof QuotationFormData, string>> & { lineItems?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    dispatch(getProductsForLead());
    return () => { dispatch(clearSalesErrors()); };
  }, [dispatch]);

  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * item.tax) / 100;
    return afterDiscount + taxAmount;
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: number | string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.total = calculateLineTotal(updated);
          return updated;
        }
        return item;
      }),
    );
  };

  // Logic to handle product selection from dropdown
  const handleProductSelect = (id: string, compositeKey: string) => {
    if (!compositeKey) return;
    
    // Find the product and variant from the master list
    // compositeKey format: "productName|variantName"
    const [pName, vName] = compositeKey.split("|");
    const selectedProduct = products.find((p) => p.product_name === pName);
    const selectedVariant = selectedProduct?.variants?.find((v) => v.variant_name === vName);

    if (selectedProduct && selectedVariant) {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const updated = { 
                ...item, 
                product: selectedProduct.product_name, 
                description: selectedVariant.variant_name,
                unitPrice: parseFloat(selectedVariant.unit_price) || 0
            };
            updated.total = calculateLineTotal(updated);
            return updated;
          }
          return item;
        })
      );
    }
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: Date.now().toString(), product: "", description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 18, total: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const getTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalDiscount = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.discount) / 100, 0);
    const taxableValue = subtotal - totalDiscount;
    const totalTax = lineItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = (itemSubtotal * item.discount) / 100;
      const afterDiscount = itemSubtotal - itemDiscount;
      return sum + (afterDiscount * item.tax) / 100;
    }, 0);
    const grandTotal = taxableValue + totalTax;
    return { subtotal, totalDiscount, taxableValue, totalTax, grandTotal };
  };

  const totals = getTotals();

  const handleSubmit = async () => {
    const newErrors: any = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.billingAddress.trim()) newErrors.billingAddress = "Billing address is required";
    if (lineItems.some((item) => !item.product.trim())) newErrors.lineItems = "Please select products";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveSection(newErrors.lineItems ? "items" : "customer");
      return;
    }

    const quotationData = {
      company_name: formData.companyName,
      contact_person: formData.contactPerson || null,
      email: formData.email,
      phone: formData.phone,
      billing_address: formData.billingAddress,
      shipping_address: formData.shippingAddress || null,
      gst_number: formData.customerType === "Business" ? formData.gstNumber : null,
      quotation_date: formData.quotationDate,
      valid_until: formData.validUntil,
      payment_terms: formData.paymentTerms,
      delivery_terms: formData.deliveryTerms,
      currency: formData.currency,
      discount: totals.totalDiscount,
      tax: totals.totalTax,
      notes: formData.notes || null,
      terms_conditions: formData.termsAndConditions,
      items: lineItems.map((item) => ({
        product_name: item.product,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
      })),
    };

    try {
      await dispatch(createQuotation(quotationData, navigate));
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to create quotation");
    }
  };

  const sections = [
    { id: "customer", label: "Customer Details", icon: Building2 },
    { id: "items", label: "Line Items", icon: FileText },
    { id: "terms", label: "Terms & Conditions", icon: FileText },
    { id: "summary", label: "Summary", icon: IndianRupee },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/sales/quotation")} className="p-2 hover:bg-white rounded-xl transition-colors">
              <ChevronLeft size={24} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Create New Quotation</h1>
              <p className="text-sm text-gray-400 mt-1">#{formData.quotationNumber}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <button onClick={() => navigate("/sales/quotation")} className="flex-1 lg:flex-initial bg-white text-gray-600 px-4 py-2 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all text-sm">Cancel</button>
            <button onClick={() => window.print()} className="flex-1 lg:flex-initial flex items-center justify-center gap-1 bg-white text-gray-600 px-2.5 py-2 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all text-sm"><Printer size={18} /> Preview</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-[#F59E0B] text-white px-2.5 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-[#f67317] transition-all disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {loading ? "Saving..." : "Save Quotation"}
            </button>
          </div>
        </div>

        {submitError && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{submitError}</div>}

        <div className="bg-white rounded-2xl p-2 mb-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === section.id ? "bg-[#F59E0B] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                <section.icon size={16} /> {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {activeSection === "customer" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Building2 size={20} className="text-[#F59E0B]" /> Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Company/Business Name" value={formData.companyName} onChange={(val) => setFormData({ ...formData, companyName: val.replace(/[^a-zA-Z\s]/g, "") })} error={errors.companyName} required />
                <FormField label="Contact Person" value={formData.contactPerson} onChange={(val) => setFormData({ ...formData, contactPerson: val.replace(/[^a-zA-Z\s]/g, "") })} icon={<User size={16} />} />
                <FormField label="Email Address" type="email" value={formData.email} onChange={(val) => setFormData({ ...formData, email: val })} error={errors.email} required />
                <FormField label="Phone Number" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val.replace(/\D/g, "").slice(0, 10) })} error={errors.phone} required />
                <FormField label="Billing Address" type="textarea" value={formData.billingAddress} onChange={(val) => setFormData({ ...formData, billingAddress: val })} error={errors.billingAddress} required />
                <FormField label="GST Number" value={formData.gstNumber} onChange={(val) => setFormData({ ...formData, gstNumber: val.toUpperCase().replace(/[^A-Z0-9]/g, "") })} />
              </div>
            </div>
          )}

          {activeSection === "items" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><FileText size={20} className="text-[#F59E0B]" /> Products & Services</h3>
                <button onClick={addLineItem} className="flex items-varientcenter gap-2 px-4 py-2 bg-[#f3f4e6] text-[#F59E0B] rounded-xl text-sm font-medium hover:bg-[#F59E0B] hover:text-white transition-all"><Plus size={16} /> Add Item</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase">Product Selection</th>
                      <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase">Variant Details</th>
                      <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Quantity</th>
                      <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Unit Price</th>
                      <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Disc %</th>
                      <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Tax %</th>
                      <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">Total</th>
                      <th className="p-4 text-center text-xs font-bold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <select
                            value={`${item.product}|${item.description}`}
                            onChange={(e) => handleProductSelect(item.id, e.target.value)}
                            className={`w-56 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] ${errors.lineItems && !item.product ? "border-red-500" : "border-gray-200"}`}
                          >
                            <option value="">Select Product</option>
                            {products?.map((p: any) => (
                                <optgroup key={p.product_id} label={p.product_name}>
                                    {p.variants?.map((v: any) => (
                                        <option key={v.variant_id} value={`${p.product_name}|${v.variant_name}`}>
                                            {p.product_name} - {v.variant_name}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <input type="text" value={item.description} readOnly className="w-48 px-3 py-2 border border-gray-100 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed outline-none" />
                        </td>
                        <td className="p-4">
                          <input type="number" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)} className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right" />
                        </td>
                        <td className="p-4">
                          <input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)} className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right" />
                        </td>
                        <td className="p-4">
                          <input type="number" value={item.discount} onChange={(e) => updateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)} className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right" />
                        </td>
                        <td className="p-4">
                          <input type="number" value={item.tax} onChange={(e) => updateLineItem(item.id, "tax", parseFloat(e.target.value) || 0)} className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right" />
                        </td>
                        <td className="p-4 text-right font-bold text-[#F59E0B]">₹ {item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => removeLineItem(item.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "terms" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><FileText size={20} className="text-[#F59E0B]" /> Terms & Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Payment Terms" value={formData.paymentTerms} onChange={(val) => setFormData({ ...formData, paymentTerms: val })} type="select" options={["Net 15", "Net 30", "Net 45", "50% Advance", "100% Advance"]} />
                <FormField label="Delivery Terms" value={formData.deliveryTerms} onChange={(val) => setFormData({ ...formData, deliveryTerms: val })} type="select" options={["FOB", "CIF", "Ex-Works", "Free Delivery"]} />
              </div>
              <FormField label="Terms & Conditions" type="textarea" rows={5} value={formData.termsAndConditions} onChange={(val) => setFormData({ ...formData, termsAndConditions: val })} />
            </div>
          )}

          {activeSection === "summary" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-4">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Financial Summary</h3>
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹ {totals.subtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹ {totals.totalTax.toLocaleString("en-IN")}</span></div>
                <div className="border-t-2 border-gray-100 pt-4 flex justify-between items-center"><span className="text-lg font-bold">Grand Total</span><span className="text-2xl font-black text-[#F59E0B]">₹ {totals.grandTotal.toLocaleString("en-IN")}</span></div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-4">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Validity</h3>
                <FormField label="Quotation Date" type="date" value={formData.quotationDate} onChange={(val) => setFormData({ ...formData, quotationDate: val })} />
                <FormField label="Valid Until" type="date" value={formData.validUntil} onChange={(val) => setFormData({ ...formData, validUntil: val })} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationCreate;