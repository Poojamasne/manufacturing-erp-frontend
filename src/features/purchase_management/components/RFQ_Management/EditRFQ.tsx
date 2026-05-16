import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
  getRFQEntry,
  editRFQEntry,
} from "../../ModuleStateFiles/RFQManagementSlice";
import {
  ChevronRight,
  FileText,
  Info,
  Calendar,
  Activity,
  Save,
} from "lucide-react";

const EditRFQ: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { rfq, loading } = useAppSelector((state) => state.rfqManagement);

  const [formData, setFormData] = useState({ deadline: "", status: "Draft" });

  useEffect(() => {
    if (id) dispatch(getRFQEntry(id));
  }, [id, dispatch]);
  useEffect(() => {
    if (rfq) setFormData({ deadline: rfq.deadline, status: rfq.status });
  }, [rfq]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (id && rfq)
      dispatch(editRFQEntry(id, { ...rfq, ...formData }, navigate));
  };

  if (!rfq)
    return (
      <div className="p-20 text-center text-3xl font-bold text-red-400">
        RFQ not found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <button
            onClick={() => navigate("/purchase/rfqs")}
            className="hover:text-[#F59E0B] transition-colors font-medium"
          >
            RFQ Management
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-bold tracking-tight">
            Edit: {rfq.rfq_id}
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
          Modify RFQ Parameters
        </h1>

        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative h-full">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                <FileText size={14} /> RFQ Context
              </h3>
              <div className="space-y-8">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400">
                    Source PR
                  </label>
                  <p className="text-slate-800 font-black text-base">
                    {rfq.pr_ref}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400">
                    Material
                  </label>
                  <p className="text-slate-800 font-black text-base leading-tight">
                    {rfq.material_name}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400">
                    Quantity
                  </label>
                  <p className="text-slate-800 font-black text-base">
                    {rfq.quantity} {rfq.unit}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                <div className="p-3 bg-orange-50 rounded-2xl">
                  <Info className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Editable Details</h3>
                  <p className="text-sm text-slate-400 font-medium">
                    Modify sourcing timeline and life-cycle state
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Calendar size={14} /> Change Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold focus:ring-4 focus:ring-amber-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Activity size={14} /> RFQ Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="outline-none w-full bg-slate-900 text-white px-6 py-4 rounded-3xl font-black text-xs shadow-xl"
                  >
                    <option>Draft</option>
                    <option>Sent</option>
                    <option>Awaiting Response</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="mt-12 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/purchase/rfqs")}
                  className="outline-none px-4 py-2 font-bold text-slate-400 hover:text-red-500 border rounded-xl transition-all flex items-center"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="outline-none bg-[#F59E0B] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#f67317] transition-all flex items-center gap-2 shadow-xl disabled:opacity-50 shadow-orange-100"
                >
                  <Save size={18} /> {loading ? "Saving..." : "Update RFQ"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRFQ;
