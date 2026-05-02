"use client";
import React, { useState, useEffect } from "react";
import { Loader } from "@/components/loader";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [focusHours, setFocusHours] = useState(12450);
  const [activeStudents, setActiveStudents] = useState(842);
  const [availableSeats, setAvailableSeats] = useState(28);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const pulseInterval = setInterval(() => {
      setFocusHours(prev => prev + Math.floor(Math.random() * 5));
      setActiveStudents(prev => Math.max(800, Math.min(900, prev + (Math.floor(Math.random() * 3) - 1))));
      setAvailableSeats(prev => Math.max(0, Math.min(50, prev + (Math.floor(Math.random() * 3) - 1))));
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(pulseInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center space-y-8">
        <Loader />
        <h2 className="text-2xl font-semibold text-primary font-manrope">Loading Krishna Library...</h2>
      </div>
    );
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden relative">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 rounded-b-lg bg-surface-container/60 backdrop-blur-xl border-b border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">local_library</span>
            <span className="text-2xl font-bold tracking-tighter text-white uppercase font-manrope">Krishna Library</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <Link className="text-primary font-bold border-b-2 border-primary font-manrope tracking-tight py-1" href="#home">Home</Link>
            <Link className="text-on-surface-variant hover:bg-white/5 hover:text-white transition-all duration-300 font-manrope tracking-tight py-1 rounded px-3" href="#branches">Branches</Link>
            <Link className="text-on-surface-variant hover:bg-white/5 hover:text-white transition-all duration-300 font-manrope tracking-tight py-1 rounded px-3" href="#membership">Membership</Link>
            <Link className="text-on-surface-variant hover:bg-white/5 hover:text-white transition-all duration-300 font-manrope tracking-tight py-1 rounded px-3" href="#testimonials">Archive</Link>
          </nav>
          <Link href="/login" className="text-[10px] text-white/20 hover:text-white/60 transition-colors uppercase tracking-widest px-2 py-1">
            Staff Login
          </Link>
        </div>
      </header>

      <main className="mt-20">
        {/* Hero Section */}
        <section id="home" className="relative min-h-[795px] flex items-center justify-center overflow-hidden px-8 pt-20 -mt-20">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover opacity-40 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtxjNxGHLOjBsdywPQrFwaveRKrIIr65H8mKncDNKBhdDzQqo0vUe8nQc6UtizQVgi7__BHzHxONmUtCO2zBcK2aPmS4621lEhqdtv4aABqvG5wYdR3pYXhTtKrjC2Qe2finfXcwYWp6zh6RyZNxNAyPHkdE4FJ6rQbot-yFZGpQyWmPSMCUYs8gSIw0dcVzB7OUiFmPu3ZGbV9id_DSJ8K3mjexqiWdyT8K7LO4ChNrAHUUEQ4LGzBwTrOBdBdUu6fD4KcIJNsw" alt="Library Background" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/60 to-surface"></div>
          </div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="font-display-lg text-display-lg mb-6 leading-tight">
              Where <span className="text-primary">Focus</span> Meets <span className="text-tertiary">Technology</span>:<br />
              <span className="text-white">Your Private Gateway to Success.</span>
            </h1>
            <p className="text-on-surface-variant text-xl mb-10 max-w-2xl mx-auto font-body-md">
              India's smartest study environment designed for deep work, featuring noise-controlled zones, high-speed fiber optics, and ergonomic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-secondary-container text-white px-10 py-5 rounded-xl text-xl font-bold glow-red hover:scale-105 transition-all">
                Check Live Seat Availability
              </button>
              <button className="glass-pane text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-white/10 transition-all">
                Take a Virtual Tour
              </button>
            </div>
          </div>
        </section>

        {/* Library Pulse */}
        <section className="py-20 max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-pane p-8 rounded-2xl text-center border-t border-white/20">
              <span className="material-symbols-outlined text-tertiary text-5xl mb-4 block">timer</span>
              <div className="text-4xl font-black text-white mb-2">{focusHours.toLocaleString()}+</div>
              <div className="text-label-caps text-on-surface-variant">Focus Hours Logged This Week</div>
            </div>
            <div className="glass-pane p-8 rounded-2xl text-center border-t border-white/20">
              <span className="material-symbols-outlined text-primary text-5xl mb-4 block">group</span>
              <div className="text-4xl font-black text-white mb-2">{activeStudents}</div>
              <div className="text-label-caps text-on-surface-variant">Active Students Today</div>
            </div>
            <div className="glass-pane p-8 rounded-2xl text-center border-t border-white/20">
              <span className="material-symbols-outlined text-secondary text-5xl mb-4 block">event_seat</span>
              <div className="text-4xl font-black text-secondary mb-2">{availableSeats}</div>
              <div className="text-label-caps text-on-surface-variant">Available Seats Across Branches</div>
            </div>
          </div>
        </section>

        {/* Branch Showcase */}
        <section id="branches" className="py-24 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="font-headline-md text-headline-md text-white mb-4">Our Premium Branches</h2>
                <p className="text-on-surface-variant">Designed for silence, built for success.</p>
              </div>
              <div className="hidden md:block">
                <span className="text-primary font-bold">2 Branches Available</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* branch 1 */}
              <div className="glass-pane group overflow-hidden rounded-3xl transition-all duration-500 hover:translate-y-[-8px]">
                <div className="h-64 relative overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbMh8x8j5Byq6FVqFfReev-jJ1VIsxwwqc94VV3Q-eogACMe1ixCLeK2tGLd3s3WRLwvWPMDXAFZbxS0XzfPJmGWwKfy6mJMw-8Zd7byzirQz15EjTuO8j36ggzmX01Onjkn62kfB02eZ--ZFLERPHFwofKk49aOcsqslLzic5s3GQ3fhAINPDNbCzvTAvV57zUZJT6mPKYodGwZOacOi7A3NP3AdqcxOWdtfLqdhLyytgVDCO91KoBxg6XstIH_C0mXPTJeRUSw" alt="Bengali Chowk Branch" />
                  <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full"></span> 82% Occupied
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white font-manrope">Bengali Chowk Branch</h3>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-semibold">Flagship</div>
                  </div>
                  <p className="text-on-surface-variant mb-6 flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary shrink-0">location_on</span>
                    Plot 12, Bengali Chowk, Near City Center, Ambikapur.
                  </p>
                  <div className="flex gap-4">
                    <button className="flex-1 glass-pane py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">Virtual Tour</button>
                    <button className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold glow-blue">Book Space</button>
                  </div>
                </div>
              </div>
              {/* branch 2 */}
              <div className="glass-pane group overflow-hidden rounded-3xl transition-all duration-500 hover:translate-y-[-8px]">
                <div className="h-64 relative overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSiRIu70Nm5O3-J20NAnk_UM6f3cezodxbrO4MSXkIoG0drTUxA46lJ2ptUcx-DyE5CvOK87KkF9oeHIa9A3rFe3mgKiiJuS4C-YepmUeZt1er0qFlF4z-W5fSbfIU2a5batadhVlhdjCueRurGHsw9wgTZrAsTApkOSFRFmNy_ZEb--K4A2p9WRyZn1GFA4oxifCQICkng82CGZ04PGo_ShHlh7QCx9mkYZIhrQ-tj0OhyL5fZls3S9_2HIWeyWxhnduA0F8vdg" alt="Namnakala Branch" />
                  <div className="absolute top-4 right-4 bg-secondary-container text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-white animate-pulse rounded-full"></span> 95% Occupied
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white font-manrope">Namnakala Branch</h3>
                    <div className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-lg text-sm font-semibold">Central</div>
                  </div>
                  <p className="text-on-surface-variant mb-6 flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary shrink-0">location_on</span>
                    2nd Floor, Zenith Plaza, Namnakala Road, Ambikapur.
                  </p>
                  <div className="flex gap-4">
                    <button className="flex-1 glass-pane py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">Virtual Tour</button>
                    <button className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold glow-blue">Waitlist</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seat Map Sneak-Peek removed as per request */}

        {/* Membership */}
        <section id="membership" className="py-24 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-8 text-center mb-16">
            <h2 className="font-headline-md text-headline-md text-white mb-4">Investment in Your Future</h2>
            <p className="text-on-surface-variant">Simple, transparent, premium.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-8">
            {/* Plan 1 */}
            <div className="glass-pane p-12 rounded-3xl border border-white/5 relative flex flex-col items-center group transition-all duration-300 hover:border-primary/40">
              <h3 className="text-2xl font-bold text-white mb-2">Prime Focus</h3>
              <div className="text-4xl font-black text-primary mb-6">₹600<span className="text-lg text-on-surface-variant font-normal">/month</span></div>
              <ul className="text-on-surface-variant space-y-4 mb-10 w-full text-left">
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">verified</span> 8 Hours Daily Access</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">verified</span> High-Speed Fiber Internet</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">verified</span> Shared Refreshment Hub</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">verified</span> Standard Power Backup</li>
              </ul>
              <button className="w-full glass-pane py-4 rounded-xl font-bold hover:bg-white/10 transition-all text-white">Get Started</button>
            </div>
            {/* Plan 2 */}
            <div className="glass-pane p-12 rounded-3xl border-2 border-secondary-container relative flex flex-col items-center group transition-all duration-300 transform scale-105 shadow-[0_0_50px_rgba(255,85,64,0.15)]">
              <div className="absolute -top-5 bg-secondary-container text-white px-6 py-1 rounded-full text-sm font-black uppercase tracking-widest">Most Popular</div>
              <h3 className="text-2xl font-bold text-white mb-2">Ultimate Marathon</h3>
              <div className="text-4xl font-black text-secondary-container mb-6">₹1000<span className="text-lg text-on-surface-variant font-normal">/month</span></div>
              <ul className="text-on-surface-variant space-y-4 mb-10 w-full text-left">
                <li className="flex items-center gap-3 text-white"><span className="material-symbols-outlined text-secondary-container">star</span> 24/7 Unlimited Access</li>
                <li className="flex items-center gap-3 text-white"><span className="material-symbols-outlined text-secondary-container">star</span> Dedicated Personal Locker</li>
                <li className="flex items-center gap-3 text-white"><span className="material-symbols-outlined text-secondary-container">star</span> Priority Seat Reservation</li>
                <li className="flex items-center gap-3 text-white"><span className="material-symbols-outlined text-secondary-container">star</span> Premium Beverage Selection</li>
                <li className="flex items-center gap-3 text-white"><span className="material-symbols-outlined text-secondary-container">star</span> Digital Archive Pass</li>
              </ul>
              <button className="w-full bg-secondary-container text-white py-4 rounded-xl font-bold glow-red hover:scale-[1.02] transition-all">Upgrade to Ultimate</button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 mb-12">
            <h2 className="font-headline-md text-headline-md text-white text-center">Voices of Success</h2>
          </div>
          <div className="flex gap-8 px-8 whitespace-nowrap overflow-x-auto pb-8">
            <div className="glass-pane p-8 rounded-2xl w-80 shrink-0 inline-block whitespace-normal">
              <div className="flex text-tertiary mb-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-on-surface-variant italic mb-6 break-words">"The silence here is therapeutic. Cleared my UPSC Prelims studying at the Bengali Chowk branch."</p>
              <div className="font-bold text-white">Ananya Singh</div>
              <div className="text-sm text-primary">Civil Services Aspirant</div>
            </div>
            
            <div className="glass-pane p-8 rounded-2xl w-80 shrink-0 inline-block whitespace-normal">
              <div className="flex text-tertiary mb-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-on-surface-variant italic mb-6 break-words">"High-speed internet and the ergonomic chairs made my remote work much more productive."</p>
              <div className="font-bold text-white">Rahul Verma</div>
              <div className="text-sm text-primary">Software Engineer</div>
            </div>

            <div className="glass-pane p-8 rounded-2xl w-80 shrink-0 inline-block whitespace-normal">
              <div className="flex text-tertiary mb-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-on-surface-variant italic mb-6 break-words">"Finally found a place where I can focus for 12 hours straight without distractions."</p>
              <div className="font-bold text-white">Sneha Kapoor</div>
              <div className="text-sm text-primary">Medical Student</div>
            </div>

            <div className="glass-pane p-8 rounded-2xl w-80 shrink-0 inline-block whitespace-normal">
              <div className="flex text-tertiary mb-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-on-surface-variant italic mb-6 break-words">"The ambiance at Namnakala is world-class. Worth every rupee."</p>
              <div className="font-bold text-white">Vikram Dass</div>
              <div className="text-sm text-primary">Chartered Accountant Aspirant</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 w-full py-12 border-t border-blue-900/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto px-8 items-center">
          <div>
            <div className="text-lg font-black text-blue-50 mb-4 uppercase tracking-tighter">Krishna Library</div>
            <p className="text-slate-500 font-manrope text-sm font-medium">© 2024 Krishna Library. Intellectual Zen Workspace.</p>
            <div className="mt-6 flex gap-6">
              <a className="text-slate-500 hover:text-blue-300 transition-colors text-sm font-medium" href="#">Digital Archive</a>
              <a className="text-slate-500 hover:text-blue-300 transition-colors text-sm font-medium" href="#">Branch Locator</a>
              <a className="text-slate-500 hover:text-blue-300 transition-colors text-sm font-medium" href="#">Membership Plans</a>
              <a className="text-slate-500 hover:text-blue-300 transition-colors text-sm font-medium" href="#">Privacy Policy</a>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-4">
            <Link href="/login" className="bg-primary/5 text-primary border border-primary/20 px-6 py-2 rounded-lg font-bold hover:bg-primary/10 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Staff Portal
            </Link>
            <div className="flex gap-4">
              <a className="text-slate-500 hover:text-blue-300 transition-colors flex items-center gap-1" href="#">
                <span className="material-symbols-outlined text-base">directions</span> Get Directions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
