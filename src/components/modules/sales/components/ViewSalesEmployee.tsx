import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mail, Phone, Calendar, TrendingUp, BarChart3,
  MapPin, Activity,
  ChevronRight, ShieldCheck, Award, Target
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from "recharts";

// Redux & State
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { getEmployee } from "../ModuleStateFiles/EmployeeSlice";
import type { RootState } from "../../../../ApplicationState/Store";

const ViewSalesEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { employee, loading } = useAppSelector((state: RootState) => state.SalesEmployee);

  useEffect(() => {
    if (id) dispatch(getEmployee(id));
  }, [dispatch, id]);

  if (loading) return null; // Thunk handles SweetAlert loading
  if (!employee) return <div className="p-20 text-center text-slate-500 font-medium">Employee not found.</div>;

  // --- Formatting Helpers ---
  const initials = employee.name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
  const joinedDate = new Date(employee.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* BREADCRUMBS & ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <button onClick={() => navigate("/sales/employees")} className="hover:text-[#005d52] transition-colors">Employees</button>
              <ChevronRight size={14} />
              <span className="text-slate-600 font-semibold">{employee.user_id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Profile Overview</h1>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: PROFILE CARD */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-28 bg-[#005d52] relative" />
              <div className="px-6 pb-8 text-center">
                <div className="relative -mt-14 mb-4 inline-block">
                  <div className="w-28 h-28 bg-white p-1.5 rounded-2xl shadow-xl">
                    <div className="w-full h-full rounded-xl bg-[#d1e9e7] flex items-center justify-center text-2xl font-bold text-[#005d52]">
                      {initials}
                    </div>
                  </div>
                  <div className={`absolute bottom-1 right-1 w-5 h-5 border-4 border-white rounded-full ${employee.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                </div>

                <h2 className="text-xl font-bold text-slate-900">{employee.name}</h2>
                <p className="text-xs font-bold text-[#005d52] uppercase tracking-wider mt-1">{employee.designation}</p>

                <div className="mt-8 space-y-4 text-left">
                  <InfoRow icon={<Mail size={16} />} label="Email Address" value={employee.email} />
                  <InfoRow icon={<Phone size={16} />} label="Phone Number" value={employee.phone} />
                  <InfoRow icon={<ShieldCheck size={16} />} label="Employee ID" value={employee.user_id} />
                  <InfoRow icon={<MapPin size={16} />} label="System Role" value={employee.role} className="capitalize" />
                </div>
              </div>
            </div>

            {/* JOINED CARD */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-teal-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Member Since</p>
                <p className="text-md font-semibold">{joinedDate}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: PERFORMANCE & ANALYTICS */}
          <div className="lg:col-span-8 space-y-6">

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Active Leads" value="48" icon={<Activity size={18} />} trend="+12%" positive />
              <StatCard label="Conversions" value="12" icon={<Target size={18} />} trend="+2.4%" positive />
              <StatCard label="Revenue" value="₹12.4L" icon={<BarChart3 size={18} />} trend="Target: 15L" />
            </div>

            {/* CHART */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Performance Trends</h3>
                <div className="text-[10px] font-bold text-[#005d52] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">WEEKLY VIEW</div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="sales" radius={[4, 4, 0, 0]} barSize={30}>
                      {MOCK_CHART_DATA.map((_, i) => (
                        <Cell key={i} fill={i === MOCK_CHART_DATA.length - 1 ? "#005d52" : "#d1e9e7"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award size={14} className="text-[#005d52]" /> Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["CRM Specialist", "Account Management", "Negotiation"].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 uppercase">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-500" /> Growth Velocity
                </h3>
                <div className="h-20 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CHART_DATA}>
                      <Area type="monotone" dataKey="leads" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Sub-components ---

const InfoRow = ({ icon, label, value, className = "" }: any) => (
  <div className="flex items-center gap-3 group">
    <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-[#005d52] transition-all">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-300 uppercase leading-none mb-1">{label}</p>
      <p className={`text-sm font-semibold text-slate-600 group-hover:text-slate-900 ${className}`}>{value}</p>
    </div>
  </div>
);

const StatCard = ({ label, value, icon, trend, positive }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-xl font-bold text-slate-900">{value}</h4>
      <p className={`text-[10px] font-bold mt-1 ${positive ? 'text-green-500' : 'text-slate-400'}`}>{trend}</p>
    </div>
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#005d52]">
      {icon}
    </div>
  </div>
);

const MOCK_CHART_DATA = [
  { name: "W1", sales: 2400, leads: 12 },
  { name: "W2", sales: 1398, leads: 19 },
  { name: "W3", sales: 9800, leads: 33 },
  { name: "W4", sales: 3908, leads: 24 },
  { name: "W5", sales: 4800, leads: 28 },
];

export default ViewSalesEmployee;