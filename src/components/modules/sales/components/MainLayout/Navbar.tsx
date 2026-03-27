import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      
      {/* Left Side */}
      <div className="flex items-center gap-3">
        
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          ☰
        </button>

        {/* Search */}
        <div className="hidden sm:block relative w-48 md:w-72 lg:w-96">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-100 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-gray-200 outline-none"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 sm:gap-5 lg:gap-6">
        
        {/* Notification */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <img src="/icons/Bell.svg" className="h-5 w-5" alt="" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-900">Rahul Jagtap</p>
            <p className="text-xs text-gray-500">Sales Manager</p>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
            SM
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <img src="/icons/logout.svg" className="h-5 w-5" alt="" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;