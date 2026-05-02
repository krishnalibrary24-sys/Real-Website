"use client";
import React, { useEffect, useState } from 'react';
import { useBranch } from "@/components/branch-context";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function MembersPage() {
  const { activeBranch } = useBranch();
  const branchName = activeBranch === 'namnakala' ? 'Namnakala' : 'Bengali Chowk';
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('branch', activeBranch)
        .order('created_at', { ascending: false });
      
      if (data) setMembers(data);
      setLoading(false);
    };

    fetchMembers();
  }, [activeBranch]);

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) || 
    m.permanent_id.toLowerCase().includes(search.toLowerCase()) ||
    m.mobile.includes(search)
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this member? This cannot be undone.")) return;
    setIsActionLoading(true);
    await supabase.from('members').delete().eq('id', id);
    setMembers(prev => prev.filter(m => m.id !== id));
    setSelectedMember(null);
    setIsActionLoading(false);
  };

  const handleRenew = async (member: any) => {
    setIsActionLoading(true);
    const currentEnd = new Date(member.subscription_end_date);
    const newEnd = currentEnd < new Date() ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    await supabase.from('members').update({ 
      subscription_end_date: newEnd.toISOString(),
      is_active: true
    }).eq('id', member.id);

    await supabase.from('payments').insert([{
      member_id: member.id,
      amount: member.plan_amount,
      branch: member.branch,
      payment_mode: 'Cash'
    }]);

    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, subscription_end_date: newEnd.toISOString(), is_active: true } : m));
    setSelectedMember({ ...member, subscription_end_date: newEnd.toISOString(), is_active: true });
    setIsActionLoading(false);
    
    // Auto-generate Invoice & Print
    window.open(`/dashboard/invoice?id=${member.id}`, '_blank');

    // Trigger WhatsApp Bot Notification
    const mobile = member.mobile.replace(/[^0-9]/g, '');
    const dateStr = newEnd.toLocaleDateString();
    const msg = `Dear ${member.full_name},\n\nThank you for choosing Krishna Library! Your subscription has been successfully renewed.\n\nAmount Paid: ₹${member.plan_amount}\nValid Till: ${dateStr}\n\nWe have emailed your invoice or you can collect the physical copy at the reception.\n\nRegards,\nKrishna Library (${member.branch})`;
    window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(msg)}`, '_blank');
  };
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-manrope text-white mb-2">Student Directory</h1>
          <p className="text-on-surface-variant font-body-md">Managing {members.length} members for {branchName} Branch</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Name, Phone..." 
              className="w-full bg-surface-container border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-bold glow-blue flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="glass-pane rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[calc(100vh-220px)] relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-surface/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          </div>
        )}
        
        {/* Desktop Table View */}
        <div className="hidden md:block flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container sticky top-0 z-10 text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Primary Info</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Status & Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant font-semibold">
                    No members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} onClick={() => setSelectedMember(member)} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center text-primary font-bold">
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold flex items-center gap-2">
                            {member.full_name}
                            <span className="text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">{member.permanent_id}</span>
                          </div>
                          <div className="text-xs text-on-surface-variant mt-0.5">Seat: <span className="text-white font-bold">{member.seat_no || 'Unassigned'}</span></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface-variant">{member.mobile}</span>
                        <a href={`https://wa.me/${member.mobile.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-3 h-3 invert" style={{ filter: 'brightness(0) saturate(100%) invert(48%) sepia(87%) saturate(1475%) hue-rotate(94deg) brightness(101%) contrast(105%)' }}/>
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{member.shift}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">₹{member.plan_amount}/mo</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-green-500' : 'bg-surface-container-highest'}`}></span>
                          <span className="text-xs text-white">{member.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                           <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded font-bold">Paid</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Profile Cards View */}
        <div className="md:hidden flex-1 overflow-auto p-4 space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} onClick={() => setSelectedMember(member)} className="bg-surface-container-low border border-white/5 p-4 rounded-2xl cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center text-primary font-bold text-lg">
                    {member.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-bold">{member.full_name}</div>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">{member.permanent_id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-green-500 glow-green' : 'bg-surface-container-highest'}`}></span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="bg-surface-container p-2 rounded-lg">
                  <div className="text-[10px] text-on-surface-variant uppercase">Seat</div>
                  <div className="font-bold text-white">{member.seat_no || 'None'}</div>
                </div>
                <div className="bg-surface-container p-2 rounded-lg">
                  <div className="text-[10px] text-on-surface-variant uppercase">Shift</div>
                  <div className="font-bold text-white">{member.shift}</div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold">Paid</span>
                <a href={`https://wa.me/${member.mobile.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="bg-green-500/20 text-green-500 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-Dive Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedMember(null)}>
          <div className="glass-pane border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-container-low/50">
              <h2 className="text-xl font-bold text-white font-manrope">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-on-surface-variant hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8">
              <div className="flex gap-6 items-start mb-8 border-b border-white/5 pb-8">
                <div className="w-24 h-24 rounded-2xl bg-surface-container-highest border border-white/10 flex items-center justify-center text-primary font-display-lg text-4xl">
                  {selectedMember.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-white">{selectedMember.full_name}</h3>
                      <p className="text-primary font-bold">{selectedMember.permanent_id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedMember.is_active ? 'bg-green-500/20 text-green-400' : 'bg-surface-container text-on-surface-variant'}`}>
                        {selectedMember.is_active ? 'Active Member' : 'Inactive'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">Valid till: {new Date(selectedMember.subscription_end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">Father's Name</div>
                      <div className="text-white">{selectedMember.father_name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">Mobile</div>
                      <div className="text-white">{selectedMember.mobile}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">DOB / Gender</div>
                      <div className="text-white">{selectedMember.dob ? selectedMember.dob.split('T')[0] : 'N/A'} / {selectedMember.gender || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">Address</div>
                      <div className="text-white truncate">{selectedMember.address || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Transaction Ledger</h4>
              <div className="bg-surface-container border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-highest text-on-surface-variant text-xs">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Plan</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    <tr>
                      <td className="px-4 py-3 border-t border-white/5">{selectedMember.created_at.split('T')[0]}</td>
                      <td className="px-4 py-3 border-t border-white/5 font-bold">₹{selectedMember.plan_amount}</td>
                      <td className="px-4 py-3 border-t border-white/5">{selectedMember.shift}</td>
                      <td className="px-4 py-3 border-t border-white/5"><span className="text-green-400 font-bold text-xs">Successful</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex flex-wrap gap-4 bg-surface-container-low/50">
              <button disabled={isActionLoading} onClick={() => handleDelete(selectedMember.id)} className="bg-error/10 hover:bg-error/20 text-error font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined align-middle">delete</span>
              </button>
              <button disabled={isActionLoading} onClick={() => router.push('/dashboard/admission')} className="flex-1 bg-surface-container hover:bg-surface-container-highest text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                Update Details
              </button>
              <button disabled={isActionLoading} onClick={() => handleRenew(selectedMember)} className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-xl glow-blue hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 disabled:opacity-50">
                {isActionLoading ? <span className="material-symbols-outlined animate-spin">sync</span> : null}
                Renew Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
