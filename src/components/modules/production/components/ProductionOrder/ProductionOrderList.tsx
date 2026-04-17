import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileEdit,
  MoreHorizontal,
  Filter,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Clock,
  Factory,
  Plus,
  Calendar,
  User,
  Cpu,
  ClipboardList,
  Send,
  Settings,
  AlertCircle
} from "lucide-react";

// ==================== Types based on SRS Requirements ====================

type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";

// Production Order Status
type ProductionOrderStatus = 
  | "DRAFT"           // Initial creation
  | "PLANNED"         // Planned but not yet scheduled
  | "SCHEDULED"       // Machines & operators assigned
  | "IN_PROGRESS"     // Active on shop floor
  | "ON_HOLD"         // Paused
  | "COMPLETED"       // Finished
  | "CANCELLED";      // Cancelled

// Work Order Status
type WorkOrderStatus = 
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED";

// Shift Types
type Shift = "MORNING" | "EVENING" | "NIGHT";

// Priority Levels
type Priority = "HIGH" | "MEDIUM" | "LOW";

// Work Order Interface
interface WorkOrder {
  id: string;
  workOrderId: string;
  productionOrderId: string;
  taskName: string;
  description: string;
  machineId: string;
  machineName: string;
  operatorId: string;
  operatorName: string;
  shift: Shift;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  status: WorkOrderStatus;
  progress: number;
  instructions: string[];
  safetyNotes: string[];
}

// Production Order Interface (SRS 3.6.1)
interface ProductionOrder {
  id: string;
  productionOrderId: string;
  salesOrderId: string;
  productName: string;
  productCode: string;
  quantity: number;
  completedQuantity: number;
  rejectedQuantity: number;
  deadline: string;
  startDate: string;
  endDate: string | null;
  status: ProductionOrderStatus;
  priority: Priority;
  progress: number;
  shift: Shift;
  assignedMachineId: string;
  assignedMachineName: string;
  assignedOperatorId: string;
  assignedOperatorName: string;
  workOrders: WorkOrder[];
  workInstructions: string;
  safetyInstructions: string;
  createdAt: string;
  createdBy: string;
}

// Machine Interface (SRS 3.7.1)
interface Machine {
  id: string;
  machineCode: string;
  machineName: string;
  type: string;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OFFLINE";
  currentOrderId: string | null;
  nextAvailableDate: string;
}

// Operator Interface (SRS 3.7.2)
interface Operator {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  shift: Shift;
  status: "AVAILABLE" | "ASSIGNED" | "OFF_DUTY";
  currentWorkload: number;
  maxWorkload: number;
}

// ==================== Mock Data ====================

// Mock Machines
const mockMachines: Machine[] = [
  { id: "M001", machineCode: "MC-001", machineName: "CNC Machine A", type: "CNC", status: "AVAILABLE", currentOrderId: null, nextAvailableDate: "2024-05-20" },
  { id: "M002", machineCode: "MC-002", machineName: "CNC Machine B", type: "CNC", status: "IN_USE", currentOrderId: "PO-001", nextAvailableDate: "2024-05-22" },
  { id: "M003", machineCode: "MC-003", machineName: "Injection Molder", type: "MOLDING", status: "AVAILABLE", currentOrderId: null, nextAvailableDate: "2024-05-20" },
  { id: "M004", machineCode: "MC-004", machineName: "Assembly Line 1", type: "ASSEMBLY", status: "IN_USE", currentOrderId: "PO-002", nextAvailableDate: "2024-05-21" },
  { id: "M005", machineCode: "MC-005", machineName: "Quality Station", type: "QC", status: "AVAILABLE", currentOrderId: null, nextAvailableDate: "2024-05-20" },
];

// Mock Operators
const mockOperators: Operator[] = [
  { id: "OP001", employeeId: "EMP-101", name: "John Doe", role: "CNC Operator", shift: "MORNING", status: "AVAILABLE", currentWorkload: 2, maxWorkload: 5 },
  { id: "OP002", employeeId: "EMP-102", name: "Jane Smith", role: "Assembly Lead", shift: "MORNING", status: "ASSIGNED", currentWorkload: 4, maxWorkload: 5 },
  { id: "OP003", employeeId: "EMP-103", name: "Mike Johnson", role: "Quality Inspector", shift: "EVENING", status: "AVAILABLE", currentWorkload: 1, maxWorkload: 5 },
  { id: "OP004", employeeId: "EMP-104", name: "Sarah Wilson", role: "Machine Operator", shift: "NIGHT", status: "AVAILABLE", currentWorkload: 0, maxWorkload: 5 },
];

