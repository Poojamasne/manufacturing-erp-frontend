import { useState, useMemo, useRef, useEffect } from "react";
import type { FC } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  X,
  TrendingUp,
} from "lucide-react";

// --- Types ---
type TimeRange = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";

interface LeaderboardItem {
  name: string;
  leads: number;
  conversion: string;
  revenue: string;
}


interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  svg: string;
  isNeg?: boolean;
}

// --- Theme Config ---
const THEME = {
  primary: "#005d52",
  secondary: "#4fb29b",
  lightTeal: "#d1e9e7",
  target: "#b0d9d9",
  production: "#f08552",
  chart: ["#005d52", "#4fb29b", "#b0d9d9", "#f08552"]
};

// --- Mock Data Store ---
const DATA_STORE: Record<Exclude<TimeRange, "Custom">, any> = {
  Weekly: {
    revenue: [{ name: "Mon", val: 1.2 }, { name: "Tue", val: 2.1 }, { name: "Wed", val: 1.8 }, { name: "Thu", val: 3.4 }, { name: "Fri", val: 2.9 }, { name: "Sat", val: 4.1 }, { name: "Sun", val: 3.2 }],
    sources: [{ name: "Trade Fair", value: 40 }, { name: "Referral", value: 30 }, { name: "Web", value: 20 }, { name: "Direct", value: 10 }],
    kpis: { rev: "₹12.4L", leads: "42", conv: "9.5%", avg: "₹0.8L" },
    products: [
      { name: "Fridge", target: 100, sold: 85, prod: 110 },
      { name: "AC", target: 80, sold: 95, prod: 90 },
      { name: "Wash", target: 60, sold: 40, prod: 55 }
    ],
    leaderboard: [{ name: "Sneha Patil", leads: 12, conversion: "10%", revenue: "₹2.1L" }, { name: "Rahul Deshpande", leads: 8, conversion: "12%", revenue: "₹3.4L" }]
  },
  Monthly: {
    revenue: [{ name: "W1", val: 10 }, { name: "W2", val: 18 }, { name: "W3", val: 14 }, { name: "W4", val: 22 }],
    sources: [{ name: "Trade Fair", value: 120 }, { name: "Referral", value: 80 }, { name: "Web", value: 60 }, { name: "Direct", value: 40 }],
    kpis: { rev: "₹48.2L", leads: "233", conv: "14.2%", avg: "₹1.4L" },
    products: [
      { name: "Fridge", target: 400, sold: 380, prod: 420 },
      { name: "AC", target: 350, sold: 410, prod: 380 },
      { name: "Wash", target: 250, sold: 200, prod: 240 }
    ],
    leaderboard: [{ name: "Sneha Patil", leads: 45, conversion: "12%", revenue: "₹8.4L" }, { name: "Rahul Deshpande", leads: 38, conversion: "15%", revenue: "₹12.2L" }]
  },
  Quarterly: {
    revenue: [{ name: "Jan", val: 35 }, { name: "Feb", val: 42 }, { name: "Mar", val: 51 }],
    sources: [{ name: "Trade Fair", value: 350 }, { name: "Referral", value: 210 }, { name: "Web", value: 140 }, { name: "Direct", value: 100 }],
    kpis: { rev: "₹1.2Cr", leads: "680", conv: "12.8%", avg: "₹1.9L" },
    products: [
      { name: "Fridge", target: 1200, sold: 1150, prod: 1300 },
      { name: "AC", target: 1000, sold: 1250, prod: 1100 },
      { name: "Wash", target: 800, sold: 720, prod: 850 }
    ],
    leaderboard: [{ name: "Priya Mehta", leads: 120, conversion: "20%", revenue: "₹45.2L" }, { name: "Rahul Deshpande", leads: 95, conversion: "18%", revenue: "₹38.1L" }]
  },
  Yearly: {
    revenue: [{ name: "2023", val: 120 }, { name: "2024", val: 240 }, { name: "2025", val: 310 }],
    sources: [{ name: "Trade Fair", value: 1500 }, { name: "Referral", value: 1000 }, { name: "Web", value: 500 }, { name: "Direct", value: 300 }],
    kpis: { rev: "₹4.8Cr", leads: "2.4K", conv: "15.4%", avg: "₹2.2L" },
    products: [
      { name: "Fridge", target: 5000, sold: 4800, prod: 5200 },
      { name: "AC", target: 4500, sold: 5100, prod: 4800 },
      { name: "Wash", target: 3500, sold: 3100, prod: 3600 }
    ],
    leaderboard: [{ name: "Rahul Deshpande", leads: 420, conversion: "16%", revenue: "₹1.4Cr" }, { name: "Sneha Patil", leads: 380, conversion: "14%", revenue: "₹1.1Cr" }]
  }
};

