"use client";
import React, { useEffect, useState } from 'react';
import { useBranch } from "@/components/branch-context";
import { supabase } from "@/lib/supabase";

export default function SeatingPage() {
  const { activeBranch } = useBranch();
  const seats = activeBranch === 'namnakala' ? 120 : 153;
  const branchName = activeBranch === 'namnakala' ? 'Namnakala' : 'Bengali Chowk';
  
  const [seatMap, setSeatMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [unassignedMembers, setUnassignedMembers] = useState<any[]>([]);
  
  // Modals state
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchSeats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('id, seat_no, shift, is_active, full_name, permanent_id')
        .eq('branch', activeBranch)
        .eq('is_active', true);
      
      if (data) {
        const map: Record<string, any[]> = {};
        const unassigned: any[] = [];
        data.forEach(m => {
          if (m.seat_no) {
            if (!map[m.seat_no]) map[m.seat_no] = [];
            map[m.seat_no].push(m);
          } else {
            unassigned.push(m);
          }
        });
        setSeatMap(map);
        setUnassignedMembers(unassigned);
      }
      setLoading(false);
    };

    fetchSeats();
  }, [activeBranch]);

  const handleAssignSeat = async (memberId: string) => {
    if (!selectedSeat) return;
    setIsAssigning(true);
    await supabase.from('members').update({ seat_no: selectedSeat }).eq('id', memberId);
    
    // Optimistic update
    const member = unassignedMembers.find(m => m.id === memberId);
    if (member) {
      setSeatMap(prev => {
        const current = prev[selectedSeat] || [];
        return { ...prev, [selectedSeat]: [...current, { ...member, seat_no: selectedSeat }] };
      });
      setUnassignedMembers(prev => prev.filter(m => m.id !== memberId));
    }
    setIsAssigning(false);
  };

  const handleUnassignSeat = async (memberId: string, seatNo: string) => {
    setIsAssigning(true);
    await supabase.from('members').update({ seat_no: null }).eq('id', memberId);
    
    setSeatMap(prev => {
      const current = prev[seatNo] || [];
      const updated = current.filter(m => m.id !== memberId);
      const member = current.find(m => m.id === memberId);
      if (member) {
        setUnassignedMembers(unass => [...unass, { ...member, seat_no: null }]);
      }
      if (updated.length === 0) {
        const newMap = { ...prev };
        delete newMap[seatNo];
        return newMap;
      }
      return { ...prev, [seatNo]: updated };
    });
    
    setIsAssigning(false);
  };
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-manrope text-white mb-2">Smart Seating Grid</h1>
          <p className="text-on-surface-variant font-body-md">{branchName} Branch ({seats} Total Seats)</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-bold text-white bg-surface-container/50 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-sm"></div>Unreserved</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-sm"></div>Full Day (7 AM - 10 PM)</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>Morning (7 AM - 3 PM)</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-500 rounded-sm"></div>Evening (3 PM - 10 PM)</div>
        </div>
      </div>
      
      <div className="glass-pane p-8 rounded-3xl border border-white/5 overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-surface/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          </div>
        )}
        <div className="grid grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-3 min-w-[600px]">
          {[...Array(seats)].map((_, i) => {
            const seatId = (i + 1).toString();
            const occupants = seatMap[seatId] || [];
            
            let color = 'bg-red-500'; // Unreserved by default
            let title = `Seat ${seatId} Available`;
            
            if (occupants.length === 2) {
              // Both shifts occupied
              color = 'bg-gradient-to-br from-yellow-500 to-purple-500 border border-white/20';
              title = `${seatId}: Morning & Evening Occupied`;
            } else if (occupants.length === 1) {
              const shift = occupants[0].shift;
              if (shift === 'Full Day') { color = 'bg-green-500'; title = `${seatId}: ${occupants[0].full_name} (Full Day)`; }
              else if (shift === 'Morning') { color = 'bg-yellow-500'; title = `${seatId}: ${occupants[0].full_name} (Morning Only)`; }
              else if (shift === 'Evening') { color = 'bg-purple-500'; title = `${seatId}: ${occupants[0].full_name} (Evening Only)`; }
            }
            
            return (
              <div 
                key={i} 
                onClick={() => setSelectedSeat(seatId)}
                className={`aspect-square ${color} rounded-lg shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity hover:scale-105 transform group relative`}
                title={title}
              >
                <span className="text-[10px] font-bold text-white mix-blend-overlay opacity-80">{seatId}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Management Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedSeat(null)}>
          <div className="glass-pane border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-container-low/50">
              <h2 className="text-xl font-bold text-white font-manrope flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event_seat</span>
                Seat Management: #{selectedSeat}
              </h2>
              <button onClick={() => setSelectedSeat(null)} className="text-on-surface-variant hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6">
              {seatMap[selectedSeat] && seatMap[selectedSeat].length > 0 ? (
                // Seat is Occupied
                <div className="space-y-4">
                  {seatMap[selectedSeat].map(member => (
                    <div key={member.id} className="bg-surface-container-highest p-4 rounded-2xl flex justify-between items-center border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold">{member.full_name}</div>
                          <div className="text-xs text-on-surface-variant">{member.permanent_id} • <span className="text-primary font-bold">{member.shift}</span></div>
                        </div>
                      </div>
                      <button 
                        disabled={isAssigning}
                        onClick={() => handleUnassignSeat(member.id, selectedSeat)}
                        className="bg-error/20 text-error hover:bg-error hover:text-white transition-colors p-2 rounded-lg font-bold flex justify-center items-center disabled:opacity-50"
                        title="Un-assign Seat"
                      >
                        {isAssigning ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">person_remove</span>}
                      </button>
                    </div>
                  ))}

                  {/* Show assignment options if seat is partially occupied (e.g., Morning only) */}
                  {seatMap[selectedSeat].length === 1 && seatMap[selectedSeat][0].shift !== 'Full Day' && (
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <h4 className="text-xs font-bold text-tertiary mb-3 uppercase">Slot Available: {seatMap[selectedSeat][0].shift === 'Morning' ? 'Evening' : 'Morning'}</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {unassignedMembers.filter(m => m.shift === (seatMap[selectedSeat][0].shift === 'Morning' ? 'Evening' : 'Morning')).length === 0 ? (
                          <div className="text-xs text-on-surface-variant italic">No compatible members available to share this seat.</div>
                        ) : (
                          unassignedMembers.filter(m => m.shift === (seatMap[selectedSeat][0].shift === 'Morning' ? 'Evening' : 'Morning')).map(m => (
                            <div key={m.id} className="flex justify-between items-center bg-surface-container p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                              <div>
                                <div className="text-white font-bold text-xs">{m.full_name}</div>
                                <div className="text-[10px] text-on-surface-variant">{m.shift}</div>
                              </div>
                              <button disabled={isAssigning} onClick={() => handleAssignSeat(m.id)} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold disabled:opacity-50">Assign</button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Seat is Empty
                <div>
                  <h3 className="text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-wider">Unassigned Members</h3>
                  {unassignedMembers.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant">
                      No active members require seat assignment.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {unassignedMembers.map(m => (
                        <div key={m.id} className="flex justify-between items-center bg-surface-container p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
                          <div>
                            <div className="text-white font-bold text-sm">{m.full_name}</div>
                            <div className="text-xs text-on-surface-variant">{m.permanent_id} • {m.shift}</div>
                          </div>
                          <button 
                            disabled={isAssigning}
                            onClick={() => handleAssignSeat(m.id)}
                            className="bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                          >
                            Assign Here
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
