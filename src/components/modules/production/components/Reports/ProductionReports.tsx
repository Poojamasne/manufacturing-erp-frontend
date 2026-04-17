import React from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  ExternalLink,
  FileBarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight
} from "lucide-react";

// ==================== Sub-Components ====================
const KpiCard: React.FC<{ label: string; value: string; trend: number; icon: any; color: string }> = ({ label, value, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className={`p-3 rounded-2xl ${color} bg-opacity-10 inline-flex items-center justify-center mb-4`}>
      <Icon className={color} size={24} />
    </div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{label}</p>
    <div className="flex items-end gap-3">
      <p className="text-3xl font-black text-slate-800 leading-none">{value}</p>
      <div className={`flex items-center gap-1 text-[10px] font-bold ${trend >= 0 ? 'text-teal-500' : 'text-red-500'} mb-1`}>
        {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(trend)}%
      </div>
    </div>
  </div>
);

// ==================== Main Component ====================
const ProductionReports: React.FC = () => {
  const reportPeriod = "Last 30 Days";

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">Analytics & Intelligence</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-2">
              Performance data for your production plant
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                <Calendar size={16} className="text-orange-500" />
                {reportPeriod}
                <ChevronDown size={14} />
             </button>
             <button className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-slate-900/10">
                <Download size={16} />
                Export Data
             </button>
          </div>
        </header>

        {/* Top KPI Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard label="Production Output" value="42,501" trend={12.4} icon={Activity} color="text-orange-500" />
          <KpiCard label="Quality Pass Rate" value="98.2%" trend={2.1} icon={FileBarChart} color="text-teal-500" />
          <KpiCard label="Scrap Rate" value="1.8%" trend={-4.5} icon={PieChart} color="text-red-500" />
          <KpiCard label="Machine Utilization" value="84.3h" trend={5.2} icon={BarChart3} color="text-blue-500" />
        </section>

        {/* Analytics Charts Placeholder Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Main Trend (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Efficiency Trend</h3>
                <p className="text-xs text-slate-400">Actual vs. Goal Output (Per Shift)</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target</span>
                </div>
              </div>
            </div>
            
            {/* Visualizer Mock */}
            <div className="h-75 flex items-end justify-between gap-4 pt-10">
              {[60, 85, 40, 95, 75, 55, 90, 85, 100, 60, 45, 80].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                    {h}%
                  </div>
                  <div className="w-full bg-slate-50 h-full rounded-t-lg overflow-hidden relative">
                     <div className="absolute bottom-0 w-full bg-orange-500 group-hover:bg-orange-600 transition-all rounded-t-lg" style={{ height: `${h}%` }}></div>
                     <div className="absolute bottom-0 w-full bg-slate-200 opacity-20" style={{ height: '80%' }}></div> {/* Target Line Placeholder */}
                  </div>
                  <p className="text-[9px] font-black text-slate-300 mt-2 text-center uppercase">P{i+1}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown / Pie Mock (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <PieChart size={20} className="text-orange-500" />
                Downtime Causes
              </h3>
              <p className="text-xs text-slate-400 mt-1">Allocation of non-productive hours</p>
            </div>
            
            <div className="flex-1 flex items-center justify-center my-8">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 border-20 border-orange-500 rounded-full clip-path-demo"></div>
                <div className="absolute inset-2 border-16 border-slate-700 rounded-full opacity-50"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">242h</span>
                  <span className="text-[8px] text-slate-400 uppercase font-black">Total Idle</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Maintenance", val: "45%", col: "bg-orange-500" },
                { label: "Lack of Materials", val: "30%", col: "bg-blue-400" },
                { label: "Shift Change", val: "15%", col: "bg-teal-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.col}`}></span>
                    <span className="text-slate-400">{item.label}</span>
                  </div>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Logs & Archival */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                 <FileBarChart size={18} className="text-orange-500" /> Generated Intelligence Reports
              </h3>
              <button className="text-orange-500 text-xs font-bold hover:underline">Clear History</button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                 <tr>
                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Report Name</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Created</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Data Accuracy</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Download</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {[
                   { name: "Monthly OEE Production Summary", date: "May 01, 2024", acc: "99.9%", file: "PDF" },
                   { name: "Quality & Reject Distribution", date: "Apr 28, 2024", acc: "98.5%", file: "CSV" },
                   { name: "Shift Operator Efficiency Log", date: "Apr 25, 2024", acc: "100%", file: "PDF" },
                 ].map((report, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="px-8 py-5 flex items-center gap-4">
                          <div className="p-2 bg-slate-50 rounded-lg group-hover:text-orange-500"><Download size={14}/></div>
                          <span className="text-[13px] font-bold text-slate-700">{report.name}</span>
                       </td>
                       <td className="px-8 py-5 text-xs text-slate-500 font-medium">{report.date}</td>
                       <td className="px-8 py-5 text-center">
                          <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black border border-teal-100 uppercase tracking-tight">{report.acc} Score</span>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-800"><ExternalLink size={16}/></button>
                       </td>
                    </tr>
                 ))}
               </tbody>
             </table>
           </div>

           <div className="p-8 flex justify-center bg-slate-50/30 border-t border-slate-50">
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">
                 Load 15 More Reports <ArrowRight size={16} />
              </button>
           </div>
        </section>
      </div>
    </div>
  );
};

export default ProductionReports;