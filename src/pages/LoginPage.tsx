import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import logoUrl from "../assets/Logo.jpg";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome to CrochCosmo Admin");
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-center p-4 selection:bg-[#585e4c] selection:text-white">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white shadow-xl mb-4 bg-white flex items-center justify-center p-1">
          <img src={logoUrl} alt="CrochCosmo Logo" className="w-full h-full object-contain rounded-full" />
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl text-[#1b1c1a] font-bold tracking-wide">
          CrochCosmo
        </h1>
        <p className="text-[#585e4c] text-xs font-bold uppercase tracking-[0.2em] mt-1.5">
          Admin Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-[2rem] shadow-xl border border-[#e4e2de] p-6 sm:p-10">
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@crochcosmo.com"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#c7c7bd] rounded-xl text-sm focus:outline-none focus:border-[#585e4c] focus:ring-1 focus:ring-[#585e4c]/50 transition-all text-[#1b1c1a] placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-white border border-[#c7c7bd] rounded-xl text-sm focus:outline-none focus:border-[#585e4c] focus:ring-1 focus:ring-[#585e4c]/50 transition-all text-[#1b1c1a] placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#585e4c] hover:bg-[#44493b] disabled:opacity-70 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#585e4c]/20 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In To Dashboard <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer / Trust Badge */}
      <div className="mt-8 flex items-center justify-center gap-1.5 text-gray-400">
        <ShieldCheck size={14} />
        <span className="text-xs font-medium">Secure Admin Access</span>
      </div>
    </div>
  );
};
