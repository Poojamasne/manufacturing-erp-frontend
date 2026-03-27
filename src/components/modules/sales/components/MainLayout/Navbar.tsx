import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  }
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="relative w-96">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-gray-100 hover:border hover:border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-200 outline-none text-gray-600"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Notification */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <img src="/icons/Bell.svg" className="h-6 w-6" alt="" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 leading-none">Rahul Jagtap</p>
            <p className="text-xs text-gray-500 mt-1">Sales Manager</p>
          </div>
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm tracking-tighter">
            SM
          </div>
        </div>
        <button
          onClick={onLogout}
          className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <img src="/icons/logout.svg" className="h-6 w-6" alt="" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;