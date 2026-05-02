"use client";
import React, { useState, useEffect, useRef } from "react";
import { Loader } from "@/components/loader";
import Link from "next/link";
import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { KrishnaTestimonials } from "@/components/ui/krishna-testimonials";
import ParallaxMouseBackground from "@/components/ui/parallax-mouse-background";

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
        ease: [0.33, 1, 0.68, 1], // Custom power ease
        onUpdate: (latest) => setDisplayValue(Math.floor(latest))
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return <span ref={ref}>{displayValue.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [focusHours, setFocusHours] = useState(12450);
  const [activeStudents, setActiveStudents] = useState(0);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [occupancy, setOccupancy] = useState({ 'bengali-chowk': 0, 'namnakala': 0 });
  const [activeTab, setActiveTab] = useState('home');
  const [selectedImage, setSelectedImage] = useState<{img: string, area: string} | null>(null);

  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', interest: 'Full Day' });
  const [enquiryStatus, setEnquiryStatus] = useState('');

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryStatus('submitting');
    try {
      const { error } = await supabase.from('leads').insert([{
         full_name: enquiryForm.name,
         phone: enquiryForm.phone,
         interest: enquiryForm.interest,
         created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      setEnquiryStatus('success');
      setEnquiryForm({ name: '', phone: '', interest: 'Full Day' });
    } catch (error: any) {
      console.error('Enquiry error:', error);
      setEnquiryStatus('error');
    }
  };

  useEffect(() => {
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
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = TABS.map(tab => document.getElementById(tab.id));
      const scrollPosition = window.scrollY + 250;
      let currentTab = 'home';
      sections.forEach(section => {
        if (section && section.offsetTop <= scrollPosition) {
          currentTab = section.id;
        }
      });
      setActiveTab(currentTab);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060e20] flex flex-col items-center justify-center space-y-8">
        <Loader />
        <h2 className="text-2xl font-semibold text-primary font-manrope animate-pulse">Initializing Premium Workspace...</h2>
      </div>
    );
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden relative">
      <ParallaxMouseBackground className="fixed inset-0 z-[-1]" intensity={0.15} />
      
      {/* Custom Cursor Glow */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <motion.div 
           className="w-[800px] h-[800px] bg-primary/[0.04] rounded-full blur-[150px] absolute"
           style={{
             left: 'var(--mouse-x, 50%)',
             top: 'var(--mouse-y, 50%)',
             transform: 'translate(-50%, -50%)',
           }}
        />
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('mousemove', (e) => {
          document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
          document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        });
      `}} />

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 rounded-b-xl bg-surface-container/60 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">local_library</span>
            <span className="text-2xl font-bold tracking-tighter text-white uppercase font-manrope hidden sm:block">Krishna Library</span>
          </Link>
          <nav className="hidden md:flex gap-1 items-center relative bg-white/[0.03] p-1 rounded-full border border-white/5">
            {TABS.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-2 text-xs font-manrope font-black uppercase tracking-widest transition-all rounded-full ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary/20 rounded-full border border-primary/30"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </a>
            ))}
          </nav>
          <Link href="/login" className="text-[10px] text-white/10 hover:text-white/50 transition-colors uppercase tracking-[0.3em] font-black px-2">
            Staff
          </Link>
        </div>
      </header>

      <main className="mt-20">
        {/* Hero Section */}
        <section id="home" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-8 pt-20">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover opacity-30 grayscale contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtxjNxGHLOjBsdywPQrFwaveRKrIIr65H8mKncDNKBhdDzQqo0vUe8nQc6UtizQVgi7__BHzHxONmUtCO2zBcK2aPmS4621lEhqdtv4aABqvG5wYdR3pYXhTtKrjC2Qe2finfXcwYWp6zh6RyZNxNAyPHkdE4FJ6rQbot-yFZGpQyWmPSMCUYs8gSIw0dcVzB7OUiFmPu3ZGbV9id_DSJ8K3mjexqiWdyT8K7LO4ChNrAHUUEQ4LGzBwTrOBdBdUu6fD4KcIJNsw" alt="Zen Workspace" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060e20]/80 to-[#060e20]"></div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-center max-w-5xl mx-auto"
          >
            {/* X-Factor: 4.9 Star Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="inline-flex flex-col items-center mb-10"
            >
              <motion.span 
                animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="material-symbols-outlined text-[#e9c400] text-5xl block drop-shadow-[0_0_20px_rgba(233,196,0,0.4)]"
              >
                crown
              </motion.span>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-2xl flex items-center gap-4 mt-2 shadow-2xl">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[#fbbc04] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <span className="text-white font-black tracking-tighter text-xl italic uppercase">4.9/5 <span className="text-white/40 font-bold not-italic text-xs ml-2 tracking-widest">Google Maps</span></span>
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.95] tracking-tighter text-white font-manrope uppercase">
              The <span className="text-primary italic">Zenith</span> of<br />
              <span className="text-white/90">Deep Focus.</span>
            </h1>
            
            <p className="text-white/50 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-body-md leading-relaxed">
              India's elite self-study destination. Engineered for absolute silence, 
              unmatched connectivity, and ergonomic perfection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="#enquiry" className="bg-primary text-on-primary px-12 py-5 rounded-2xl text-lg font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(102,178,255,0.3)]">
                Secure Your Seat
              </a>
              <a href="#gallery" className="glass-pane text-white px-12 py-5 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
                Explore Space
              </a>
            </div>
          </motion.div>
        </section>

        {/* Stats Pulse */}
        <section className="py-32 max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div whileHover={{ y: -5 }} className="glass-pane p-10 rounded-[32px] text-center border-t border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="material-symbols-outlined text-primary text-6xl mb-6 block">timer</span>
              <div className="text-5xl font-black text-white mb-2 font-manrope">
                <Counter value={focusHours} suffix="+" />
              </div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Hours of Productivity</div>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="glass-pane p-10 rounded-[32px] text-center border-t border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-tertiary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="material-symbols-outlined text-tertiary text-6xl mb-6 block">hub</span>
              <div className="text-5xl font-black text-white mb-2 font-manrope">
                <Counter value={activeStudents} />
              </div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Active Scholars Today</div>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="glass-pane p-10 rounded-[32px] text-center border-t border-white/10 relative overflow-hidden group border-primary/20">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="material-symbols-outlined text-white text-6xl mb-6 block">event_seat</span>
              <div className="text-5xl font-black text-white mb-2 font-manrope">
                <Counter value={availableSeats} />
              </div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Real-time Seat Openings</div>
            </motion.div>
          </div>
        </section>

        {/* Branch Section */}
        <section id="branches" className="py-32">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl text-left">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter font-manrope leading-[0.9]">Our Premium<br /><span className="text-primary">Establishments.</span></h2>
                <p className="text-white/50 text-lg">Two elite locations in Ambikapur, meticulously designed for silence and success.</p>
              </div>
              <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 font-black uppercase tracking-widest text-[10px] text-primary">
                Live Status: Online
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Branch 1 */}
              <div className="group relative">
                <div className="aspect-[16/10] overflow-hidden rounded-[40px] border border-white/5 relative">
                  <img className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbMh8x8j5Byq6FVqFfReev-jJ1VIsxwwqc94VV3Q-eogACMe1ixCLeK2tGLd3s3WRLwvWPMDXAFZbxS0XzfPJmGWwKfy6mJMw-8Zd7byzirQz15EjTuO8j36ggzmX01Onjkn62kfB02eZ--ZFLERPHFwofKk49aOcsqslLzic5s3GQ3fhAINPDNbCzvTAvV57zUZJT6mPKYodGwZOacOi7A3NP3AdqcxOWdtfLqdhLyytgVDCO91KoBxg6XstIH_C0mXPTJeRUSw" alt="Bengali Chowk" />
                  <div className="absolute top-8 right-8 bg-[#060e20]/80 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                    <span className="text-white font-black text-xs uppercase tracking-widest">{occupancy['bengali-chowk']}% Full</span>
                  </div>
                </div>
                <div className="mt-10 px-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-3xl font-black text-white font-manrope uppercase italic">Bengali Chowk</h3>
                    <span className="text-[10px] font-black text-primary border border-primary/20 px-3 py-1 rounded-full uppercase">Flagship Hub</span>
                  </div>
                  <p className="text-white/40 mb-8 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                    Plot 12, Bengali Chowk Area, Ambikapur.
                  </p>
                  <div className="flex gap-4">
                    <a href="#gallery" className="flex-1 bg-white/5 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5 text-center">Gallery</a>
                    <a href="#enquiry" className="flex-1 bg-primary py-5 rounded-2xl font-black uppercase tracking-widest text-xs text-on-primary shadow-xl hover:scale-105 transition-all text-center">Book Now</a>
                  </div>
                </div>
              </div>

              {/* Branch 2 */}
              <div className="group relative">
                <div className="aspect-[16/10] overflow-hidden rounded-[40px] border border-white/5 relative">
                  <img className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSiRIu70Nm5O3-J20NAnk_UM6f3cezodxbrO4MSXkIoG0drTUxA46lJ2ptUcx-DyE5CvOK87KkF9oeHIa9A3rFe3mgKiiJuS4C-YepmUeZt1er0qFlF4z-W5fSbfIU2a5batadhVlhdjCueRurGHsw9wgTZrAsTApkOSFRFmNy_ZEb--K4A2p9WRyZn1GFA4oxifCQICkng82CGZ04PGo_ShHlh7QCx9mkYZIhrQ-tj0OhyL5fZls3S9_2HIWeyWxhnduA0F8vdg" alt="Namnakala" />
                  <div className="absolute top-8 right-8 bg-[#060e20]/80 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#66b2ff]" />
                    <span className="text-white font-black text-xs uppercase tracking-widest">{occupancy['namnakala']}% Full</span>
                  </div>
                </div>
                <div className="mt-10 px-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-3xl font-black text-white font-manrope uppercase italic">Namnakala</h3>
                    <span className="text-[10px] font-black text-tertiary border border-tertiary/20 px-3 py-1 rounded-full uppercase">Central Wing</span>
                  </div>
                  <p className="text-white/40 mb-8 flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary mt-1">location_on</span>
                    2nd Floor, Zenith Plaza, Namnakala, Ambikapur.
                  </p>
                  <div className="flex gap-4">
                    <a href="#gallery" className="flex-1 bg-white/5 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5 text-center">Gallery</a>
                    <a href="#enquiry" className="flex-1 bg-tertiary py-5 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-xl hover:scale-105 transition-all text-center">Waitlist</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="py-32 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-8 text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter font-manrope">
              The Interior<br />
              <span className="text-[#fbbc04] italic relative inline-block drop-shadow-[0_0_15px_rgba(251,188,4,0.4)]">
                Perspective.
                <motion.span 
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 45, 90] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="material-symbols-outlined absolute -top-4 -right-8 text-2xl"
                >
                  auto_awesome
                </motion.span>
                <motion.span 
                  animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="material-symbols-outlined absolute -bottom-2 -left-10 text-xl"
                >
                  sparkles
                </motion.span>
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8 max-w-[1400px] mx-auto">
             {[
               { img: 'dark_room.jpg', area: 'Silent Dark Zone' },
               { img: 'discussion_hall.jpg', area: 'Discussion Hub' },
               { img: 'entry_gate.jpg', area: 'Main Entrance' },
               { img: 'exterior.jpg', area: 'Modern Exterior' },
               { img: 'light_room.jpg', area: 'Premium Light Room' },
               { img: 'office.jpg', area: 'Administrative Office' },
               { img: 'parking.jpg', area: 'Secured Parking' }
             ].map((item, i) => (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 key={item.img} 
                 onClick={() => setSelectedImage(item)}
                 className="overflow-hidden rounded-[32px] h-[300px] md:h-[400px] relative group border border-white/5 shadow-2xl cursor-pointer"
               >
                  <img 
                    src={`/assets/${item.img}`} 
                    alt={item.area} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" 
                  />
                  
                  {/* Area Label Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] via-[#060e20]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <motion.div 
                      initial={{ y: 10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      className="space-y-1"
                    >
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Discovery</span>
                      <h4 className="text-xl font-black text-white uppercase tracking-tighter font-manrope italic">{item.area}</h4>
                    </motion.div>
                  </div>

                  {/* Glass frame effect on hover */}
                  <div className="absolute inset-4 border border-white/10 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               </motion.div>
             ))}
          </div>
        </section>

        <section id="membership" className="py-32">
          <KrishnaTestimonials />
        </section>

        {/* Final Enquiry */}
        <section id="enquiry" className="py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="max-w-4xl mx-auto px-8 relative z-10">
             <div className="glass-pane p-16 rounded-[48px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter font-manrope italic">Reserve Your Space</h2>
                  <p className="text-white/40 text-lg">Leave your contact details and our registrar will contact you within 4 hours.</p>
                </div>
                <form onSubmit={handleEnquirySubmit} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Full Name</label>
                        <input type="text" placeholder="John Doe" required className="w-full bg-white/5 p-6 rounded-2xl text-white outline-none border border-white/5 focus:border-primary/40 focus:bg-white/[0.08] transition-all placeholder:text-white/10 font-bold" value={enquiryForm.name} onChange={e => setEnquiryForm({...enquiryForm, name: e.target.value})} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Contact Number</label>
                        <input type="tel" placeholder="+91" required className="w-full bg-white/5 p-6 rounded-2xl text-white outline-none border border-white/5 focus:border-primary/40 focus:bg-white/[0.08] transition-all placeholder:text-white/10 font-bold" value={enquiryForm.phone} onChange={e => setEnquiryForm({...enquiryForm, phone: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Preferred Shift</label>
                     <div className="relative">
                       <select className="w-full bg-white/5 p-6 rounded-2xl text-white outline-none border border-white/5 focus:border-primary/40 focus:bg-white/[0.08] transition-all appearance-none cursor-pointer font-bold" value={enquiryForm.interest} onChange={e => setEnquiryForm({...enquiryForm, interest: e.target.value})}>
                         <option value="Full Day" className="bg-[#060e20] text-white">Full Day Access (Elite)</option>
                         <option value="Half Day" className="bg-[#060e20] text-white">Half Day Batch</option>
                         <option value="Night Shift" className="bg-[#060e20] text-white">Late Night Access</option>
                         <option value="Just Exploring" className="bg-[#060e20] text-white">Request Site Visit</option>
                       </select>
                       <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">expand_more</span>
                     </div>
                   </div>
                   <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-on-primary py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] flex justify-center items-center gap-3 disabled:opacity-50" disabled={enquiryStatus === 'submitting'}>
                      {enquiryStatus === 'submitting' ? "Transmitting..." : "Send Application"}
                      <span className="material-symbols-outlined text-sm">north_east</span>
                   </button>
                   {enquiryStatus === 'success' && <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl text-center mt-6 font-bold uppercase tracking-widest text-xs italic animate-pulse">Application sent successfully. Welcome to the elite circle.</div>}
                   {enquiryStatus === 'error' && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center mt-6 font-bold uppercase tracking-widest text-xs italic">Transmission failed. Please check connection.</div>}
                </form>
             </div>
          </div>
        </section>
      </main>

      {/* Elite Footer */}
      <footer className="bg-[#040a18] w-full py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-center md:text-left">
              <div className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">Krishna Library</div>
              <p className="text-white/20 font-manrope text-xs font-bold uppercase tracking-widest">Intellectual Zen Workspace. Founded 2024.</p>
            </div>
            <div className="flex flex-col md:items-end gap-6">
              <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                <a className="text-white/30 hover:text-primary transition-colors flex items-center gap-2" href="#">
                  <span className="material-symbols-outlined text-base">directions</span> Directions
                </a>
                <a className="text-white/30 hover:text-primary transition-colors" href="#">Legal</a>
                <a className="text-white/30 hover:text-primary transition-colors" href="#">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Full-screen Gallery Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#060e20]/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full max-h-[80vh] overflow-hidden rounded-[40px] border border-white/10 shadow-2xl">
                <img 
                  src={`/assets/${selectedImage.img}`} 
                  alt={selectedImage.area} 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="text-center space-y-2">
                <span className="text-primary font-black uppercase tracking-[0.4em] text-xs">Viewing Area</span>
                <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic font-manrope">
                  {selectedImage.area}
                </h3>
              </div>

              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-0 right-0 md:-top-12 md:-right-12 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
              >
                <span className="material-symbols-outlined text-white/50 group-hover:text-white group-hover:rotate-90 transition-all">close</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
