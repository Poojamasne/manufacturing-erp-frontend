import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
  getGRNEntry,
  updateQCStatus,
} from "../../ModuleStateFiles/GoodsReceiptSlice";
import {
  ChevronRight,
  Package,
  Hash,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,

  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

const ViewGRN: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { grn, loading } = useAppSelector((state) => state.goodsReceipts);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (id) dispatch(getGRNEntry(id));
  }, [id, dispatch]);

  const handleQC = (status: "Approved" | "Rejected") => {
    if (status === "Rejected" && !rejectionReason) {
      toast.error("Please specify a reason for rejection.");
      return;
    }
    if (grn) dispatch(updateQCStatus(grn.id, status, rejectionReason));
  };

  if (loading || !grn)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] font-bold text-slate-400">
        Loading GRN...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <button
            onClick={() => navigate("/purchase/goods-receipts")}
            className="outline-none hover:text-[#F59E0B] font-medium"
          >
            Material Receipts
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-bold tracking-tight">
            {grn.grn_id}
          </span>
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
          Goods Receipt Note
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Context */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <ClipboardCheck size={120} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                <ClipboardCheck size={14} /> Receipt Context
              </h3>
              <div className="space-y-8 relative z-10">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Supplier
                  </label>
                  <p className="text-slate-800 font-black text-base leading-tight">
                    {grn.supplier_name}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Linked PO Ref
                  </label>
                  <p className="text-slate-800 font-black text-base">
                    {grn.po_ref}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Material
                  </label>
                  <p className="text-slate-800 font-black text-base leading-tight">
                    {grn.material_name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: QC Action & Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                <div className="p-3 bg-orange-50 rounded-2xl">
                  <Info className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Inward Specifications</h3>
                  <p className="text-sm text-slate-400 font-medium">
                    Logged quantity and physical parameters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                    <Package size={14} /> Qty Received
                  </label>
                  <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800 text-2xl">
                    {grn.quantity_received.toLocaleString()}{" "}
                    <span className="text-sm text-slate-400 font-bold">
                      Units
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                    <Hash size={14} /> Batch Identification
                  </label>
                  <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800 text-lg">
                    {grn.batch_number}
                  </div>
                </div>
              </div>

              {/* QC Process Section (SRS 3.10) */}
              <div className="pt-10 border-t border-slate-100">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] flex items-center gap-1.5 mb-6">
                  <Activity size={14} /> Quality verification Logic
                </label>

                {grn.qc_status === "Pending" ? (
                  <div className="bg-slate-50 p-8 rounded-4xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                      <AlertCircle className="text-amber-500" />
                      <h4 className="font-bold text-slate-700">
                        Awaiting QC Decision
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="If rejecting, state the reason here (e.g., Diameter Mismatch, Damages)..."
                        className="outline-none w-full bg-white border border-slate-200 p-6 rounded-3xl text-sm font-medium h-24 resize-none"
                      />
                      <div className="flex flex-col md:flex-row gap-4">
                        <button
                          onClick={() => handleQC("Rejected")}
                          className="outline-none flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-rose-500 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-50 transition-all"
                        >
                          <XCircle size={20} /> Reject Material
                        </button>
                        <button
                          onClick={() => handleQC("Approved")}
                          className="outline-none flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                        >
                          <CheckCircle2 size={20} /> Approve for Inventory
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-8 rounded-4xl flex justify-between items-center ${grn.qc_status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}
                  >
                    <div className="flex items-center gap-4">
                      {grn.qc_status === "Approved" ? (
                        <CheckCircle2 size={32} />
                      ) : (
                        <XCircle size={32} />
                      )}
                      <div>
                        <p className="font-black text-lg uppercase tracking-wider">
                          Quality {grn.qc_status}
                        </p>
                        {grn.rejection_reason && (
                          <p className="text-sm font-bold opacity-70 mt-1 italic">
                            Reason: {grn.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <label className="text-[9px] font-black uppercase opacity-60">
                        Verified By
                      </label>
                      <p className="font-bold">{grn.received_by}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* <div className="mt-12 flex justify-end">
                <button onClick={() => navigate("/purchase/goods-receipts")} className="outline-none px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"><ArrowLeft size={18} /> Back to Directory</button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGRN;