// Mock Production Orders
const mockProductionOrders: ProductionOrder[] = [
  {
    id: "1",
    productionOrderId: "PO-001",
    salesOrderId: "SO-001",
    productName: "Industrial Bolt M12",
    productCode: "PRD-001",
    quantity: 5000,
    completedQuantity: 3250,
    rejectedQuantity: 45,
    deadline: "2024-05-20",
    startDate: "2024-05-15",
    endDate: null,
    status: "IN_PROGRESS",
    priority: "HIGH",
    progress: 65,
    shift: "MORNING",
    assignedMachineId: "M002",
    assignedMachineName: "CNC Machine B",
    assignedOperatorId: "OP001",
    assignedOperatorName: "John Doe",
    workOrders: [
      {
        id: "WO001",
        workOrderId: "WO-001",
        productionOrderId: "PO-001",
        taskName: "Raw Material Cutting",
        description: "Cut steel rods to specified length",
        machineId: "M001",
        machineName: "CNC Machine A",
        operatorId: "OP001",
        operatorName: "John Doe",
        shift: "MORNING",
        startDate: "2024-05-15",
        endDate: "2024-05-16",
        estimatedHours: 8,
        actualHours: 7.5,
        status: "COMPLETED",
        progress: 100,
        instructions: ["Use cutting tool #A12", "Maintain speed at 1500 RPM"],
        safetyNotes: ["Wear safety goggles", "Keep hands clear of cutting area"]
      },
      {
        id: "WO002",
        workOrderId: "WO-002",
        productionOrderId: "PO-001",
        taskName: "Threading",
        description: "Create threads on bolts",
        machineId: "M002",
        machineName: "CNC Machine B",
        operatorId: "OP001",
        operatorName: "John Doe",
        shift: "MORNING",
        startDate: "2024-05-16",
        endDate: "2024-05-18",
        estimatedHours: 16,
        actualHours: 14,
        status: "IN_PROGRESS",
        progress: 65,
        instructions: ["Use threading die size M12", "Apply cutting oil regularly"],
        safetyNotes: ["Watch for hot chips", "Use coolant system"]
      }
    ],
    workInstructions: "1. Cut raw material to length\n2. Heat treat for hardness\n3. Threading operation\n4. Quality inspection\n5. Packaging",
    safetyInstructions: "Always wear PPE. Follow lockout/tagout procedures. Report any anomalies.",
    createdAt: "2024-05-14T10:00:00Z",
    createdBy: "Production Planner"
  },
  {
    id: "2",
    productionOrderId: "PO-002",
    salesOrderId: "SO-002",
    productName: "Aluminum Frame 4x4",
    productCode: "PRD-002",
    quantity: 250,
    completedQuantity: 0,
    rejectedQuantity: 0,
    deadline: "2024-05-18",
    startDate: "",
    endDate: null,
    status: "PLANNED",
    priority: "HIGH",
    progress: 0,
    shift: "MORNING",
    assignedMachineId: "",
    assignedMachineName: "",
    assignedOperatorId: "",
    assignedOperatorName: "",
    workOrders: [],
    workInstructions: "1. Cut aluminum sheets\n2. Bend corners\n3. Weld joints\n4. Surface finishing\n5. Quality check",
    safetyInstructions: "Handle aluminum sheets carefully. Use welding mask.",
    createdAt: "2024-05-12T09:00:00Z",
    createdBy: "Production Planner"
  },
  {
    id: "3",
    productionOrderId: "PO-003",
    salesOrderId: "SO-003",
    productName: "Plastic Container L",
    productCode: "PRD-003",
    quantity: 1000,
    completedQuantity: 300,
    rejectedQuantity: 12,
    deadline: "2024-05-22",
    startDate: "2024-05-17",
    endDate: null,
    status: "ON_HOLD",
    priority: "MEDIUM",
    progress: 30,
    shift: "EVENING",
    assignedMachineId: "M003",
    assignedMachineName: "Injection Molder",
    assignedOperatorId: "OP004",
    assignedOperatorName: "Sarah Wilson",
    workOrders: [
      {
        id: "WO003",
        workOrderId: "WO-003",
        productionOrderId: "PO-003",
        taskName: "Injection Molding",
        description: "Mold plastic containers",
        machineId: "M003",
        machineName: "Injection Molder",
        operatorId: "OP004",
        operatorName: "Sarah Wilson",
        shift: "EVENING",
        startDate: "2024-05-17",
        endDate: null,
        estimatedHours: 24,
        actualHours: 8,
        status: "BLOCKED",
        progress: 30,
        instructions: ["Set temperature to 220°C", "Use mold #M3"],
        safetyNotes: ["Hot surfaces - use gloves", "Ventilation required"]
      }
    ],
    workInstructions: "1. Set up injection molding machine\n2. Load plastic resin\n3. Run production cycle\n4. Trim excess material\n5. Quality inspection",
    safetyInstructions: "Machine interlocks must be functional. Emergency stop accessible.",
    createdAt: "2024-05-13T14:00:00Z",
    createdBy: "Production Planner"
  },
  {
    id: "4",
    productionOrderId: "PO-004",
    salesOrderId: "SO-004",
    productName: "Rubber Gasket Set",
    productCode: "PRD-004",
    quantity: 3000,
    completedQuantity: 3000,
    rejectedQuantity: 28,
    deadline: "2024-05-19",
    startDate: "2024-05-10",
    endDate: "2024-05-18",
    status: "COMPLETED",
    priority: "HIGH",
    progress: 100,
    shift: "MORNING",
    assignedMachineId: "M004",
    assignedMachineName: "Assembly Line 1",
    assignedOperatorId: "OP002",
    assignedOperatorName: "Jane Smith",
    workOrders: [
      {
        id: "WO004",
        workOrderId: "WO-004",
        productionOrderId: "PO-004",
        taskName: "Rubber Molding",
        description: "Mold rubber gaskets",
        machineId: "M003",
        machineName: "Injection Molder",
        operatorId: "OP002",
        operatorName: "Jane Smith",
        shift: "MORNING",
        startDate: "2024-05-10",
        endDate: "2024-05-14",
        estimatedHours: 32,
        actualHours: 30,
        status: "COMPLETED",
        progress: 100,
        instructions: ["Use rubber compound R-5", "Curing time 45 seconds"],
        safetyNotes: ["Fumes extraction on", "Heat resistant gloves"]
      },
      {
        id: "WO005",
        workOrderId: "WO-005",
        productionOrderId: "PO-004",
        taskName: "Quality Testing",
        description: "Test gasket durability",
        machineId: "M005",
        machineName: "Quality Station",
        operatorId: "OP003",
        operatorName: "Mike Johnson",
        shift: "EVENING",
        startDate: "2024-05-15",
        endDate: "2024-05-18",
        estimatedHours: 16,
        actualHours: 14,
        status: "COMPLETED",
        progress: 100,
        instructions: ["Test pressure resistance", "Check dimensions"],
        safetyNotes: ["Use calibrated equipment"]
      }
    ],
    workInstructions: "1. Prepare rubber compound\n2. Load into molding machine\n3. Cure and cool\n4. Trim flash\n5. Quality test",
    safetyInstructions: "Chemical gloves required. Eye protection mandatory.",
    createdAt: "2024-05-09T11:00:00Z",
    createdBy: "Production Planner"
  },
  {
    id: "5",
    productionOrderId: "PO-005",
    salesOrderId: "SO-005",
    productName: "Steel Plates 6mm",
    productCode: "PRD-005",
    quantity: 1500,
    completedQuantity: 0,
    rejectedQuantity: 0,
    deadline: "2024-05-25",
    startDate: "",
    endDate: null,
    status: "SCHEDULED",
    priority: "MEDIUM",
    progress: 0,
    shift: "NIGHT",
    assignedMachineId: "M001",
    assignedMachineName: "CNC Machine A",
    assignedOperatorId: "OP004",
    assignedOperatorName: "Sarah Wilson",
    workOrders: [
      {
        id: "WO006",
        workOrderId: "WO-006",
        productionOrderId: "PO-005",
        taskName: "Plate Cutting",
        description: "Cut steel plates to size",
        machineId: "M001",
        machineName: "CNC Machine A",
        operatorId: "OP004",
        operatorName: "Sarah Wilson",
        shift: "NIGHT",
        startDate: "2024-05-20",
        endDate: "2024-05-23",
        estimatedHours: 24,
        actualHours: 0,
        status: "PENDING",
        progress: 0,
        instructions: ["Use plasma cutter", "Follow CAD dimensions"],
        safetyNotes: ["Fire safety equipment ready", "Eye protection required"]
      }
    ],
    workInstructions: "1. Load steel sheet\n2. Program cutting dimensions\n3. Execute plasma cutting\n4. Deburr edges\n5. Inspect quality",
    safetyInstructions: "Fire extinguisher nearby. Hearing protection required.",
    createdAt: "2024-05-15T08:00:00Z",
    createdBy: "Production Planner"
  },
  {
    id: "6",
    productionOrderId: "PO-006",
    salesOrderId: "SO-006",
    productName: "Copper Wires",
    productCode: "PRD-006",
    quantity: 8000,
    completedQuantity: 0,
    rejectedQuantity: 0,
    deadline: "2024-05-28",
    startDate: "",
    endDate: null,
    status: "DRAFT",
    priority: "LOW",
    progress: 0,
    shift: "MORNING",
    assignedMachineId: "",
    assignedMachineName: "",
    assignedOperatorId: "",
    assignedOperatorName: "",
    workOrders: [],
    workInstructions: "1. Draw copper wire\n2. Annealing process\n3. Insulation coating\n4. Spooling\n5. Quality check",
    safetyInstructions: "Electrical safety protocols. Insulated tools.",
    createdAt: "2024-05-16T09:00:00Z",
    createdBy: "Production Planner"
  }
];

