"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // Hardcoded credentials check
    setTimeout(() => {
      const validCredentials = [
        { id: "ADMIN-01", pass: "admin123", role: "admin" },
        { id: "BENGALI-01", pass: "bengali123", role: "bengali-chowk" },
        { id: "NAMNA-01", pass: "namna123", role: "namnakala" }
      ];

      const user = validCredentials.find(c => c.id === staffId && c.pass === password);

      if (user) {
        // Save role and id to localStorage so the dashboard knows who is logged in
        localStorage.setItem("krishna_role", user.role);
        localStorage.setItem("krishna_staff_id", user.id);
        router.push("/dashboard");
      } else {
        setError("Invalid Staff ID or Password.");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors group z-20">
        <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
        <span className="font-manrope font-semibold">Back to Library</span>
      </Link>

      <div className="glass-pane p-10 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative z-10 backdrop-blur-2xl bg-surface-container/80">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-white/5 shadow-inner">
            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-display-lg text-white text-center mb-2">Staff Portal</h1>
        <p className="text-on-surface-variant text-center mb-8 font-body-md text-sm">Authorized personnel only.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider block">Staff ID</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">badge</span>
              <input 
                type="text" 
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                placeholder="e.g. ADMIN-01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">lock</span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl glow-blue hover:scale-[1.02] transition-transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <>
                <span>Secure Login</span>
                <span className="material-symbols-outlined text-sm">login</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-on-surface-variant font-body-md">
            Having trouble accessing the portal? <br/> Contact the system administrator.
          </p>
        </div>

        {/* TEMPORARY CREDENTIALS DISPLAY FOR TESTING */}
        <div className="mt-6 bg-surface-container-highest/30 border border-white/10 rounded-xl p-4 text-xs">
          <h3 className="text-white font-bold mb-2 uppercase tracking-wider text-[10px] text-center">Test Credentials</h3>
          <div className="grid grid-cols-1 gap-2 text-on-surface-variant font-mono">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Admin:</span> <span className="text-white">ADMIN-01 / admin123</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Bengali Chowk:</span> <span className="text-white">BENGALI-01 / bengali123</span>
            </div>
            <div className="flex justify-between">
              <span>Namnakala:</span> <span className="text-white">NAMNA-01 / namna123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
