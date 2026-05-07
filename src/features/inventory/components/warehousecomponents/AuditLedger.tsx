import { ArrowDownLeft, ArrowUpRight, User, } from 'lucide-react';

const AuditLedger = ({ ledgerData }: { ledgerData: any[] }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref ID</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Delta</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ledgerData.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4 text-[11px] font-medium text-slate-400">{log.timestamp}</td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase ${
                  log.type === 'INWARD' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {log.type === 'INWARD' ? <ArrowDownLeft className="h-3 w-3 mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1" />}
                  {log.type}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-slate-800 text-sm">{log.materialName}</td>
              <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-500 underline decoration-slate-200">{log.reference}</td>
              <td className={`px-6 py-4 font-black ${log.type === 'INWARD' ? 'text-emerald-600' : 'text-orange-600'}`}>
                {log.type === 'INWARD' ? '+' : '-'}{log.quantity}
              </td>
              <td className="px-6 py-4 flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-3 w-3 text-slate-500" />
                </div>
                <span className="text-xs font-bold text-slate-600">{log.user}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLedger;