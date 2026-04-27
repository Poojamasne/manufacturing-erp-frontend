import { useState, useRef, useEffect } from "react";
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
import { Filter, ChevronDown, Download } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { fetchReportData, exportReportCSV, clearReportErrors } from "../ModuleStateFiles/ReportSlice";
import type { RootState } from "../../../../ApplicationState/Store";

type TimeRange = "All Time" | "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";

interface LeaderboardItem {
  name: string;
  leads: number;
  conversion: string;
  revenue: string;
}

interface StatCardProps {
  title: string;
  value: string;
  svg: string;
}

const THEME = {
  primary: "#F59E0B",
  secondary: "#4fb29b",
  lightTeal: "#f3f4e6",
  target: "#b0d9d9",
  production: "#f08552",
  chart: ["#F59E0B", "#4fb29b", "#b0d9d9", "#f08552"],
};

const ReportsAndAnalytics: FC = () => {
  const dispatch = useAppDispatch();
  const { data } = useAppSelector((state: RootState) => state.SalesReport);

  const [range, setRange] = useState<TimeRange>("All Time");
  const [customRange, setCustomRange] = useState({
    start: "",
    end: ""
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (range === "Custom") {
      if (customRange.start && customRange.end) {
        dispatch(fetchReportData({
          range,
          startDate: customRange.start,
          endDate: customRange.end
        }));
      }
    } else {
      dispatch(fetchReportData({ range }));
    }
  }, [dispatch, range, customRange.start, customRange.end]);

  useEffect(() => {
    return () => {
      dispatch(clearReportErrors());
    };
  }, [dispatch]);

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

  const handleExport = () => {
    if (range === "Custom" && customRange.start && customRange.end) {
      dispatch(exportReportCSV({
        range,
        startDate: customRange.start,
        endDate: customRange.end
      }));
    } else {
      dispatch(exportReportCSV({ range }));
    }
  };

  const handleFilterChange = (newRange: TimeRange) => {
    if (newRange === "Custom") {
      setIsCalendarOpen(true);
      setIsDropdownOpen(false);
    } else {
      setRange(newRange);
      setIsDropdownOpen(false);
      setIsCalendarOpen(false);
      setCustomRange({ start: "", end: "" });
    }
  };

  const handleCustomApply = () => {
    if (!customRange.start || !customRange.end) {
      alert("Please select date range");
      return;
    }
    setRange("Custom");
    setIsCalendarOpen(false);
    setIsDropdownOpen(false);
  };

  const rangeOptions: TimeRange[] = [
    "All Time",
    "Weekly",
    "Monthly",
    "Quarterly",
    "Yearly",
    "Custom",
  ];

  // Get display text for filter button
  const getFilterDisplayText = () => {
    const formatDate = (dateStr: string | number | Date) => {
      const date = new Date(dateStr);

      const day = date.getDate();
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });

      return `${day} ${month} ${year}`;
    };

    if (range === "Custom" && customRange.start && customRange.end) {
      return `${formatDate(customRange.start)} to ${formatDate(customRange.end)}`;
    }

    return range;
  };

  const currentData = {
    revenue: data?.revenue?.length > 0 ? data.revenue : [{ name: "No Data", val: 0 }],
    sources: data?.sources?.length > 0 ? data.sources : [{ name: "No Data", value: 100 }],
    kpis: data?.kpis || { rev: "₹0", leads: "0", conv: "0%", avg: "₹0" },
    products: data?.products?.length > 0 ? data.products : [{ name: "No Data", sold: 0, target: 0, prod: 0 }],
    leaderboard: data?.leaderboard?.length > 0 ? data.leaderboard : [{ name: "No Data", leads: 0, conversion: "0%", revenue: "₹0" }]
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">

        {/* REFACTORED HEADER: Title, Export, and Filter in one row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Advanced business intelligence insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} className="text-[#F59E0B]" />
                <span className="min-w-17.5 text-left">{getFilterDisplayText()}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && !isCalendarOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 w-fit min-w-35">                  {rangeOptions.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleFilterChange(tab)}
                    className={`outline-none w-full text-left px-4 py-2 text-[13px] transition-colors ${range === tab
                      ? "text-[#F59E0B] font-bold bg-teal-50/50"
                      : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
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
                      onClick={handleCustomApply}
                      className="w-full bg-[#F59E0B] text-white py-2 rounded-lg text-sm hover:bg-[#f67317] transition-colors font-bold"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Export CSV Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-2 bg-[#F59E0B] text-white rounded-xl text-sm font-bold hover:bg-[#d98c0a] transition-all shadow-sm active:scale-95"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Revenue" value={currentData.kpis.rev} svg="/icons/inr.svg" />
          <StatCard title="Active Leads" value={currentData.kpis.leads} svg="/icons/users-bold.svg" />
          <StatCard title="Conv. Rate" value={currentData.kpis.conv} svg="/icons/percent.svg" />
          <StatCard title="Avg Deal Value" value={currentData.kpis.avg} svg="/icons/graph-up.svg" />
        </div>

        {/* Triple Bar Chart */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-50 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Manufacturing vs Sales</h3>
              <p className="text-sm text-gray-400 font-normal">Target vs Sold Units vs Actual Production</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {['target', 'primary', 'production'].map((key) => (
                <div key={key} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: THEME[key as keyof typeof THEME] as string }} />
                  {key === 'primary' ? 'Sold' : key}
                </div>
              ))}
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.products} margin={{ left: -20 }} barGap={8}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#7e899c", fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#7e899c", fontSize: 10 }} />
                <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "16px", border: "none" }} />
                <Bar dataKey="target" fill={THEME.target} radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="sold" fill={THEME.primary} radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="prod" fill={THEME.production} radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue and Lead Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 pb-20 sm:p-8 sm:pb-22 border border-gray-50 shadow-sm h-100">
            <h3 className="font-bold text-lg text-gray-800 mb-8">Revenue Growth Trend</h3>
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData.revenue} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="pGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#7e899c", fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#7e899c", fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                  <Area type="monotone" dataKey="val" stroke={THEME.primary} strokeWidth={4} fill="url(#pGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm flex flex-col">
            <h3 className="font-bold text-lg text-gray-800 mb-6 uppercase tracking-tight">Lead Sources</h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={currentData.sources} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" cornerRadius={6} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {currentData.sources.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} style={{ outline: "none" }} fill={THEME.chart[index % THEME.chart.length]} />
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
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: THEME.chart[i % THEME.chart.length] }} />
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
            <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">Sales Rep Ranking</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30 border-b border-gray-100">
                  <th className="px-8 py-5 text-[13px] font-bold text-gray-800 uppercase tracking-widest border-r border-gray-100">Representative</th>
                  <th className="px-8 py-5 text-[13px] font-bold text-gray-800 uppercase tracking-widest text-center border-r border-gray-100">Leads</th>
                  <th className="px-8 py-5 text-[13px] font-bold text-gray-800 uppercase tracking-widest text-center border-r border-gray-100">Conversion</th>
                  <th className="px-8 py-5 text-[13px] font-bold text-gray-800 uppercase tracking-widest text-center">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentData.leaderboard.map((person: LeaderboardItem, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-3 border-r border-gray-100 font-normal">
                      <div className="w-8 h-8 rounded-full bg-[#f3f4e6] flex items-center justify-center text-[#F59E0B] font-bold text-[13px]">{person.name.charAt(0)}</div>
                      <span className="text-[13px] text-gray-800">{person.name}</span>
                    </td>
                    <td className="px-8 py-5 text-center text-sm text-gray-800 font-normal border-r border-gray-100">{person.leads}</td>
                    <td className="px-8 py-5 text-center border-r border-gray-100">
                      <span className="px-3 py-1 bg-[#f3f4e6] text-[#F59E0B] rounded-full text-[13px]">{person.conversion}</span>
                    </td>
                    <td className="px-8 py-5 text-center text-[13px] text-gray-800">{person.revenue}</td>
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

const StatCard: FC<StatCardProps> = ({ title, value, svg }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">{title}</p>
        <div className="p-2.5 rounded-xl bg-[#f3f4e6] flex items-center justify-center border border-teal-50/50">
          <img
            src={svg}
            alt=""
            className="w-6 h-6 opacity-80"
            style={{
              filter:
                "invert(62%) sepia(90%) saturate(1200%) hue-rotate(2deg) brightness(100%) contrast(105%)",
            }}
          />        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-700 tracking-tight">{value}</h3>
    </div>
  </div>
);

export default ReportsAndAnalytics;