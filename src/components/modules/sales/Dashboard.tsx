import  { useState } from "react";
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
import { Calendar, X } from "lucide-react";

// ---------------- TYPES ----------------
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
// Extended colors for the 7 stages of the pipeline
const COLORS = ["#005d52", "#1a7a6f", "#4fb29b", "#7bc7b5", "#f08552", "#b0d9d9", "#cbd5e1"];

// ---------------- DATA (Updated with 2 new stages) ----------------
const DATA: Record<Exclude<FilterType, "Custom">, DataPoint> = {
  Weekly: {
    range: "17 - 23 March 2026",
    stats: { leads: 156, won: 42, revenue: "2.4M", rate: "18%" },
    pipeline: [
      { name: "New Lead", value: 45 },
      { name: "Not Contacted", value: 38 },
      { name: "Contacted", value: 30 },
      { name: "Negotiation", value: 22 },
      { name: "Quotation", value: 15 },
      { name: "Won", value: 10 },
      { name: "Lost", value: 5 },
    ],
    products: [{ name: "Fridge", sold: 90, target: 75 }, { name: "AC", sold: 90, target: 65 }, { name: "Wash", sold: 90, target: 40 }, { name: "Micro", sold: 90, target: 45 }, { name: "Heat", sold: 70, target: 90 }],
  },
  Monthly: {
    range: "March 2026",
    stats: { leads: 640, won: 185, revenue: "10.2M", rate: "24%" },
    pipeline: [
      { name: "New Lead", value: 180 },
      { name: "Not Contacted", value: 150 },
      { name: "Contacted", value: 120 },
      { name: "Negotiation", value: 95 },
      { name: "Quotation", value: 70 },
      { name: "Won", value: 50 },
      { name: "Lost", value: 20 },
    ],
    products: [{ name: "Fridge", sold: 320, target: 300 }, { name: "AC", sold: 450, target: 400 }, { name: "Wash", sold: 210, target: 250 }, { name: "Micro", sold: 180, target: 150 }, { name: "Heat", sold: 150, target: 200 }],
  },
  Quarterly: {
    range: "Q1 2026",
    stats: { leads: "1.8K", won: 520, revenue: "34.5M", rate: "28%" },
    pipeline: [
      { name: "New Lead", value: 500 },
      { name: "Not Contacted", value: 420 },
      { name: "Contacted", value: 350 },
      { name: "Negotiation", value: 280 },
      { name: "Quotation", value: 200 },
      { name: "Won", value: 160 },
      { name: "Lost", value: 55 },
    ],
    products: [{ name: "Fridge", sold: 980, target: 900 }, { name: "AC", sold: 1200, target: 1100 }, { name: "Wash", sold: 750, target: 800 }, { name: "Micro", sold: 600, target: 550 }, { name: "Heat", sold: 500, target: 600 }],
  },
  Yearly: {
    range: "FY 2023-24",
    stats: { leads: "7.2K", won: 2100, revenue: "142M", rate: "31%" },
    pipeline: [
      { name: "New Lead", value: 2000 },
      { name: "Not Contacted", value: 1700 },
      { name: "Contacted", value: 1400 },
      { name: "Negotiation", value: 1100 },
      { name: "Quotation", value: 800 },
      { name: "Won", value: 650 },
      { name: "Lost", value: 280 },
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

// ---------------- MAIN COMPONENT ----------------
export const Dashboard = () => {
  const [filter, setFilter] = useState<FilterType>("Weekly");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Use Quarterly data as a fallback when "Custom" is selected but no dates are picked
  const currentData = filter === "Custom" ? DATA.Quarterly : DATA[filter];

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">

        {/* HEADER & TIME FILTERS */}
        <div className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1 font-normal">Real-time performance of your sales pipeline</p>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-2 bg-[#005d52] text-white px-4 py-1.5 rounded-full text-[11px] font-bold shadow-lg shadow-teal-900/10">
                <Calendar size={13} /> 
                {filter === "Custom" ? 
                  (customRange.start ? `${customRange.start} to ${customRange.end || '...'}` : "Select Range") 
                  : currentData.range}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white w-fit shadow-sm">
              {(["Weekly", "Monthly", "Quarterly", "Yearly", "Custom"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${filter === f
                      ? "bg-[#d1e9e7] text-[#005d52] shadow-sm"
                      : "text-gray-400 hover:text-gray-700"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* CUSTOM DATE PICKERS */}
            {filter === "Custom" && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-teal-50 shadow-sm animate-in slide-in-from-top-2">
                <input 
                  type="date" 
                  className="bg-gray-50 border-none rounded-lg p-1.5 text-xs text-[#005d52] outline-none"
                  onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                />
                <span className="text-gray-300 text-xs font-bold">TO</span>
                <input 
                  type="date" 
                  className="bg-gray-50 border-none rounded-lg p-1.5 text-xs text-[#005d52] outline-none"
                  onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                />
                <button onClick={() => {setCustomRange({start:"", end:""}); setFilter("Weekly")}} className="text-gray-400 hover:text-red-500">
                  <X size={16} />
                </button>
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

        {/* CHARTS STACK */}
        <div className="flex flex-col gap-8">

          {/* 1st Chart: Sales Pipeline (Updated Stages) */}
          <div className="bg-white p-6 sm:p-8 rounded-4xl border border-gray-100 shadow-sm w-full">
            <div className="mb-8 px-2">
              <h3 className="text-md font-bold text-gray-800 uppercase tracking-wider text-[11px]">Sales Pipeline</h3>
              <p className="text-sm text-gray-400 font-normal">Conversion stages from lead to won</p>
            </div>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.pipeline} margin={{ top: 10, right: 20, left: -25, bottom: 20 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#7e899c', fontSize: 10, fontWeight: 500 }} 
                    dy={15}
                    interval={0}
                    angle={0}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10,fontWeight:500 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                    {currentData.pipeline.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2nd Chart: Product Comparison */}
          <div className="bg-white p-6 sm:p-8 rounded-4xl border border-gray-100 shadow-sm w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-2 gap-4">
              <div>
                <h3 className="text-md font-bold text-gray-800 uppercase tracking-wider text-[11px]">Product Performance</h3>
                <p className="text-sm text-gray-400 font-normal">Sold units vs Target units</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#005d52]" /> Sold
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#b0d9d9]" /> Target
                </div>
              </div>
            </div>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.products} margin={{ top: 10, right: 20, left: -25, bottom: 0 }} barGap={8}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10,fontWeight:500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7e899c', fontSize: 10, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="sold" fill="#005d52" radius={[6, 6, 0, 0]} barSize={30} />
                  <Bar dataKey="target" fill="#b0d9d9" radius={[6, 6, 0, 0]} barSize={30} />
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