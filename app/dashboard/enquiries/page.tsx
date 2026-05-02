"use client";
import React, { useEffect, useState } from 'react';
import { useBranch } from "@/components/branch-context";
import { supabase } from "@/lib/supabase";

interface Lead {
  id: string;
  full_name: string;
  phone: string;
  interest: string;
  created_at: string;
}

export default function EnquiriesPage() {
  const { activeBranch } = useBranch();
  const branchName = activeBranch === 'namnakala' ? 'Namnakala' : 'Bengali Chowk';
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setLeads(data);
      } else if (error) {
        console.error('Error fetching leads:', error);
      }
      setLoading(false);
    }
    fetchLeads();
  }, []);
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold font-manrope text-white mb-2">Enquiries</h1>
        <p className="text-on-surface-variant font-body-md">Lead management for {branchName}</p>
      </div>
      
      <div className="glass-pane p-8 rounded-3xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-white font-bold">New Walk-ins</h2>
          <button className="bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold">Add Enquiry</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-on-surface-variant text-xs uppercase">
              <tr>
                <th className="py-3 px-2 border-b border-white/5">Name</th>
                <th className="py-3 px-2 border-b border-white/5">Phone</th>
                <th className="py-3 px-2 border-b border-white/5">Interest</th>
                <th className="py-3 px-2 border-b border-white/5">Date</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-on-surface-variant italic">Loading leads...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-on-surface-variant italic">No leads found.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-2 border-b border-white/5 font-semibold">{lead.full_name}</td>
                    <td className="py-4 px-2 border-b border-white/5 text-on-surface-variant">{lead.phone}</td>
                    <td className="py-4 px-2 border-b border-white/5">
                      <span className="bg-tertiary/20 text-tertiary px-2 py-1 rounded text-xs whitespace-nowrap">
                        {lead.interest}
                      </span>
                    </td>
                    <td className="py-4 px-2 border-b border-white/5 text-on-surface-variant">
                      {new Date(lead.created_at).toLocaleDateString()}
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
