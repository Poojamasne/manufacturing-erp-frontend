import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
  getGRNEntry,
  finalizeQualityCheck,
} from "../../ModuleStateFiles/GoodsReceiptSlice";
import {
  ChevronRight,
  CheckCircle2,
  XCircle,

  ShieldCheck,
  Scale,
  Package,
} from "lucide-react";

const QCVerification: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { grn, loading } = useAppSelector((state) => state.goodsReceipts);

  const [reason, setReason] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (id) dispatch(getGRNEntry(id));
  }, [id, dispatch]);

  const handleDecision = (status: "Approved" | "Rejected") => {
    if (id) dispatch(finalizeQualityCheck(id, status, reason, navigate));
  };

  if (!grn)
    return (
      <div className="p-20 text-center font-bold text-slate-400">
        Loading QC Context...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <button
            onClick={() => navigate("/purchase/goods-receipts")}
            className="outline-none hover:text-[#F59E0B] font-medium"
          >
            Inward Logs
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-bold">QC Verification</span>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Quality Verification
          </h1>
          <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#F59E0B]" />
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
              {grn.grn_id}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          {/* Inspection Context */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm h-fit">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <Scale size={14} className="text-[#F59E0B]" /> Material to Inspect
            </h3>
            <div className="space-y-6">
              <QCDetail
                label="Material"
                value={grn.material_name}
                icon={<Package size={14} />}
              />
              <QCDetail
                label="Supplier"
                value={grn.supplier_name}
                icon={<ShieldCheck size={14} />}
              />
              <div className="pt-6 border-t border-slate-50 flex justify-between">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase">
                    Received Count
                  </label>
                  <p className="text-2xl font-black text-slate-800">
                    {grn.quantity_received.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <label className="text-[9px] font-black text-slate-400 uppercase">
                    Batch Ref
                  </label>
                  <p className="text-lg font-bold text-slate-700">
                    {grn.batch_number}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Logic Panel (SRS 3.10) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={150} />
            </div>

            <h3 className="font-bold text-xl mb-4 relative z-10">
              Inspector's Decision
            </h3>
            <p className="text-slate-400 text-sm mb-10 relative z-10 leading-relaxed">
              Verify the physical condition and technical specifications.
              Approval will immediately move these items into active inventory
              stock.
            </p>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  Inspection Note / Rejection Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe quality findings..."
                  className="outline-none w-full bg-slate-800 border border-slate-700 p-6 rounded-3xl text-sm font-medium h-28 focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700 mb-6">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                />
                <span className="text-[11px] font-bold text-slate-300">
                  I confirm the physical inspection is complete
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  disabled={!isVerified || !reason || loading}
                  onClick={() => handleDecision("Rejected")}
                  className="outline-none flex-1 px-4 py-2 bg-white/5 border border-white/10 hover:bg-rose-600 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  <XCircle size={18} /> Reject Material
                </button>
                <button
                  disabled={!isVerified || !reason || loading}
                  onClick={() => handleDecision("Approved")}
                  className="outline-none flex-1 px-4 py-2 bg-[#F59E0B] hover:bg-[#f67317] text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 disabled:opacity-30"
                >
                  <CheckCircle2 size={18} /> Approve & Inward
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="mt-12 flex justify-start">
                    <button onClick={() => navigate(-1)} className="outline-none px-6 py-2 rounded-xl font-bold text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2">
                        <ArrowLeft size={18} /> Back
                    </button>
                </div> */}
      </div>
    </div>
  );
};

// Sub-component
const QCDetail: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5">
      {icon} {label}
    </label>
    <p className="text-slate-800 font-bold text-base leading-tight">{value}</p>
  </div>
);

export default QCVerification;
