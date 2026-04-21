import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router";
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Shield,
  ChevronLeft,
  CheckCircle2,
  Info,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "@/assets/icons/StarIcon-green.svg";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemoHint, setShowDemoHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/admin");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const fillDemo = (type: "admin" | "staff") => {
    if (type === "admin") {
      setEmail("maria.santos@bhw.gov.ph");
      setPassword("admin123");
    } else {
      setEmail("juan.delacruz@bhw.gov.ph");
      setPassword("staff123");
    }
    setError("");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: `
          radial-gradient(circle at 12% 10%, rgba(110, 231, 183, 0.26) 0%, rgba(110, 231, 183, 0) 22%),
          radial-gradient(circle at 88% 18%, rgba(167, 243, 208, 0.16) 0%, rgba(167, 243, 208, 0) 18%),
          radial-gradient(circle at 82% 82%, rgba(94, 234, 212, 0.24) 0%, rgba(94, 234, 212, 0) 24%),
          radial-gradient(circle at 16% 70%, rgba(187, 247, 208, 0.18) 0%, rgba(187, 247, 208, 0) 16%),
          linear-gradient(180deg, #ffffff 0%, #fbfefd 100%)
        `,
      }}
    >
      <div className="w-full max-w-md space-y-6 ">
        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-8 text-center"> 
              <img src={logo} alt="" className="w-18 h-18 flex items-center justify-center mx-auto mb-4"/>
            <h1 className="text-center justify-start text-emerald-700 text-3xl font-normal font-['Jomolhari'] leading-10 tracking-widest" >
              TALA
            </h1>
            <p className="text-black-100 mt-1.5" style={{ fontSize: "0.8rem" }}>
              Admin <br />
              Barangay Health Worker Login
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600" style={{ fontSize: "0.8rem" }}>
                  {error}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                className="block text-gray-600 mb-2 font-medium"
                style={{ fontSize: "0.8rem" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="your.name@bhw.gov.ph"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  style={{ fontSize: "0.88rem" }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-gray-600 mb-2 font-medium"
                style={{ fontSize: "0.8rem" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  style={{ fontSize: "0.88rem" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
              style={{ fontSize: "0.92rem" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials section */}
          <div className="px-8 pb-8 hidden"> //nakahidden muna
            <button
              type="button"
              onClick={() => setShowDemoHint(!showDemoHint)}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
              style={{ fontSize: "0.75rem" }}
            >
              <Info className="w-3.5 h-3.5" />
              {showDemoHint ? "Hide demo credentials" : "Show demo credentials"}
            </button>

            {showDemoHint && (
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => fillDemo("admin")}
                  className="w-full flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer text-left"
                >
                  <div className="bg-emerald-200 p-2 rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-800 font-medium" style={{ fontSize: "0.78rem" }}>
                      BHW Admin
                    </p>
                    <p className="text-emerald-600" style={{ fontSize: "0.68rem" }}>
                      maria.santos@bhw.gov.ph / admin123
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => fillDemo("staff")}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer text-left"
                >
                  <div className="bg-blue-200 p-2 rounded-lg">
                    <User className="w-3.5 h-3.5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-800 font-medium" style={{ fontSize: "0.78rem" }}>
                      BHW Staff
                    </p>
                    <p className="text-blue-600" style={{ fontSize: "0.68rem" }}>
                      juan.delacruz@bhw.gov.ph / staff123
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span
              className="text-emerald-600"
              style={{ fontSize: "0.72rem", fontWeight: 500 }}
            >
              Secure login — Session stored locally
            </span>
          </div>
          <p className="text-gray-300" style={{ fontSize: "0.65rem" }}>
            TALA v1.0.0 — Offline-ready PWA
          </p>
        </div>
      </div>
    </div>
  );
}
