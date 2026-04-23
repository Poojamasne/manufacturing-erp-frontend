import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
  Factory,
  Package,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronRight as ChevronRightIcon,
  X,
} from "lucide-react";

// ==================== Types ====================
type TimeFilter =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

interface SalesOrder {
  id: string;
  productName: string;
  quantity: number;
  deliveryDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status?: string;
  created_at?: string;
}

interface BOMItem {
  materialId: string;
  materialName: string;
  quantityPerUnit: number;
  unit: string;
  totalRequired: number;
}

interface InventoryItem {
  materialId: string;
  materialName: string;
  availableQuantity: number;
  requiredQuantity: number;
  unit: string;
  shortage: number;
}

// ==================== Mock Data ====================
const mockSalesOrders: SalesOrder[] = [
  {
    id: "SO-001",
    productName: "Industrial Bolt M12",
    quantity: 5000,
    deliveryDate: "2024-05-20",
    customerName: "ABC Industries",
    customerEmail: "contact@abc.com",
    customerPhone: "+91 98765 43210",
    priority: "HIGH",
    created_at: "2024-05-10",
  },
  {
    id: "SO-002",
    productName: "Aluminum Frame 4x4",
    quantity: 250,
    deliveryDate: "2024-05-18",
    customerName: "XYZ Corp",
    customerEmail: "sales@xyz.com",
    customerPhone: "+91 87654 32109",
    priority: "HIGH",
    created_at: "2024-05-11",
  },
  {
    id: "SO-003",
    productName: "Plastic Container L",
    quantity: 1000,
    deliveryDate: "2024-05-22",
    customerName: "PQR Ltd",
    customerEmail: "info@pqr.com",
    customerPhone: "+91 76543 21098",
    priority: "MEDIUM",
    created_at: "2024-05-12",
  },
  {
    id: "SO-004",
    productName: "Rubber Gasket Set",
    quantity: 3000,
    deliveryDate: "2024-05-25",
    customerName: "MNO Enterprises",
    customerEmail: "orders@mno.com",
    customerPhone: "+91 65432 10987",
    priority: "LOW",
    created_at: "2024-05-09",
  },
  {
    id: "SO-005",
    productName: "Steel Plate 6mm",
    quantity: 1500,
    deliveryDate: "2024-05-28",
    customerName: "DEF Ltd",
    customerEmail: "purchase@def.com",
    customerPhone: "+91 54321 09876",
    priority: "HIGH",
    created_at: "2024-05-13",
  },
];

// BOM Database
const bomDatabase: { [key: string]: BOMItem[] } = {
  "Industrial Bolt M12": [
    {
      materialId: "RM001",
      materialName: "Steel Rod 12mm",
      quantityPerUnit: 1.2,
      unit: "kg",
      totalRequired: 0,
    },
    {
      materialId: "RM002",
      materialName: "Zinc Coating",
      quantityPerUnit: 0.05,
      unit: "kg",
      totalRequired: 0,
    },
    {
      materialId: "RM003",
      materialName: "Thread Oil",
      quantityPerUnit: 0.01,
      unit: "liter",
      totalRequired: 0,
    },
  ],
  "Aluminum Frame 4x4": [
    {
      materialId: "RM004",
      materialName: "Aluminum Sheet",
      quantityPerUnit: 2.5,
      unit: "kg",
      totalRequired: 0,
    },
    {
      materialId: "RM005",
      materialName: "Screws Set",
      quantityPerUnit: 8,
      unit: "pcs",
      totalRequired: 0,
    },
    {
      materialId: "RM006",
      materialName: "Corner Brackets",
      quantityPerUnit: 4,
      unit: "pcs",
      totalRequired: 0,
    },
  ],
  "Plastic Container L": [
    {
      materialId: "RM007",
      materialName: "Plastic Resin",
      quantityPerUnit: 1.8,
      unit: "kg",
      totalRequired: 0,
    },
    {
      materialId: "RM008",
      materialName: "Color Masterbatch",
      quantityPerUnit: 0.1,
      unit: "kg",
      totalRequired: 0,
    },
  ],
  "Rubber Gasket Set": [
    {
      materialId: "RM009",
      materialName: "Rubber Sheet",
      quantityPerUnit: 0.5,
      unit: "kg",
      totalRequired: 0,
    },
    {
      materialId: "RM010",
      materialName: "Adhesive",
      quantityPerUnit: 0.02,
      unit: "liter",
      totalRequired: 0,
    },
  ],
  "Steel Plate 6mm": [
    {
      materialId: "RM011",
      materialName: "Steel Coil",
      quantityPerUnit: 6.5,
      unit: "kg",
      totalRequired: 0,
    },
    {
      materialId: "RM012",
      materialName: "Cutting Oil",
      quantityPerUnit: 0.03,
      unit: "liter",
      totalRequired: 0,
    },
  ],
};

// Inventory Database
const inventoryDatabase: {
  [key: string]: { available: number; unit: string };
} = {
  RM001: { available: 4500, unit: "kg" },
  RM002: { available: 300, unit: "kg" },
  RM003: { available: 80, unit: "liter" },
  RM004: { available: 400, unit: "kg" },
  RM005: { available: 1500, unit: "pcs" },
  RM006: { available: 800, unit: "pcs" },
  RM007: { available: 1200, unit: "kg" },
  RM008: { available: 150, unit: "kg" },
  RM009: { available: 800, unit: "kg" },
  RM010: { available: 45, unit: "liter" },
  RM011: { available: 6000, unit: "kg" },
  RM012: { available: 60, unit: "liter" },
};

// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: { [key: string]: string } = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-teal-50 border-teal-100",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-[13px] font-medium uppercase border ${styles[status] || styles.MEDIUM}`}
    >
      {status}
    </span>
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`; 
};


const ProductionPlanningScreen: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // State
  const [salesOrders] = useState<SalesOrder[]>(mockSalesOrders);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showPurchaseRequest, setShowPurchaseRequest] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Priority options
  const priorityOptions = ["All", "HIGH", "MEDIUM", "LOW"];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTimeDropdownOpen(false);
      }
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
      if (
        priorityRef.current &&
        !priorityRef.current.contains(event.target as Node)
      ) {
        setIsPriorityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset page on filter change
  useEffect(() => {
    //eslint-disable-next-line react-hooks/exhaustive-deps
    setCurrentPage(1);
  }, [searchQuery, priorityFilter, timeFilter, customRange]);

  // Handle time filter change
  const handleTimeFilterChange = (value: TimeFilter) => {
    if (value === "Custom") {
      setIsCalendarOpen(true);
      setIsTimeDropdownOpen(false);
    } else {
      setTimeFilter(value);
      setIsTimeDropdownOpen(false);
      setIsCalendarOpen(false);
      setCustomRange({ start: "", end: "" });
    }
  };

  // Handle custom range apply
  const handleCustomApply = () => {
    if (!customRange.start || !customRange.end) {
      alert("Please select date range");
      return;
    }
    setTimeFilter("Custom");
    setIsCalendarOpen(false);
    setIsTimeDropdownOpen(false);
  };

  // Get filter display text
  const getFilterDisplayText = () => {
    if (timeFilter === "Custom" && customRange.start && customRange.end) {
      return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`;
    }
    return timeFilter;
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...salesOrders];

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (priorityFilter !== "All") {
      filtered = filtered.filter((order) => order.priority === priorityFilter);
    }

    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.created_at || order.deliveryDate);
      const now = new Date();

      if (timeFilter === "Weekly") {
        const diffDays =
          (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && diffDays >= 0;
      }
      if (timeFilter === "Monthly") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === "Quarterly") {
        return (
          Math.floor(orderDate.getMonth() / 3) ===
            Math.floor(now.getMonth() / 3) &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === "Yearly") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      if (timeFilter === "Custom" && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        return orderDate >= start && orderDate <= end;
      }
      return true;
    });

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at || b.deliveryDate).getTime() -
        new Date(a.created_at || a.deliveryDate).getTime(),
    );
  }, [salesOrders, searchQuery, priorityFilter, timeFilter, customRange]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleSelectAll = () => {
    if (
      selectedIds.length === paginatedOrders.length &&
      paginatedOrders.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    }
  };

  // Handle production planning
  const handlePlanProduction = (order: SalesOrder) => {
    setSelectedOrder(order);
    setCurrentStep(1);

    const bom = bomDatabase[order.productName] || [];
    const calculatedBom = bom.map((item) => ({
      ...item,
      totalRequired: item.quantityPerUnit * order.quantity,
    }));
    setBomItems(calculatedBom);

    const inventoryCheck = calculatedBom.map((bomItem) => {
      const inventory = inventoryDatabase[bomItem.materialId] || {
        available: 0,
        unit: bomItem.unit,
      };
      const shortage = Math.max(0, bomItem.totalRequired - inventory.available);
      return {
        materialId: bomItem.materialId,
        materialName: bomItem.materialName,
        availableQuantity: inventory.available,
        requiredQuantity: bomItem.totalRequired,
        unit: inventory.unit,
        shortage: shortage,
      };
    });
    setInventoryItems(inventoryCheck);
  };

  const hasMaterialShortage = () => {
    return inventoryItems.some((item) => item.shortage > 0);
  };

  const handleCreateProductionOrder = () => {
    const productionOrderId = `PO-${Date.now()}`;
    alert(`Production Order ${productionOrderId} created successfully!`);
    setSelectedOrder(null);
    setCurrentStep(1);
    navigate("/production/orders");
  };

  const handleCreatePurchaseRequest = () => {
    setShowPurchaseRequest(false);
    alert("Purchase Request Created!");
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Production Planning
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Plan production from confirmed sales orders
            </p>
          </div>

          {/* Global Time Filter */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-orange-500" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown
                size={14}
                className={isTimeDropdownOpen ? "rotate-180" : ""}
              />
            </button>

            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                {["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTimeFilterChange(tab as TimeFilter)}
                      className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === tab ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {tab}
                    </button>
                  ),
                )}
                <button
                  onClick={() => handleTimeFilterChange("Custom")}
                  className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === "Custom" ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Custom
                </button>
              </div>
            )}

            {isCalendarOpen && (
              <div
                ref={calendarRef}
                className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72"
              >
                <div className="space-y-3">
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) =>
                      setCustomRange({ ...customRange, start: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <input
                    type="date"
                    value={customRange.end}
                    min={customRange.start}
                    onChange={(e) =>
                      setCustomRange({ ...customRange, end: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    onClick={handleCustomApply}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Data Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            {/* ✅ Search (EXACT SAME AS Production Orders) */}
            <div className="relative w-full lg:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />

              <input
                type="text"
                placeholder="Search by order ID or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl 
                 focus:bg-white focus:ring-4 focus:ring-orange-500/5 
                 text-sm outline-none"
              />
            </div>

            {/* ✅ Right side filters (same spacing as Orders) */}
            <div className="flex flex-wrap gap-3">
              {/* Priority Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${
                    priorityFilter !== "All"
                      ? "bg-orange-50 border-orange-200 text-orange-600"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {priorityFilter === "All" ? "Priority" : priorityFilter}
                  <ChevronDown
                    size={14}
                    className={isPriorityOpen ? "rotate-180" : ""}
                  />
                </button>

                {isPriorityOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded-2xl shadow-2xl z-50 py-2">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setPriorityFilter(opt);
                          setIsPriorityOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${
                          priorityFilter === opt
                            ? "text-orange-600 font-bold bg-orange-50/50"
                            : "text-slate-600"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                      className="accent-orange-500 w-4 h-4 cursor-pointer"
                      checked={
                        paginatedOrders.length > 0 &&
                        selectedIds.length === paginatedOrders.length
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ORDER ID
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    PRODUCT
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    QUANTITY
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    DELIVERY DATE
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    CUSTOMER
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    PRIORITY
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="group hover:bg-orange-50/20 transition-colors"
                  >
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        className="accent-orange-500 w-4 h-4 cursor-pointer"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => {
                          if (selectedIds.includes(order.id))
                            setSelectedIds(
                              selectedIds.filter((id) => id !== order.id),
                            );
                          else setSelectedIds([...selectedIds, order.id]);
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">
                      {order.id}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">
                      {order.productName}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center whitespace-nowrap">
                      {formatDate(order.deliveryDate)}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={order.priority} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handlePlanProduction(order)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-medium hover:bg-orange-600 transition flex items-center gap-2"
                        >
                          <Factory size={14} /> Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                  <Package className="text-slate-200" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No Sales Orders Found
                </h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  No confirmed sales orders matching your filter criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
                {filteredOrders.length} Orders
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
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
                        className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-orange-500 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Production Planning Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-6 flex justify-between items-center shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Production Planning Wizard
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedOrder.productName}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setCurrentStep(1);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Steps */}
            <div className="sticky top-[88px] z-10 bg-white p-6 border-b border-gray-200">
              <div className="flex">
                {[
                  { step: 1, title: "Order Details", icon: Package },
                  { step: 2, title: "BOM Check", icon: Factory },
                  { step: 3, title: "Inventory Check", icon: ShoppingCart },
                ].map((item) => (
                  <div key={item.step} className="flex-1 relative">
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentStep >= item.step ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"}`}
                      >
                        <item.icon size={18} />
                      </div>
                      {item.step < 3 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 transition-all ${currentStep > item.step ? "bg-orange-500" : "bg-gray-200"}`}
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentStep === 1 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">
                    Order Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="text-xs text-gray-500 uppercase">
                        Order ID
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.id}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="text-xs text-gray-500 uppercase">
                        Product
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.productName}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="text-xs text-gray-500 uppercase">
                        Quantity Required
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.quantity.toLocaleString()} units
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="text-xs text-gray-500 uppercase">
                        Delivery Date
                      </label>
                      <p className="font-semibold text-gray-900">
                        {formatDate(selectedOrder.deliveryDate)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="text-xs text-gray-500 uppercase">
                        Customer Name
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.customerName}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="text-xs text-gray-500 uppercase">
                        Contact
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm text-orange-800">
                      ✓ Ready to check BOM. Click Next to view Bill of
                      Materials.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">
                    Bill of Materials (BOM)
                  </h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Material
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Qty/Unit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Unit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Required
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bomItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm">
                              {item.materialName}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.quantityPerUnit}
                            </td>
                            <td className="px-4 py-3 text-sm">{item.unit}</td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {item.totalRequired.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-800">
                      ✓ BOM fetched successfully. Click Next to check inventory
                      availability.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">
                    Inventory Availability Check
                  </h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Material
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Required
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Available
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Unit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventoryItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm">
                              {item.materialName}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.requiredQuantity.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.availableQuantity}
                            </td>
                            <td className="px-4 py-3 text-sm">{item.unit}</td>
                            <td className="px-4 py-3">
                              {item.shortage === 0 ? (
                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                  <CheckCircle size={14} /> Available
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                                  <AlertCircle size={14} /> Shortage:{" "}
                                  {item.shortage.toFixed(2)} {item.unit}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {hasMaterialShortage() && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className="text-yellow-600 mt-0.5"
                          size={18}
                        />
                        <div>
                          <p className="text-sm font-semibold text-yellow-800">
                            Material Shortage Detected
                          </p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Some materials are insufficient. A purchase request
                            will be created.
                          </p>
                          <button
                            onClick={() => setShowPurchaseRequest(true)}
                            className="mt-3 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition"
                          >
                            Create Purchase Request
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-between">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className={`px-6 py-2 rounded-xl transition ${currentStep > 1 ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "invisible"}`}
              >
                Previous
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition flex items-center gap-2"
                >
                  Next <ChevronRightIcon size={16} />
                </button>
              ) : (
                <button
                  onClick={handleCreateProductionOrder}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                >
                  <CheckCircle size={16} /> Create PO
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Purchase Request Modal */}
      {showPurchaseRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Create Purchase Request
            </h3>
            <div className="space-y-3 mb-6">
              {inventoryItems
                .filter((i) => i.shortage > 0)
                .map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-800">
                      {item.materialName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Required: {item.shortage.toFixed(2)} {item.unit}
                    </p>
                  </div>
                ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseRequest(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePurchaseRequest}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlanningScreen;
