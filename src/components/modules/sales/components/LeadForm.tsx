import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { 
  ChevronRight, 
  Building2, 
  Package, 
  FileText, 
  Plus, 
  ChevronDown,
} from "lucide-react";

// --- Interfaces ---
interface LeadFormData {
  companyName: string;
  contactPerson: string;
  designation: string;
  phoneNumber: string;
  email: string;
  gstNumber: string;
  city: string;
  state: string;
  leadSource: string;
  priority: string;
  expectedDecisionDate: string;
  followUpDate: string;
  initialStatus: string;
  address: string;
  notes: string;
}

interface ProductItem {
  id: number;
  product: string;
  variant: string;
  quantity: number;
  unit: string;
  estValue: number;
  assignedTo: string;
}

interface SummaryData {
  totalQty: number;
  totalValue: string;
}

// --- Helper Components Props ---
interface InputFieldProps {
  label: string;
  name: keyof LeadFormData;
  placeholder: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface SelectFieldProps {
  label: string;
  options: string[];
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const LeadForm: React.FC = () => {
  // --- State Management ---
  const [formData, setFormData] = useState<LeadFormData>({
    companyName: "",
    contactPerson: "",
    designation: "Owner",
    phoneNumber: "",
    email: "",
    gstNumber: "",
    city: "",
    state: "",
    leadSource: "",
    priority: "",
    expectedDecisionDate: "",
    followUpDate: "",
    initialStatus: "",
    address: "Vasukamal Express - 2nd Floor, Rohan Sehar Ln, Pancard Club Rd, behind Beverly Hills Society, Samarth Colony, Baner, Pune, Maharashtra 411069",
    notes: "",
  });

  const [products, setProducts] = useState<ProductItem[]>([
    { id: Date.now(), product: "", variant: "Advance", quantity: 1, unit: "Unit (approx.)", estValue: 7.2, assignedTo: "" }
  ]);

  const [summary, setSummary] = useState<SummaryData>({ totalQty: 0, totalValue: "0.0" });

  // --- Calculations ---
  useEffect(() => {
    const qty = products.reduce((acc, curr) => acc + Number(curr.quantity), 0);
    const val = products.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.estValue)), 0);
    setSummary({ totalQty: qty, totalValue: val.toFixed(1) });
  }, [products]);

  // --- Handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (id: number, field: keyof ProductItem, value: string | number) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addProduct = () => {
    setProducts([...products, { 
      id: Date.now(), 
      product: "", 
      variant: "Advance", 
      quantity: 1, 
      unit: "Unit (approx.)", 
      estValue: 0, 
      assignedTo: "" 
    }]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Saving Lead Data:", { ...formData, products, summary });
    alert("Lead saved successfully!");
  };

  // --- Reusable Components ---
  const InputField: React.FC<InputFieldProps> = ({ label, name, placeholder, type = "text", required = false, value, onChange }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-gray-700">{label} {required && "*"}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-[#E9E9E9] border-none rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5"
      />
    </div>
  );

  const SelectField: React.FC<SelectFieldProps> = ({ label, options, placeholder, name, value, onChange }) => (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select 
          name={name}
          value={value}
          onChange={onChange}
          className="bg-[#E9E9E9] border-none rounded-md p-2.5 text-sm outline-none w-full appearance-none cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 font-sans max-w-6xl mx-auto">
      
      {/* Header & Breadcrumbs */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 text-gray-500 text-base md:text-lg mb-1">
          <span>Lead</span>
          <ChevronRight size={18} />
          <span className="font-bold text-black text-xl md:text-2xl">New Lead</span>
        </div>
        <p className="text-sm text-gray-400">Manage and track customer leads for electrical products, from inquiry to conversion.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-2">
        <h2 className="text-lg md:text-xl font-semibold">Create new lead</h2>
        <span className="text-xs md:text-sm text-gray-400">Lead ID will be auto-assigned on save</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 overflow-x-auto pb-4 px-2 no-scrollbar">
        {[
          { step: 1, label: "Lead info" },
          { step: 2, label: "Product interest" },
          { step: 3, label: "Assignment" },
          { step: 4, label: "Review & save" }
        ].map((item, idx) => (
          <React.Fragment key={item.step}>
            <div className="flex items-center gap-3 shrink-0">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium ${item.step === 1 ? 'border-black text-black' : 'border-gray-300 text-gray-400'}`}>
                {item.step}
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${item.step === 1 ? 'text-black' : 'text-gray-400'}`}>{item.label}</span>
            </div>
            {idx < 3 && <div className="h-px bg-gray-300 flex-1 mx-4 min-w-7.5 md:min-w-15" />}
          </React.Fragment>
        ))}
      </div>

      {/* Main Form Container */}
      <div className="border border-gray-300 rounded-xl overflow-hidden mb-10 shadow-sm">
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-10">
          
          {/* Section 1: Company Information */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
              <Building2 size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Company information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-6">
              <InputField label="Company name" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="eg Rajesh Electronics" required />
              <InputField label="Contact person" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="Full Name" required />
              <InputField label="Designation" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Owner" />
              <InputField label="Phone number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="91543234342" required />
              <InputField label="Email address" name="email" value={formData.email} onChange={handleInputChange} placeholder="rajeshelectronics@gmail.com" type="email" />
              <InputField label="GST number" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="NPSS91543234342" />
              <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="Pune" />
              <InputField label="State" name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" />
            </div>
          </section>

          {/* Section 2: Product Interest */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
              <Package size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Product interest</h3>
              <span className="text-xs text-gray-400 ml-2 font-normal">Qty field included</span>
            </div>

            {products.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-6 mb-8 p-4 bg-gray-50/50 rounded-lg md:bg-transparent md:p-0">
                <SelectField 
                  label="Product" 
                  name="product"
                  value={item.product}
                  onChange={(e) => handleProductChange(item.id, 'product', e.target.value)}
                  options={["Switchboard", "Wires", "LED Panel"]} 
                  placeholder="Select Product" 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Variant / Model</label>
                  <input value={item.variant} readOnly className="bg-[#E9E9E9] border-none rounded-md p-2.5 text-sm text-gray-500 cursor-not-allowed" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Quantity *</label>
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => handleProductChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="bg-white border border-gray-300 rounded-md p-2 text-sm text-center focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                  <SelectField 
                    label="Unit (approx.)" 
                    name="unit"
                    value={item.unit}
                    onChange={(e) => handleProductChange(item.id, 'unit', e.target.value)}
                    options={["Unit", "Box", "Meter"]} 
                    placeholder="Unit (approx.)" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Est. value ₹</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <input 
                        type="number"
                        step="0.1"
                        value={item.estValue} 
                        onChange={(e) => handleProductChange(item.id, 'estValue', parseFloat(e.target.value) || 0)}
                        className="bg-[#E9E9E9] pl-7 w-full border-none rounded-md p-2.5 text-sm outline-none" 
                      />
                    </div>
                  </div>
                  <SelectField 
                    label="Assigned to" 
                    name="assignedTo"
                    value={item.assignedTo}
                    onChange={(e) => handleProductChange(item.id, 'assignedTo', e.target.value)}
                    options={["Sales Team A", "Manager B"]} 
                    placeholder="Assigned to" 
                  />
                </div>
              </div>
            ))}

            <button 
              type="button"
              onClick={addProduct}
              className="w-full bg-black text-white py-3 rounded-md flex items-center justify-center gap-2 font-medium hover:bg-zinc-800 transition-colors"
            >
              <Plus size={18} /> Add another Product
            </button>

            {/* Product Summary Card */}
            <div className="mt-8 bg-[#F5F5F5] rounded-xl p-4 sm:p-6 flex flex-col md:flex-row items-center border border-gray-100 gap-6">
              <div className="flex flex-1 w-full justify-between md:justify-start md:gap-12 lg:gap-16">
                <div className="text-center md:text-left">
                  <p className="text-[10px] md:text-xs text-gray-500 mb-1 uppercase tracking-wider">Total quantity</p>
                  <p className="font-semibold text-sm md:text-base">{summary.totalQty} units</p>
                </div>
                <div className="w-px h-10 bg-gray-300 hidden md:block" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] md:text-xs text-gray-500 mb-1 uppercase tracking-wider">Est. deal value</p>
                  <p className="font-semibold text-base md:text-lg">₹ {summary.totalValue}L</p>
                </div>
                <div className="w-px h-10 bg-gray-300 hidden md:block" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] md:text-xs text-gray-500 mb-1 uppercase tracking-wider">Products</p>
                  <p className="font-semibold text-sm md:text-base">{products.length}</p>
                </div>
              </div>
              <div className="w-full md:w-px h-px md:h-10 bg-gray-300" />
              <p className="text-[10px] md:text-[11px] text-gray-400 flex-1 italic leading-relaxed">
                Est. value is calculated from quantity × avg. unit price. Confirm in quotation.
              </p>
            </div>
          </section>

          {/* Section 3: Lead Details */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
              <FileText size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Lead details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-6">
              <SelectField label="Lead source *" name="leadSource" value={formData.leadSource} onChange={handleInputChange} options={["Website", "Referral", "Cold Call"]} placeholder="Select source" />
              <SelectField label="Priority" name="priority" value={formData.priority} onChange={handleInputChange} options={["High", "Medium", "Low"]} placeholder="Select Priority" />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Expected decision date</label>
                <input 
                  type="date" 
                  name="expectedDecisionDate" 
                  value={formData.expectedDecisionDate}
                  onChange={handleInputChange} 
                  className="bg-[#E9E9E9] w-full border-none rounded-md p-2.5 text-sm uppercase outline-none focus:ring-1 focus:ring-black" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Follow-up date</label>
                <input 
                  type="date" 
                  name="followUpDate" 
                  value={formData.followUpDate}
                  onChange={handleInputChange} 
                  className="bg-[#E9E9E9] w-full border-none rounded-md p-2.5 text-sm uppercase outline-none focus:ring-1 focus:ring-black" 
                />
              </div>

              <SelectField label="Initial status" name="initialStatus" value={formData.initialStatus} onChange={handleInputChange} options={["New", "Contacted", "Qualified"]} placeholder="Filter" />
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Add Address</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-4 text-sm text-gray-600 min-h-20 resize-none focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <div className="bg-[#E9E9E9] rounded-md p-4 min-h-37.5">
                  <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Note</p>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="bg-transparent border-none w-full focus:ring-0 text-sm outline-none resize-none min-h-25"
                    placeholder="Write your notes here..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Form Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-100">
            <button type="button" className="w-full sm:w-auto text-gray-600 font-semibold px-8 py-2 hover:underline transition-all">Cancel</button>
            <button type="button" className="w-full sm:w-auto border border-black rounded-md px-10 py-2.5 font-semibold text-black hover:bg-gray-50 transition-colors">Save draft</button>
            <button type="submit" className="w-full sm:w-auto bg-black text-white rounded-md px-12 py-2.5 font-semibold hover:bg-zinc-800 transition-all shadow-md active:scale-95">Save lead</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LeadForm;