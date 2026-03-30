import { useState } from "react";
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
import { Calendar } from "lucide-react";

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

// ---------------- THEME ----------------
const COLORS = ["#005d52", "#4fb29b", "#f08552", "#b0d9d9", "#d1e9e7", "#cbd5e1"];

// ---------------- DATA ----------------
const DATA: Record<string, DataPoint> = {
  Weekly: {
    range: "17 - 23 March 2024",
    stats: { leads: 156, won: 42, revenue: "2.4M", rate: "18%" },
    pipeline: [{ name: "New Lead", value: 32 }, { name: "Contacted", value: 24 }, { name: "Converted", value: 18 }, { name: "Quotation", value: 12 }, { name: "Won", value: 8 }, { name: "Lost", value: 3 }],
    products: [{ name: "Fridge", sold: 90, target: 75 }, { name: "AC", sold: 90, target: 65 }, { name: "Wash", sold: 90, target: 40 }, { name: "Micro", sold: 90, target: 45 }, { name: "Heat", sold: 70, target: 90 }],
  },
  Monthly: {
    range: "March 2024",
    stats: { leads: 640, won: 185, revenue: "10.2M", rate: "24%" },
    pipeline: [{ name: "New Lead", value: 140 }, { name: "Contacted", value: 110 }, { name: "Converted", value: 90 }, { name: "Quotation", value: 65 }, { name: "Won", value: 45 }, { name: "Lost", value: 18 }],
    products: [{ name: "Fridge", sold: 320, target: 300 }, { name: "AC", sold: 450, target: 400 }, { name: "Wash", sold: 210, target: 250 }, { name: "Micro", sold: 180, target: 150 }, { name: "Heat", sold: 150, target: 200 }],
  },
  Quarterly: {
    range: "Q1 2024",
    stats: { leads: "1.8K", won: 520, revenue: "34.5M", rate: "28%" },
    pipeline: [{ name: "New Lead", value: 450 }, { name: "Contacted", value: 380 }, { name: "Converted", value: 290 }, { name: "Quotation", value: 210 }, { name: "Won", value: 155 }, { name: "Lost", value: 60 }],
    products: [{ name: "Fridge", sold: 980, target: 900 }, { name: "AC", sold: 1200, target: 1100 }, { name: "Wash", sold: 750, target: 800 }, { name: "Micro", sold: 600, target: 550 }, { name: "Heat", sold: 500, target: 600 }],
  },
  Yearly: {
    range: "FY 2023-24",
    stats: { leads: "7.2K", won: 2100, revenue: "142M", rate: "31%" },
    pipeline: [{ name: "New Lead", value: 1800 }, { name: "Contacted", value: 1500 }, { name: "Converted", value: 1100 }, { name: "Quotation", value: 850 }, { name: "Won", value: 620 }, { name: "Lost", value: 240 }],
    products: [{ name: "Fridge", sold: 4200, target: 4000 }, { name: "AC", sold: 5500, target: 5000 }, { name: "Wash", sold: 3100, target: 3500 }, { name: "Micro", sold: 2400, target: 2200 }, { name: "Heat", sold: 1900, target: 2500 }],
  },
};

// ---------------- SUB-COMPONENTS ----------------
const StatCard = ({ title, value, svg }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <div className="p-2 rounded-lg bg-[#f4f7f6]">
          <img src={svg} alt="" className="w-6 h-6 opacity-40" />
        </div>
      </div>
      <h3 className="text-2xl font-extrabold text-gray-800">{value}</h3>
    </div>
  </div>
);

// ---------------- MAIN COMPONENT ----------------
export const Dashboard = () => {
  type FilterType = "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  const filters: FilterType[] = ["Weekly", "Monthly", "Quarterly", "Yearly"];
  const [filter, setFilter] = useState<FilterType>("Weekly");
  const currentData = DATA[filter];

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Overview of your Sales management system</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-2 bg-[#005d52] text-white px-4 py-1.5 rounded-full text-[11px] font-bold shadow-lg shadow-teal-900/10">
                <Calendar size={13} /> {currentData.range}
              </div>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-white/60 rounded-2xl border border-white w-fit shadow-sm">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${filter === f
                    ? "bg-[#d1e9e7] text-[#005d52] shadow-sm"
                    : "text-gray-400 hover:text-gray-700"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Leads" value={currentData.stats.leads} svg="/icons/users.svg" />
          <StatCard title="Deals Won" value={currentData.stats.won} svg="/icons/win.svg" />
          <StatCard title="Revenue" value={`₹${currentData.stats.revenue}`} svg="/icons/rupee.svg" />
          <StatCard title="Win Rate" value={currentData.stats.rate} svg="/icons/trending.svg" />
        </div>

        {/* ONE-BY-ONE CHARTS (Vertical Stack) */}
        <div className="flex flex-col gap-8">

          {/* 1st Chart: Pipeline Performance (Full Width) */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm w-full">
            <h3 className="text-md font-bold text-gray-800 mb-8 px-2">Forecast this quarter by owner</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.pipeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={45}>
                    {currentData.pipeline.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2nd Chart: Product Comparison (Full Width) */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-2 gap-4">
              <h3 className="text-md font-bold text-gray-800">Sales by product category</h3>
              <div className="flex gap-5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#005d52]" /> Units Sold
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#b0d9d9]" /> Target Units
                </div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.products} margin={{ top: 10, right: 20, left: -20, bottom: 0 }} barGap={8}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="sold" fill="#005d52" radius={[6, 6, 0, 0]} barSize={35} />
                  <Bar dataKey="target" fill="#b0d9d9" radius={[6, 6, 0, 0]} barSize={35} />
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