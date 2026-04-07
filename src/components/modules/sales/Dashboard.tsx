import { useState, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { getDashboardData } from "../sales/ModuleStateFiles/DashboardSlice"; // Adjust path
import { useAppDispatch, useAppSelector } from "../../common/ReduxMainHooks";
import type { RootState } from "../../../ApplicationState/Store";

interface StatCardProps {
  title: string;
  value: string | number;
  svg: string;
}

type FilterType = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";

const COLORS = ["#005d52", "#1a7a6f", "#4fb29b", "#7bc7b5", "#f08552", "#b0d9d9", "#cbd5e1"];

// Keeping mock stats for now as requested

const StatCard = ({ title, value, svg }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <div className="p-2 rounded-lg bg-[#e6f4f2] flex items-center justify-center">
          <img
            src={svg}
            alt=""
            className="w-6 h-6 opacity-80"
            style={{ filter: "invert(23%) sepia(21%) saturate(1100%) hue-rotate(120deg) brightness(90%)" }}
          />
        </div>
      </div>
      <h3 className="text-2xl font-extrabold text-gray-800">{value}</h3>
    </div>
  </div>
);

export const Dashboard = () => {
  const dispatch = useAppDispatch();

  const { salesByCategory, stats, pipeline } = useAppSelector((state: RootState) => state.SalesDashboard);

  const [filter, setFilter] = useState<FilterType>("Weekly");
  const [customRange, setCustomRange] = useState({ start: "", end: new Date().toISOString().split("T")[0] });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    dispatch(getDashboardData());
  }, [dispatch, filter]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">

        {/* HEADER & TIME FILTERS */}
        <div className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Full customer pipeline overview</p>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-2 bg-[#005d52] text-white px-4 py-3 rounded-2xl text-[11px] font-bold shadow-lg shadow-teal-900/10">
                <CalendarIcon size={13} />
                {filter === "Custom" ?
                  (customRange.start ? `${customRange.start} to ${customRange.end}` : "Custom Selection")
                  : `${filter} Overview`}
              </div>
              {/* {loading && <Loader2 className="animate-spin text-[#005d52]" size={20} />} */}
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white w-fit shadow-sm">
              {(["Weekly", "Monthly", "Quarterly", "Yearly"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setIsCalendarOpen(false); }}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${filter === f ? "bg-[#d1e9e7] text-[#005d52] shadow-sm" : "text-gray-400 hover:text-gray-700"
                    }`}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${filter === "Custom" ? "bg-[#d1e9e7] text-[#005d52] shadow-sm" : "text-gray-400 hover:text-gray-700"
                  }`}
              >
                <CalendarIcon size={14} /> Custom
              </button>
            </div>

            {isCalendarOpen && (
              <div ref={calendarRef} className="absolute top-full mt-3 right-0 z-50 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-50 w-70 sm:w-85 animate-in zoom-in-95 fade-in duration-200 origin-top-right">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-gray-800">Select Date Range</h4>
                  <button onClick={() => setIsCalendarOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <input type="date" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} />
                  <input type="date" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} />
                  <button onClick={() => { if (customRange.start) setFilter("Custom"); setIsCalendarOpen(false); }} className="w-full py-3 bg-[#005d52] text-white rounded-xl font-bold text-xs shadow-lg">
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS GRID (Keeping mock for now) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Leads" value={stats?.totalLeads} svg="/icons/users.svg" />
          <StatCard title="Deals Won" value={stats?.dealsWon} svg="/icons/win.svg" />
          <StatCard title="Revenue" value={`₹${stats?.totalRevenue}`} svg="/icons/rupee.svg" />
          <StatCard title="Win Rate" value={`${stats?.winRate}%`} svg="/icons/trending.svg" />
        </div>

        {/* CHARTS (Using Redux Data) */}
        <div className="grid grid-cols-1 gap-8">

          {/* Sales Pipeline Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm w-full">
            <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-1">Sales Pipeline</h3>
            <p className="text-sm text-gray-400 font-normal mb-8">Conversion stages distribution</p>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={isMobile ? false : { fill: '#7e899c', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={isMobile ? 28 : 35}>
                    {pipeline.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Performance Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-1">Product Performance</h3>
                <p className="text-sm text-gray-400 font-normal">Sold units vs Target units</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-[#005d52]" /> Sold
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-[#b0d9d9]" /> Target
                </div>
              </div>
            </div>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCategory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={8}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="units_sold" fill="#005d52" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="target" fill="#b0d9d9" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;