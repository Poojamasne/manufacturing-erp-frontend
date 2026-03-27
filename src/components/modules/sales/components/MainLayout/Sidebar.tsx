import { useNavigate, useLocation, Link } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname.startsWith(path);

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 flex flex-col">
      
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <Link to="/sales/dashboard" className="bg-black p-2 rounded-lg text-white">
          <img src="/icons/salesDashboardLogo.svg" className="h-8 w-8" alt="" />
        </Link>
        <span className="font-bold text-xl text-gray-800">Sales</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        {/* Dashboard */}
        <button
          onClick={() => navigate("/sales/dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/sales/dashboard")
              ? "bg-black text-white shadow-lg"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <img
            src="/icons/dashboard-monitor.svg"
            className={`h-5 w-5 ${
              isActive("/sales/dashboard")
                ? "brightness-0 invert"   // white icon
                : "brightness-0"          // black icon
            }`}
            alt=""
          />
          <span className="font-medium">Dashboard</span>
        </button>

        {/* Lead */}
        <button
          onClick={() => navigate("/sales/new-lead")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/sales/new-lead")
              ? "bg-black text-white shadow-lg"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <img
            src="/icons/lead-management.svg"
            className={`h-5 w-5 ${
              isActive("/sales/new-lead")
                ? "brightness-0 invert"
                : "brightness-0"
            }`}
            alt=""
          />
          <span className="font-medium">Lead</span>
        </button>

        {/* Employees */}
        <button
          onClick={() => navigate("/sales/employees")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/sales/employees")
              ? "bg-black text-white shadow-lg"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <img
            src="/icons/users2.svg"
            className={`h-5 w-5 ${
              isActive("/sales/employees")
                ? "brightness-0 invert"
                : "brightness-0"
            }`}
            alt=""
          />
          <span className="font-medium">Employees</span>
        </button>

        {/* Reports */}
        <button
          onClick={() => navigate("/sales/reports")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/sales/reports")
              ? "bg-black text-white shadow-lg"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <img
            src="/icons/data-report.svg"
            className={`h-5 w-5 ${
              isActive("/sales/reports")
                ? "brightness-0 invert"
                : "brightness-0"
            }`}
            alt=""
          />
          <span className="font-medium">Reports & Analytics</span>
        </button>

      </nav>
    </div>
  );
};

export default Sidebar;