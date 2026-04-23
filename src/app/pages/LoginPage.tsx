import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Shield,
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
    
    try {
      // 20-second timeout para sa Login (sapat na oras para sa Cold Start)
      const timeoutPromise = new Promise<{success: boolean, error?: string}>((resolve) => 
        setTimeout(() => resolve({ success: false, error: "Connection Timeout: Server is waking up or internet is slow. Please try again." }), 20000)
      );
      
      const loginPromise = login(email, password);
      const result = await Promise.race([loginPromise, timeoutPromise]);

      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      console.error("Login Exception:", err);
      setError("Network error: Please check your internet connection.");
    } finally {
      // Garantisadong titigil ang loading spinner kahit anong mangyari!
      setLoading(false); 
    }
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
                  placeholder="admin@bhw.gov.ph"
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