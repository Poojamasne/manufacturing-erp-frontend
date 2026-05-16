import React, { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
  deleteQuotationEntry,
  getQuotationEntry,
} from "../../ModuleStateFiles/VendorQuotationSlice";
import {
  ChevronRight,
  Package,
  Calendar,
  Clock,
  FileText,
 
  Activity,
  Trash2,
  Edit,
  IndianRupeeIcon,
  Handshake,
} from "lucide-react";

const ViewQuotation: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { quotation, loading } = useAppSelector(
    (state) => state.vendorQuotations,
  );

  useEffect(() => {
    if (id) dispatch(getQuotationEntry(id));
  }, [id, dispatch]);

  if (loading || !quotation)
    return (
      <div className="p-20 text-center font-bold text-slate-400">
        Loading Document...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <button
            onClick={() => navigate("/purchase/quotations")}
            className="hover:text-[#F59E0B] font-medium"
          >
            Bids
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-bold">
            {quotation.quotation_id}
          </span>
        </div>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Bid Analysis
            </h1>
            <p className="text-slate-500 font-medium">
              Detailed commercial terms from {quotation.vendor_name}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                dispatch(deleteQuotationEntry(quotation.id, navigate))
              }
              className="outline-none flex items-center gap-1 px-4 py-2 text-[#f59e0b] hover:text-rose-500 border hover:bg-white rounded-xl font-black text-sm shadow-xl shadow-rose-100 transition-all"
            >
              <Trash2 size={20} /> Delete
            </button>
            <Link
              to={`/purchase/vendor-quotations/edit-vendor-quotation/${quotation.id}`}
              className="outline-none flex items-center gap-1 px-4 py-2 bg-[#F59E0B] text-white rounded-xl font-black text-sm shadow-xl shadow-orange-100 transition-all"
            >
              <Edit size={18} />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative h-fit">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <FileText size={120} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                <Package size={14} /> Fixed Context
              </h3>
              <div className="space-y-8 relative z-10">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Sourcing Ref
                  </label>
                  <p className="text-slate-800 font-black text-base">
                    {quotation.rfq_ref}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Material
                  </label>
                  <p className="text-slate-800 font-black text-base leading-tight">
                    {quotation.material_name}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Vendor
                  </label>
                  <p className="text-slate-800 font-black text-base">
                    {quotation.vendor_name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                <div className="p-3 bg-orange-50 rounded-2xl">
                  <IndianRupeeIcon className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Commercial Summary</h3>
                  <p className="text-sm text-slate-400 font-medium">
                    Bidding price and payment arrangements
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <IndianRupeeIcon size={14} /> Unit Price
                  </label>
                  <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800 text-2xl tracking-tighter">
                    ₹{quotation.unit_price.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Clock size={14} /> Lead Time
                  </label>
                  <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800 text-lg">
                    {quotation.delivery_lead_time}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Activity size={14} /> Status
                  </label>
                  <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest text-center shadow-lg">
                    {quotation.status}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Calendar size={14} /> Validity Until
                  </label>
                  <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800">
                    {quotation.validity_date}
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-10 border-t border-slate-50">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-4">
                  <Handshake size={14} /> Payment Terms
                </label>
                <p className="bg-slate-50 p-6 rounded-3xl text-sm font-bold text-slate-700 border border-slate-50">
                  {quotation.payment_terms}
                </p>
              </div>
              {/* <div className="mt-8 flex justify-end"><button onClick={() => navigate("/purchase/quotations")} className="outline-none px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"><ArrowLeft size={18} /> Return to Directory</button></div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;
