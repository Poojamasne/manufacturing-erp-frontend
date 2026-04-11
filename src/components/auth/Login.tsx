import React, { useState, useMemo, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  clearErrors,
} from "../modules/sales/ModuleStateFiles/AuthSlice";
import { useAppDispatch, useAppSelector } from "../common/ReduxMainHooks";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error: authError } = useAppSelector(
    (state: any) => state.auth,
  );

  useEffect(() => {
    dispatch(clearErrors());
  }, [email, password, dispatch]);

  const emailStatus = useMemo(() => {
    if (!email) return { error: null, isValid: false };
    if (email.includes(" "))
      return { error: "Spaces are not allowed", isValid: false };

    const atParts = email.split("@");
    if (atParts.length !== 2)
      return { error: "Only one @ allowed", isValid: false };

    const [username, domain] = atParts;
    if (!username) return { error: "Enter username before @", isValid: false };
    if (!domain) return { error: "Enter domain after @", isValid: false };
    if (email.includes(".."))
      return { error: "Consecutive dots (..) not allowed", isValid: false };
    if (email.startsWith(".") || email.endsWith("."))
      return { error: "Dot cannot be at start or end", isValid: false };

    const domainParts = domain.split(".");
    if (domainParts.length < 2)
      return { error: "Invalid domain format", isValid: false };

    const validDomains = [
      "com",
      "org",
      "net",
      "edu",
      "gov",
      "mil",
      "int",
      "info",
      "biz",
      "name",
      "co",
      "io",
      "ai",
      "app",
      "dev",
      "tech",
      "me",
      "tv",
      "xyz",
      "online",
      "store",
      "blog",
      "site",
      "club",
      "shop",
      "in",
      "us",
      "uk",
      "au",
      "ca",
      "de",
      "fr",
      "jp",
      "cn",
      "ru",
      "br",
      "za",
      "live",
    ];
    const extension = domainParts[domainParts.length - 1];
    if (!validDomains.includes(extension))
      return { error: "Only .com, .org, .co, .in allowed", isValid: false };

    return { error: null, isValid: true };
  }, [email]);

  const passwordStatus = useMemo(() => {
    if (!password) return { error: null, isValid: false };
    if (password.length < 6)
      return { error: "Minimum 6 characters required", isValid: false };
    return { error: null, isValid: true };
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!emailStatus.isValid || !passwordStatus.isValid) return;

    dispatch(loginUser({ email, password }, navigate) as any);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-1/2 bg-[#005d52] p-8 flex-col justify-between">
          <div>
            <div className="bg-white/10 p-3 rounded-xl w-fit mb-6">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-semibold text-white leading-snug mb-4">
              Manufacturing ERP System
            </h1>
            <div className="space-y-3 text-sm text-[#d1e9e7]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} /> Streamlined Business Processes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} /> Production & Inventory Control
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} /> Analytics for Operational Efficiency
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} /> Analytics Dashboard
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#d1e9e7] uppercase tracking-widest">
            Secure Access
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-6 flex justify-center w-full">
              <img
                src="/logo.svg"
                alt="Zonixtec Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800">ERP Login</h2>
            <p className="text-sm text-gray-400">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="text-xs text-gray-600 font-semibold uppercase">
                Email
              </label>
              <div className="relative mt-1">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="email"
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#005d52] transition-colors disabled:bg-gray-50"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {isSubmitted && !email ? (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Email is required
                </p>
              ) : (
                !emailStatus.isValid &&
                email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {emailStatus.error}
                  </p>
                )
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between">
                <label className="text-xs text-gray-600 font-semibold uppercase">
                  Password
                </label>
              </div>
              <div className="relative mt-1">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  autoComplete="off"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#005d52]"
                  placeholder="Enter your password"
                  value={password || ""}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isSubmitted && !password ? (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Password is required
                </p>
              ) : (
                !passwordStatus.isValid &&
                password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {passwordStatus.error}
                  </p>
                )
              )}
            </div>

            {/* REDUX AUTH ERROR */}
            {authError && (
              <div className="text-red-600 text-xs text-center bg-red-50 p-2 rounded-lg border border-red-100 animate-pulse">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="outline-none w-full bg-[#005d52] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#004a42] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Login</>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] text-gray-500 uppercase tracking-widest">
            Zonixtec ERP System • {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
