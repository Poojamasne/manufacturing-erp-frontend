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
import { getDashboardData } from "../sales/ModuleStateFiles/DashboardSlice";
import { useAppDispatch, useAppSelector } from "../../common/ReduxMainHooks";
import type { RootState } from "../../../ApplicationState/Store";

interface StatCardProps {
  title: string;
  value: string | number;
  svg: string;
}

type FilterType = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";

const COLORS = ["#005d52", "#1a7a6f", "#4fb29b", "#7bc7b5", "#f08552", "#b0d9d9", "#cbd5e1"];

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
  const { salesByCategory, stats, pipeline, loading } = useAppSelector(
    (state: RootState) => state.SalesDashboard
  );

  const formattedData = salesByCategory?.map((item: any) => ({
    ...item,
    units_sold: Number(item.units_sold),
    target: Number(item.target) || Math.round(Number(item.units_sold) * 1.2),
  }));

  const [filter, setFilter] = useState<FilterType>("Weekly");
  const [customRange, setCustomRange] = useState({ start: "", end: new Date().toISOString().split("T")[0] });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Fetch data when filter or custom range changes
  useEffect(() => {
    if (filter === "Custom") {
      if (customRange.start && customRange.end) {
        dispatch(getDashboardData(filter, customRange));
      }
    } else {
      dispatch(getDashboardData(filter));
    }
  }, [dispatch, filter, customRange.start, customRange.end]);

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

  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    if (value === "Custom") {
      setIsCalendarOpen(true);
    } else {
      setIsCalendarOpen(false);
      setCustomRange({ start: "", end: new Date().toISOString().split("T")[0] });
    }
  };

  const handleApplyCustomRange = () => {
    if (!customRange.start || !customRange.end) {
      alert("Please select date range");
      return;
    }
    setIsCalendarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005d52] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* HEADER & TIME FILTERS */}
        <div className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Full customer pipeline overview
            </p>
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value as FilterType)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005d52]/20"
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
              <option value="Custom">Custom</option>
            </select>

            {isCalendarOpen && filter === "Custom" && (
              <div 
                ref={calendarRef}
                className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72"
              >
                <div className="space-y-3">
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) =>
                      setCustomRange({ ...customRange, start: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005d52]/20"
                    placeholder="Start Date"
                  />

                  <input
                    type="date"
                    value={customRange.end}
                    min={customRange.start}
                    onChange={(e) =>
                      setCustomRange({ ...customRange, end: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005d52]/20"
                    placeholder="End Date"
                  />

                  <button
                    onClick={handleApplyCustomRange}
                    className="w-full bg-[#005d52] text-white py-2 rounded-lg text-sm hover:bg-[#004a40] transition-colors"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Leads" value={stats?.totalLeads || 0} svg="/icons/users.svg" />
          <StatCard title="Deals Won" value={stats?.dealsWon || 0} svg="/icons/win.svg" />
          <StatCard title="Revenue" value={`₹ ${Number(stats?.totalRevenue || 0).toLocaleString("en-IN")}`} svg="/icons/rupee.svg" />
          <StatCard title="Win Rate" value={`${stats?.winRate || 0}%`} svg="/icons/trending.svg" />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 gap-8">
          {/* Sales Pipeline Chart - FIXED STRAIGHT LABELS */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm w-full">
            <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-1">Sales Pipeline</h3>
            <p className="text-sm text-gray-400 font-normal mb-8">Conversion stages distribution</p>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={pipeline || []} 
                  margin={{ top: 10, right: 10, left: -25, bottom: 60 }}
                >
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="stage" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#7e899c', fontSize: 11, fontWeight: 500 }}
                    interval={0}
                    angle={0}
                    textAnchor="middle"
                    dy={10}
                    height={60}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={isMobile ? 28 : 35}>
                    {(pipeline || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Performance Chart - FIXED STRAIGHT LABELS */}
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
                <BarChart 
                  data={formattedData || []} 
                  margin={{ top: 10, right: 10, left: -25, bottom: 60 }} 
                  barGap={8}
                >
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#7e899c', fontSize: 11, fontWeight: 500 }}
                    interval={0}
                    angle={0}
                    textAnchor="middle"
                    dy={10}
                    height={60}
                  />
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