const ReportsAndAnalytics: FC = () => {
  const [range, setRange] = useState<TimeRange>("Monthly");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const currentData = useMemo(() => range === "Custom" ? DATA_STORE.Quarterly : DATA_STORE[range], [range]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = () => {
    alert(`Exporting ${range} data...`);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-gray-400 mt-1 font-normal">Advanced business intelligence insights</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters and Floating Calendar */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-10">
          <div className="relative">
            <div className="flex gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm w-fit">
              {(["Weekly", "Monthly", "Quarterly", "Yearly"] as TimeRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRange(r); setIsCalendarOpen(false); }}
                  className={`px-6 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${range === r ? "bg-[#d1e9e7] text-[#005d52] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${range === "Custom" ? "bg-[#d1e9e7] text-[#005d52] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Calendar size={14} /> Custom
              </button>
            </div>

            {/* Calendar Popup */}
            {isCalendarOpen && (
              <div ref={calendarRef} className="absolute top-full mt-3 left-0 xl:left-auto xl:right-0 z-50 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-50 min-w-75 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-gray-800">Custom Range</h4>
                  <button onClick={() => setIsCalendarOpen(false)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From</label>
                    <input type="date" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm text-[#005d52] outline-none" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To</label>
                    <input type="date" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm text-[#005d52] outline-none" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} />
                  </div>
                  <button onClick={() => { setRange("Custom"); setIsCalendarOpen(false); }} className="w-full py-3 bg-[#005d52] text-white rounded-xl font-bold text-xs shadow-lg">Apply Range</button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#005d52] text-white px-5 py-2 rounded-full text-[11px] font-bold shadow-md">
            <TrendingUp size={14} className="inline mr-2" />
            {range === "Custom" ? `${customRange.start || '...'} to ${customRange.end || '...'}` : `Performance: ${range}`}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Revenue" value={currentData.kpis.rev} trend="+12.4%" svg="/icons/inr.svg" />
          <StatCard label="Active Leads" value={currentData.kpis.leads} trend="+18" svg="/icons/users-bold.svg" />
          <StatCard label="Conv. Rate" value={currentData.kpis.conv} trend="-2.1%" isNeg svg="/icons/percent.svg" />
          <StatCard label="Avg Deal Value" value={currentData.kpis.avg} trend="+5.2%" svg="/icons/graph-up.svg" />
        </div>

        {/* Triple Bar Chart - Target vs Sold vs Production */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-50 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Manufacturing vs Sales</h3>
              <p className="text-sm text-gray-400 font-normal">Target vs Sold Units vs Actual Production</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: THEME.target }} /> Target
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: THEME.primary }} /> Sold
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: THEME.production }} /> Production
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.products} margin={{ left: -20 }} barGap={8}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="target" fill={THEME.target} radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="sold" fill={THEME.primary} radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="prod" fill={THEME.production} radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-50 shadow-sm">
            <h3 className="font-bold text-lg text-gray-800 mb-8">Revenue Growth Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData.revenue} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="pGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="val" stroke={THEME.primary} strokeWidth={4} fill="url(#pGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm flex flex-col">
            <h3 className="font-bold text-lg text-gray-800 mb-6 uppercase tracking-tight text-center sm:text-left">Lead Sources</h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={currentData.sources} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" cornerRadius={6}>
                      {currentData.sources.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} tabIndex={-1} style={{ outline: "none" }} fill={THEME.chart[index % THEME.chart.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-6">
                {currentData.sources.map((s: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: THEME.chart[i % THEME.chart.length] }}></div>
                      <span className="text-gray-400 uppercase tracking-widest">{s.name}</span>
                    </div>
                    <span className="text-gray-800">{Math.round((s.value / currentData.sources.reduce((a: number, b: any) => a + b.value, 0)) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden mb-10">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">Performance Leaderboard</h3>
            <span className="text-[10px] font-bold text-[#005d52] uppercase tracking-widest">Sales Rep Ranking</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-50">Representative</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-r border-gray-50">Leads</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-r border-gray-50">Conversion</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentData.leaderboard.map((person: LeaderboardItem, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-3 border-r border-gray-50 font-normal">
                      <div className="w-8 h-8 rounded-full bg-[#d1e9e7] flex items-center justify-center text-[#005d52] font-bold text-xs">{person.name.charAt(0)}</div>
                      <span className="text-sm font-bold text-gray-800">{person.name}</span>
                    </td>
                    <td className="px-8 py-5 text-center text-sm text-gray-500 font-normal border-r border-gray-50">{person.leads}</td>
                    <td className="px-8 py-5 text-center border-r border-gray-50">
                      <span className="px-3 py-1 bg-[#d1e9e7] text-[#005d52] rounded-full text-[10px] font-bold">{person.conversion}</span>
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-bold text-gray-800">{person.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Stat Card Sub-Component ---
const StatCard: FC<StatCardProps> = ({ label, value, trend, svg, isNeg }) => (
  <div className="bg-white rounded-[28px] p-6 border border-gray-50 hover:border-[#005d52]/30 transition-all group shadow-sm">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-[#f4f7f6] rounded-2xl text-[#005d52] group-hover:bg-[#005d52] group-hover:text-white transition-all duration-300 shadow-sm">
        <img
          src={svg}
          alt=""
          className="w-6 h-6 transition-all duration-300 
             
             /* default → green */
             [filter:invert(23%)_sepia(21%)_saturate(1100%)_hue-rotate(120deg)_brightness(90%)]
             
             /* hover → reset + white */
             group-hover:[filter:brightness(0)_invert(1)]"
        />           </div>
      <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${isNeg ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
        {isNeg ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} {trend}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default ReportsAndAnalytics;