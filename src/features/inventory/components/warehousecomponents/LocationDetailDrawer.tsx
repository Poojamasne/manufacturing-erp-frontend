import React from 'react';
import { X, History, ArrowDownLeft, ArrowUpRight, ShieldCheck, Database, Box } from 'lucide-react';

const LocationDetailsDrawer = ({ location, onClose }: { location: any, onClose: () => void }) => {
  if (!location) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
        {/* Detail Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
              <Box className="h-8 w-8" />
            </div>
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Storage Inspection</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{location.rackNumber}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Material Identity Section */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-4 w-4 text-slate-400" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Material Specifications</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Material Name</p>
                <p className="text-xl font-bold text-slate-900">{location.materialName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Stock Code</p>
                <p className="text-sm font-mono font-bold text-indigo-600">{location.materialCode || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Batch Assignment</p>
                <p className="text-sm font-mono font-bold text-slate-700">{location.batchNumber || '-'}</p>
              </div>
            </div>
          </section>

          {/* Real-time Inventory Section */}
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Availability</h3>
            <div className="flex items-end justify-between p-6 bg-white border-2 border-slate-900 rounded-2xl shadow-[8px_8px_0px_0px_rgba(15,23,42,0.1)]">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Stock</p>
                <p className="text-5xl font-black text-slate-900">{location.totalQuantity}<span className="text-lg ml-1 font-bold text-slate-400">{location.unit}</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-orange-500 uppercase mb-1">Reserved</p>
                <p className="text-2xl font-black text-orange-600">{location.reservedQuantity}</p>
              </div>
            </div>
          </section>

          {/* Location Ledger (SRS 6.0) */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Movements</h3>
              <History className="h-4 w-4 text-slate-300" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${i % 2 === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {i % 2 === 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{i % 2 === 0 ? 'Inward from Purchase' : 'Issue to Production'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Ref: PO-2210{i} • Jan 1{i}, 2024</p>
                    </div>
                  </div>
                  <span className={`font-black ${i % 2 === 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {i % 2 === 0 ? '+200' : '-50'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 flex gap-4">
          <button className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition shadow-lg shadow-slate-200">
            Export Issue Slip
          </button>
          <button className="px-6 py-4 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition">
            <ShieldCheck className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailsDrawer;