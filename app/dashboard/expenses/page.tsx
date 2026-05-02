"use client";
import React from 'react';
import { useBranch } from "@/components/branch-context";

export default function ExpensesPage() {
  const { activeBranch } = useBranch();
  const branchName = activeBranch === 'namnakala' ? 'Namnakala' : 'Bengali Chowk';
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold font-manrope text-white mb-2">Expenses & Enquiries</h1>
        <p className="text-on-surface-variant font-body-md">Operational tracking for {branchName}</p>
      </div>
      
      <div className="glass-pane p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center h-[50vh]">
        <span className="material-symbols-outlined text-6xl text-secondary-container mb-4">receipt_long</span>
        <h2 className="text-xl text-white font-bold mb-2">Module Offline</h2>
        <p className="text-on-surface-variant text-center max-w-md">The Expense & Enquiries module will be activated during the database integration phase.</p>
      </div>
    </div>
  );
}
