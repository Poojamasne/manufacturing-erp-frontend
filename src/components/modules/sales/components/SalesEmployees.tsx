import React, { useState, useMemo, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileEdit,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEmployees, clearSalesErrors, deleteEmployee } from "../ModuleStateFiles/EmployeeSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Interfaces ---
interface Employee {
  id: string;
  user_id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  is_active: 0 | 1;
  created_at: string;
}

const SalesEmployees: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { employees, loading } = useAppSelector((state: RootState) => state.SalesEmployee);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Active" | "All">("Active");

  // Professional Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Matches Leads Module
  setItemsPerPage(10)
  useEffect(() => {
    dispatch(getEmployees());
    return () => {
      dispatch(clearSalesErrors());
    };
  }, [dispatch]);

  // Reset to page 1 when filters or density change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, itemsPerPage]);

  // Filtering Logic
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return (employees as Employee[]).filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.user_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || emp.is_active === 1;
      return matchesSearch && matchesTab;
    });
  }, [employees, searchQuery, activeTab]);

  // --- Pagination Helpers ---
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedData = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleDelete = (id: string) => {
    dispatch(deleteEmployee(id, navigate) as any);
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Employees</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage employee accounts and access permissions.</p>
        </div>

        <button
          onClick={() => navigate("/sales/employees/add-employee")}
          className="outline-none group flex items-center gap-2 bg-[#005d52] hover:bg-[#004a41] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-teal-900/20 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          Add Sales Employee
        </button>
      </div>

      {/* Tabs & Search Row */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("Active")}
            className={` outline-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "Active" ? "bg-[#005d52] text-white shadow-md" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("All")}
            className={` outline-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "All" ? "bg-[#005d52] text-white shadow-md" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
          >
            All Employees
          </button>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none shadow-sm focus:ring-4 focus:ring-teal-500/5 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Name & Id</th>
                <th className="px-4 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Designation</th>
                <th className="px-6 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Contact</th>
                <th className="px-6 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                <th className="px-6 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Joined Date</th>
                <th className="px-6 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((emp) => (
                <tr key={emp.user_id} className="group hover:bg-teal-50/20 transition-colors">
                  <td className="px-6 py-5 cursor-pointer" onClick={() => navigate(`/sales/employees/view-employee/${emp?.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 shrink-0 rounded-2xl bg-teal-50 flex items-center justify-center text-[#005d52] font-black text-xs border border-teal-100 shadow-sm group-hover:bg-white group-hover:scale-110 transition-all">
                        {emp.name ? emp.name.split(' ').map(n => n[0]).join('') : 'U'}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">{emp.name}</p>
                        <p className="text-[11px] font-bold text-[#005d52] uppercase tracking-wider">{emp.user_id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-5">
                    <span className="text-[13px] text-slate-800 text-center">{emp.designation}</span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[13px] text-slate-800 text-center">
                        <Mail size={14} className="text-[#005d52]/50" /> {emp.email}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-800 text-center">
                        <Phone size={14} className="text-[#005d52]/50" /> {emp.phone}
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${emp.is_active === 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${emp.is_active === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      {emp.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className="text-[13px] text-slate-800 text-center whitespace-nowrap">
                      {emp?.created_at ? new Date(emp.created_at).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => navigate(`/sales/employees/view-employee/${emp?.id}`)} className="outline-none p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-[#005d52] rounded-xl transition-all">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => navigate(`/sales/employees/edit-employee/${emp?.id}`)} className="outline-none p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                        <FileEdit size={16} />
                      </button>
                      <button onClick={() => handleDelete(emp?.id)} className="outline-none p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-rose-600 rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EMPTY STATE */}
          {!loading && filteredEmployees.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="p-6 bg-slate-50 rounded-full mb-4">
                <Search className="text-slate-200" size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Workforce Found</h3>
              <p className="text-slate-400 text-sm max-w-xs">We couldn't find any employees matching your criteria.</p>
            </div>
          )}
        </div>

        {/* --- CONSISTENT ERP PAGINATION FOOTER --- */}
        <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Left: Rows Per Page & Stats */}
          <div className="flex items-center gap-6">

            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
              Showing <span className="text-slate-900">{paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="text-slate-900">{filteredEmployees.length}</span> Employees
            </div>
          </div>

          {/* Right: Smart Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#005d52] hover:border-teal-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-1.5">
              {getPageNumbers().map((page, index) => (
                page === "..." ? (
                  <span key={`dots-${index}`} className="px-2 text-slate-300">
                    <MoreHorizontal size={14} />
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all duration-200 ${currentPage === page
                      ? "bg-[#005d52] text-white shadow-lg shadow-teal-900/20 scale-105"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800 shadow-sm"
                      }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#005d52] hover:border-teal-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SalesEmployees;