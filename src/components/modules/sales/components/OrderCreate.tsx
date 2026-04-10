import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  IndianRupee,
  User,
  Phone,
  Mail,
  FileText,
  Printer,
  Loader2,
  MapPin,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { createOrder, clearSalesErrors } from "../ModuleStateFiles/OrderSlice";
import { getQuotations } from "../ModuleStateFiles/QuotationSlice";
import type { RootState } from "../../../../ApplicationState/Store";

interface LineItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface QuotationProduct {
  id: number | string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Quotation {
  id: number | string;
  quote_id?: string;
  status?: string;
  company_name: string;
  email?: string;
  phone?: string;
  shipping_address?: string;
  billing_address?: string;
  created_at?: string;
  products?: QuotationProduct[];
  total?: number;
}

interface OrderFormData {
  quotation_id: string;
  customer_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  notes: string;
}

const OrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state: RootState) => state.SalesOrder);
  const { quotations } = useAppSelector(
    (state: RootState) => state.SalesQuotation,
  );

  const [activeSection, setActiveSection] = useState("quotation"); // Changed to 'quotation' as default
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null,
  );
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const [formData, setFormData] = useState<OrderFormData>({
    quotation_id: "",
    customer_name: "",
    email: "",
    phone: "",
    shipping_address: "",
    notes: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof OrderFormData, string>> & { lineItems?: string }
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch ALL quotations (sent, accepted, etc.) - remove status filter
    dispatch(getQuotations({}));
    return () => {
      dispatch(clearSalesErrors());
    };
  }, [dispatch]);

  const handleQuotationSelect = (quotation: any) => {
    setSelectedQuotation(quotation);
    setFormData({
      ...formData,
      quotation_id: quotation.id.toString(),
      customer_name: quotation.company_name,
      email: quotation.email || "",
      phone: quotation.phone || "",
      shipping_address:
        quotation.shipping_address || quotation.billing_address || "",
    });

    // Map quotation products to line items
    if (quotation.products && quotation.products.length > 0) {
      const items = quotation.products.map((product: any, index: number) => ({
        id: index.toString(),
        product_name: product.product_name,
        quantity: product.quantity,
        unit_price: product.unit_price,
        total: product.quantity * product.unit_price,
      }));
      setLineItems(items);
    }
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product_name: "",
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const getTotals = () => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
    return { subtotal };
  };

  const totals = getTotals();

  const handleSubmit = async () => {
    const newErrors: any = {};

    if (!selectedQuotation) {
      newErrors.quotation = "Please select a quotation first";
    }
    if (!formData.customer_name.trim())
      newErrors.customer_name = "Customer name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }
    if (!formData.shipping_address.trim())
      newErrors.shipping_address = "Shipping address is required";
    if (lineItems.some((item) => !item.product_name.trim())) {
      newErrors.lineItems = "Please ensure all products have names";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.quotation) {
        setActiveSection("quotation");
      } else if (
        newErrors.customer_name ||
        newErrors.email ||
        newErrors.phone ||
        newErrors.shipping_address
      ) {
        setActiveSection("customer");
      } else if (newErrors.lineItems) {
        setActiveSection("items");
      }
      return;
    }

    setErrors({});
    setSubmitError(null);

    const orderData = {
      quotation_id: formData.quotation_id
        ? parseInt(formData.quotation_id)
        : null,
      customer_name: formData.customer_name,
      email: formData.email || null,
      phone: formData.phone || null,
      shipping_address: formData.shipping_address || null,
      notes: formData.notes || null,
      items: lineItems.map((item) => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    try {
      await dispatch(createOrder(orderData));
      setTimeout(() => {
        navigate("/sales/orders");
      }, 2500);
    } catch (err) {
      setSubmitError(typeof err === "string" ? err : "Failed to create order");
    }
  };

  const sections = [
    { id: "quotation", label: "Select Quotation", icon: FileText },
    { id: "customer", label: "Customer Details", icon: User },
    { id: "items", label: "Order Items", icon: Package },
    { id: "summary", label: "Summary", icon: IndianRupee },
  ];

  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    const baseClass = "px-2 py-0.5 rounded text-[10px] font-bold ";
    switch (status?.toLowerCase()) {
      case "accepted":
        return baseClass + "bg-green-100 text-green-700";
      case "sent":
        return baseClass + "bg-blue-100 text-blue-700";
      case "pending":
        return baseClass + "bg-yellow-100 text-yellow-700";
      case "rejected":
        return baseClass + "bg-red-100 text-red-700";
      default:
        return baseClass + "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/sales/orders")}
              className="p-2 hover:bg-white rounded-xl transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Create New Order
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Convert quotation to sales order
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-white text-gray-600 px-5 py-2.5 rounded-xl font-medium text-sm border border-gray-200 hover:bg-gray-50"
            >
              <Printer size={18} /> Preview
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#004a41] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {submitError}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 mb-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === section.id ? "bg-[#d1e9e7] text-[#005d52]" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <section.icon size={16} />
                {section.label}
                {section.id === "quotation" && errors.quotation_id && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {section.id === "customer" &&
                  (errors.customer_name || errors.email || errors.phone) && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                {section.id === "items" && errors.lineItems && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Select Quotation Section - Shows ALL quotations */}
          {activeSection === "quotation" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <FileText size={20} className="text-[#005d52]" />
                  Select Quotation
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Choose a quotation to convert into an order
                </p>
              </div>
              <div className="p-6">
                {errors.quotation_id && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {errors.quotation_id}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                  {/* Show ALL quotations without filtering */}
                  {quotations && quotations.length > 0 ? (
                    quotations
                      .filter((quotation: any) =>
                        ["sent", "accepted"].includes(
                          (quotation.status || "").toLowerCase(),
                        ),
                      )
                      .map((quotation: any) => (
                        <div
                          key={quotation.id}
                          onClick={() => handleQuotationSelect(quotation)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            selectedQuotation?.id === quotation.id
                              ? "border-[#005d52] bg-teal-50 ring-2 ring-teal-500/20"
                              : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-bold text-gray-800">
                                  {quotation.quote_id || `QT-${quotation.id}`}
                                </p>
                                <span
                                  className={getStatusBadge(quotation.status)}
                                >
                                  {quotation.status || "Sent"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 font-medium">
                                {quotation.company_name}
                              </p>
                              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                <span>
                                  Date: quotation.created_at ? new
                                  Date(quotation.created_at).toLocaleDateString()
                                  : "-"
                                </span>
                                <span>
                                  Products: {quotation.products?.length || 0}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-[#005d52] mt-2">
                                Total: ₹
                                {Number(quotation.total || 0).toLocaleString(
                                  "en-IN",
                                )}
                              </p>
                            </div>
                            {selectedQuotation?.id === quotation.id && (
                              <div className="w-6 h-6 bg-[#005d52] rounded-full flex items-center justify-center shadow-md">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <FileText size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">
                        No quotations available
                      </p>
                      <p className="text-xs mt-1">
                        Create a quotation first to convert it into an order
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Details Section */}
          {activeSection === "customer" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <User size={20} className="text-[#005d52]" />
                  Customer Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Customer Name"
                    value={formData.customer_name}
                    onChange={(val) =>
                      setFormData({ ...formData, customer_name: val })
                    }
                    error={errors.customer_name}
                    icon={<User size={16} />}
                    required={true}
                  />
                  <FormField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(val) => setFormData({ ...formData, email: val })}
                    error={errors.email}
                    icon={<Mail size={16} />}
                    required={true}
                  />
                  <FormField
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(val) => setFormData({ ...formData, phone: val })}
                    error={errors.phone}
                    icon={<Phone size={16} />}
                    required={true}
                  />
                  <FormField
                    label="Shipping Address"
                    type="textarea"
                    value={formData.shipping_address}
                    onChange={(val) =>
                      setFormData({ ...formData, shipping_address: val })
                    }
                    error={errors.shipping_address}
                    icon={<MapPin size={16} />}
                    required={true}
                  />
                  <FormField
                    label="Additional Notes"
                    type="textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(val) => setFormData({ ...formData, notes: val })}
                    icon={<FileText size={16} />}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Line Items Section */}
          {activeSection === "items" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <Package size={20} className="text-[#005d52]" />
                  Order Items
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
                      <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase">
                        Product
                      </th>
                      <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">
                        Quantity
                      </th>
                      <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">
                        Unit Price
                      </th>
                      <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase">
                        Total
                      </th>
                      <th className="p-4 text-center text-xs font-bold text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => {
                              setLineItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? { ...i, product_name: e.target.value }
                                    : i,
                                ),
                              );
                            }}
                            className={`w-64 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005d52] ${errors.lineItems && !item.product_name ? "border-red-500" : "border-gray-200"}`}
                            placeholder="Product name"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              setLineItems((prev) =>
                                prev.map((i) => {
                                  if (i.id === item.id) {
                                    const newQuantity =
                                      parseFloat(e.target.value) || 0;
                                    return {
                                      ...i,
                                      quantity: newQuantity,
                                      total: newQuantity * i.unit_price,
                                    };
                                  }
                                  return i;
                                }),
                              );
                            }}
                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#005d52]"
                            step="any"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => {
                              setLineItems((prev) =>
                                prev.map((i) => {
                                  if (i.id === item.id) {
                                    const newPrice =
                                      parseFloat(e.target.value) || 0;
                                    return {
                                      ...i,
                                      unit_price: newPrice,
                                      total: i.quantity * newPrice,
                                    };
                                  }
                                  return i;
                                }),
                              );
                            }}
                            className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#005d52]"
                            step="any"
                          />
                        </td>
                        <td className="p-4 text-right font-bold text-[#005d52]">
                          ₹
                          {item.total.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errors.lineItems && (
                <div className="p-4 text-red-500 text-sm font-medium">
                  {errors.lineItems}
                </div>
              )}
            </div>
          )}

          {/* Summary Section */}
          {activeSection === "summary" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                <ShoppingCart size={20} className="text-[#005d52]" />
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₹
                    {totals.subtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      Grand Total
                    </span>
                    <span className="text-2xl font-bold text-[#005d52]">
                      ₹
                      {totals.subtotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium text-sm border border-gray-300 hover:bg-gray-50"
          >
            <Printer size={18} /> Preview Order
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-[#004a41] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Creating..." : "Create Order"}
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
  type = "text",
  placeholder,
  rows = 3,
  required = false,
}) => (
  <div className="flex flex-col gap-1.5">
    <label
      className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${error ? "text-red-500" : "text-gray-400"}`}
    >
      {icon} {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "textarea" ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005d52] text-sm resize-none ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005d52] text-sm ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
      />
    )}
    {error && (
      <div className="text-[10px] font-bold text-red-500 uppercase mt-0.5">
        {error}
      </div>
    )}
  </div>
);

export default OrderCreate;
