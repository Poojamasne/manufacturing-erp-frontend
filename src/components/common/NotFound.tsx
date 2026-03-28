import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center">

      {/* IMAGE */}
      <img
        src="https://cdn.dribbble.com/userupload/42200473/file/original-6fb8267ef95c5fd4d783e6aec7476946.png?resize=1600x1200"
        alt="Not Found"
        className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain mb-6"
      />

      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
        Page Not Found
      </h1>

      {/* DESCRIPTION */}
      <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-md">
        The page you are looking for doesn’t exist or has been moved.
      </p>

      {/* BUTTON */}
      <button
        onClick={() => navigate(-1 || "/")}
        className="mt-6 mb-1 bg-black text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:bg-gray-900 cursor-pointer active:scale-95 transition-all duration-200"
      >
        Go to Back
      </button>
    </div>
  );
};

export default NotFound;