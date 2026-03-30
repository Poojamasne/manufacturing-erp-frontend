import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="h-16 sm:h-20 bg-[#f4f7f6] flex items-center justify-between px-4 sm:px-6 lg:px-10 border-b border-gray-100/50 sticky top-0 z-30">
      
      {/* LEFT: Menu & Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        
        {/* Mobile Menu Button - Visible only on small screens */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white text-gray-600 transition-colors"
          aria-label="Open Menu"
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Search Bar: Hidden on mobile, visible from 'md' (tablet) upwards */}
        <div className="hidden md:block relative w-full max-w-70 lg:max-w-100">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
             <img src="/icons/search.svg" className="h-4 w-4 opacity-30" alt="" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-white border border-transparent rounded-full py-2.5 pl-11 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-[#005d52]/20 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* RIGHT: Utility Icons & Profile */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6">
        
        {/* Utility Icons Group: Hidden on very small screens, visible from 'sm' upwards */}
        <div className="hidden sm:flex items-center gap-1 md:gap-2">
          {/* Add Note */}
          <button 
            title="Add Note"
            className="p-2.5 text-gray-500 hover:bg-white rounded-full transition-all hover:text-[#005d52] active:scale-90"
          >
            <img src="/icons/note.svg" className="h-5 w-5 opacity-70" alt="Add Note" />
          </button>

          {/* Calendar */}
          <button 
            title="Calendar"
            className="p-2.5 text-gray-500 hover:bg-white rounded-full transition-all hover:text-[#005d52] active:scale-90"
          >
            <img src="/icons/calendar.svg" className="h-5 w-5 opacity-70" alt="Calendar" />
          </button>
        </div>

        {/* Notification: Always visible but adjusted padding for mobile */}
        <button className="relative p-2.5 text-gray-500 hover:bg-white rounded-full transition-colors active:scale-90">
          <img src="/icons/Bell.svg" className="h-5 w-5 sm:h-6 sm:w-6 opacity-70" alt="Notifications" />
          <span className="absolute top-2 right-2 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-[#e63946] text-[8px] sm:text-[9px] text-white rounded-full flex items-center justify-center border-2 border-[#f4f7f6] font-bold">
            3
          </span>
        </button>

        {/* Divider - Hidden on Mobile */}
        <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1"></div>

        {/* Profile Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Avatar - Always visible */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-2 border-white shadow-sm rounded-full overflow-hidden flex items-center justify-center text-xs sm:text-sm font-bold text-[#005d52] shrink-0">
            SM
          </div>
          
          {/* Name & Role - Hidden on Mobile and Tablet, visible on Desktop (lg) */}
          <div className="hidden lg:block text-left min-w-fit">
            <p className="text-xs font-bold text-gray-800 leading-tight">Rahul Jagtap</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Sales Manager</p>
          </div>
        </div>

        {/* Logout - Always visible */}
        <button
          onClick={onLogout}
          title="Logout"
          className="p-2.5 text-gray-400 hover:bg-white rounded-full hover:text-red-500 transition-all active:scale-90"
        >
          <img src="/icons/logout.svg" className="h-5 w-5 opacity-60" alt="Logout" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;