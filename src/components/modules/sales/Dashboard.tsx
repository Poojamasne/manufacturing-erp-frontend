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
import {
  // TrendingUp,
  // Users,
  // Target,
  // IndianRupee,
  Calendar,
} from "lucide-react";

// ---------------- DATA (Full Pipeline for ALL filters) ----------------
const DATA = {
  Weekly: {
    range: "17 - 23 March 2024",
    stats: { leads: 156, won: 42, revenue: "2.4M", rate: "18%" },
    pipeline: [
      { name: "New Lead", value: 32, color: "#6366f1" },
      { name: "Contacted", value: 24, color: "#8b5cf6" },
      { name: "Converted", value: 18, color: "#a855f7" },
      { name: "Quotation", value: 12, color: "#ec4899" },
      { name: "Won", value: 8, color: "#10b981" },
      { name: "Lost", value: 3, color: "#94a3b8" },
    ],
    products: [
      { name: "Refrigerator", sold: 90, target: 75 },
      { name: "AC", sold: 90, target: 65 },
      { name: "Washing Machine", sold: 90, target: 40 },
      { name: "Microwave", sold: 90, target: 45 },
      { name: "Water Heater", sold: 70, target: 90 },
    ],
  },
  Monthly: {
    range: "March 2024",
    stats: { leads: 640, won: 185, revenue: "10.2M", rate: "24%" },
    pipeline: [
      { name: "New Lead", value: 140, color: "#6366f1" },
      { name: "Contacted", value: 110, color: "#8b5cf6" },
      { name: "Converted", value: 90, color: "#a855f7" },
      { name: "Quotation", value: 65, color: "#ec4899" },
      { name: "Won", value: 45, color: "#10b981" },
      { name: "Lost", value: 18, color: "#94a3b8" },
    ],
    products: [
      { name: "Refrigerator", sold: 320, target: 300 },
      { name: "AC", sold: 450, target: 400 },
      { name: "Washing Machine", sold: 210, target: 250 },
      { name: "Microwave", sold: 180, target: 150 },
      { name: "Water Heater", sold: 150, target: 200 },
    ],
  },
  Quarterly: {
    range: "Q1 2024 (Jan - Mar)",
    stats: { leads: "1.8K", won: 520, revenue: "34.5M", rate: "28%" },
    pipeline: [
      { name: "New Lead", value: 450, color: "#6366f1" },
      { name: "Contacted", value: 380, color: "#8b5cf6" },
      { name: "Converted", value: 290, color: "#a855f7" },
      { name: "Quotation", value: 210, color: "#ec4899" },
      { name: "Won", value: 155, color: "#10b981" },
      { name: "Lost", value: 60, color: "#94a3b8" },
    ],
    products: [
      { name: "Refrigerator", sold: 980, target: 900 },
      { name: "AC", sold: 1200, target: 1100 },
      { name: "Washing Machine", sold: 750, target: 800 },
      { name: "Microwave", sold: 600, target: 550 },
      { name: "Water Heater", sold: 500, target: 600 },
    ],
  },
  Yearly: {
    range: "Fiscal Year 2023-24",
    stats: { leads: "7.2K", won: "2.1K", revenue: "142M", rate: "31%" },
    pipeline: [
      { name: "New Lead", value: 1800, color: "#6366f1" },
      { name: "Contacted", value: 1500, color: "#8b5cf6" },
      { name: "Converted", value: 1100, color: "#a855f7" },
      { name: "Quotation", value: 850, color: "#ec4899" },
      { name: "Won", value: 620, color: "#10b981" },
      { name: "Lost", value: 240, color: "#94a3b8" },
    ],
    products: [
      { name: "Refrigerator", sold: 4200, target: 4000 },
      { name: "AC", sold: 5500, target: 5000 },
      { name: "Washing Machine", sold: 3100, target: 3500 },
      { name: "Microwave", sold: 2400, target: 2200 },
      { name: "Water Heater", sold: 1900, target: 2500 },
    ],
  },
};

// ---------------- COMPONENTS ----------------
interface StatCardProps {
  title: string;
  value: string | number;
  svg: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, svg, colorClass }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center gap-4">

      {svg && (
        <div className={`p-3 rounded-lg ${colorClass || ""}`}>
          <img src={svg} alt="icon" className="w-5 h-5 object-contain" />
        </div>
      )}

      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
          {title}
        </p>
        <h3 className="text-xl font-extrabold text-slate-900">
          {value}
        </h3>
      </div>
    </div>
  </div>
);
interface PipelineItem {
  name: string;
  value: number;
  color: string;
}

interface PipelineChartProps {
  data: PipelineItem[];
}

const PipelineChart: React.FC<PipelineChartProps> = ({ data }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-600 shadow-sm w-full">
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-900">Sales Pipeline Performance</h3>
      <p className="text-sm text-slate-500">Stages analysis across all filters</p>
    </div>
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            barSize={50}
            label={{ position: 'top', fill: '#1e293b', fontSize: 12, fontWeight: 'bold' }}
          >
            {data.map((entry: PipelineItem, index: number) => (<Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const Dashboard = () => {
  type FilterType = "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  const filters: FilterType[] = ["Weekly", "Monthly", "Quarterly", "Yearly"];
  const [filter, setFilter] = useState<FilterType>("Weekly");
  const currentData = DATA[filter] || DATA.Weekly;

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-10 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* HEADER SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium text-sm">Overview of your sales management system</p>
        </div>

        {/* --- SEPARATED FILTER BOXES --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex flex-wrap items-center gap-10"> {/* Gap-10 for distance like image */}
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`min-w-[120px] px-6 py-2.5 text-sm font-semibold rounded-lg border transition-all duration-200 shadow-sm
                  ${filter === item
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400 hover:bg-slate-50"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-xl">
            <Calendar size={16} className="text-indigo-600" />
            <span className="text-sm font-bold text-indigo-900">{currentData.range}</span>
          </div>
        </div>

        <hr className="border-slate-200 mb-8" />

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            title="Total Leads"
            value={currentData.stats.leads}
            svg={"/icons/users.svg"}
            colorClass="bg-blue-100"
          />

          <StatCard
            title="Deals Won"
            value={currentData.stats.won}
            svg={"/icons/win.svg"}
            colorClass="bg-green-100"
          />

          <StatCard
            title="Revenue"
            value={`₹${currentData.stats.revenue}`}
            svg={"/icons/rupee.svg"}
            colorClass="bg-yellow-100"
          />

          <StatCard
            title="Win Rate"
            value={currentData.stats.rate}
            svg={"/icons/trending.svg"}
            colorClass="bg-purple-100"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="flex flex-col gap-10">
          {/* Now shows ALL bars for every filter selection */}
          <PipelineChart data={currentData.pipeline} />

          {/* Product Category Chart */}
          <div className="bg-white p-8 rounded-2xl border border-slate-600 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <h3 className="text-lg font-bold text-slate-900">Sales by product category</h3>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2 text-[#192231]"><div className="w-3 h-3 bg-[#192231]" /> Units sold</div>
                <div className="flex items-center gap-2 text-slate-900"><div className="w-3 h-3 bg-black" /> Units target</div>
              </div>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.products} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barGap={8}>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}`} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="sold" fill="#192231" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="target" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
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