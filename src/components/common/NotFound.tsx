import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>

      <p className="mt-4 text-xl font-semibold text-gray-800">
        Page Not Found
      </p>

      <p className="mt-2 text-gray-500 max-w-md">
        The page you are looking for doesn’t exist or has been moved.
      </p>

      <button
        onClick={() => navigate("/login")}
        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Go to Login
      </button>
    </div>
  );
};

export default NotFound;