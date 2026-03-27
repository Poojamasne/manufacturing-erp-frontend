// import React, { useState } from "react";
// import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// interface User {
//   id: string;
//   email: string;
//   password: string;
//   fullName: string;
//   role: string;
//   module: string;
//   department: string;
// }

// interface LoginProps {
//   onLoginSuccess: (user: User) => void;
// }

// const USERS: User[] = [
//   { id: '1', email: 'admin@erp.com', password: 'admin123', fullName: 'Rajesh Sharma', role: 'super_admin', module: 'admin', department: 'IT Administration' },
//   { id: '2', email: 'salesmanager@erp.com', password: 'sales123', fullName: 'Priya Mehta', role: 'sales_manager', module: 'sales', department: 'Sales' },
//   { id: '3', email: 'salesexec@erp.com', password: 'sales123', fullName: 'Rahul Gupta', role: 'sales_executive', module: 'sales', department: 'Sales' },
//   { id: '4', email: 'purchasemanager@erp.com', password: 'purchase123', fullName: 'Vikram Singh', role: 'purchase_manager', module: 'purchase', department: 'Purchase' },
//   { id: '5', email: 'inventorymanager@erp.com', password: 'inventory123', fullName: 'Suresh Kumar', role: 'inventory_manager', module: 'inventory', department: 'Inventory' },
//   { id: '6', email: 'productionmanager@erp.com', password: 'production123', fullName: 'Deepak Joshi', role: 'production_manager', module: 'production', department: 'Production' },
//   { id: '7', email: 'operator@erp.com', password: 'operator123', fullName: 'Ramesh Kumar', role: 'operator', module: 'operator', department: 'Production' },
//   { id: '8', email: 'qualitymanager@erp.com', password: 'quality123', fullName: 'Sanjay Mehta', role: 'quality_manager', module: 'quality', department: 'Quality Assurance' },
//   { id: '9', email: 'hrmanager@erp.com', password: 'hr1234', fullName: 'Kavita Reddy', role: 'hr_manager', module: 'hrms', department: 'Human Resources' },
//   { id: '10', email: 'accountant@erp.com', password: 'finance123', fullName: 'Seema Joshi', role: 'accountant', module: 'finance', department: 'Finance' },
// ];

// export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [error, setError] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   // EMAIL VALIDATION
//   const validateEmail = (email: string) => {
//     if (!email) return "Email is required";
//     if (email.includes(" ")) return "No spaces allowed";

//     const atCount = (email.match(/@/g) || []).length;
//     if (atCount === 0) return "Missing @";
//     if (atCount > 1) return "Multiple @ not allowed";

//     const [localPart, domainPart] = email.split("@");
//     if (!localPart) return "Missing username";
//     if (!domainPart) return "Missing domain";

//     if (email.includes("..")) return "No consecutive dots";
//     if (email.startsWith(".") || email.endsWith(".")) return "Invalid dot";

//     if (!domainPart.includes(".")) return "Domain must contain extension";

//     const ext = domainPart.split(".").pop();
//     const allowed = ["com", "in", "org", "co"];
//     if (!allowed.includes(ext || "")) return "Invalid domain";

//     return "";
//   };

//   // PASSWORD VALIDATION
//   const validatePassword = (password: string) => {
//     if (!password) return "Password required";
//     if (password.length < 6) return "Minimum 6 characters";
//     return "";
//   };

//   // SUBMIT
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const eErr = validateEmail(email);
//     const pErr = validatePassword(password);

//     setEmailError(eErr);
//     setPasswordError(pErr);

//     if (eErr || pErr) return;

//     setLoading(true);
//     setError("");

//     setTimeout(() => {
//       const user = USERS.find(
//         (u) => u.email === email && u.password === password
//       );

//       if (user) onLoginSuccess(user);
//       else setError("Invalid credentials");

//       setLoading(false);
//     }, 500);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

//       {/* MAIN CONTAINER */}
//       <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-600 overflow-hidden flex flex-col md:flex-row shadow-lg">
//         {/* LEFT IMAGE (50%) */}
//         <div className="hidden md:block md:w-1/2 w-full overflow-hidden rounded-l-3xl relative z-10 shadow-[10px_0_25px_rgba(0,0,0,0.25)]">          <img
//           src="https://img.freepik.com/free-photo/engineer-working-with-robot-modern-industrial-facility_23-2151962519.jpg"
//           className="w-full h-full object-cover"
//         />
//         </div>

//         {/* RIGHT PANEL (50%) */}
//         <div className="w-full md:w-1/2 p-10 flex items-center justify-center rounded-r-3xl bg-white">          <div className="w-full max-w-md mx-auto">

