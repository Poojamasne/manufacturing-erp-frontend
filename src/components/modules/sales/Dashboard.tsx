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

interface StatCardProps {
  title: string;
  value: string | number;
  svg: string;
}

interface PipelineItem {
  name: string;
  value: number;
}

interface ProductItem {
  name: string;
  sold: number;
  target: number;
}

interface DataPoint {
  range: string;
  stats: { leads: string | number; won: number; revenue: string; rate: string };
  pipeline: PipelineItem[];
  products: ProductItem[];
}

type FilterType = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";

// ---------------- THEME ----------------
const COLORS = ["#005d52", "#1a7a6f", "#4fb29b", "#7bc7b5", "#f08552", "#b0d9d9", "#cbd5e1"];

// ---------------- MOCK DATA ----------------
const DATA: Record<Exclude<FilterType, "Custom">, DataPoint> = {
  Weekly: {
    range: "17 - 23 March 2026",
    stats: { leads: 156, won: 42, revenue: "2.4M", rate: "18%" },
    pipeline: [
      { name: "New", value: 45 }, { name: "Not Contacted", value: 38 },
      { name: "Contacted", value: 30 }, { name: "Negotiation", value: 22 },
      { name: "Quotation", value: 15 }, { name: "Won", value: 10 }, { name: "Lost", value: 5 },
    ],
    products: [{ name: "Fridge", sold: 90, target: 75 }, { name: "AC", sold: 90, target: 65 }, { name: "Wash", sold: 90, target: 40 }, { name: "Micro", sold: 90, target: 45 }, { name: "Heat", sold: 70, target: 90 }],
  },
  Monthly: {
    range: "March 2026",
    stats: { leads: 640, won: 185, revenue: "10.2M", rate: "24%" },
    pipeline: [
      { name: "New", value: 180 }, { name: "Not Contacted", value: 150 },
      { name: "Contacted", value: 120 }, { name: "Negotiation", value: 95 },
      { name: "Quotation", value: 70 }, { name: "Won", value: 50 }, { name: "Lost", value: 20 },
    ],
    products: [{ name: "Fridge", sold: 320, target: 300 }, { name: "AC", sold: 450, target: 400 }, { name: "Wash", sold: 210, target: 250 }, { name: "Micro", sold: 180, target: 150 }, { name: "Heat", sold: 150, target: 200 }],
  },
  Quarterly: {
    range: "Q1 2026",
    stats: { leads: "1.8K", won: 520, revenue: "34.5M", rate: "28%" },
    pipeline: [
      { name: "New", value: 500 }, { name: "Not Contacted", value: 420 },
      { name: "Contacted", value: 350 }, { name: "Negotiation", value: 280 },
      { name: "Quotation", value: 200 }, { name: "Won", value: 160 }, { name: "Lost", value: 55 },
    ],
    products: [{ name: "Fridge", sold: 980, target: 900 }, { name: "AC", sold: 1200, target: 1100 }, { name: "Wash", sold: 750, target: 800 }, { name: "Micro", sold: 600, target: 550 }, { name: "Heat", sold: 500, target: 600 }],
  },
  Yearly: {
    range: "FY 2023-24",
    stats: { leads: "7.2K", won: 2100, revenue: "142M", rate: "31%" },
    pipeline: [
      { name: "New", value: 2000 }, { name: "Not Contacted", value: 1700 },
      { name: "Contacted", value: 1400 }, { name: "Negotiation", value: 1100 },
      { name: "Quotation", value: 800 }, { name: "Won", value: 650 }, { name: "Lost", value: 280 },
    ],
    products: [{ name: "Fridge", sold: 4200, target: 4000 }, { name: "AC", sold: 5500, target: 5000 }, { name: "Wash", sold: 3100, target: 3500 }, { name: "Micro", sold: 2400, target: 2200 }, { name: "Heat", sold: 1900, target: 2500 }],
  },
};


