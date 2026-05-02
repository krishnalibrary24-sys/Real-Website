"use client";
import React, { useState, useEffect } from 'react';
import { useBranch } from "@/components/branch-context";
import { supabase } from "@/lib/supabase";

export default function AdmissionPage() {
  const { activeBranch } = useBranch();
  const branchName = activeBranch === 'namnakala' ? 'Namnakala' : 'Bengali Chowk';
  
  const [mobile, setMobile] = useState("");
  const [fullName, setFullName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [shift, setShift] = useState("Full Day");
  
  const [recordFound, setRecordFound] = useState(false);
  const [permanentId, setPermanentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate or fetch ID logic
  useEffect(() => {
    if (mobile.replace(/[^0-9]/g, '').length >= 10) {
      checkExistingMember(mobile);
    } else {
      setRecordFound(false);
    }
  }, [mobile]);

  const checkExistingMember = async (phone: string) => {
    const { data, error } = await supabase.from('members').select('*').eq('mobile', phone).maybeSingle();
    if (data) {
      setFullName(data.full_name || "");
      setFatherName(data.father_name || "");
      setDob(data.dob ? data.dob.split('T')[0] : ""); // assuming date format
      setGender(data.gender || "");
      setAddress(data.address || "");
      setPermanentId(data.permanent_id || "");
      setRecordFound(true);
    } else {
      setRecordFound(false);
      setPermanentId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let finalId = permanentId;
      
      // If new student, generate ID
      if (!recordFound) {
        const branchCode = activeBranch === 'namnakala' ? 'N' : 'B';
        const prefix = `#KL26${branchCode}`;

        const { data: allIds } = await supabase
          .from('members')
          .select('permanent_id')
          .like('permanent_id', `${prefix}%`);
          
        let maxSeq = 0;
        if (allIds && allIds.length > 0) {
          allIds.forEach(record => {
            if (record.permanent_id) {
              // Extract the numbers after the prefix
              const suffix = record.permanent_id.replace(prefix, '');
              const num = parseInt(suffix);
              if (!isNaN(num) && num > maxSeq) maxSeq = num;
            }
          });
        }
        const seq = maxSeq + 1;
        finalId = `${prefix}${seq.toString().padStart(3, '0')}`;
        setPermanentId(finalId);
      }

      const payload = {
        permanent_id: finalId,
        full_name: fullName,
        father_name: fatherName,
        dob: dob || null,
        gender: gender,
        mobile: mobile,
        address: address,
        branch: activeBranch,
        seat_no: null, // Seat assigned later via Seat Map
        shift: shift,
        plan_amount: shift === 'Full Day' ? 1000 : 600,
        is_active: true,
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      if (recordFound && permanentId) {
        const { error: updErr } = await supabase.from('members').update(payload).eq('permanent_id', permanentId);
        if (updErr) throw new Error(updErr.message);
      } else {
        const { error: insErr } = await supabase.from('members').insert([payload]);
        if (insErr) throw new Error(insErr.message);
      }
      
      setSuccess(true);
      setErrorMsg(null);
      setTimeout(() => {
        setSuccess(false);
        // Reset form
        setMobile(""); setFullName(""); setFatherName(""); setDob(""); setGender(""); setAddress("");
      }, 3000);

    } catch (err: any) {
      console.error("Admission Error:", err);
      setErrorMsg(err.message || "An unknown database error occurred.");
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold font-manrope text-white mb-2">Admission Portal</h1>
        <p className="text-on-surface-variant font-body-md">Register new members for {branchName} Branch</p>
      </div>
      
      <div className="glass-pane p-8 rounded-3xl border border-white/5 max-w-4xl mx-auto mt-10">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h2 className="text-xl text-white font-bold">New Member Registration</h2>
          {recordFound && (
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified</span>
              Record Found: Auto-filled
            </span>
          )}
        </div>
        
        {success && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 text-center font-bold">
            Admission Successful! Member ID: {permanentId}
          </div>
        )}

        {errorMsg && (
          <div className="bg-error/20 border border-error/30 text-error p-4 rounded-xl mb-6 text-center font-bold">
            Failed to save: {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
              <span className="material-symbols-outlined">badge</span> Identity Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-label-caps text-on-surface-variant uppercase">Mobile Number (Primary Key)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40">phone</span>
                  <input 
                    type="tel" 
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={`w-full bg-surface-container-highest/50 border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none transition-colors ${recordFound ? 'border-green-500/50 focus:border-green-500' : 'border-white/10 focus:border-primary/50'}`}
                    placeholder="+91 00000 00000" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label-caps text-on-surface-variant uppercase">Full Name</label>
                <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50" placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label-caps text-on-surface-variant uppercase">Father's Name</label>
                <input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50" placeholder="Required for records" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-label-caps text-on-surface-variant uppercase">DOB</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-label-caps text-on-surface-variant uppercase">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 appearance-none">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-label-caps text-on-surface-variant uppercase">Permanent Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50" placeholder="Full residential address" />
              </div>
            </div>
          </div>

          {/* Seating & Plan Section */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-sm font-bold text-tertiary flex items-center gap-2 uppercase tracking-wider">
              <span className="material-symbols-outlined">event_seat</span> Shift Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-label-caps text-on-surface-variant uppercase">Shift Selection</label>
                <select required value={shift} onChange={(e) => setShift(e.target.value)} className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 appearance-none">
                  <option value="Full Day">Full Day (7 AM - 10 PM) - ₹1000</option>
                  <option value="Morning">Morning (7 AM - 3 PM) - ₹600</option>
                  <option value="Evening">Evening (3 PM - 10 PM) - ₹600</option>
                </select>
              </div>
              <div className="space-y-2 flex flex-col justify-center">
                <label className="text-xs font-label-caps text-on-surface-variant uppercase">Seat Assignment</label>
                <div className="text-sm font-bold text-tertiary mt-2">
                  <span className="material-symbols-outlined align-middle mr-1 text-[16px]">info</span>
                  Seat allotment is handled directly from the Seat Map module.
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-sm font-bold text-secondary flex items-center gap-2 uppercase tracking-wider">
              <span className="material-symbols-outlined">upload_file</span> Documents (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">add_a_photo</span>
                <div className="text-sm text-white font-bold">Upload Profile Photo</div>
              </div>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">id_card</span>
                <div className="text-sm text-white font-bold">Upload Aadhar / ID Proof</div>
              </div>
            </div>
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold glow-blue mt-8 flex justify-center items-center gap-2 disabled:opacity-50">
            {isSubmitting ? <span className="material-symbols-outlined animate-spin">sync</span> : null}
            {isSubmitting ? "Processing..." : recordFound ? "Re-Activate & Update Member" : "Complete Admission & Generate ID"}
          </button>
        </form>
      </div>
    </div>
  );
}
