import React from 'react';
import { Package, AlertTriangle, ChevronRight } from 'lucide-react';

interface LocationCardProps {
  location: any;
  onViewDetails: (loc: any) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onViewDetails }) => {
  const isLow = location.totalQuantity <= location.minThreshold && location.status === 'occupied';
  const available = location.totalQuantity - location.reservedQuantity;

  return (
    <div className={`bg-white rounded-xl border-2 p-5 transition-all group ${
      isLow ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100 hover:border-indigo-300 hover:shadow-md'
    }`}>
      {/* Rack Header */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded uppercase tracking-tighter shadow-sm">
          Rack {location.rackNumber}
        </span>
        {isLow && (
          <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-1 rounded-full flex items-center animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1"/> LOW STOCK
          </span>
        )}
      </div>

      {location.materialName ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
              {location.materialName}
            </h3>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
              {location.materialCode}
            </p>
          </div>

          {/* Mini Stock Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">Available</p>
              <p className="text-sm font-bold text-slate-900">{available} {location.unit}</p>
            </div>
            <div className="bg-indigo-50/50 rounded-lg p-2 border border-indigo-100 text-center">
              <p className="text-[9px] font-black text-indigo-400 uppercase">Reserved</p>
              <p className="text-sm font-bold text-indigo-600">{location.reservedQuantity} {location.unit}</p>
            </div>
          </div>

          <button 
            onClick={() => onViewDetails(location)}
            className="w-full py-2.5 bg-slate-900 text-white text-[11px] font-black rounded-lg transition hover:bg-indigo-600 flex items-center justify-center group"
          >
            VIEW FULL DETAILS
            <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-lg">
          <Package className="h-8 w-8 text-slate-200 mb-2" />
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Available Bin</p>
        </div>
      )}
    </div>
  );
};

export default LocationCard;