import {  ArrowRight } from 'lucide-react';

const ProductionRequests = ({ requests }: { requests: any[] }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Request ID</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Production Ref</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty Needed</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Priority</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{req.id}</td>
              <td className="px-6 py-4">
                <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded">{req.productionOrderId}</span>
              </td>
              <td className="px-6 py-4">
                <p className="font-bold text-slate-800 text-sm">{req.materialName}</p>
                <p className="text-[10px] text-slate-400 font-medium">Req Date: {req.requestDate}</p>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-black text-slate-900">{req.qtyRequested}</span>
                <span className="text-[10px] ml-1 text-slate-400 uppercase font-bold">{req.unit}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                  req.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {req.priority}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-indigo-600 transition flex items-center ml-auto">
                  PROCESS ISSUE <ArrowRight className="h-3 w-3 ml-2" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionRequests;