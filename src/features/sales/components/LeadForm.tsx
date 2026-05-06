import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronRight,
  Building2,
  Package,
  FileText,
  Plus,
  ChevronDown,
  Trash2,
  Save,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Redux
import { useAppDispatch, useAppSelector } from "../../common/ReduxMainHooks";
import { getProductsForLead } from "../ModuleStateFiles/ProductSlice";
import { getEmployeesForLead } from "../ModuleStateFiles/EmployeeSlice";
import { createLead } from "../ModuleStateFiles/LeadSlice";
import type { RootState } from "../../../app/store/store";

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
  const { products } = useAppSelector(
    (state: RootState) => state.SalesProduct,
  ) as { products: Product[] };
  const { employees } = useAppSelector(
    (state: RootState) => state.SalesEmployee,
  ) as { employees: Employee[] | null };

  const [formData, setFormData] = useState<LeadFormData>({
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    gst_number: "",
    lead_source: "",
    priority: "Medium",
    expected_close_date: "",
    followup_date: "",
    notes: "",
    assigned_to: "",
  });

  const [productRows, setProductRows] = useState<ProductRow[]>([
    {
      id: Date.now(),
      product_id: "",
      variant_id: "",
      quantity: 1,
      unit_price: 0,
    },
  ]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getProductsForLead());
    dispatch(getEmployeesForLead());
  }, [dispatch]);

  const summary = useMemo(() => {
    const qty = productRows.reduce(
      (acc, curr) => acc + (curr.quantity || 0),
      0,
    );
    const val = productRows.reduce(
      (acc, curr) => acc + (curr.quantity || 0) * (curr.unit_price || 0),
      0,
    );
    return { totalQty: qty, totalValue: val };
  }, [productRows]);

  // --- Validation Logic ---

  const validateNameInput = (value: string) => {
  return value.replace(/[^a-zA-Z\s]/g, '');
  }

  const validateNumberInput = (value: string) => {
  return value.replace(/\D/g, '');
};

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.followup_date && formData.expected_close_date) {
      const followUp = new Date(formData.followup_date);
      const closing = new Date(formData.expected_close_date);

      if (followUp > closing) {
        newErrors.followup_date = "Follow-up must be before closing date";
        newErrors.expected_close_date = "Closing date must be after follow-up";
      }
    }

if (!formData.company_name.trim()) {
  newErrors.company_name = "Company name is required";
} else if (!/^[a-zA-Z\s]+$/.test(formData.company_name)) {
  newErrors.company_name = "Company name should contain only letters and spaces";
}
    
if (!formData.contact_person.trim()) {
  newErrors.contact_person = "Contact person is required";
} else if (!/^[a-zA-Z\s]+$/.test(formData.contact_person)) {
  newErrors.contact_person = "Contact person name should contain only letters and spaces";
} 
   if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter a valid 10-digit number";

    if (formData.email) {
      if (!formData.email.trim()) {
        newErrors.email = "Email address is required";
      }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email =
          "Enter a valid email address (e.g., name@company.com)";
      }
      else {
        const emailParts = formData.email.split("@");
        if (emailParts.length === 2) {
          const domain = emailParts[1];
          const validTLDs = [
            "com", "org", "net", "edu", "gov", "in", "co", "io", "ai", 
            "app", "dev", "tech", "info", "biz",
          ];
          const tld = domain.split(".").pop()?.toLowerCase();

          if (!tld || !validTLDs.includes(tld)) {
            newErrors.email = `Invalid email domain. Valid domains: .com, .org, .net, .in, .edu, .gov, etc.`;
          }

          if (domain.split(".").length < 2) {
            newErrors.email = "Invalid email domain format (e.g., example.com)";
          }
        }
      }
    } else {
      newErrors.email = "Email address is required";
    }

    if (!formData.lead_source) newErrors.lead_source = "Select lead source";
    if (!formData.assigned_to)
      newErrors.assigned_to = "Assign this lead to an employee";

    productRows.forEach((row) => {
      if (!row.product_id) newErrors[`prod_${row.id}`] = "Select product";
      if (!row.variant_id) newErrors[`var_${row.id}`] = "Select variant";
      if (row.quantity <= 0) newErrors[`qty_${row.id}`] = "Qty > 0";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handlers ---
const handleInputChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
  const { name, value } = e.target;
  
  let sanitizedValue = value;
  
  // Apply validation based on field name
  if (name === "company_name" || name === "contact_person") {
    sanitizedValue = validateNameInput(value);
  }
  
  if (name === "phone") {
    sanitizedValue = validateNumberInput(value);
    // Limit to 10 digits
    if (sanitizedValue.length > 10) sanitizedValue = sanitizedValue.slice(0, 10);
  }
  
  setFormData((prev) => ({
    ...prev,
    [name]:
      name === "assigned_to" ? (sanitizedValue === "" ? "" : Number(sanitizedValue)) : sanitizedValue,
  }));
  
  if (errors[name]) {
    const updatedErrors = { ...errors };
    delete updatedErrors[name];
    setErrors(updatedErrors);
  }
};

  const handleProductSelect = (id: number, pId: string) => {
    setProductRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, product_id: pId, variant_id: "", unit_price: 0 }
          : row,
      ),
    );
    setErrors((prev) => {
      const n = { ...prev };
      delete n[`prod_${id}`];
      return n;
    });
  };

  const handleVariantSelect = (id: number, vId: string, pId: string) => {
    const productData = products.find((p) => p.product_id === Number(pId));
    const variantData = productData?.variants.find(
      (v) => v.variant_id === Number(vId),
    );
    const price = variantData ? Number(variantData.unit_price) : 0;

    setProductRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, variant_id: vId, unit_price: price } : row,
      ),
    );
    setErrors((prev) => {
      const n = { ...prev };
      delete n[`var_${id}`];
      return n;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // CRITICAL FIX: Convert empty date strings to null
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
      expected_close_date: formData.expected_close_date || null,
      followup_date: formData.followup_date || null,
      notes: formData.notes,
      assigned_to: Number(formData.assigned_to),
      products: productRows
        .filter((p) => p.product_id !== "" && p.variant_id !== "")
        .map((p) => ({
          product_id: Number(p.product_id),
          variant_id: Number(p.variant_id),
          quantity: Number(p.quantity),
          unit_price: Number(p.unit_price)
        }))
    };

    console.log("Final Payload being sent:", JSON.stringify(payload, null, 2));
    
    if (payload.products.length === 0) {
      setErrors({ ...errors, products: "Please add at least one product" });
      setIsSubmitting(false);
      return;
    }
    
    try {
      await dispatch(createLead(payload, navigate));
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <button
                onClick={() => navigate("/sales/leads")}
                className="hover:text-[#F59E0B] transition-colors font-medium"
              >
                Leads
              </button>
              <ChevronRight size={14} />
              <span className="text-gray-800 font-bold">New Lead</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Create Lead
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Add new prospect to your pipeline
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate("/sales/leads")}
              className="flex-1 md:flex-none px-2.5 py-2 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 hover:text-amber-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 md:flex-none px-2.5 py-2 rounded-xl font-bold text-sm text-white bg-[#F59E0B] shadow-lg shadow-amber-500/5 hover:bg-[#f67317] disabled:opacity-70 transition-all flex items-center justify-center gap-1"
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <Save size={18} /> Create Lead
                </>
              )}
            </button>
          </div>
        </div>

        {errors.products && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            {errors.products}
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1: Company Info */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
            <SectionTitle
              icon={<Building2 size={20} />}
              title="Customer Information"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormInput
                label="Company Name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                error={errors.company_name}
                placeholder="e.g. ABC Electronics"
              />
              <FormInput
                label="Contact Person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                required
                error={errors.contact_person}
                placeholder="Full Name"
              />
              <FormInput
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                error={errors.phone}
                placeholder="10 Digit Number"
              />
              <FormInput
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                error={errors.email}
                placeholder="mail@company.com"
              />
              <FormInput
                label="GST Number"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleInputChange}
                placeholder="27XXXXX..."
              />
              <FormSelect
                label="Lead Source"
                name="lead_source"
                value={formData.lead_source}
                onChange={handleInputChange}
                required
                error={errors.lead_source}
                options={[
                  "Website",
                  "Trade Show",
                  "Referral",
                  "Cold Call",
                  "Existing Client",
                ].map((o) => ({ l: o, v: o }))}
              />
            </div>
          </div>

          {/* Section 2: Products */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
            <SectionTitle
              icon={<Package size={20} />}
              title="Requirements & Products"
            />
            <div className="space-y-4">
              {productRows.map((row) => {
                const selectedProd = products.find(
                  (p) => p.product_id === Number(row.product_id),
                );
                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl border transition-all items-end ${
                      errors[`prod_${row.id}`] || errors[`var_${row.id}`] 
                        ? "bg-red-50/30 border-red-100" 
                        : "bg-slate-50/50 border-slate-100"
                    }`}
                  >
                    <div className="md:col-span-4">
                      <FormSelect
                        label="Product"
                        value={row.product_id}
                        required
                        error={errors[`prod_${row.id}`]}
                        onChange={(e) =>
                          handleProductSelect(row.id, e.target.value)
                        }
                        options={products.map((p) => ({
                          l: p.product_name,
                          v: String(p.product_id),
                        }))}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <FormSelect
                        label="Variant"
                        value={row.variant_id}
                        required
                        disabled={!row.product_id}
                        error={errors[`var_${row.id}`]}
                        onChange={(e) =>
                          handleVariantSelect(
                            row.id,
                            e.target.value,
                            row.product_id,
                          )
                        }
                        options={
                          selectedProd?.variants.map((v) => ({
                            l: v.variant_name,
                            v: String(v.variant_id),
                          })) || []
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormInput
                        label="Quantity"
                        type="number"
                        value={row.quantity}
                        required
                        error={errors[`qty_${row.id}`]}
                        onChange={(e) =>
                          setProductRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, quantity: Number(e.target.value) }
                                : r,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                          Unit Price
                        </label>
                        <div className="h-12 flex items-center bg-white px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-900">
                          ₹ {row.unit_price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-1 flex justify-center pb-2">
                      <button
                        type="button"
                        onClick={() =>
                          productRows.length > 1 &&
                          setProductRows((prev) =>
                            prev.filter((r) => r.id !== row.id),
                          )
                        }
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  setProductRows([
                    ...productRows,
                    {
                      id: Date.now(),
                      product_id: "",
                      variant_id: "",
                      quantity: 1,
                      unit_price: 0,
                    },
                  ])
                }
                className="flex items-center gap-2 text-[#F59E0B] font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-[#f3f4e6] rounded-xl transition-all"
              >
                <Plus size={16} strokeWidth={2.5} /> Add Another Item
              </button>
            </div>

            {/* Summary Bar */}
            <div className="mt-8 bg-[#F59E0B] rounded-2xl p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl shadow-amber-500/5 border border-white/10">
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] uppercase font-black text-white tracking-wider mb-1">
                    Total Units
                  </p>
                  <p className="text-2xl font-black">
                    {summary.totalQty}{" "}
                    <span className="text-sm font-medium opacity-80">
                      Units
                    </span>
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10 hidden sm:block" />
                <div>
                  <p className="text-[10px] uppercase font-black text-white tracking-wider mb-1">
                    Deal Value
                  </p>
                  <p className="text-2xl font-black">
                    ₹ {summary.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-medium text-teal-100 italic opacity-80">
                  Total includes all variants and quantities selected above.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 3: Assignment */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
              <SectionTitle
                icon={<FileText size={20} />}
                title="Logistics & Ownership"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormSelect
                  label="Assign Employee"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  required
                  error={errors.assigned_to}
                  options={
                    employees?.map((emp) => ({
                      l: `${emp.name} (${emp.designation})`,
                      v: emp.id,
                    })) || []
                  }
                />
                <FormSelect
                  label="Priority Level"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  options={[
                    { l: "High", v: "High" },
                    { l: "Medium", v: "Medium" },
                    { l: "Low", v: "Low" },
                  ]}
                />
                <FormInput
                  label="Follow-up Date"
                  name="followup_date"
                  type="date"
                  value={formData.followup_date}
                  onChange={handleInputChange}
                  error={errors.followup_date}
                />
                <FormInput
                  label="Closing Date (Est)"
                  name="expected_close_date"
                  type="date"
                  value={formData.expected_close_date}
                  onChange={handleInputChange}
                  error={errors.expected_close_date}
                />
              </div>
              <div className="mt-5">
                <FormInput
                  label="Internal Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Special instructions or background info..."
                />
              </div>
            </div>

            {/* Section 4: Location */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
              <SectionTitle
                icon={<MapPin size={20} />}
                title="Location Details"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <FormInput
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Mumbai"
                />
                <FormInput
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Maharashtra"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                  Full Installation Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all resize-none font-medium placeholder:font-normal text-slate-800"
                  placeholder="Building, Street, Area info..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Atomic Components ---

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({
  icon,
  title,
}) => (
  <div className="flex items-center gap-3 mb-8">
    <div className="p-2.5 bg-[#f3f4e6] text-[#F59E0B] rounded-xl border border-[#f3f4e6] shadow-sm">
      {icon}
    </div>
    <h3 className="font-bold text-xl text-slate-800 tracking-tight">{title}</h3>
  </div>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const FormInput: React.FC<InputFieldProps> = ({
  label,
  error,
  required,
  ...props
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
      {label}
      {required && (
        <span className="text-rose-500 text-sm font-extrabold ml-1">*</span>
      )}
    </label>
    <div className="relative group">
      <input
        {...props}
        {...(props.type === "number" ? { min: 1 } : {})}
        className={`w-full bg-slate-50 border ${
          error ? "border-rose-300 ring-4 ring-rose-50" : "border-slate-200"
        } rounded-xl px-4 py-3 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all font-medium text-slate-800 group-hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400`}
      />
      {error && (
        <AlertCircle
          className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400"
          size={16}
        />
      )}
    </div>
    {error && (
      <p className="text-xs font-medium text-rose-600 px-1 flex items-center gap-1">
        {error}
      </p>
    )}
  </div>
);

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { l: string; v: string | number }[];
  error?: string;
  required?: boolean;
}

const FormSelect: React.FC<SelectFieldProps> = ({
  label,
  options,
  error,
  required,
  ...props
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
      {label}
      {required && (
        <span className="text-rose-500 text-sm font-extrabold ml-1">*</span>
      )}
    </label>
    <div className="relative group">
      <select
        {...props}
        className={`w-full bg-slate-50 border ${
          error ? "border-rose-300 ring-4 ring-rose-50" : "border-slate-200"
        } rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 transition-all font-medium text-slate-800 cursor-pointer group-hover:border-slate-300`}
      >
        <option value="" className="text-slate-400">Select option</option>
{options.map((o) => (
  <option
    key={o.v}
    value={o.v}
    title={o.l}  
    className="text-slate-800"
  >
    {o.l}
  </option>
))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors"
      />
    </div>
    {error && (
      <p className="text-xs font-medium text-rose-600 px-1 flex items-center gap-1">
        {error}
      </p>
    )}
  </div>
);

export default LeadForm;