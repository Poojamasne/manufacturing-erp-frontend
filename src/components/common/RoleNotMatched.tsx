import React from "react";
import { useNavigate } from "react-router-dom";

const RoleNotMatched: React.FC = () => {
    const navigate = useNavigate();
	return (
		<div className="h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
			<h1 className="text-5xl font-bold text-red-600">Access Denied</h1>

			<p className="mt-4 text-lg font-semibold text-gray-800">
				Your role does not have permission to view this page.
			</p>

			<div className="mt-6 flex gap-3">
				<button
					onClick={() => navigate("/")}
					className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
				>
					Go to Dashboard
				</button>

				<button
					onClick={() => {
						localStorage.clear();
						navigate("/");
					}}
					className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
				>
					Logout
				</button>
			</div>
		</div>
	);
};

export default RoleNotMatched;

