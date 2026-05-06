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
        <Link to="/inventory/dashboard" className="bg-[#F59E0B] p-2 rounded-xl text-white shadow-md">
          <img src="/icons/Production_Icons/Product.svg" className="h-5 w-5 brightness-0 invert" alt="Logo" />
        </Link>
        <span className="font-bold text-xl text-gray-800 tracking-tight">Inventory</span>
      </div>

      {/* SCROLLABLE MENU */}
      <nav
        className="flex-1 px-4 py-4 space-y-2 overflow-y-auto 
        [scrollbar-width:none]
        [-ms-overflow-style:none] 
        [&::-webkit-scrollbar]:hidden"
      >
        {/* inventory Dashboard */}
        <button
          onClick={() => {
            navigate("/inventory/dashboard")
            document.title = "Manufacturing ERP - Production Dashboard";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/inventory/dashboard")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/dashboard-monitor.svg"
            className={`h-5 w-5 ${isActive("/inventory/dashboard") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/inventory/dashboard") ? "font-bold" : "font-semibold"} text-sm`}>Dashboard</span>
        </button> 
        {/* inventory Dashboard */}
        <button
          onClick={() => {
            navigate("/inventory/material-receipts")
            document.title = "Manufacturing ERP - Production Dashboard";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/inventory/material-receipts")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/dashboard-monitor.svg"
            className={`h-5 w-5 ${isActive("/inventory/material-receipts") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/inventory/material-receipts") ? "font-bold" : "font-semibold"} text-sm`}>Material Receipts</span>
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