"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useBranch } from "@/components/branch-context";
import { supabase } from "@/lib/supabase";

export default function DuesPage() {
  const { activeBranch } = useBranch();
  const branchName = activeBranch === 'namnakala' ? 'Namnakala' : 'Bengali Chowk';

  const [dueSoon, setDueSoon] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('branch', activeBranch)
      .order('subscription_end_date', { ascending: true });

    if (data) {
      setDueSoon(data.filter(m => {
        if (!m.is_active || !m.subscription_end_date) return false;
        const end = new Date(m.subscription_end_date);
        return end >= now && end <= in3Days;
      }));
      setDefaulters(data.filter(m => !m.is_active));
    }
    setLoading(false);
  }, [activeBranch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getDaysOverdue = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysLeft = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const sendWhatsApp = (member: any, type: 'reminder' | 'overdue') => {
    const mobile = member.mobile.replace(/[^0-9]/g, '');
    const endDate = new Date(member.subscription_end_date).toLocaleDateString();
    const msg = type === 'reminder'
      ? `Dear ${member.full_name},\n\nThis is a friendly reminder from Krishna Library that your membership (${member.permanent_id}) is expiring on ${endDate}.\n\nPlease renew your subscription to continue enjoying uninterrupted access to your seat.\n\nRegards,\nKrishna Library — ${branchName}`
      : `Dear ${member.full_name},\n\nYour Krishna Library membership (${member.permanent_id}) expired on ${endDate}. Your seat has been temporarily released.\n\nPlease visit the library at the earliest to renew your subscription.\n\nRegards,\nKrishna Library — ${branchName}`;
    window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const reactivateMember = async (member: any) => {
    setActionId(member.id);
    const newEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('members').update({ is_active: true, subscription_end_date: newEnd }).eq('id', member.id);
    await fetchData();
    setActionId(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-manrope text-white mb-2">Dues & Defaulters</h1>
          <p className="text-on-surface-variant font-body-md">Payment lifecycle tracking for {branchName} Branch</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-pane px-5 py-3 rounded-2xl border border-tertiary/30 text-center">
            <div className="text-2xl font-black text-tertiary">{dueSoon.length}</div>
            <div className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">Due in 3 Days</div>
          </div>
          <div className="glass-pane px-5 py-3 rounded-2xl border border-error/30 text-center">
            <div className="text-2xl font-black text-error">{defaulters.length}</div>
            <div className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">Defaulters</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Due Soon Panel */}
        <div className="glass-pane rounded-3xl border border-tertiary/20 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-surface-container-low/50">
            <span className="material-symbols-outlined text-tertiary text-2xl">schedule</span>
            <div>
              <h2 className="text-xl font-bold text-white">Ending in 3 Days</h2>
              <p className="text-xs text-on-surface-variant">{dueSoon.length} member(s) need renewal</p>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {dueSoon.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-green-500 block mb-2">check_circle</span>
                <p className="font-bold text-green-400">All clear! No subscriptions expiring soon.</p>
              </div>
            ) : dueSoon.map(m => (
              <div key={m.id} className="bg-surface-container/50 p-4 rounded-2xl border border-tertiary/10 hover:border-tertiary/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-white font-bold">{m.full_name}</div>
                    <div className="text-xs text-primary font-bold">{m.permanent_id}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{m.mobile} · Seat {m.seat_no || 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <span className="bg-tertiary/20 text-tertiary text-xs font-bold px-2 py-1 rounded-lg block">
                      {getDaysLeft(m.subscription_end_date)}d left
                    </span>
                    <div className="text-[10px] text-on-surface-variant mt-1">
                      {new Date(m.subscription_end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => sendWhatsApp(m, 'reminder')}
                    className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-colors text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    WhatsApp Reminder
                  </button>
                  <button
                    disabled={actionId === m.id}
                    onClick={() => reactivateMember(m)}
                    className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">autorenew</span>
                    Renew Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defaulters Panel */}
        <div className="glass-pane rounded-3xl border border-error/30 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-error/5">
            <span className="material-symbols-outlined text-error text-2xl animate-pulse">warning</span>
            <div>
              <h2 className="text-xl font-bold text-error">Overdue Defaulters</h2>
              <p className="text-xs text-on-surface-variant">{defaulters.length} inactive member(s)</p>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {defaulters.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-green-500 block mb-2">verified</span>
                <p className="font-bold text-green-400">No defaulters! All members are active.</p>
              </div>
            ) : defaulters.map(m => (
              <div key={m.id} className="bg-error/5 p-4 rounded-2xl border border-error/20 hover:border-error/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-white font-bold">{m.full_name}</div>
                    <div className="text-xs text-primary font-bold">{m.permanent_id}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{m.mobile}</div>
                  </div>
                  <div className="text-right">
                    <span className="bg-error/20 text-error text-xs font-bold px-2 py-1 rounded-lg block">
                      {getDaysOverdue(m.subscription_end_date)}d overdue
                    </span>
                    <div className="text-[10px] text-on-surface-variant mt-1">
                      Expired: {new Date(m.subscription_end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => sendWhatsApp(m, 'overdue')}
                    className="flex-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    Chase Up
                  </button>
                  <button
                    disabled={actionId === m.id}
                    onClick={() => reactivateMember(m)}
                    className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {actionId === m.id
                      ? <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      : <span className="material-symbols-outlined text-sm">restart_alt</span>
                    }
                    Re-activate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
