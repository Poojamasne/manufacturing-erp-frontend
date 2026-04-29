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
import { Filter, ChevronDown } from "lucide-react";
import { getDashboardData } from "../sales/ModuleStateFiles/DashboardSlice";
import { useAppDispatch, useAppSelector } from "../../common/ReduxMainHooks";
import type { RootState } from "../../../ApplicationState/Store";

interface StatCardProps {
  title: string;
  value: string | number;
  svg: string;
}

type FilterType = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";

const COLORS = [
  "#F59E0B", // primary amber
  "#10B981", // teal/green contrast
  "#FCD34D", // soft amber
  "#FBBF24", // lighter amber
  "#F97316", // orange (strong contrast)
  "#6B7280", // neutral gray
  "#FB923C", // soft orange
];

const StatCard = ({ title, value, svg }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">{title}</p>
        <div className="p-2 rounded-lg bg-[#f3f4e6] flex items-center justify-center">
          <img
            src={svg}
            alt=""
            className="w-6 h-6 opacity-80"
            style={{
              filter:
                "invert(62%) sepia(90%) saturate(1200%) hue-rotate(2deg) brightness(100%) contrast(105%)",
            }}
          />
        </div>
      </div>
      <h3 className="text-2xl font-bold tracking-tight text-gray-700">{value}</h3>
    </div>
  </div>
);
type TimeTab =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";
export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { salesByCategory, stats, pipeline } = useAppSelector(
    (state: RootState) => state.SalesDashboard
  );


  //eslint-disable-next-line
  const formattedData = salesByCategory?.map((item: any) => ({
    ...item,
    units_sold: Number(item.units_sold),
    target: Number(item.target) || Math.round(Number(item.units_sold) * 1.2),
  }));

  const [filter, setFilter] = useState<FilterType>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const [isMobileForCategory, setIsMobileForCategory] = useState(window.innerWidth < 780);

  // Fetch data when filter or custom range changes
  useEffect(() => {
    if (filter === "Custom") {
      if (customRange.start && customRange.end) {
        console.log("Fetching custom range:", customRange);
        dispatch(getDashboardData(filter, customRange));
      }
    } else {
      console.log("Fetching filter:", filter);
      dispatch(getDashboardData(filter));
    }
  }, [dispatch, filter, customRange.start, customRange.end]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 700);
    const handleResizeForCategory = () => setIsMobileForCategory(window.innerWidth < 780);
    window.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResizeForCategory);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResizeForCategory);
    };
  }, []);

  // Close dropdown and calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (value: FilterType) => {
    console.log("Changing filter to:", value);
    if (value === "Custom") {
      setFilter("Custom");
      setIsCalendarOpen(true);
      setIsDropdownOpen(false);
    } else {
      setFilter(value);
      setIsDropdownOpen(false);
      setIsCalendarOpen(false);
      setCustomRange({ start: "", end: "" });
    }
  };

  const handleApplyCustomRange = () => {
    if (!customRange.start || !customRange.end) {
      alert("Please select date range");
      return;
    }
    console.log("Applying custom range:", customRange);
    setFilter("Custom");
    setIsCalendarOpen(false);
    setIsDropdownOpen(false);
    // The useEffect will trigger the data fetch
  };

  const getFilterDisplayText = () => {
    const formatDate = (dateStr: any) => {
      const date = new Date(dateStr);

      const day = date.getDate();
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });

      return `${day} ${month} ${year}`;
    };

    if (filter === "Custom" && customRange.start && customRange.end) {
      return `${formatDate(customRange.start)} to ${formatDate(customRange.end)}`;
    }

    return filter;
  };

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

          {/* Filter Dropdown with Icon */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 flex items-center gap-2 text-gray-700 transition-all active:scale-95"
            >
              <Filter size={18} className="text-[#F59E0B]" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleFilterChange(tab as TimeTab)}
                    className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${filter === tab
                      ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50"
                      : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
                <button
                  onClick={() => handleFilterChange("Custom")}
                  className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${filter === "Custom"
                    ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  Custom
                </button>
              </div>
            )}

            {/* Custom Date Range Popup */}
            {isCalendarOpen && (
              <div
                ref={calendarRef}
                className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72"
              >
                <div className="space-y-3">
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                  />
                  <input
                    type="date"
                    value={customRange.end}
                    min={customRange.start}
                    onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                  />
                  <button
                    onClick={handleApplyCustomRange}
                    className="w-full bg-[#F59E0B] text-white py-2 rounded-lg text-sm hover:bg-[#f67317] transition-colors"
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
          {/* Sales Pipeline Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm w-full">
            <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-1">Sales Pipeline</h3>
            <p className="text-sm text-gray-400 font-normal mb-8">Conversion stages distribution</p>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%" >
                <BarChart
                  data={pipeline || []}
                  margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                >
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="stage"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#7e899c', fontSize: 10, fontWeight: 650 }}
                    interval={0}
                    angle={isMobile ? -90 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    dy={isMobile ? 10 : 5}
                    dx={isMobile ? -5 : 0}
                    height={isMobile ? 90 : 35}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10, fontWeight: 650 }} />
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

          {/* Product Performance Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-1">Product Performance</h3>
                <p className="text-sm text-gray-400 font-normal">Sold units vs Target units</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Sold
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-[#F97316]" /> Target
                </div>
              </div>
            </div>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedData || []}
                  margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                  barGap={8}
                >
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#7e899c', fontSize: 10, fontWeight: 650 }}
                    interval={0}
                    angle={isMobileForCategory ? -90 : 0}
                    textAnchor={isMobileForCategory ? "end" : "middle"}
                    dy={isMobileForCategory ? 10 : 5}
                    dx={isMobileForCategory ? -5 : 0}
                    height={isMobileForCategory ? 90 : 35}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10, fontWeight: 650 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="units_sold" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="target" fill="#F97316" radius={[6, 6, 0, 0]} barSize={28} />
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