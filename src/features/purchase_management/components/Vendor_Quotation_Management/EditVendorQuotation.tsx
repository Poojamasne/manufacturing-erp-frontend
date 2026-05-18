import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
  getQuotationEntry,
  editQuotationEntry
} from "../../ModuleStateFiles/VendorQuotationSlice";
import {
  ChevronRight,
  Package,
  DollarSign,
  Truck,
  Calendar,
  Info,
  Hash,
  Activity,
  AlertCircle,
  Save,
  CreditCard,
  Building2,
  IndianRupee
} from "lucide-react";

const EditVendorQuotation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux State
  const { quotation, loading } = useAppSelector((state) => state.vendorQuotations);

  // Local Form State
  const [formData, setFormData] = useState({
    unit_price: 0,
    delivery_lead_time: 0,
    payment_terms: "",
    validity_date: "",
    status: "Submitted"
  });

  // 1. Initial Data Fetch
  useEffect(() => {
    if (id) {
      dispatch(getQuotationEntry(id));
    }
  }, [id, dispatch]);

  // 2. Sync Redux to Local State
  useEffect(() => {
    if (quotation) {
      setFormData({
        unit_price: quotation.unit_price,
        delivery_lead_time: quotation.delivery_lead_time,
        payment_terms: quotation.payment_terms,
        validity_date: quotation.validity_date,
        status: quotation.status
      });
    }
  }, [quotation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !quotation) return;

    const payload = {
      ...quotation,
      ...formData,
      total_amount: formData.unit_price * (quotation.total_amount / quotation.unit_price) // recalculate total
    };

    dispatch(editQuotationEntry(id, payload, navigate));
  };

  if (!quotation && !loading) {
    return <div className="p-20 text-center font-bold text-slate-400">Bid record not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <button onClick={() => navigate("/purchase/vendor-quotations")} className="outline-none hover:text-[#F59E0B] transition-colors font-medium">
            Bids & Quotations
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-bold tracking-tight">Modify Bid: {quotation?.quotation_id}</span>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Modify Commercials</h1>
            <p className="text-slate-500 font-medium">Update unit prices, lead times, and selection status</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
            <Hash size={16} className="text-[#F59E0B]" />
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest">{quotation?.quotation_id}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Fixed Sourcing Context */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <DollarSign size={120} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                <Activity size={14} /> Sourcing Context
              </h3>
              <div className="space-y-8 relative z-10">
                <DetailBox label="Supplier Name" value={quotation?.vendor_name || ""} icon={<Building2 size={12} className="text-[#F59E0B]" />} />
                <DetailBox label="Material Item" value={quotation?.material_name || ""} icon={<Package size={12} className="text-[#F59E0B]" />} />
                <DetailBox label="RFQ Reference" value={quotation?.rfq_ref || ""} icon={<Hash size={12} className="text-[#F59E0B]" />} />
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-amber-400" size={20} />
                <h4 className="font-bold">Revision Notice</h4>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Adjusting commercial terms will affect the vendor comparison matrix. Ensure the validity date is consistent with the latest supplier communication.
              </p>
            </div>
          </div>

          {/* Right Column: Editable Commercials */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">

              <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                <div className="p-3 bg-orange-50 rounded-2xl"><Info className="text-[#F59E0B]" /></div>
                <div>
                  <h3 className="font-bold text-xl">Pricing & Delivery</h3>
                  <p className="text-sm text-slate-400 font-medium">Update bidding specifics and payment terms</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Unit Price */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <IndianRupee size={14} /> Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-black text-slate-800 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* Lead Time */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Truck size={14} /> Delivery Lead Time
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.delivery_lead_time}
                    onChange={(e) => setFormData({ ...formData, delivery_lead_time: Number(e.target.value) })}
                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                    placeholder="e.g. 10 Working Days"
                  />
                </div>

                {/* Validity Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Calendar size={14} /> Bid Validity Date
                  </label>
                  <input
                    type="date"
                    value={formData.validity_date}
                    onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* Payment Terms */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <CreditCard size={14} /> Payment Terms
                  </label>

                  <select
                    value={formData.payment_terms}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_terms: e.target.value })
                    }
                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                  >
                    <option value="">Select Payment Terms</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Advance">Advance</option>
                    <option value="50% Advance">50% Advance</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>

              {/* Status Section (SRS 3.6.3 Finalization) */}
              <div className="space-y-4 pt-8 border-t border-slate-50">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] flex items-center gap-1.5">
                  <Activity size={14} /> Quotation Lifecycle Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Submitted", "Under Review", "Accepted", "Rejected"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s as any })}
                      className={`outline-none px-4 py-3 rounded-2xl text-[11px] font-bold transition-all border ${formData.status === s
                          ? 'bg-slate-800 text-white border-transparent shadow-lg'
                          : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-16 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/purchase/vendor-quotations")}
                  className="outline-none px-4 py-2 text-sm rounded-xl font-bold text-slate-400 hover:text-red-500 border transition-colors flex items-center gap-2"
                >
                   Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="outline-none bg-[#F59E0B] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#f67317] transition-all flex items-center gap-1 shadow-xl shadow-orange-100 disabled:opacity-50"
                >
                  {loading ? "Updating..." : <><Save size={18} /> Update</>}
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== Sub-Components ====================

const DetailBox: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="space-y-1 group">
    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
      {icon} {label}
    </label>
    <div className="text-slate-800 font-black text-base wrap-break-word leading-tight group-hover:text-amber-600 transition-colors">
      {value || "-"}
    </div>
  </div>
);

export default EditVendorQuotation;