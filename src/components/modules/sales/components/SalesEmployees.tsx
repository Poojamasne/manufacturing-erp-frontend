import React, { useState, useMemo, useEffect, useRef } from "react";
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
  MoreHorizontal,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getEmployees,
  clearSalesErrors,
  deleteEmployee,
} from "../ModuleStateFiles/EmployeeSlice";
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

type EmployeeStatus = "Active" | "Inactive" | "All";

const SalesEmployees: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { employees } = useAppSelector(
    (state: RootState) => state.SalesEmployee,
  );

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus>("Active");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const statusOptions: EmployeeStatus[] = ["Active", "Inactive", "All"];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(getEmployees());
    return () => {
      dispatch(clearSalesErrors());
    };
  }, [dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    //eslint-disable-next-line react-hooks/exhaustive-deps
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtering Logic
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return (employees as Employee[]).filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        emp.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        emp.user_id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        emp.designation.toLowerCase().includes(debouncedSearch.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === "Active") matchesStatus = emp.is_active === 1;
      else if (statusFilter === "Inactive") matchesStatus = emp.is_active === 0;
      else matchesStatus = true;

      return matchesSearch && matchesStatus;
    });
  }, [employees, debouncedSearch, statusFilter]);

  // --- Pagination Helpers ---
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredEmployees.slice(startIndex, endIndex);

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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleSelectAll = () => {
    if (
      selectedIds.length === paginatedData.length &&
      paginatedData.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map((emp) => emp.id));
    }
  };

  const handleDelete = (id: string) => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(deleteEmployee(id, navigate) as any);
    setSelectedIds((prev) => prev.filter((pid) => pid !== id));
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedIds.forEach((id) => dispatch(deleteEmployee(id, navigate) as any));
    setSelectedIds([]);
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get display text for filter button
  const getFilterDisplayText = () => {
    if (statusFilter === "Active") return "Active";
    if (statusFilter === "Inactive") return "Inactive";
    return "All Employees";
  };


  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Employees
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Manage employee accounts and access permissions.
            </p>
          </div>

          {/* Container for both buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Filter Button */}
            <section className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 flex items-center gap-2 text-gray-700 h-full"
              >
                <Filter size={16} className="text-[#F59E0B]" />
                <span>{getFilterDisplayText()}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setStatusFilter(option);
                        setIsDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${statusFilter === option
                        ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {option === "Active"
                        ? "Active"
                        : option === "Inactive"
                          ? "Inactive"
                          : "All Employees"}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Add Button */}
            <button
              onClick={() => navigate("/sales/employees/add-employee")}
              className="outline-none group flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-2.5 py-2 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/5 transition-all active:scale-95 whitespace-nowrap"
            >
              <UserPlus size={18} />
              Add Sales Employee
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, email, ID..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                className={`p-3 rounded-xl transition-all ${selectedIds.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                  }`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="w-12 p-5 text-center border-b border-slate-100">
                    <input
                      type="checkbox"
                      className="
      h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 
      bg-white transition-all relative
      checked:bg-[#F59E0B] checked:border-[#F59E0B]
      /* The Checkmark (Pseudo-element) */
      after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100
      after:left-[5px] after:top-[1px] after:w-[4px] after:h-[8px]
      after:border-white after:border-r-2 after:border-b-2 after:rotate-45
    "                      checked={
                        paginatedData.length > 0 &&
                        selectedIds.length === paginatedData.length
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ID
                  </th><th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    NAME
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    DESIGNATION
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    CONTACT
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    STATUS
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    JOINED DATE
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((emp) => (
                  <tr
                    key={emp.id}
                    className="group hover:bg-[#f3f4e6]/20 transition-colors"
                  >
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        className="
      h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 
      bg-white transition-all relative
      checked:bg-[#F59E0B] checked:border-[#F59E0B]
      /* The Checkmark (Pseudo-element) */
      after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100
      after:left-[5px] after:top-[1px] after:w-[4px] after:h-[8px]
      after:border-white after:border-r-2 after:border-b-2 after:rotate-45
    "                        checked={selectedIds.includes(emp.id)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(emp.id)
                              ? prev.filter((i) => i !== emp.id)
                              : [...prev, emp.id],
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div>

                        <p className="text-[13px] font-medium text-gray-800 uppercase tracking-wider">
                          {emp.user_id}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">
                          {emp.name}
                        </p>

                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[13px] text-slate-600">
                        {emp.designation}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center gap-2 text-[12px] text-slate-600">
                          <Mail size={12} className="text-[#F59E0B]/50" />{" "}
                          {emp.email}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-[12px] text-slate-600">
                          <Phone size={12} className="text-[#F59E0B]/50" />{" "}
                          {emp.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${emp.is_active === 1 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${emp.is_active === 1 ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                        {emp.is_active === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[13px] text-slate-600 whitespace-nowrap">
                        <span className="text-[13px] text-slate-600 whitespace-nowrap">
                          {formatDate(emp.created_at)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/sales/employees/view-employee/${emp?.id}`,
                            )
                          }
                          className="outline-none p-2 hover:bg-white text-slate-500 hover:text-[#F59E0B] rounded-xl transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/sales/employees/edit-employee/${emp?.id}`,
                            )
                          }
                          className="outline-none p-2 hover:bg-white text-slate-500 hover:text-blue-600 rounded-xl transition-all"
                        >
                          <FileEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp?.id)}
                          className="outline-none p-2 hover:bg-white text-slate-500 hover:text-rose-600 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* EMPTY STATE */}
            {filteredEmployees.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                  <UserPlus className="text-slate-200" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No Employees Found
                </h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  We couldn't find any employees matching your current filter
                  criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Footer - Same as OrderList */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                  Showing{" "}
                  <span className="text-slate-900">
                    {filteredEmployees.length > 0 ? startIndex + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="text-slate-900">
                    {Math.min(endIndex, filteredEmployees.length)}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-900">
                    {filteredEmployees.length}
                  </span>{" "}
                  Employees
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={i} className="px-2 text-slate-300">
                        <MoreHorizontal size={14} />
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => goToPage(page as number)}
                        className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-[#F59E0B] text-white shadow-lg shadow-amber-500/5 scale-105" : "bg-white text-slate-500 border border-slate-200"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesEmployees;
