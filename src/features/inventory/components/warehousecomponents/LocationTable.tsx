import React from 'react';
import { AlertTriangle,  ArrowRight } from 'lucide-react';

interface LocationTableProps {
  locations: any[];
  onViewDetails: (loc: any) => void;
}

const LocationTable: React.FC<LocationTableProps> = ({ locations, onViewDetails }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rack ID</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Info</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Stock</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Available</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reserved</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {locations.map((loc) => {
            const isLow = loc.totalQuantity <= loc.minThreshold && loc.status === 'occupied';
            const available = loc.totalQuantity - loc.reservedQuantity;

            return (
              <tr key={loc.id} className="hover:bg-slate-50 transition-colors group">
                {/* Rack ID */}
                <td className="px-6 py-4">
                  <span className="font-mono font-black text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {loc.rackNumber}
                  </span>
                </td>

                {/* Material Info */}
                <td className="px-6 py-4">
                  {loc.materialName ? (
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-slate-800 text-sm">{loc.materialName}</p>
                        {isLow && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase">{loc.materialCode}</p>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-300 italic tracking-widest">Empty Storage</span>
                  )}
                </td>

                {/* Quantities */}
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-bold text-slate-900">{loc.totalQuantity || '-'}</span>
                  <span className="text-[10px] ml-1 text-slate-400 uppercase">{loc.unit}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-black text-emerald-600">{available || '-'}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-black text-orange-500">{loc.reservedQuantity || '-'}</span>
                </td>

                {/* Action */}
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onViewDetails(loc)}
                    className="p-2 bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition-all"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LocationTable;