//           {/* LOGO */}
//           <div className="flex justify-center mb-4">
//             <img
//               src="https://www.zonixtec.com/Assets/Logo.svg"
//               alt="Logo"
//               className="w-16 h-16 rounded-full border border-gray-200 shadow-sm p-2 bg-black"
//             />
//           </div>

//           {/* HEADINGS */}
//           <h2 className="text-xl font-bold text-center mb-1 text-gray-800">
//             Welcome Back to Manufacturing ERP
//           </h2>

//           <h3 className="text-sm font-medium text-center mb-6 text-gray-600">
//             Sign in to your account
//           </h3>

//           <form onSubmit={handleSubmit} className="space-y-5">

//             {/* EMAIL */}
//             <div className="flex flex-col items-center w-full">
//               <div className="relative w-full max-w-sm">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />

//                 <input
//                   type="email"
//                   placeholder="Email address"
//                   className={`w-full pl-10 pr-3 py-3 text-sm rounded-md border bg-white
//                     transition-all duration-200 hover:shadow-sm focus:outline-none
//                     ${emailError
//                       ? "border-red-400 focus:ring-1 focus:ring-red-400"
//                       : email
//                         ? "border-green-500 focus:ring-1 focus:ring-green-500"
//                         : "border-gray-300 focus:ring-1 focus:ring-slate-600"
//                     }`}
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     setEmailError(validateEmail(e.target.value));
//                     setError("");
//                   }}
//                 />
//               </div>

//               {emailError ? (
//                 <p className="text-red-500 text-xs mt-1 w-full max-w-sm text-left">
//                   {emailError}
//                 </p>
//               ) : email ? (
//                 <p className="text-green-600 text-xs mt-1 w-full max-w-sm text-left">
//                   Valid email
//                 </p>
//               ) : null}
//             </div>

//             {/* PASSWORD */}
//             <div className="flex flex-col items-center w-full">
//               <div className="relative w-full max-w-sm">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />

//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   className={`w-full pl-10 pr-10 py-3 text-sm rounded-md border bg-white
//                     transition-all duration-200 hover:shadow-sm focus:outline-none
//                     ${passwordError
//                       ? "border-red-400 focus:ring-1 focus:ring-red-400"
//                       : password
//                         ? "border-green-500 focus:ring-1 focus:ring-green-500"
//                         : "border-gray-300 focus:ring-1 focus:ring-slate-600"
//                     }`}
//                   value={password}
//                   onChange={(e) => {
//                     setPassword(e.target.value);
//                     setPasswordError(validatePassword(e.target.value));
//                     setError("");
//                   }}
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>

//               {passwordError ? (
//                 <p className="text-red-500 text-xs mt-1 w-full max-w-sm text-left">
//                   {passwordError}
//                 </p>
//               ) : password ? (
//                 <p className="text-green-600 text-xs mt-1 w-full max-w-sm text-left">
//                   Looks good
//                 </p>
//               ) : null}
//             </div>

//             {/* ERROR */}
//             {error && (
//               <div className="text-red-500 text-sm text-center">{error}</div>
//             )}

//             {/* BUTTON */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full max-w-sm mx-auto block py-3 mt-2 text-sm rounded-md text-white font-medium
//                 bg-slate-900 hover:bg-slate-800 transition disabled:opacity-50"
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>

//           </form>

//           <p className="text-xs text-gray-600 text-center mt-5">
//             ©{new Date().getFullYear()} Manufacturing ERP
//           </p>

