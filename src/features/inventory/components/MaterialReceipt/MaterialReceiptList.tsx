import React, { useState } from "react";
import { 
  Package, Search, MoreVertical, Filter, 
  ChevronRight, Plus, ChevronLeft, MoreHorizontal 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Material {
  code: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  currentStock: number;
}

const mockMaterials: Material[] = [
  { code: "MAT-001", name: "Steel Grade A", category: "Raw Material", unit: "kg", minStock: 1000, currentStock: 3200 },
  { code: "MAT-042", name: "Copper Wire 2mm", category: "Raw Material", unit: "m", minStock: 500, currentStock: 150 },
  { code: "MAT-088", name: "Aluminum Sheet", category: "Raw Material", unit: "sheets", minStock: 200, currentStock: 850 },
  { code: "MAT-102", name: "Plastic Resin", category: "Raw Material", unit: "kg", minStock: 300, currentStock: 500 },
];

const MaterialReceiptList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredMaterials = mockMaterials.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header Section (Matching Lead Theme) --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <button className="hover:text-[#F59E0B] transition-colors font-medium">Inventory</button>
              <ChevronRight size={14} />
              <span className="text-gray-800 font-bold">Material Receipts</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Material Master</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage stock levels and item specifications</p>
          </div>

          <button
            onClick={() => {
              navigate("/inventory/material-receipts/new-material-receipt");
              document.title = "Manufacturing ERP - New Material Receipt";
            }}
            className="group flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/5 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>New Receipt</span>
          </button>
        </header>

        {/* --- Main Data Container --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search materials by code, name..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 text-[13px] font-bold flex items-center gap-2">
                <Filter size={16} className="text-[#F59E0B]" />
                Filter
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100">Material Details</th>
                  <th className="px-8 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100">Category</th>
                  <th className="px-8 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">In Stock</th>
                  <th className="px-8 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                  <th className="px-8 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMaterials.map((item) => (
                  <tr key={item.code} className="group hover:bg-[#f3f4e6]/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-2xl text-[#F59E0B] group-hover:bg-white transition shadow-sm">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{item.name}</p>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{item.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[13px] font-bold text-slate-600">{item.category}</td>
                    <td className="px-8 py-6 text-center">
                      <p className="font-black text-slate-700 text-sm">{item.currentStock.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{item.unit}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        item.currentStock <= item.minStock 
                        ? 'bg-rose-50 text-rose-700 border-rose-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {item.currentStock <= item.minStock ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <button className="p-2 hover:bg-white text-slate-800 hover:text-[#F59E0B] rounded-xl transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (Matching Lead Theme) */}
          <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
             <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                Showing <span className="text-slate-900">1</span> to <span className="text-slate-900">{filteredMaterials.length}</span> of <span className="text-slate-900">{filteredMaterials.length}</span> Materials
             </div>
             <div className="flex items-center gap-2">
                <button disabled className="p-2 rounded-xl border border-slate-200 bg-white text-slate-300 opacity-50"><ChevronLeft size={18}/></button>
                <button className="w-10 h-10 rounded-xl text-xs font-bold bg-[#F59E0B] text-white">1</button>
                <button disabled className="p-2 rounded-xl border border-slate-200 bg-white text-slate-300 opacity-50"><ChevronRight size={18}/></button>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default MaterialReceiptList;