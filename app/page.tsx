"use client";
import React, { useState, useEffect, useRef } from "react";
import { Loader } from "@/components/loader";
import Link from "next/link";
import { motion, useInView, animate, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { KrishnaTestimonials } from "@/components/ui/krishna-testimonials";
import BranchShowcase from "@/components/ui/branch-showcase";
import { BouncingBalls } from "@/components/ui/bouncing-balls";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";
import Image from "next/image";
import ThemeSwitch from "@/components/ui/theme-switch";

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'branches', label: 'Branches' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'membership', label: 'Membership' },
  { id: 'testimonials', label: 'FAQ' },
  { id: 'enquiry', label: 'Enquiry' }
];

const CAPACITIES = {
  'bengali-chowk': 153,
  'namnakala': 120
};

function Counter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: [0.33, 1, 0.68, 1],
        onUpdate: (latest) => setDisplayValue(Math.floor(latest))
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return <span ref={ref}>{displayValue.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [focusHours, setFocusHours] = useState(12450);
  const [activeStudents, setActiveStudents] = useState(0);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [occupancy, setOccupancy] = useState({ 'bengali-chowk': 0, 'namnakala': 0 });
  const [activeTab, setActiveTab] = useState('home');
  const [selectedImage, setSelectedImage] = useState<{img: string, area: string} | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 300, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 300, mass: 0.5 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    }
  }, [mouseX, mouseY]);

  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', interest: 'Full Day', branch: 'bengali-chowk' });
  const [enquiryStatus, setEnquiryStatus] = useState('');

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryStatus('submitting');
    try {
      const { error } = await supabase.from('leads').insert([{
         full_name: enquiryForm.name,
         phone: enquiryForm.phone,
         interest: enquiryForm.interest,
         branch: enquiryForm.branch,
         created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      setEnquiryStatus('success');
      setEnquiryForm({ name: '', phone: '', interest: 'Full Day', branch: 'bengali-chowk' });
    } catch (error: any) {
      console.error('Enquiry error:', error);
      setEnquiryStatus('error');
    }
  };

  useEffect(() => {
    setMounted(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3500);

    async function fetchStats() {
      try {
        const { data: members, error } = await supabase.from('members').select('branch, is_active');
        if (!error && members) {
          const active = members.filter(m => m.is_active);
          setActiveStudents(active.length);
          const counts: Record<string, number> = { 'bengali-chowk': 0, 'namnakala': 0 };
          active.forEach(m => {
            if (m.branch in counts) counts[m.branch]++;
          });
          setOccupancy({
            'bengali-chowk': Math.round((counts['bengali-chowk'] / CAPACITIES['bengali-chowk']) * 100),
            'namnakala': Math.round((counts['namnakala'] / CAPACITIES['namnakala']) * 100)
          });
          const totalCapacity = CAPACITIES['bengali-chowk'] + CAPACITIES['namnakala'];
          setAvailableSeats(totalCapacity - active.length);
        }
      } catch (err) {
        console.error("Stats error:", err);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    }
    fetchStats();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = TABS.map(tab => document.getElementById(tab.id));
      const scrollPosition = window.scrollY + 350;
      let currentTab = 'home';
      sections.forEach(section => {
        if (section && section.offsetTop <= scrollPosition) {
          currentTab = section.id;
        }
      });
      setActiveTab(currentTab);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="selection:bg-primary/30 selection:text-white overflow-x-hidden relative" suppressHydrationWarning>
      
      {/* ─── Infinity Flow Background System ─── */}
      <div className="global-infinity-bg" />
      <div className="global-noise" />
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Cursor Glow — Preserved Animation */}
        {mounted && (
          <motion.div 
             className="w-[800px] h-[800px] bg-primary/[0.04] rounded-full blur-[150px] absolute"
             style={{
               x: smoothX,
               y: smoothY,
               translateX: "-50%",
               translateY: "-50%",
               left: 0,
               top: 0
             }}
          />
        )}
      </div>

      {mounted && (
        <BouncingBalls 
          numBalls={30} 
          colors={["#bfc2ff", "#e9c400", "#ffffff"]} 
          opacity={0.12} 
          minRadius={1} 
          maxRadius={3}
          speed={0.4}
          interactive={true}
        />
      )}

      {/* ─── Navigation ─── */}
      <header className="fixed top-0 w-full z-[100] transition-all duration-500">
        <div className="max-w-[90rem] mx-auto px-4 lg:px-8 h-24 flex justify-between items-center">
          {/* Left Side */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center group relative scale-[1.6] origin-left mr-4">
              <div className="relative w-[150px] h-[80px] transition-transform duration-500 group-hover:scale-105">
                <Image src="/assets/logo.png" alt="Krishna Library" fill className="object-contain object-left" priority />
              </div>
            </Link>
            <div className="hidden xl:block translate-y-1 z-10">
              <ThemeSwitch />
            </div>
          </div>

          {/* Center Nav */}
          <nav className="hidden xl:flex gap-1 items-center bg-white/[0.02] p-1.5 rounded-full border border-white/[0.05] backdrop-blur-2xl">
            {TABS.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                className={`relative px-4 xl:px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] transition-all rounded-full ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link href="/login" className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-primary transition-colors">
              Staff Portal
            </Link>
            <a href="#enquiry" className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white !px-4 lg:!px-6 !py-3 !text-[10px] font-black uppercase tracking-[0.2em] !rounded-full shadow-[0_10px_20px_rgba(249,115,22,0.3)] transition-all hover:scale-105 flex items-center gap-2 group relative overflow-hidden shrink-0">
              <span className="relative z-10">Book Seat</span>
              <div className="flex -space-x-1 relative z-10">
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                <ArrowRight size={12} className="opacity-50 group-hover:translate-x-1 transition-transform delay-75" />
                <ArrowRight size={12} className="opacity-25 group-hover:translate-x-1 transition-transform delay-150" />
              </div>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-48 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <Image 
               src="/assets/exterior.jpg"
               alt="Library Architecture" 
               fill
               className="object-cover opacity-[0.25] mix-blend-lighten"
               priority
             />
             <div className="absolute inset-0 bg-gradient-to-b from-[#010409] via-[#010409]/60 to-[#010409]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] px-5 py-2.5 rounded-full mb-10 backdrop-blur-xl">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#010409] bg-primary/40" />)}
                 </div>
                 <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Join {activeStudents || 500}+ Scholars</span>
                 <div className="w-px h-4 bg-white/10 mx-1" />
                 <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#e9c400]">
                   <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                   4.9/5 RATING
                 </span>
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[0.85] tracking-[-0.06em] text-white font-manrope uppercase">
                A <span className="text-[#e9c400] italic relative inline-block drop-shadow-[0_0_20px_rgba(233,196,0,0.4)]">
                  Heaven
                  <Sparkles className="absolute -top-4 -right-8 text-[#e9c400] w-8 h-8 animate-pulse" />
                  <Sparkles className="absolute -bottom-2 -left-6 text-[#e9c400] w-6 h-6 animate-pulse" style={{ animationDelay: '1s' }} />
                </span><br />
                for <span className="text-white">Curious</span><br />
                <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent">Minds.</span>
              </h1>

              <p className="max-w-2xl mx-auto text-white/40 text-lg md:text-xl font-medium leading-relaxed tracking-tight mb-12">
                Ambikapur&apos;s premier intellectual sanctuary. Engineered for absolute silence, 
                unmatched connectivity, and the ultimate pursuit of academic excellence.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href="#enquiry" className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black uppercase tracking-[0.2em] !px-12 !py-5 !text-xs !rounded-2xl shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-all hover:scale-105 flex items-center justify-center">
                  Start Your Journey
                </a>
                <a href="#branches" className="bg-transparent border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-300 font-black uppercase tracking-[0.2em] !px-12 !py-5 !text-xs !rounded-2xl group transition-all flex items-center justify-center">
                  Explore Branches
                  <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </section>

        <section className="relative py-24 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatItem icon={<span className="material-symbols-outlined text-primary text-3xl">domain</span>} label="Quiet Study Zones" value={2} delay={0.1} />
              <StatItem icon={<ShieldCheck className="text-[#4ade80]" />} label="Active Scholars" value={activeStudents} delay={0.2} />
              <StatItem icon={<Award className="text-tertiary" />} label="Real-time Seats" value={availableSeats} delay={0.3} />
            </div>
          </div>
        </section>

        <section id="branches" className="relative py-24">
          <div className="max-w-7xl mx-auto px-8 mb-32 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl"
            >
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-6 block">Elite Locations</span>
               <h2 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-none font-manrope">
                 Crafted for <span className="text-primary italic">Deep Focus.</span>
               </h2>
               <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                 Discover our two flagship establishments in Ambikapur, each engineered with state-of-the-art acoustic management and premium ergonomics.
               </p>
            </motion.div>
          </div>
          
          <div className="relative z-10">
            <BranchShowcase occupancy={occupancy} />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-orange-600/[0.05] blur-[150px] -translate-y-1/2 pointer-events-none" />
        </section>

        <section id="gallery" className="relative py-24">
          <div className="max-w-7xl mx-auto px-8 mb-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter font-manrope">
                The Intellectual <span className="text-tertiary italic drop-shadow-[0_0_20px_rgba(233,196,0,0.2)]">Sanctuary.</span>
              </h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto">A visual tour of our meticulously curated study environments.</p>
            </motion.div>
          </div>

          <div className="max-w-[1600px] mx-auto px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { img: 'dark_room.jpg', area: 'Silent Dark Zone', span: 'lg:col-span-2' },
                { img: 'discussion_hall.jpg', area: 'Discussion Hub' },
                { img: 'light_room.jpg', area: 'Premium Light Room' },
                { img: 'entry_gate.jpg', area: 'Main Entrance' },
                { img: 'exterior.jpg', area: 'Modern Exterior', span: 'lg:col-span-2' },
                { img: 'office.jpg', area: 'Admin Office' },
              ].map((item, i) => (
                <motion.div 
                  key={item.img}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedImage(item)}
                  className={`relative h-[400px] rounded-[32px] overflow-hidden group cursor-pointer ${item.span || ""}`}
                >
                  <Image 
                    src={`/assets/${item.img}`} 
                    alt={item.area} 
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010409] via-[#010409]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Perspective</span>
                     <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{item.area}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="membership" className="relative py-24">
          <KrishnaTestimonials />
        </section>

        <section id="enquiry" className="relative py-24">
          <div className="absolute inset-0 bg-primary/[0.01] mix-blend-screen" />
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto px-8 relative z-10"
          >
             <div className="glass-pane-elevated p-12 md:p-20 rounded-[48px] shadow-[0_60px_120px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity duration-1000" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
                
                <div className="relative z-10">
                  <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-6">Join the Circle</div>
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter font-manrope italic leading-none">Apply for<br />Admission.</h2>
                    <p className="text-white/40 text-lg max-w-sm mx-auto font-medium">Leave your contact details and our registrar will contact you within 4 hours.</p>
                  </div>
                  
                  <form onSubmit={handleEnquirySubmit} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">Your Full Name</label>
                          <input type="text" placeholder="e.g. Aryan Sharma" required className="w-full bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl text-white outline-none focus:bg-white/[0.04] focus:border-primary/40 transition-all placeholder:text-white/10 font-bold" value={enquiryForm.name} onChange={e => setEnquiryForm({...enquiryForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">WhatsApp Number</label>
                          <input type="tel" placeholder="+91" required className="w-full bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl text-white outline-none focus:bg-white/[0.04] focus:border-primary/40 transition-all placeholder:text-white/10 font-bold" value={enquiryForm.phone} onChange={e => setEnquiryForm({...enquiryForm, phone: e.target.value})} />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">Branch Preference</label>
                         <div className="relative">
                           <select className="w-full bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl text-white outline-none focus:bg-white/[0.04] transition-all appearance-none cursor-pointer font-bold" value={enquiryForm.branch} onChange={e => setEnquiryForm({...enquiryForm, branch: e.target.value})}>
                             <option value="bengali-chowk" className="bg-[#010409] text-white">Bengali Chowk (Flagship Hub)</option>
                             <option value="namnakala" className="bg-[#010409] text-white">Namnakala (Central Wing)</option>
                           </select>
                           <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">expand_more</span>
                         </div>
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">Shift Preference</label>
                         <div className="relative">
                           <select className="w-full bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl text-white outline-none focus:bg-white/[0.04] transition-all appearance-none cursor-pointer font-bold" value={enquiryForm.interest} onChange={e => setEnquiryForm({...enquiryForm, interest: e.target.value})}>
                             <option value="Full Day" className="bg-[#010409] text-white">Full Day Access (07:00 AM – 10:00 PM)</option>
                             <option value="Half Day" className="bg-[#010409] text-white">Half Day Batch (Morning/Evening)</option>
                             <option value="Night Shift" className="bg-[#010409] text-white">Late Night Intensive</option>
                           </select>
                           <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">expand_more</span>
                         </div>
                       </div>
                     </div>
                     <button type="submit" className="w-full btn-primary !py-7 !rounded-2xl !text-sm flex justify-center items-center gap-4 disabled:opacity-50 group" disabled={enquiryStatus === 'submitting'}>
                        {enquiryStatus === 'submitting' ? "Transmitting Application..." : "Secure My Seat"}
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                     </button>
                     
                     <AnimatePresence>
                       {enquiryStatus === 'success' && (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 text-emerald-400 p-6 rounded-2xl text-center font-bold uppercase tracking-widest text-xs italic">Application sent. Welcome to the elite circle.</motion.div>
                       )}
                       {enquiryStatus === 'error' && (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 text-red-400 p-6 rounded-2xl text-center font-bold uppercase tracking-widest text-xs italic">Transmission failed. Check connection.</motion.div>
                       )}
                     </AnimatePresence>
                  </form>
                </div>
             </div>
          </motion.div>
        </section>

      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
            <div className="max-w-md">
              <div className="text-3xl font-black text-white mb-6 uppercase tracking-tighter italic">Krishna Library</div>
              <p className="text-white/20 font-medium leading-relaxed mb-8">
                The ultimate intellectual zen workspace. Founded in 2024 to provide scholars with the environment they deserve.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-[10px] font-black uppercase tracking-[0.3em]">
              <div className="space-y-6">
                <div className="text-white/10">Quick Links</div>
                <div className="flex flex-col gap-4">
                  <a href="#" className="text-white/40 hover:text-white">Home</a>
                  <a href="#" className="text-white/40 hover:text-white">Gallery</a>
                  <a href="#" className="text-white/40 hover:text-white">Contact</a>
                </div>
              </div>
              <div className="space-y-6">
                <div className="text-white/10">Legal</div>
                <div className="flex flex-col gap-4">
                  <a href="#" className="text-white/40 hover:text-white">Privacy</a>
                  <a href="#" className="text-white/40 hover:text-white">Terms</a>
                </div>
              </div>
              <div className="space-y-6">
                <div className="text-white/10">Portal</div>
                <div className="flex flex-col gap-4">
                  <Link href="/login" className="text-white/40 hover:text-primary">Staff Login</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/[0.01]">
            <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">© 2026 Krishna Library Hub</div>
            <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Designed in Ambikapur</div>
          </div>
        </div>
      </footer>

      {/* ─── Gallery Modal ─── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#010409]/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full max-h-[80vh] overflow-hidden rounded-[40px] shadow-2xl border border-white/5">
                <Image src={`/assets/${selectedImage.img}`} alt={selectedImage.area} fill className="object-contain" />
              </div>
              <div className="text-center space-y-2">
                <span className="text-primary font-black uppercase tracking-[0.4em] text-xs italic">Viewing Space</span>
                <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic font-manrope">{selectedImage.area}</h3>
              </div>
              <button onClick={() => setSelectedImage(null)} className="absolute top-0 right-0 md:-top-12 md:-right-12 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
                <span className="material-symbols-outlined text-white/50 group-hover:text-white group-hover:rotate-90 transition-all">close</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mounted && loading && (
          <motion.div 
            key="loader-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-[#010409] flex flex-col items-center justify-center space-y-8"
          >
            <Loader />
            <h2 className="text-2xl font-black text-primary font-manrope animate-pulse uppercase tracking-[0.3em] italic">Preparing Excellence...</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ icon, label, value, suffix = "", delay = 0 }: { icon: React.ReactNode, label: string, value: number, suffix?: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass-pane p-12 rounded-[40px] text-center group hover:bg-white/[0.04] transition-all"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl">
        {icon}
      </div>
      <div className="text-5xl font-black text-white mb-3 font-manrope tracking-tighter">
        <Counter value={value} suffix={suffix} />
      </div>
      <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{label}</div>
    </motion.div>
  );
}
