import React, { useState, useMemo } from "react";
import type { ChangeEvent } from "react";
import { 
  UserPlus, 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Filter,
  ChevronLeft,
  ChevronRight
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
}

const SalesEmployees: React.FC = () => {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Active" | "All">("Active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Mock Data ---
  const [employees] = useState<Employee[]>([
    { id: "EMP001", name: "Sneha Patil", designation: "Senior Sales Executive", email: "sneha.p@electronics.in", phone: "+91 98234 56789", status: "Active", joinedDate: "12 Jan 2024" },
    { id: "EMP002", name: "Rahul Deshpande", designation: "Sales Manager", email: "rahul.d@electronics.in", phone: "+91 98234 11223", status: "Active", joinedDate: "05 Mar 2023" },
    { id: "EMP003", name: "Anjali Sharma", designation: "Territory Lead", email: "anjali.s@electronics.in", phone: "+91 98234 44556", status: "Active", joinedDate: "20 Nov 2023" },
    { id: "EMP004", name: "Vikram Rathore", designation: "Junior Sales Associate", email: "vikram.r@electronics.in", phone: "+91 98234 99887", status: "Inactive", joinedDate: "15 Feb 2024" },
    { id: "EMP005", name: "Priya Mehta", designation: "Sales Executive", email: "priya.m@electronics.in", phone: "+91 98234 77665", status: "Active", joinedDate: "01 Dec 2023" },
    { id: "EMP006", name: "Karan Johar", designation: "Regional Head", email: "karan.j@electronics.in", phone: "+91 98234 22334", status: "Active", joinedDate: "10 Jan 2023" },
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

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedData = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Sales Employees</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your sales force and track performance accounts.</p>
          </div>

          <button className="flex items-center gap-2 bg-[#005d52] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-teal-900/20 hover:opacity-90 transition-all active:scale-95">
            <UserPlus size={18} strokeWidth={3} />
            Add Sales Employee
          </button>
      </div>

      {/* Tabs & Search Row */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex flex-wrap gap-2 p-1.5 bg-white/60 rounded-2xl border border-white w-fit shadow-sm">
          <button 
            onClick={() => { setActiveTab("Active"); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "Active" ? "bg-[#d1e9e7] text-[#005d52] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Active
          </button>
          <button 
            onClick={() => { setActiveTab("All"); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "All" ? "bg-[#d1e9e7] text-[#005d52] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            All Employees
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-2.5 bg-white border-none rounded-full text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#005d52]/20 transition-all placeholder:text-gray-300"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 shadow-sm transition-colors">
            <Filter size={14} className="opacity-50" /> Filter <ChevronDown size={14} className="opacity-50" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee Name</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designation</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedData.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#f4f7f6]/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#d1e9e7] flex items-center justify-center text-[#005d52] font-bold text-sm shadow-sm border-2 border-white">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                        <p className="text-[11px] font-bold text-[#005d52] uppercase tracking-tighter opacity-70">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm text-gray-600 font-semibold">{emp.designation}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                        <Mail size={12} className="opacity-50" /> {emp.email}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                        <Phone size={12} className="opacity-50" /> {emp.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${emp.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-green-600' : 'bg-gray-400'}`} />
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm text-gray-400 font-medium">{emp.joinedDate}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-300 hover:text-[#005d52] rounded-full hover:bg-gray-50 transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Search size={40} className="text-gray-100 mb-2" />
                       <p className="text-sm text-gray-400 font-medium italic">No employees found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Interactive Footer / Pagination */}
        <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-800">{paginatedData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="text-gray-800">{filteredEmployees.length}</span> Employees
          </p>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[#005d52] disabled:opacity-30 transition-all uppercase"
                disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                            currentPage === i + 1 ? "bg-[#005d52] text-white shadow-lg shadow-teal-900/20" : "text-gray-400 hover:bg-gray-100"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[#005d52] disabled:opacity-30 transition-all uppercase"
                disabled={currentPage === totalPages || totalPages === 0}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesEmployees;