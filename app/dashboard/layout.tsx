"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BranchProvider, useBranch } from "@/components/branch-context";
import { BouncingBalls } from "@/components/ui/bouncing-balls";

function DashboardInner({ children, role }: { children: React.ReactNode, role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role === "admin";
  const { activeBranch, setActiveBranch } = useBranch();

  const navLinks = [
    { name: "Overview", icon: "dashboard", path: "/dashboard" },
    { name: "Student Directory", icon: "group", path: "/dashboard/members" },
    { name: "Admission Portal", icon: "person_add", path: "/dashboard/admission" },
    { name: "Seat Map", icon: "grid_view", path: "/dashboard/seating" },
    { name: "Dues & Defaulters", icon: "warning", path: "/dashboard/dues" },
    { name: "Invoices", icon: "receipt", path: "/dashboard/invoices" },
    { name: "Enquiries", icon: "help_center", path: "/dashboard/enquiries" },
    { name: "Expenses", icon: "receipt_long", path: "/dashboard/expenses" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("krishna_role");
    localStorage.removeItem("krishna_staff_id");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row text-foreground font-body-md overflow-hidden relative">
      <BouncingBalls 
        numBalls={25} 
        colors={["#bfc2ff", "#ffffff"]} 
        opacity={0.15} 
        minRadius={0.5} 
        maxRadius={2.5}
        speed={0.4}
      />
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-container/20 via-surface to-background pointer-events-none z-[-1]"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-surface-container-low/80 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0">
        <div className="p-6 border-b border-white/5 flex flex-col gap-1">
          <h1 className="text-xl font-bold font-manrope text-white tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_library</span>
            Krishna Library
          </h1>
          <span className="text-xs font-label-caps text-secondary-container uppercase tracking-widest font-bold">
            {isAdmin ? "Admin Portal" : "Branch Office"}
          </span>
        </div>

        {/* Branch Toggle Switch for Admin */}
        {isAdmin && (
          <div className="p-4 border-b border-white/5">
            <div className="bg-surface-container-highest rounded-xl p-1 flex relative">
              <button 
                onClick={() => setActiveBranch('bengali-chowk')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all z-10 ${activeBranch === 'bengali-chowk' ? 'text-white' : 'text-on-surface-variant hover:text-white'}`}
              >
                Bengali Chowk
              </button>
              <button 
                onClick={() => setActiveBranch('namnakala')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all z-10 ${activeBranch === 'namnakala' ? 'text-white' : 'text-on-surface-variant hover:text-white'}`}
              >
                Namnakala
              </button>
              {/* Sliding Active Background */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-all duration-300 ease-in-out shadow-[0_0_10px_rgba(191,194,255,0.2)]`}
                style={{ left: activeBranch === 'bengali-chowk' ? '4px' : 'calc(50%)' }}
              ></div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.path} 
                href={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(191,194,255,0.1)]" 
                    : "text-on-surface-variant hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-error hover:bg-error/10 transition-colors font-semibold"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface-container-low/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
          <div className="flex flex-col">
            <span className="text-lg font-bold font-manrope text-white tracking-tight">Krishna Library</span>
            <span className="text-[10px] text-secondary-container font-bold uppercase tracking-widest">
              {isAdmin ? "Global Admin" : "Branch Office"}
            </span>
          </div>
          <button onClick={handleLogout} className="text-on-surface-variant hover:text-error transition-colors p-2">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-highest/95 backdrop-blur-xl border-t border-white/10 z-50 px-2 py-2 flex justify-around pb-safe">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.path} 
              href={link.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? "filled" : ""}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {link.icon}
              </span>
              <span className="text-[10px] font-semibold mt-1">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem("krishna_role");
    if (!savedRole) {
      router.push("/login");
    } else {
      setRole(savedRole);
    }
  }, [router]);

  if (!role) return null;

  return (
    <BranchProvider>
      <DashboardInner role={role}>{children}</DashboardInner>
    </BranchProvider>
  );
}