//         </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  module: string;
  department: string;
}

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const USERS: User[] = [
  { id: '1', email: 'admin@erp.com', password: 'admin123', fullName: 'Rajesh Sharma', role: 'super_admin', module: 'admin', department: 'IT Administration' },
  { id: '2', email: 'salesmanager@erp.com', password: 'sales123', fullName: 'Priya Mehta', role: 'sales_manager', module: 'sales', department: 'Sales' },
  { id: '3', email: 'salesexec@erp.com', password: 'sales123', fullName: 'Rahul Gupta', role: 'sales_executive', module: 'sales', department: 'Sales' },
  { id: '4', email: 'purchasemanager@erp.com', password: 'purchase123', fullName: 'Vikram Singh', role: 'purchase_manager', module: 'purchase', department: 'Purchase' },
  { id: '5', email: 'inventorymanager@erp.com', password: 'inventory123', fullName: 'Suresh Kumar', role: 'inventory_manager', module: 'inventory', department: 'Inventory' },
  { id: '6', email: 'productionmanager@erp.com', password: 'production123', fullName: 'Deepak Joshi', role: 'production_manager', module: 'production', department: 'Production' },
  { id: '7', email: 'operator@erp.com', password: 'operator123', fullName: 'Ramesh Kumar', role: 'operator', module: 'operator', department: 'Production' },
  { id: '8', email: 'qualitymanager@erp.com', password: 'quality123', fullName: 'Sanjay Mehta', role: 'quality_manager', module: 'quality', department: 'Quality Assurance' },
  { id: '9', email: 'hrmanager@erp.com', password: 'hr1234', fullName: 'Kavita Reddy', role: 'hr_manager', module: 'hrms', department: 'Human Resources' },
  { id: '10', email: 'accountant@erp.com', password: 'finance123', fullName: 'Seema Joshi', role: 'accountant', module: 'finance', department: 'Finance' },
];

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (email.includes(" ")) return "No spaces allowed";
    const atCount = (email.match(/@/g) || []).length;
    if (atCount === 0) return "Missing @";
    if (atCount > 1) return "Multiple @ not allowed";
    const [localPart, domainPart] = email.split("@");
    if (!localPart) return "Missing username";
    if (!domainPart) return "Missing domain";
    if (email.includes("..")) return "No consecutive dots";
    if (email.startsWith(".") || email.endsWith(".")) return "Invalid dot";
    if (!domainPart.includes(".")) return "Domain must contain extension";
    const ext = domainPart.split(".").pop();
    const allowed = ["com", "in", "org", "co"];
    if (!allowed.includes(ext || "")) return "Invalid domain";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password required";
    if (password.length < 6) return "Minimum 6 characters";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;
    setLoading(true);
    setError("");
    setTimeout(() => {
      const user = USERS.find((u) => u.email === email && u.password === password);
      if (user) onLoginSuccess(user);
      else setError("Invalid credentials");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-600 overflow-hidden flex flex-col md:flex-row shadow-lg">
        
        {/* LEFT IMAGE */}
        <div className="hidden md:block md:w-1/2 w-full overflow-hidden rounded-l-3xl relative z-10 shadow-[10px_0_25px_rgba(0,0,0,0.25)]">
          <img
            src="https://img.freepik.com/free-photo/engineer-working-with-robot-modern-industrial-facility_23-2151962519.jpg"
            className="w-full h-full object-cover"
            alt="Industrial robot"
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-10 flex items-center justify-center rounded-r-3xl bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <img
                src="https://www.zonixtec.com/Assets/Logo.svg"
                alt="Logo"
                className="w-16 h-16 rounded-full border border-gray-200 shadow-sm p-2 bg-black"
              />
            </div>

            <h2 className="text-xl font-bold text-center mb-1 text-gray-800">
              Welcome Back to Manufacturing ERP
            </h2>
            <h3 className="text-sm font-medium text-center mb-6 text-gray-600">
              Sign in to your account
            </h3>

            <form onSubmit={handleSubmit} className="space-y-2"> {/* Reduced spacing to handle reserved slots */}

              {/* EMAIL */}
              <div className="flex flex-col items-center w-full">
                <div className="relative w-full max-w-sm">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="email"
                    placeholder="Email address"
                    className={`w-full pl-10 pr-3 py-3 text-sm rounded-md border bg-white transition-all duration-200 hover:shadow-sm focus:outline-none
                      ${emailError ? "border-red-400 focus:ring-1 focus:ring-red-400" : email ? "border-green-500 focus:ring-1 focus:ring-green-500" : "border-gray-300 focus:ring-1 focus:ring-slate-600"}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(validateEmail(e.target.value));
                      setError("");
                    }}
                  />
                </div>
                {/* RESERVED SPACE FOR EMAIL ERROR/SUCCESS */}
                <div className="h-6 w-full max-w-sm flex items-start">
                  {emailError ? (
                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                  ) : email ? (
                    <p className="text-green-600 text-xs mt-1">Valid email</p>
                  ) : null}
                </div>
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col items-center w-full">
                <div className="relative w-full max-w-sm">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={`w-full pl-10 pr-10 py-3 text-sm rounded-md border bg-white transition-all duration-200 hover:shadow-sm focus:outline-none
                      ${passwordError ? "border-red-400 focus:ring-1 focus:ring-red-400" : password ? "border-green-500 focus:ring-1 focus:ring-green-500" : "border-gray-300 focus:ring-1 focus:ring-slate-600"}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(validatePassword(e.target.value));
                      setError("");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* RESERVED SPACE FOR PASSWORD ERROR/SUCCESS */}
                <div className="h-6 w-full max-w-sm flex items-start">
                  {passwordError ? (
                    <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                  ) : password ? (
                    <p className="text-green-600 text-xs mt-1">Looks good</p>
                  ) : null}
                </div>
              </div>

              {/* GENERAL LOGIN ERROR SLOT */}
              <div className="h-5">
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-sm mx-auto block py-3 mt-2 text-sm rounded-md text-white font-medium bg-slate-900 hover:bg-slate-800 transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-xs text-gray-600 text-center mt-5">
              ©{new Date().getFullYear()} Manufacturing ERP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};