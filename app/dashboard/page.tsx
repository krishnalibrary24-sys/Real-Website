"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/components/branch-context";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const { activeBranch } = useBranch();

  useEffect(() => {
    const savedRole = localStorage.getItem("krishna_role");
    if (!savedRole) {
      router.push("/login");
    } else {
      setRole(savedRole);
    }
  }, [router]);

  if (!role) return null;

  const isAdmin = role === "admin";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display-lg text-white font-bold mb-1">
            {isAdmin ? "Global Overview" : "Command Center"}
          </h1>
          <p className="text-on-surface-variant font-body-md">
            {isAdmin 
              ? "Monitor all branches and revenue streams from a single vantage point." 
              : "Manage daily operations, seating, and student lifecycle."}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="glass-pane px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
          </button>
          {!isAdmin && (
            <button className="bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold glow-blue hover:scale-105 transition-transform flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">person_add</span>
              Add Member
            </button>
          )}
        </div>
      </header>

      {isAdmin ? <AdminDashboard activeBranch={activeBranch} /> : <OfficeDashboard branch={activeBranch} />}
    </div>
  );
}

function AdminDashboard({ activeBranch }: { activeBranch: string }) {
  // Mock data changes based on branch selection
  const isAll = activeBranch === 'all';
  const rev = activeBranch === 'bengali-chowk' ? '₹8,50,000' : '₹6,00,000';
  const dues = activeBranch === 'bengali-chowk' ? '₹25,200' : '₹20,000';
  const members = activeBranch === 'bengali-chowk' ? '468' : '374';
  const branchName = activeBranch === 'namnakala' ? 'Namnakala' : 'Bengali Chowk';
  return (
    <div className="space-y-8">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-pane p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-white/5 text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">trending_up</span> +12%
            </span>
          </div>
          <p className="text-on-surface-variant text-sm font-semibold mb-1">Total Revenue ({branchName})</p>
          <h3 className="text-3xl font-black text-white">{rev}</h3>
        </div>

        <div className="glass-pane p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container/10 rounded-full blur-xl group-hover:bg-secondary-container/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-error-container/20 flex items-center justify-center border border-error/10 text-secondary-container">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="bg-error/10 text-error text-xs font-bold px-2 py-1 rounded-lg">Action Required</span>
          </div>
          <p className="text-error text-sm font-bold mb-1">Global Due Tracker ({branchName})</p>
          <h3 className="text-3xl font-black text-white">{dues}</h3>
          <p className="text-xs text-on-surface-variant mt-2">Active alerts across this branch.</p>
        </div>

        <div className="glass-pane p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-white/5 text-tertiary">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-sm font-semibold mb-1">Active Members ({branchName})</p>
          <h3 className="text-3xl font-black text-white">{members}</h3>
          <div className="mt-4 flex h-2 rounded-full overflow-hidden bg-surface-container-highest">
            <div className="bg-primary w-[55%]" title="Bengali Chowk"></div>
            <div className="bg-tertiary w-[45%]" title="Namnakala"></div>
          </div>
        </div>
      </div>

      {/* Branch Breakdown & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-pane p-6 rounded-3xl border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white font-manrope">Branch Revenue Split</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View Details</button>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-white flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Bengali Chowk</span>
                <span className="font-bold text-white">₹8,50,000</span>
              </div>
              <div className="h-4 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[60%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-white flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary-container glow-red"></span> Namnakala</span>
                <span className="font-bold text-white">₹6,00,000</span>
              </div>
              <div className="h-4 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container rounded-full w-[40%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-pane p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white font-manrope">Subscription Types</h3>
          </div>
          <div className="flex items-center justify-center gap-8 flex-1">
            {/* Simple CSS Donut Chart representation */}
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center" style={{ background: 'conic-gradient(var(--tw-colors-primary) 0% 65%, var(--tw-colors-tertiary) 65% 100%)' }}>
              <div className="absolute inset-2 bg-surface rounded-full"></div>
              <div className="relative z-10 text-center">
                <div className="text-2xl font-black text-white">100%</div>
                <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Active</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <div>
                  <div className="text-white font-bold text-sm">Full Day (₹1000)</div>
                  <div className="text-xs text-on-surface-variant">65% of students</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-tertiary"></div>
                <div>
                  <div className="text-white font-bold text-sm">Half Shift (₹600)</div>
                  <div className="text-xs text-on-surface-variant">35% of students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfficeDashboard({ branch }: { branch: string }) {
  const branchName = branch === "namnakala" ? "Namnakala Branch" : "Bengali Chowk Branch";
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dueSoon, setDueSoon] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const fetchLiveMembers = async () => {
      setLoading(true);
      
      // Lazy Evaluation for Defaulters (Future Plan 1)
      try {
        const { data: expired } = await supabase
          .from('members')
          .select('id')
          .eq('branch', branch)
          .eq('is_active', true)
          .lt('subscription_end_date', new Date().toISOString());

        if (expired && expired.length > 0) {
          const ids = expired.map(e => e.id);
          // Automatically evict them and mark as inactive
          await supabase.from('members').update({ is_active: false, seat_no: null }).in('id', ids);
          console.log(`Auto-evicted ${ids.length} defaulters.`);
        }
      } catch (err) {
        console.error("Auto-eviction failed", err);
      }

      // Fetch ALL active members for this branch (no limit for stats)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('branch', branch)
        .order('created_at', { ascending: false });
      
      if (data) {
        const now = new Date();
        const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        
        // Count active members expiring within 3 days (but not yet expired)
        const dueSoonCount = data.filter(m => {
          if (!m.is_active || !m.subscription_end_date) return false;
          const end = new Date(m.subscription_end_date);
          return end >= now && end <= in3Days;
        }).length;

        // Count inactive members (expired/defaulters)
        const defaulterCount = data.filter(m => !m.is_active).length;
        
        setDueSoon(dueSoonCount);
        setOverdueCount(defaulterCount);
        setMembers(data.filter(m => m.is_active).slice(0, 10)); // Show top 10 active in table
      } else if (error) {
        console.error("Error fetching members:", error);
      }
      setLoading(false);
    };

    fetchLiveMembers();
  }, [branch]);

  return (
    <div className="space-y-8">
      {/* Quick Actions / Status Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container/50 hover:bg-surface-container p-4 rounded-2xl border border-white/5 cursor-pointer transition-all text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-2">person_add</span>
          <div className="text-white font-bold text-sm">New Admission</div>
        </div>
        <div className="bg-surface-container/50 hover:bg-surface-container p-4 rounded-2xl border border-white/5 cursor-pointer transition-all text-center">
          <span className="material-symbols-outlined text-tertiary text-3xl mb-2">event_upcoming</span>
          <div className="text-white font-bold text-sm">Due in 3 Days {dueSoon > 0 && <span className="bg-tertiary/20 text-tertiary px-2 py-0.5 rounded-full text-xs ml-1">{dueSoon}</span>}{dueSoon === 0 && <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs ml-1">0</span>}</div>
        </div>
        <div className="bg-error/10 hover:bg-error/20 p-4 rounded-2xl border border-error/20 cursor-pointer transition-all text-center glow-red relative overflow-hidden">
          <span className="material-symbols-outlined text-error text-3xl mb-2 animate-pulse">warning</span>
          <div className="text-error font-bold text-sm">Overdue / Inactive {overdueCount > 0 ? <span className="bg-error text-white px-2 py-0.5 rounded-full text-xs ml-1">{overdueCount}</span> : <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs ml-1">0</span>}</div>
        </div>
        <div className="bg-surface-container/50 hover:bg-surface-container p-4 rounded-2xl border border-white/5 cursor-pointer transition-all text-center">
          <span className="material-symbols-outlined text-secondary text-3xl mb-2">grid_view</span>
          <div className="text-white font-bold text-sm">Manage Seating</div>
        </div>
      </div>

      {/* Booking List Table */}
      <div className="glass-pane rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[500px]">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low/50">
          <h3 className="text-xl font-bold text-white font-manrope">Active Members ({branchName})</h3>
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search ID, Name, Phone..." 
              className="w-full bg-background border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container sticky top-0 z-10 text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                    <div className="mt-2 text-sm font-semibold">Loading Live Data...</div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant font-semibold">
                    No active bookings found for this branch.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="text-primary font-bold bg-primary/10 px-2 py-1 rounded">{member.permanent_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{member.full_name}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{member.mobile}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-md bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-xs border border-green-500/30">
                          {member.seat_no}
                        </span>
                        <span className="text-white text-xs">{member.shift}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${member.is_active ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                        <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${member.is_active ? 'translate-x-5' : 'translate-x-1'}`}></span>
                      </button>
                      <span className="text-xs text-on-surface-variant ml-2">{member.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-on-surface-variant hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button className="text-on-surface-variant hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