// ==================== Helper Functions ====================

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

const getStatusStyle = (status: ProductionOrderStatus) => {
  const styles: Record<ProductionOrderStatus, string> = {
    DRAFT: "bg-gray-50 text-gray-600 border-gray-100",
    PLANNED: "bg-blue-50 text-blue-700 border-blue-100",
    SCHEDULED: "bg-purple-50 text-purple-700 border-purple-100",
    IN_PROGRESS: "bg-orange-50 text-orange-700 border-orange-100",
    ON_HOLD: "bg-yellow-50 text-yellow-700 border-yellow-100",
    COMPLETED: "bg-green-50 text-green-700 border-green-100",
    CANCELLED: "bg-red-50 text-red-700 border-red-100"
  };
  const labels: Record<ProductionOrderStatus, string> = {
    DRAFT: "Draft",
    PLANNED: "Planned",
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "In Progress",
    ON_HOLD: "On Hold",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
  };
  return {
    className: `px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`,
    label: labels[status]
  };
};

const getPriorityStyle = (priority: Priority) => {
  const styles: Record<Priority, string> = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-teal-50 border-teal-100"
  };
  return `px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[priority]}`;
};

const getShiftLabel = (shift: Shift) => {
  const labels: Record<Shift, string> = {
    MORNING: "Morning (6AM-2PM)",
    EVENING: "Evening (2PM-10PM)",
    NIGHT: "Night (10PM-6AM)"
  };
  return labels[shift];
};

