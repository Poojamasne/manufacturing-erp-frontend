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
        <Link to="/purchase/dashboard" className="bg-[#F59E0B] p-2 rounded-xl text-white shadow-md">
          <img src="/icons/Purchase_manager/Purchase-Dashboard.svg" className="h-5 w-5 brightness-0 invert" alt="Logo" />
        </Link>
        <span className="font-bold text-xl text-gray-800 tracking-tight">Purchase</span>
      </div>

      {/* SCROLLABLE MENU */}
      <nav
        className="flex-1 px-4 py-4 space-y-2 overflow-y-auto 
        [scrollbar-width:none]
        [-ms-overflow-style:none] 
        [&::-webkit-scrollbar]:hidden"
      >

        {/* purchase manager Dashboard */}
        <button
          onClick={() => {
            navigate("/purchase/dashboard")
            document.title = "Manufacturing ERP - Purchase Dashboard";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/purchase/dashboard")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Purchase_manager/Purchase-Dashboard.svg"
            className={`h-5 w-5 ${isActive("/purchase/dashboard") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/purchase/dashboard") ? "font-bold" : "font-semibold"} text-sm`}>Dashboard</span>
        </button>

        {/* purchase Requests */}
        <button
          onClick={() => {
            navigate("/purchase/purchase-requests")
            document.title = "Manufacturing ERP - Purchase Requests";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/purchase/purchase-requests")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Purchase_manager/Create-PR.svg"
            className={`h-5 w-5 ${isActive("/purchase/purchase-requests") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/purchase/purchase-requests") ? "font-bold" : "font-semibold"} text-sm`}>Purchase Requests</span>
        </button>

        {/* Vendor Management */}
        <button
          onClick={() => {
            navigate("/purchase/vendors")
            document.title = "Manufacturing ERP - Vendor Management";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/purchase/vendors")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Purchase_manager/Vendors.svg"
            className={`h-5 w-5 ${isActive("/purchase/vendors") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/purchase/vendors") ? "font-bold" : "font-semibold"} text-sm`}>Vendor Management</span>
        </button>

        {/* RFQ Management */}
        <button
          onClick={() => {
            navigate("/purchase/rfqs")
            document.title = "Manufacturing ERP - RFQ Management";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/purchase/rfqs")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Purchase_manager/RFQs.svg"
            className={`h-5 w-5 ${isActive("/purchase/rfqs") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/purchase/rfqs") ? "font-bold" : "font-semibold"} text-sm`}>RFQ Management</span>
        </button>

        {/* Vendor Quotation Management */}
        <button
          onClick={() => {
            navigate("/purchase/vendor-quotations")
            document.title = "Manufacturing ERP - Vendor Quotation Management";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/purchase/vendor-quotations")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Purchase_manager/Quotation.svg"
            className={`h-5 w-5 ${isActive("/purchase/vendor-quotations") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/purchase/vendor-quotations") ? "font-bold" : "font-semibold"} text-sm`}>Vendor Quotations</span>
        </button>

        {/* Purchase Order Management */}
        <button
          onClick={() => {
            navigate("/purchase/purchase-orders")
            document.title = "Manufacturing ERP - Purchase Order Management";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/purchase/purchase-orders")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Purchase_manager/PO.svg"
            className={`h-5 w-5 ${isActive("/purchase/purchase-orders") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/purchase/purchase-orders") ? "font-bold" : "font-semibold"} text-sm`}>Purchase Orders</span>
        </button>

        {/* Goods Receipt Management */}
        <button
          onClick={() => {
            navigate("/purchase/goods-receipts")
            document.title = "Manufacturing ERP - Goods Receipt Management";
          }}
          className={`outline-none w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive("/purchase/goods-receipts")
            ? "bg-[#F59E0B] text-white shadow-md"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <img
            src="/icons/Purchase_manager/GRN.svg"
            className={`h-5 w-5 ${isActive("/purchase/goods-receipts") ? "" : "invert opacity-60"}`}
            alt=""
          />
          <span className={`${isActive("/purchase/goods-receipts") ? "font-bold" : "font-semibold"} text-sm`}>Goods Receipts</span>
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