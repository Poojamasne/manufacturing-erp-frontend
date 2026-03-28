import React, { useState, useMemo } from "react";
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
} from "recharts";
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";

// --- Types ---
type TimeRange = "Weekly" | "Monthly" | "Quarterly" | "Yearly";

interface LeaderboardItem {
  name: string;
  leads: number;
  conversion: string;
  revenue: string;
}

// --- Mock Data Store ---
const DATA_STORE: Record<TimeRange, any> = {
  Weekly: {
    revenue: [{ name: "Mon", val: 1.2 }, { name: "Tue", val: 2.1 }, { name: "Wed", val: 1.8 }, { name: "Thu", val: 3.4 }, { name: "Fri", val: 2.9 }, { name: "Sat", val: 4.1 }, { name: "Sun", val: 3.2 }],
    sources: [{ name: "Trade Fair", value: 400 }, { name: "Referral", value: 300 }, { name: "Web", value: 200 }],
    kpis: { rev: "₹12.4L", leads: "42", conv: "9.5%", avg: "₹0.8L" },
    leaderboard: [
      { name: "Sneha Patil", leads: 12, conversion: "10%", revenue: "₹2.1L" },
      { name: "Rahul Deshpande", leads: 8, conversion: "12%", revenue: "₹3.4L" }
    ]
  },
  Monthly: {
    revenue: [{ name: "W1", val: 10 }, { name: "W2", val: 18 }, { name: "W3", val: 14 }, { name: "W4", val: 22 }],
    sources: [{ name: "Trade Fair", value: 1200 }, { name: "Referral", value: 800 }, { name: "Web", value: 600 }],
    kpis: { rev: "₹48.2L", leads: "233", conv: "14.2%", avg: "₹1.4L" },
    leaderboard: [
      { name: "Sneha Patil", leads: 45, conversion: "12%", revenue: "₹8.4L" },
      { name: "Rahul Deshpande", leads: 38, conversion: "15%", revenue: "₹12.2L" },
      { name: "Anjali Sharma", leads: 52, conversion: "8%", revenue: "₹5.1L" },
      { name: "Priya Mehta", leads: 31, conversion: "22%", revenue: "₹14.8L" }
    ]
  },
  Quarterly: {
    revenue: [{ name: "Jan", val: 35 }, { name: "Feb", val: 42 }, { name: "Mar", val: 51 }],
    sources: [{ name: "Trade Fair", value: 3500 }, { name: "Referral", value: 2100 }, { name: "Web", value: 1400 }],
    kpis: { rev: "₹1.2Cr", leads: "680", conv: "12.8%", avg: "₹1.9L" },
    leaderboard: [
      { name: "Priya Mehta", leads: 120, conversion: "20%", revenue: "₹45.2L" },
      { name: "Rahul Deshpande", leads: 95, conversion: "18%", revenue: "₹38.1L" },
      { name: "Sneha Patil", leads: 110, conversion: "14%", revenue: "₹31.5L" }
    ]
  },
  Yearly: {
    revenue: [{ name: "2022", val: 120 }, { name: "2023", val: 180 }, { name: "2024", val: 240 }, { name: "2025", val: 310 }],
    sources: [{ name: "Trade Fair", value: 15000 }, { name: "Referral", value: 10000 }, { name: "Web", value: 5000 }],
    kpis: { rev: "₹4.8Cr", leads: "2450", conv: "15.4%", avg: "₹2.2L" },
    leaderboard: [
      { name: "Rahul Deshpande", leads: 420, conversion: "16%", revenue: "₹1.4Cr" },
      { name: "Sneha Patil", leads: 380, conversion: "14%", revenue: "₹1.1Cr" },
      { name: "Priya Mehta", leads: 450, conversion: "24%", revenue: "₹1.8Cr" }
    ]
  }
};

const COLORS = ["#000000", "#666666", "#cccccc"];

const ReportsAndAnalytics: FC = () => {
  const [range, setRange] = useState<TimeRange>("Monthly");

  const currentData = useMemo(() => DATA_STORE[range], [range]);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-[#1a1a1a]">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Reports & Performance</h1>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all">
              <Download size={18} /> Export
            </button>
            <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-zinc-800 active:scale-95 transition-all shadow-md">
              <Calendar size={18} /> Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(["Weekly", "Monthly", "Quarterly", "Yearly"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                range === r ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><Filter size={18}/></button>
      </div>

      {/* KPI Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Revenue" value={currentData.kpis.rev} trend="+12%" icon={<DollarSign size={20}/>}/>
        <StatCard label="Active Leads" value={currentData.kpis.leads} trend="+18" icon={<Users size={20}/>}/>
        <StatCard label="Conversion" value={currentData.kpis.conv} trend="-2%" isNeg icon={<Target size={20}/>}/>
        <StatCard label="Avg Deal" value={currentData.kpis.avg} trend="+5%" icon={<TrendingUp size={20}/>}/>
      </div>

      {/* Analytics Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-lg">Revenue Growth Trend</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider uppercase">
                <div className="w-2 h-2 rounded-full bg-black"></div> Revenue (Lakhs)
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.revenue}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#000', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="val" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
          <h3 className="font-bold text-lg mb-4">Lead Source Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={currentData.sources} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {currentData.sources.map((_:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {currentData.sources.map((s:any, i:number) => (
                <div key={i} className="flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                        <span className="text-gray-500 uppercase">{s.name}</span>
                    </div>
                    <span>{Math.round((s.value / currentData.sources.reduce((a:number,b:any)=>a+b.value, 0)) * 100)}%</span>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW: Performance Leaderboard Table */}
      <div className="max-w-7xl mx-auto border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg">Performance Leaderboard</h3>
            <button className="text-sm font-bold text-gray-500 hover:text-black transition-colors">View All Members</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Representative</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Leads</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Conversion</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.leaderboard.map((person: LeaderboardItem, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-gray-900">{person.name}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm text-gray-600 font-medium">{person.leads}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-block text-[11px] font-bold px-2.5 py-1 bg-gray-100 rounded-md text-gray-700">
                        {person.conversion}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-bold text-black">{person.revenue}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// --- Sub Component ---
const StatCard: FC<{label: string, value: string, trend: string, icon: React.ReactNode, isNeg?: boolean}> = ({label, value, trend, icon, isNeg}) => (
    <div className="border border-gray-200 rounded-2xl p-6 hover:border-black transition-all group bg-white shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-gray-100 rounded-lg group-hover:bg-black group-hover:text-white transition-all duration-300">{icon}</div>
            <div className={`flex items-center gap-1 text-xs font-bold ${isNeg ? 'text-red-500' : 'text-green-600'}`}>
                {isNeg ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14}/>} {trend}
            </div>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);

export default ReportsAndAnalytics;