const getStatusIcon = (status: ProductionOrderStatus) => {
  switch(status) {
    case 'IN_PROGRESS': return <Play size={12} />;
    case 'ON_HOLD': return <Pause size={12} />;
    case 'COMPLETED': return <CheckCircle size={12} />;
    case 'CANCELLED': return <AlertTriangle size={12} />;
    case 'SCHEDULED': return <Calendar size={12} />;
    default: return <Clock size={12} />;
  }
};

// ==================== Main Component ====================
const ProductionOrderList: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // State
  const [orders, setOrders] = useState<ProductionOrder[]>(mockProductionOrders);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showWorkOrdersModal, setShowWorkOrdersModal] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [shiftFilter, setShiftFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Options
  const statusOptions = ["All", "DRAFT", "PLANNED", "SCHEDULED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];
  const priorityOptions = ["All", "HIGH", "MEDIUM", "LOW"];
  const shiftOptions = ["All", "MORNING", "EVENING", "NIGHT"];

  // Stats
  const stats = useMemo(() => ({
    total: orders.length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    planned: orders.filter(o => o.status === 'PLANNED' || o.status === 'SCHEDULED').length,
    onHold: orders.filter(o => o.status === 'ON_HOLD').length,
  }), [orders]);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, shiftFilter, timeFilter, customRange]);

  // Handle time filter
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

  const handleCustomApply = () => {
    if (!customRange.start || !customRange.end) {
      alert("Please select date range");
      return;
    }
    setTimeFilter("Custom");
    setIsCalendarOpen(false);
    setIsTimeDropdownOpen(false);
  };

  const getFilterDisplayText = () => {
    if (timeFilter === "Custom" && customRange.start && customRange.end) {
      return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`;
    }
    return timeFilter;
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.productionOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.salesOrderId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (priorityFilter !== "All") {
      filtered = filtered.filter((order) => order.priority === priorityFilter);
    }

    if (shiftFilter !== "All") {
      filtered = filtered.filter((order) => order.shift === shiftFilter);
    }

    // Time filter based on deadline
    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.deadline);
      const now = new Date();

      if (timeFilter === "Weekly") {
        const diffDays = (orderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && diffDays >= -7;
      }
      if (timeFilter === "Monthly") {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      if (timeFilter === "Quarterly") {
        return Math.floor(orderDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) &&
               orderDate.getFullYear() === now.getFullYear();
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

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, statusFilter, priorityFilter, shiftFilter, timeFilter, customRange]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this production order?")) {
      setOrders(orders.filter((o) => o.id !== id));
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} production order(s)?`)) {
      setOrders(orders.filter((o) => !selectedIds.includes(o.id)));
      setSelectedIds([]);
    }
  };

  // SRS 3.10.3 Production Start
  const handleStartProduction = (order: ProductionOrder) => {
    if (order.status !== "SCHEDULED" && order.status !== "PLANNED") {
      alert("Order must be scheduled before starting production.");
      return;
    }
    const updatedOrders = orders.map((o) =>
      o.id === order.id
        ? { 
            ...o, 
            status: "IN_PROGRESS" as ProductionOrderStatus, 
            startDate: new Date().toISOString().split("T")[0], 
            progress: 5,
            workOrders: o.workOrders.map(wo => 
              wo.status === "PENDING" || wo.status === "ASSIGNED" 
                ? { ...wo, status: "IN_PROGRESS" as WorkOrderStatus, progress: 5 }
                : wo
            )
          }
        : o
    );
    setOrders(updatedOrders);
    alert(`Production started for ${order.productionOrderId}`);
  };

  // SRS 3.10.2 Shop Floor Task Management - Update Progress
  const handleUpdateProgress = (order: ProductionOrder, newProgress: number) => {
    const updatedOrders = orders.map((o) =>
      o.id === order.id
        ? { ...o, progress: newProgress, completedQuantity: Math.floor(order.quantity * newProgress / 100) }
        : o
    );
    setOrders(updatedOrders);
  };

  const handlePauseProduction = (order: ProductionOrder) => {
    const updatedOrders = orders.map((o) =>
      o.id === order.id ? { ...o, status: "ON_HOLD" as ProductionOrderStatus } : o
    );
    setOrders(updatedOrders);
    alert(`Production paused for ${order.productionOrderId}`);
  };

  const handleCompleteProduction = (order: ProductionOrder) => {
    const updatedOrders = orders.map((o) =>
      o.id === order.id
        ? { ...o, status: "COMPLETED" as ProductionOrderStatus, endDate: new Date().toISOString().split("T")[0], progress: 100, completedQuantity: o.quantity }
        : o
    );
    setOrders(updatedOrders);
    alert(`Production completed for ${order.productionOrderId}`);
  };

  // SRS 3.6.2 Work Order Assignment - Send to Shop Floor
  const handleSendToShopFloor = (order: ProductionOrder) => {
    if (order.workOrders.length === 0) {
      alert("Please create work orders first.");
      return;
    }
    const updatedOrders = orders.map((o) =>
      o.id === order.id ? { ...o, status: "SCHEDULED" as ProductionOrderStatus } : o
    );
    setOrders(updatedOrders);
    alert(`Production order ${order.productionOrderId} sent to shop floor. Operators will receive tasks.`);
  };

  const handleViewDetails = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleViewWorkOrders = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowWorkOrdersModal(true);
  };

  const handleSchedule = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowScheduleModal(true);
  };

  const isDeadlineUrgent = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  const isDeadlineOverdue = (deadline: string, status: ProductionOrderStatus) => {
    if (status === "COMPLETED" || status === "CANCELLED") return false;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Production Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Manage and track all production orders | SRS 3.6
            </p>
          </div>
          <button
            onClick={() => navigate("/production/planning")}
            className="group flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-orange-900/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            Create Production Order
          </button>
        </header>


        <section className="relative mb-8 flex justify-end">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-orange-500" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown size={14} className={`transition-transform ${isTimeDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-[160px]">
                {(["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"] as TimeFilter[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTimeFilterChange(tab)}
                    className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                      timeFilter === tab ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <button
                  onClick={() => handleTimeFilterChange("Custom")}
                  className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                    timeFilter === "Custom" ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Custom
                </button>
              </div>
            )}

            {isCalendarOpen && (
              <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72">
                <div className="space-y-3">
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <input
                    type="date"
                    value={customRange.end}
                    min={customRange.start}
                    onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    onClick={handleCustomApply}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Stats Cards - SRS 3.2 Dashboard Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border-l-4 border-orange-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
            <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-blue-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">In Progress</p>
            <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-green-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.completed}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-purple-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Planned/Scheduled</p>
            <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.planned}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-yellow-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">On Hold</p>
            <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.onHold}</p>
          </div>
        </div>


        {/* Main Data Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search by PO ID, product or SO ID..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
              {/* Status Filter */}
              <div className="relative min-w-36">
                <button
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`outline-none w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${
                    statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="truncate">{statusFilter === "All" ? "Status" : statusFilter.replace("_", " ")}</span>
                  <ChevronDown size={14} className={`transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
                </button>
                {isStatusOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setStatusFilter(opt); setIsStatusOpen(false); setCurrentPage(1); }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${
                          statusFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"
                        }`}
                      >
                        {opt === "All" ? "All" : opt.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Filter */}
              <div className="relative min-w-32">
                <button
                  onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  className={`outline-none w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${
                    priorityFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="truncate">{priorityFilter === "All" ? "Priority" : priorityFilter}</span>
                  <ChevronDown size={14} className={`transition-transform ${isPriorityOpen ? "rotate-180" : ""}`} />
                </button>
                {isPriorityOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setPriorityFilter(opt); setIsPriorityOpen(false); setCurrentPage(1); }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${
                          priorityFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shift Filter - SRS 3.8 */}
              <div className="relative min-w-36">
                <button
                  onClick={() => setIsShiftOpen(!isShiftOpen)}
                  className={`outline-none w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${
                    shiftFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="truncate">{shiftFilter === "All" ? "Shift" : getShiftLabel(shiftFilter as Shift)}</span>
                  <ChevronDown size={14} className={`transition-transform ${isShiftOpen ? "rotate-180" : ""}`} />
                </button>
                {isShiftOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                    {shiftOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setShiftFilter(opt); setIsShiftOpen(false); setCurrentPage(1); }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${
                          shiftFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"
                        }`}
                      >
                        {opt === "All" ? "All" : getShiftLabel(opt as Shift)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                disabled={selectedIds.length === 0}
                onClick={handleBulkDelete}
                className={`p-3 rounded-xl transition-all ${
                  selectedIds.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
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
                      className="accent-orange-500 w-4 h-4 cursor-pointer"
                      checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">PO ID</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Product</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Qty</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Completed</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Deadline</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Shift</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Priority</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Progress</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((order) => {
                  const statusStyle = getStatusStyle(order.status);
                  const urgent = isDeadlineUrgent(order.deadline);
                  const overdue = isDeadlineOverdue(order.deadline, order.status);
                  return (
                    <tr key={order.id} className="group hover:bg-orange-50/20 transition-colors">
                      <td className="p-5 text-center">
                        <input
                          type="checkbox"
                          className="accent-orange-500 w-4 h-4 cursor-pointer"
                          checked={selectedIds.includes(order.id)}
                          onChange={() => {
                            if (selectedIds.includes(order.id)) {
                              setSelectedIds(selectedIds.filter((id) => id !== order.id));
                            } else {
                              setSelectedIds([...selectedIds, order.id]);
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{order.productionOrderId}</td>
                      <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.productName}</td>
                      <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.quantity.toLocaleString()}</td>
                      <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.completedQuantity.toLocaleString()}</td>
                      <td className="px-4 py-4 text-[13px] text-center whitespace-nowrap">
                        <span className={`${urgent ? "text-orange-600 font-bold" : ""} ${overdue ? "text-red-600 font-bold" : "text-slate-700"}`}>
                          {formatDate(order.deadline)}
                          {overdue && <AlertCircle size={12} className="inline ml-1 text-red-500" />}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{getShiftLabel(order.shift)}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={getPriorityStyle(order.priority)}>{order.priority}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 ${statusStyle.className}`}>
                          {getStatusIcon(order.status)}
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[80px]">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${order.progress}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600">{order.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="p-1.5 hover:bg-white text-slate-500 hover:text-orange-600 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/production/orders/edit/${order.id}`)}
                            className="p-1.5 hover:bg-white text-slate-500 hover:text-blue-600 rounded-xl transition-all"
                            title="Edit"
                          >
                            <FileEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleViewWorkOrders(order)}
                            className="p-1.5 hover:bg-white text-slate-500 hover:text-purple-600 rounded-xl transition-all"
                            title="Work Orders"
                          >
                            <ClipboardList size={16} />
                          </button>
                          {(order.status === "PLANNED" || order.status === "SCHEDULED") && (
                            <button
                              onClick={() => handleStartProduction(order)}
                              className="p-1.5 hover:bg-white text-slate-500 hover:text-green-600 rounded-xl transition-all"
                              title="Start Production"
                            >
                              <Play size={16} />
                            </button>
                          )}
                          {order.status === "IN_PROGRESS" && (
                            <>
                              <button
                                onClick={() => handlePauseProduction(order)}
                                className="p-1.5 hover:bg-white text-slate-500 hover:text-yellow-600 rounded-xl transition-all"
                                title="Pause"
                              >
                                <Pause size={16} />
                              </button>
                              <button
                                onClick={() => handleCompleteProduction(order)}
                                className="p-1.5 hover:bg-white text-slate-500 hover:text-green-600 rounded-xl transition-all"
                                title="Complete"
                              >
                                <CheckCircle size={16} />
                              </button>
                            </>
                          )}
                          {order.status === "PLANNED" && (
                            <button
                              onClick={() => handleSchedule(order)}
                              className="p-1.5 hover:bg-white text-slate-500 hover:text-indigo-600 rounded-xl transition-all"
                              title="Schedule"
                            >
                              <Calendar size={16} />
                            </button>
                          )}
                          {order.status === "SCHEDULED" && (
                            <button
                              onClick={() => handleSendToShopFloor(order)}
                              className="p-1.5 hover:bg-white text-slate-500 hover:text-teal-600 rounded-xl transition-all"
                              title="Send to Shop Floor"
                            >
                              <Send size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 hover:bg-white text-slate-500 hover:text-rose-600 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                  <Factory className="text-slate-200" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Production Orders Found</h3>
                <p className="text-slate-400 text-sm max-w-xs">No production orders matching your filter criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                Showing{" "}
                <span className="text-slate-900">{filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{" "}
                <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of{" "}
                <span className="text-slate-900">{filteredOrders.length}</span> Orders
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all"
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
                        className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          currentPage === page
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-900/20 scale-105"
                            : "bg-white text-slate-500 border border-slate-200"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Production Order Details Modal - SRS 3.4.1 View Order Details */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Production Order Details</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.productionOrderId}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Sales Order ID</label>
                  <p className="font-semibold text-gray-900">{selectedOrder.salesOrderId}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Product Code</label>
                  <p className="font-semibold text-gray-900">{selectedOrder.productCode}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Created By</label>
                  <p className="font-semibold text-gray-900">{selectedOrder.createdBy}</p>
                </div>
              </div>

              {/* Quantity Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-orange-50 rounded-xl">
                  <label className="text-xs text-orange-500 uppercase">Order Quantity</label>
                  <p className="text-2xl font-bold text-orange-600">{selectedOrder.quantity.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <label className="text-xs text-green-500 uppercase">Completed</label>
                  <p className="text-2xl font-bold text-green-600">{selectedOrder.completedQuantity.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <label className="text-xs text-red-500 uppercase">Rejected</label>
                  <p className="text-2xl font-bold text-red-600">{selectedOrder.rejectedQuantity.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <label className="text-xs text-blue-500 uppercase">Remaining</label>
                  <p className="text-2xl font-bold text-blue-600">{(selectedOrder.quantity - selectedOrder.completedQuantity).toLocaleString()}</p>
                </div>
              </div>

              {/* Resource Allocation - SRS 3.7 */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Settings size={16} className="text-orange-500" /> Resource Allocation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu size={16} className="text-purple-500" />
                      <label className="text-xs text-gray-500 uppercase">Assigned Machine</label>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedOrder.assignedMachineName || "Not Assigned"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-blue-500" />
                      <label className="text-xs text-gray-500 uppercase">Assigned Operator</label>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedOrder.assignedOperatorName || "Not Assigned"}</p>
                  </div>
                </div>
              </div>

              {/* Work Instructions - SRS 3.9 */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ClipboardList size={16} className="text-orange-500" /> Work Instructions
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedOrder.workInstructions}</p>
                </div>
              </div>

              {/* Safety Instructions */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-500" /> Safety Instructions
                </h3>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-800 whitespace-pre-wrap">{selectedOrder.safetyInstructions}</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-xs text-gray-500 uppercase">Start Date</label>
                    <p className="font-semibold text-gray-900">{formatDate(selectedOrder.startDate) || "Not Started"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-xs text-gray-500 uppercase">End Date</label>
                    <p className="font-semibold text-gray-900">{formatDate(selectedOrder.endDate) || "In Progress"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-xs text-gray-500 uppercase">Deadline</label>
                    <p className="font-semibold text-gray-900">{formatDate(selectedOrder.deadline)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Orders Modal - SRS 3.6.2 Work Order Assignment */}
      {showWorkOrdersModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Work Orders</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.productionOrderId} - {selectedOrder.productName}</p>
              </div>
              <button onClick={() => setShowWorkOrdersModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {selectedOrder.workOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No work orders created yet.</p>
                  <button
                    onClick={() => navigate(`/production/orders/schedule/${selectedOrder.id}`)}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600"
                  >
                    Create Work Orders
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedOrder.workOrders.map((wo) => (
                    <div key={wo.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800">{wo.workOrderId} - {wo.taskName}</h3>
                          <p className="text-sm text-gray-500 mt-1">{wo.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          wo.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          wo.status === "IN_PROGRESS" ? "bg-orange-100 text-orange-700" :
                          wo.status === "BLOCKED" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {wo.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <label className="text-xs text-gray-500">Machine</label>
                          <p className="font-medium">{wo.machineName}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Operator</label>
                          <p className="font-medium">{wo.operatorName}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Shift</label>
                          <p className="font-medium">{getShiftLabel(wo.shift)}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Progress</label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-20">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${wo.progress}%` }} />
                            </div>
                            <span className="text-xs">{wo.progress}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-orange-600 font-medium">View Instructions & Safety Notes</summary>
                          <div className="mt-2 space-y-2 pl-4">
                            <div>
                              <label className="text-xs text-gray-500 block">Instructions:</label>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {wo.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                              </ul>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block">Safety Notes:</label>
                              <ul className="list-disc list-inside text-sm text-yellow-600">
                                {wo.safetyNotes.map((note, i) => <li key={i}>{note}</li>)}
                              </ul>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={() => setShowWorkOrdersModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal - SRS 3.8 Production Scheduling */}
      {showScheduleModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Schedule Production</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Shift</label>
                <select className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                  <option value="MORNING">Morning (6AM-2PM)</option>
                  <option value="EVENING">Evening (2PM-10PM)</option>
                  <option value="NIGHT">Night (10PM-6AM)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Assign Machine</label>
                <select className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                  {mockMachines.map(m => (
                    <option key={m.id} value={m.id}>{m.machineName} - {m.status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Assign Operator</label>
                <select className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                  {mockOperators.map(op => (
                    <option key={op.id} value={op.id}>{op.name} - {op.role} ({op.status})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updatedOrders = orders.map((o) =>
                    o.id === selectedOrder.id
                      ? { ...o, status: "SCHEDULED" as ProductionOrderStatus, shift: "MORNING" as Shift }
                      : o
                  );
                  setOrders(updatedOrders);
                  setShowScheduleModal(false);
                  alert(`Production order ${selectedOrder.productionOrderId} scheduled successfully.`);
                }}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Close icon component
const X: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default ProductionOrderList;