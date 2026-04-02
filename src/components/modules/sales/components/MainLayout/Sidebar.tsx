import { useNavigate, useLocation, Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-64 bg-white h-screen border-r border-[#005d5230] flex flex-col sticky top-0 overflow-hidden">

      {/* 1. FIXED HEADER - Always at the top */}
      <div className="shrink-0 p-6 py-[21.5px] flex items-center gap-3 border-b border-[#005d5230] bg-white z-10">
        <Link to="/sales/dashboard" className="bg-[#005d52] p-2 rounded-xl text-white shadow-md">
          <img src="/icons/SalesDashboard.svg" className="h-5 w-5" alt="Logo" />
        </Link>
        <span className="font-bold text-xl text-gray-800 tracking-tight">Sales</span>
      </div>

      {/* 2. SCROLLABLE MENU - Only this part scrolls */}
      <nav
        className="flex-1 px-4 py-4 space-y-2 overflow-y-auto 
        [scrollbar-width:none]
        [-ms-overflow-style:none] 
        [&::-webkit-scrollbar]:hidden"
      >
        {/* Dashboard */}
        <button
          onClick={() => navigate("/sales/dashboard")}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/sales/dashboard")
            ? "bg-[#005d52] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/dashboard-monitor.svg"
            className={`h-5 w-5 ${isActive("/sales/dashboard") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/sales/dashboard") ? "font-bold" : "font-semibold"} text-sm`}>Dashboard</span>
        </button>

        {/* Lead */}
        <button
          onClick={() => navigate("/sales/leads")}
          className={`outline-none w-full flex items-center gap-3 px-4 cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/sales/leads")
            ? "bg-[#005d52] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/lead-management.svg"
            className={`h-5 w-5 ${isActive("/sales/leads") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/sales/leads") ? "font-bold" : "font-semibold"} text-sm`}>Lead</span>
        </button>

        {/* Employees */}
        <button
          onClick={() => navigate("/sales/employees")}
          className={`outline-none w-full flex items-center gap-3 px-4 cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/sales/employees")
            ? "bg-[#005d52] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/users2.svg"
            className={`h-5 w-5 ${isActive("/sales/employees") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/sales/employees") ? "font-bold" : "font-semibold"} text-sm`}>Employees</span>
        </button>

        {/* Opportunities */}
        <button
          onClick={() => navigate("/sales/opportunities")}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/sales/opportunities")
            ? "bg-[#005d52] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/deal.svg"
            className={`h-5 w-5 ${isActive("/sales/opportunities") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/sales/opportunities") ? "font-bold" : "font-semibold"} text-sm`}>Opportunities</span>
        </button>

        {/* Quotation */}
        <button
          onClick={() => navigate("/sales/quotation")}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/sales/quotation")
            ? "bg-[#005d52] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/inr2.svg"
            className={`h-5 w-5 ${isActive("/sales/quotation") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/sales/quotation") ? "font-bold" : "font-semibold"} text-sm`}>Quotation</span>
        </button>

        {/* Orders */}
        <button
          onClick={() => navigate("/sales/orders")}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/sales/orders")

            ? "bg-[#005d52] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/order.svg"
            className={`h-5 w-5 ${isActive("/sales/orders") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/sales/orders") ? "font-bold" : "font-semibold"} text-sm`}>Orders</span>
        </button>

        {/* Production */}
        <button
          onClick={() => navigate("/sales/production")}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/sales/production")
            ? "bg-[#005d52] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/factory.svg"
            className={`h-5 w-5 ${isActive("/sales/production") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/sales/production") ? "font-bold" : "font-semibold"} text-sm`}>Production</span>
        </button>

        {/* Reports */}
        <button
          onClick={() => navigate("/sales/reports")}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/sales/reports")
            ? "bg-[#005d52] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/data-report.svg"
            className={`h-5 w-5 ${isActive("/sales/reports") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/sales/reports") ? "font-bold" : "font-semibold"} text-sm`}>Reports & Analytics</span>
        </button>
      </nav>

      {/* 3. FIXED FOOTER - Always at the bottom */}
      <div className="shrink-0 p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <img
            src="/icons/logout.svg"
            className="h-5 w-5 opacity-60 group-hover:opacity-100 group-hover:filter-none transition-all"
            alt="Logout"
            style={{ filter: 'grayscale(100%)' }}
          />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;