// ---------------- SUB-COMPONENTS ----------------
const StatCard = ({ title, value, svg }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          {title}
        </p>

        {/* Light green background */}
        <div className="p-2 rounded-lg bg-[#e6f4f2] flex items-center justify-center">
          <img
            src={svg}
            alt=""
            className="w-6 h-6 opacity-80"
            style={{
              filter:
                "invert(23%) sepia(21%) saturate(1100%) hue-rotate(120deg) brightness(90%)",
            }}
          />
        </div>
      </div>

      <h3 className="text-2xl font-extrabold text-gray-800">{value}</h3>
    </div>
  </div>
);

export const Dashboard = () => {
  const [filter, setFilter] = useState<FilterType>("Weekly");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

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

  const currentData = filter === "Custom" ? DATA.Quarterly : DATA[filter];

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">

        {/* HEADER & TIME FILTERS */}
        <div className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1 font-normal">Full customer pipeline overview</p>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-2 bg-[#005d52] text-white px-4 py-1.5 rounded-full text-[11px] font-bold shadow-lg shadow-teal-900/10">
                <CalendarIcon size={13} />
                {filter === "Custom" ?
                  (customRange.start ? `${customRange.start} to ${customRange.end || '...'}` : "Custom Selection")
                  : currentData.range}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white w-fit shadow-sm">
              {(["Weekly", "Monthly", "Quarterly", "Yearly"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setIsCalendarOpen(false); }}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${filter === f
                    ? "bg-[#d1e9e7] text-[#005d52] shadow-sm"
                    : "text-gray-400 hover:text-gray-700"
                    }`}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${filter === "Custom" ? "bg-[#d1e9e7] text-[#005d52] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
              >
                <CalendarIcon size={14} /> Custom
              </button>
            </div>

            {/* FLOATING CALENDAR POPUP - RESPONSIVE POSITIONING */}
            {isCalendarOpen && (
              <div
                ref={calendarRef}
                className="absolute top-full mt-3 right-0 z-50 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-50 
                           w-70 sm:w-85 max-w-[90vw] animate-in zoom-in-95 fade-in duration-200 origin-top-right"
              >
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-gray-800">Select Date Range</h4>
                  <button onClick={() => setIsCalendarOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm text-[#005d52] outline-none focus:ring-2 focus:ring-teal-500/20"
                      value={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm text-[#005d52] outline-none focus:ring-2 focus:ring-teal-500/20"
                      value={customRange.end}
                      onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={() => { if (customRange.start) setFilter("Custom"); setIsCalendarOpen(false); }}
                    className="w-full py-3 bg-[#005d52] text-white rounded-xl font-bold text-xs shadow-lg shadow-teal-900/20 hover:bg-[#004a42] transition-all"
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
          <StatCard title="Total Leads" value={currentData.stats.leads} svg="/icons/users.svg" />
          <StatCard title="Deals Won" value={currentData.stats.won} svg="/icons/win.svg" />
          <StatCard title="Revenue" value={`₹${currentData.stats.revenue}`} svg="/icons/rupee.svg" />
          <StatCard title="Win Rate" value={currentData.stats.rate} svg="/icons/trending.svg" />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm w-full">
            <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-1">Sales Pipeline</h3>
            <p className="text-sm text-gray-400 font-normal mb-8">Conversion stages distribution</p>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.pipeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={isMobile ? false : { fill: '#7e899c', fontSize: 10, fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    barSize={isMobile ? 28 : 35}
                    label={
                      isMobile
                        ? (props: any) => {
                          const { x, y, width, height, index } = props;
                          const label = currentData.pipeline[index]?.name;

                          return (
                            <text
                              x={x + width / 2}
                              y={y + height / 2}
                              fill="#ffffff"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize={10}
                              transform={`rotate(-90, ${x + width / 2}, ${y + height / 2})`}
                            >
                              {label}
                            </text>
                          );
                        }
                        : false
                    }
                  >
                    {currentData.pipeline.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                <BarChart data={currentData.products} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={8}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10, fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="sold" fill="#005d52" radius={[6, 6, 0, 0]} barSize={28} />
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