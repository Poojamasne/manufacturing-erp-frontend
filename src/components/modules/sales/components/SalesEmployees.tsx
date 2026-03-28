import React, { useState, useMemo } from "react";
import type { ChangeEvent } from "react";
import { 
  UserPlus, 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Filter
} from "lucide-react";

// --- Interfaces ---
interface Employee {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  joinedDate: string;
  image?: string;
}

interface EmployeeComponentProps {
  // onAddEmployeeClick: () => void; // For navigation logic
}

const SalesEmployees: React.FC<EmployeeComponentProps> = () => {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Active" | "All">("Active");

  // --- Mock Data ---
  const [employees] = useState<Employee[]>([
    { id: "EMP001", name: "Sneha Patil", designation: "Senior Sales Executive", email: "sneha.p@electronics.in", phone: "+91 98234 56789", status: "Active", joinedDate: "12 Jan 2024" },
    { id: "EMP002", name: "Rahul Deshpande", designation: "Sales Manager", email: "rahul.d@electronics.in", phone: "+91 98234 11223", status: "Active", joinedDate: "05 Mar 2023" },
    { id: "EMP003", name: "Anjali Sharma", designation: "Territory Lead", email: "anjali.s@electronics.in", phone: "+91 98234 44556", status: "Active", joinedDate: "20 Nov 2023" },
    { id: "EMP004", name: "Vikram Rathore", designation: "Junior Sales Associate", email: "vikram.r@electronics.in", phone: "+91 98234 99887", status: "Inactive", joinedDate: "15 Feb 2024" },
    { id: "EMP005", name: "Priya Mehta", designation: "Sales Executive", email: "priya.m@electronics.in", phone: "+91 98234 77665", status: "Active", joinedDate: "01 Dec 2023" },
  ]);

  // --- Filtering Logic ---
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || emp.status === "Active";
      return matchesSearch && matchesTab;
    });
  }, [employees, searchQuery, activeTab]);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-[#1a1a1a]">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Sales Employees</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your sales force, track their performance and account status.
            </p>
          </div>

          <button 
            // onClick={onAddEmployeeClick}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-md"
          >
            <UserPlus size={18} />
            Add Sales Employee
          </button>
        </div>
      </div>

      {/* Tabs & Search Row */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("Active")}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "Active" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab("All")}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "All" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}
          >
            All Employees
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Filter size={14} /> Filter <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="max-w-7xl mx-auto border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-gray-200">
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-gray-600 font-bold text-sm">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                        <p className="text-[11px] text-gray-400">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-600 font-medium">{emp.designation}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={12} /> {emp.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone size={12} /> {emp.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${emp.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-xs font-bold ${emp.status === 'Active' ? 'text-green-700' : 'text-gray-400'}`}>
                        {emp.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-500">{emp.joinedDate}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic">
                    No employees found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F9FAFB] border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="text-black">{filteredEmployees.length}</span> of <span className="text-black">{employees.length}</span> Employees
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 text-xs font-bold border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-4 py-1.5 text-xs font-bold border border-gray-200 rounded-md bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesEmployees;