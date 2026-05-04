import { useNavigate, useLocation, Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("designation");
    localStorage.removeItem("userName");
    document.title = "Manufacturing ERP - Login";
    navigate("/");
  };

  return (
    <div className="w-64 bg-white h-screen border-r border-[#F59E0B30] flex flex-col sticky top-0 overflow-hidden">

      {/* FIXED HEADER */}
      <div className="shrink-0 p-6 py-[21.5px] flex items-center gap-3 border-b border-[#F59E0B30] bg-white z-10">
        <Link to="/production/dashboard" className="bg-[#F59E0B] p-2 rounded-xl text-white shadow-md">
          <img src="/icons/Production_Icons/panel-icon.svg" className="h-5 w-5 brightness-0 invert" alt="Logo" />
        </Link>
        <span className="font-bold text-xl text-gray-800 tracking-tight">Production</span>
      </div>

      {/* SCROLLABLE MENU */}
      <nav
        className="flex-1 px-4 py-4 space-y-2 overflow-y-auto 
        [scrollbar-width:none]
        [-ms-overflow-style:none] 
        [&::-webkit-scrollbar]:hidden"
      >

        <button
          onClick={() => {
            navigate("/production/dashboard")
            document.title = "Manufacturing ERP - Production Dashboard";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/production/dashboard")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/dashboard-monitor.svg"
            className={`h-5 w-5 ${isActive("/production/dashboard") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/dashboard") ? "font-bold" : "font-semibold"} text-sm`}>Dashboard</span>
        </button>

        {/* Sales Orders */}
        <button
          onClick={() => {
            navigate("/production/sales-orders")
            document.title = "Manufacturing ERP - Production Sales Orders"
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/production/sales-orders")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Production_Icons/Sales-Order.svg"
            className={`h-5 w-5 ${isActive("/production/sales-orders") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/sales-orders") ? "font-bold" : "font-semibold"} text-sm`}>
            Sales Orders
          </span>
        </button>

        {/* Production Planning */}
        <button
          onClick={() => {
            navigate("/production/planning")
            document.title = "Manufacturing ERP - Production Planning";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/production/planning")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Production_Icons/Planning.svg"
            className={`h-5 w-5 ${isActive("/production/planning") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/planning") ? "font-bold" : "font-semibold"} text-sm`}>
            Production Planning
          </span>
        </button>

        {/* Production Orders */}
        <button
          onClick={() => {
            navigate("/production/orders")
            document.title = "Manufacturing ERP - Production Orders"
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/production/orders")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Production_Icons/Production.svg"
            className={`h-5 w-5 ${isActive("/production/orders") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/orders") ? "font-bold" : "font-semibold"} text-sm`}>
            Production Orders
          </span>
        </button>

        {/* Work Orders */}
        <button
          onClick={() => {
            navigate("/production/work-orders");
            document.title = "Manufacturing ERP - Production Work Orders";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/production/work-orders")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Production_Icons/Work-Order.svg"
            className={`h-5 w-5 ${isActive("/production/work-orders") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/work-orders") ? "font-bold" : "font-semibold"} text-sm`}>
            Work Orders
          </span>
        </button>

 {/* Resources */}
        <button
          onClick={() => {
            navigate("/production/resources");
            document.title = "Manufacturing ERP - Production Resources";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/production/resources")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Resources.svg"
            className={`h-5 w-5 ${isActive("/production/resources") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/resources") ? "font-bold" : "font-semibold"} text-sm`}>
            Resources
          </span>
        </button>

        {/* Scheduling */}
        <button
          onClick={() => {
            navigate("/production/scheduling");
            document.title = "Manufacturing ERP - Production Scheduling";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/production/scheduling")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Production_Icons/Scheduling.svg"
            className={`h-5 w-5 ${isActive("/production/scheduling") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/scheduling") ? "font-bold" : "font-semibold"} text-sm`}>
            Scheduling
          </span>
        </button>

        {/* Shop Floor */}
        <button
          onClick={() => {
            navigate("/production/shop-floor");
            document.title = "Manufacturing ERP - Production Shop Floor";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/production/shop-floor")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Production_Icons/Shop-Floor2.svg"
            className={`h-5 w-5 ${isActive("/production/shop-floor") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/shop-floor") ? "font-bold" : "font-semibold"} text-sm`}>
            Shop Floor
          </span>
        </button>

        {/* Reports */}
        <button
          onClick={() => {
            navigate("/production/reports");
            document.title = "Manufacturing ERP - Production Reports & Analytics";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/production/reports")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/data-report.svg"
            className={`h-5 w-5 ${isActive("/production/reports") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/reports") ? "font-bold" : "font-semibold"} text-sm`}>
            Reports & Analytics
          </span>
        </button>

        {/* All Purchase Requests */}
        <button
          onClick={() => {
            navigate("/production/purchase-requests");
            document.title = "Manufacturing ERP - Production Purchase Requests";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 hover:cursor-pointer py-3 rounded-xl transition-all duration-200 ${isActive("/production/purchase-requests")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Production_Icons/Invoice.svg"
            className={`h-5 w-5 ${isActive("/production/purchase-requests") ? "brightness-0 invert" : "opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/production/purchase-requests") ? "font-bold" : "font-semibold"} text-sm`}>
            All Purchase Requests
          </span>
        </button>
      </nav>

      {/* FIXED FOOTER */}
      <div className=" outline-none shrink-0 p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleLogout}
          className=" outline-none group w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl text-gray-500 hover:bg-red-50 hover:text-amber-500 transition-all duration-200"
        >
          <img
            src="/icons/logout.svg"
            className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-all"
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