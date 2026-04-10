import { useState, useRef, useEffect, useCallback } from "react";
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
import { Download, Calendar, X, TrendingUp, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { fetchReportData, exportReportCSV, clearReportErrors } from "../ModuleStateFiles/ReportSlice";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Types ---
type TimeRange = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";

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

// --- Theme Config ---
const THEME = {
  primary: "#005d52",
  secondary: "#4fb29b",
  lightTeal: "#d1e9e7",
  target: "#b0d9d9",
  production: "#f08552",
  chart: ["#005d52", "#4fb29b", "#b0d9d9", "#f08552"],
};

const ReportsAndAnalytics: FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state: RootState) => state.SalesReport);
  
  const [range, setRange] = useState<TimeRange>("Yearly");
  const [customRange, setCustomRange] = useState({
    start: "",
    end: new Date().toISOString().split("T")[0],
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch data when range changes
  const loadReportData = useCallback(() => {
    console.log("Fetching data for range:", range);
    if (range === "Custom" && customRange.start && customRange.end) {
      dispatch(fetchReportData({ 
        range, 
        startDate: customRange.start, 
        endDate: customRange.end 
      }));
    } else if (range !== "Custom") {
      dispatch(fetchReportData({ range }));
    }
  }, [dispatch, range, customRange.start, customRange.end]);

  // ✅ Call API when range changes
  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearReportErrors());
    };
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
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

  const handleRangeChange = (newRange: TimeRange) => {
    console.log("Changing range to:", newRange);
    setRange(newRange);
    setIsCalendarOpen(false);
  };

  const handleCustomApply = () => {
    if (customRange.start && customRange.end) {
      setRange("Custom");
      setIsCalendarOpen(false);
    }
  };

  // ✅ Use API data directly (no mock data fallback)
  const currentData = {
    revenue: data?.revenue?.length > 0 ? data.revenue : [{ name: "No Data", val: 0 }],
    sources: data?.sources?.length > 0 ? data.sources : [{ name: "No Data", value: 100 }],
    kpis: data?.kpis || { rev: "₹0", leads: "0", conv: "0%", avg: "₹0" },
    products: data?.products?.length > 0 ? data.products : [{ name: "No Data", sold: 0, target: 0, prod: 0 }],
    leaderboard: data?.leaderboard?.length > 0 ? data.leaderboard : [{ name: "No Data", leads: 0, conversion: "0%", revenue: "₹0" }]
  };

  if (loading && !data?.revenue?.length) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#005d52] mx-auto mb-4" size={48} />
          <p className="text-sm font-medium text-gray-500">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Advanced business intelligence insights
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#005d52] border border-gray-200 rounded-2xl text-xs font-bold text-white hover:bg-[#005d52]/95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
              Export CSV
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
                  onClick={() => handleRangeChange(r)}
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
              <div
                ref={calendarRef}
                className="absolute top-full mt-3 left-0 xl:left-auto xl:right-0 z-50 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-50 min-w-75 animate-in zoom-in-95 duration-200"
              >
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-gray-800">
                    Select Date Range
                  </h4>
                  <button
                    onClick={() => setIsCalendarOpen(false)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      From
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm text-[#005d52] outline-none"
                      value={customRange.start}
                      onChange={(e) =>
                        setCustomRange({
                          ...customRange,
                          start: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      To
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm text-[#005d52] outline-none"
                      value={customRange.end}
                      onChange={(e) =>
                        setCustomRange({ ...customRange, end: e.target.value })
                      }
                    />
                  </div>
                  <button
                    onClick={handleCustomApply}
                    className="w-full py-3 bg-[#005d52] text-white rounded-xl font-bold text-xs shadow-lg"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#005d52] text-white px-5 py-3 rounded-2xl text-[11px] font-bold shadow-md">
            <TrendingUp size={14} className="inline mr-2" />
            {range === "Custom"
              ? `${customRange.start || "..."} to ${customRange.end || "..."}`
              : `Performance: ${range}`}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Revenue"
            value={currentData.kpis.rev}
            svg="/icons/inr.svg"
          />
          <StatCard
            title="Active Leads"
            value={currentData.kpis.leads}
            svg="/icons/users-bold.svg"
          />
          <StatCard
            title="Conv. Rate"
            value={currentData.kpis.conv}
            svg="/icons/percent.svg"
          />
          <StatCard
            title="Avg Deal Value"
            value={currentData.kpis.avg}
            svg="/icons/graph-up.svg"
          />
        </div>

        {/* Triple Bar Chart - Target vs Sold vs Production */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-50 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                Manufacturing vs Sales
              </h3>
              <p className="text-sm text-gray-400 font-normal">
                Target vs Sold Units vs Actual Production
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: THEME.target }}
                />{" "}
                Target
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: THEME.primary }}
                />{" "}
                Sold
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: THEME.production }}
                />{" "}
                Production
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentData.products}
                margin={{ left: -20 }}
                barGap={8}
              >
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7e899c", fontSize: 10, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7e899c", fontSize: 10, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "16px", border: "none" }}
                />
                <Bar
                  dataKey="target"
                  fill={THEME.target}
                  radius={[4, 4, 0, 0]}
                  barSize={25}
                />
                <Bar
                  dataKey="sold"
                  fill={THEME.primary}
                  radius={[4, 4, 0, 0]}
                  barSize={25}
                />
                <Bar
                  dataKey="prod"
                  fill={THEME.production}
                  radius={[4, 4, 0, 0]}
                  barSize={25}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-50 shadow-sm">
            <h3 className="font-bold text-lg text-gray-800 mb-8">
              Revenue Growth Trend
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData.revenue} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="pGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={THEME.primary}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={THEME.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7e899c", fontSize: 10, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7e899c", fontSize: 10, fontWeight: 500 }}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke={THEME.primary}
                    strokeWidth={4}
                    fill="url(#pGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm flex flex-col">
            <h3 className="font-bold text-lg text-gray-800 mb-6 uppercase tracking-tight text-center sm:text-left">
              Lead Sources
            </h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData.sources}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      cornerRadius={6}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {currentData.sources.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          tabIndex={-1}
                          style={{ outline: "none" }}
                          fill={THEME.chart[index % THEME.chart.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-6">
                {currentData.sources.map((s: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px] font-bold"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: THEME.chart[i % THEME.chart.length],
                        }}
                      ></div>
                      <span className="text-gray-400 uppercase tracking-widest">
                        {s.name}
                      </span>
                    </div>
                    <span className="text-gray-800">
                      {Math.round(
                        (s.value /
                          currentData.sources.reduce(
                            (a: number, b: any) => a + b.value,
                            0,
                          )) *
                        100,
                      )}
                      %
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden mb-10">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">
              Performance Leaderboard
            </h3>
            <span className="text-[10px] font-bold text-[#005d52] uppercase tracking-widest">
              Sales Rep Ranking
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30 border-b border-gray-100">
                  <th className="px-8 py-5 text-[13px] font-bold text-gray-800 uppercase tracking-widest border-r border-gray-100">
                    Representative
                  </th>
                  <th className="px-8 py-5 text-[13px] font-bold text-gray-800 uppercase tracking-widest text-center border-r border-gray-100">
                    Leads
                  </th>
                  <th className="px-8 py-5 text-[13px] font-bold text-gray-800 uppercase tracking-widest text-center border-r border-gray-100">
                    Conversion
                  </th>
                  <th className="px-8 py-5 text-[13px] font-bold text-gray-800 uppercase tracking-widest text-center">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentData.leaderboard.map(
                  (person: LeaderboardItem, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5 flex items-center gap-3 border-r border-gray-100 font-normal">
                        <div className="w-8 h-8 rounded-full bg-[#d1e9e7] flex items-center justify-center text-[#005d52] font-bold text-[13px]">
                          {person.name.charAt(0)}
                        </div>
                        <span className="text-[13px] text-gray-800">
                          {person.name}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center text-sm text-gray-800 font-normal border-r border-gray-100">
                        {person.leads}
                      </td>
                      <td className="px-8 py-5 text-center border-r border-gray-100">
                        <span className="px-3 py-1 bg-[#d1e9e7] text-[#005d52] rounded-full text-[13px]">
                          {person.conversion}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center text-[13px] text-gray-800">
                        {person.revenue}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------- SUB-COMPONENTS ----------------
const StatCard: FC<StatCardProps> = ({ title, value, svg }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          {title}
        </p>
        <div className="p-2.5 rounded-xl bg-[#e6f4f2] flex items-center justify-center border border-teal-50/50">
          <img
            src={svg}
            alt=""
            className="w-5 h-5 opacity-90 transition-transform group-hover:scale-110 duration-300"
            style={{
              filter:
                "invert(23%) sepia(21%) saturate(1100%) hue-rotate(120deg) brightness(90%)",
            }}
          />
        </div>
      </div>
      <h3 className="text-2xl font-black text-gray-900 tracking-tight">
        {value}
      </h3>
    </div>
  </div>
);

export default ReportsAndAnalytics;