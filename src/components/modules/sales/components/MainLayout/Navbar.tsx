import React from "react";

interface NavbarProps {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ setIsSidebarOpen }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  return (
    <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold">Sales Dashboard</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-gray-600">
          Welcome, User
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;