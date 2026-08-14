import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campus Career Copilot — AI-Powered Placement Readiness',
  description:
    'AI-powered campus placement assistant with resume analysis, skill journeys, and peer benchmarking.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080B09] text-slate-200 font-sans selection:bg-[#00D68F]/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/4 w-[800px] h-[800px] bg-[#00D68F]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      
      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-white tracking-tight font-serif">
          Campus Career Copilot
        </div>
        <nav className="hidden md:flex gap-10 text-sm font-semibold">
          <Link href="#" className="text-[#00D68F]">Students</Link>
          <Link href="#" className="text-slate-300 hover:text-white transition-colors">Institutions</Link>
        </nav>
        <Link href="/signup" className="bg-[#00D68F] hover:bg-[#00e89b] text-[#041a12] px-6 py-2.5 rounded-lg font-bold text-sm transition-all">
          Get Started
        </Link>
      </header>

      {/* Main content - Bento Grid */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Hero Card */}
          <div className="col-span-1 md:col-span-2 rounded-[2rem] border border-[#1e2923] bg-gradient-to-br from-[#121815] to-[#0d120f] p-10 md:p-14 relative overflow-hidden group flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D68F]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-[#00D68F]/15 transition-all duration-700"></div>
            
            <div className="relative z-10 max-w-xl">
              <h1 className="text-5xl md:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight font-serif mb-6">
                Your Campus <br/>Placement Journey,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D68F] to-emerald-200 italic font-medium">Supercharged by AI</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10 max-w-md">
                Navigate the complexities of elite placement engineering. Precision tools for ambitious students and institutions.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Link href="/signup" className="bg-[#00D68F] hover:bg-[#00e89b] text-[#041a12] px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,214,143,0.2)] hover:shadow-[0_0_30px_rgba(0,214,143,0.4)]">
                  Start Your Journey
                </Link>
                <Link href="#features" className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
                  Explore Features <span className="text-[#00D68F]">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Engineering Success Card */}
          <div className="col-span-1 rounded-[2rem] border border-[#1e2923] bg-[#121815] overflow-hidden relative flex flex-col group min-h-[400px]">
            {/* Visual Header */}
            <div className="flex-grow w-full relative overflow-hidden bg-[#0d1410] min-h-[200px]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#121815] via-transparent to-transparent z-10"></div>
              {/* Abstract Network Visual */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00D68F]/30 via-transparent to-transparent mix-blend-screen"></div>
              <svg className="absolute w-full h-full text-[#00D68F]/30 stroke-current group-hover:scale-105 transition-transform duration-1000 origin-center" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M-10,50 Q25,25 50,50 T110,50" fill="none" strokeWidth="0.5" />
                <path d="M-10,70 Q40,10 60,60 T110,40" fill="none" strokeWidth="0.3" />
                <path d="M-10,30 Q30,80 70,30 T110,60" fill="none" strokeWidth="0.4" />
                <path d="M30,-10 Q40,50 50,110" fill="none" strokeWidth="0.2" />
                <path d="M70,-10 Q60,50 80,110" fill="none" strokeWidth="0.3" />
                <circle cx="50" cy="50" r="1.5" fill="currentColor" className="animate-pulse" />
                <circle cx="25" cy="37.5" r="1" fill="currentColor" />
                <circle cx="75" cy="56.25" r="1" fill="currentColor" />
                <circle cx="40" cy="80" r="1" fill="currentColor" />
                <circle cx="60" cy="20" r="1" fill="currentColor" />
              </svg>
            </div>
            <div className="p-8 relative z-20 shrink-0">
              <h3 className="text-2xl font-bold text-white mb-3 font-serif">Engineering Success</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tools designed for the modern campus ecosystem, combining deep analytics with intuitive design.
              </p>
            </div>
          </div>

          {/* AI Resume Analysis Card */}
          <div className="col-span-1 rounded-[2rem] border border-[#1e2923] bg-[#121815] p-8 md:p-10 relative overflow-hidden group hover:border-[#00D68F]/30 transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00D68F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-12 h-12 rounded-xl bg-[#1a231d] flex items-center justify-center mb-6 text-[#00D68F] border border-white/5 shadow-[0_0_15px_rgba(0,214,143,0.05)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 font-serif">AI Resume Analysis</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time feedback and intelligent restructuring to align your profile with elite industry standards.
            </p>
          </div>

          {/* Curated Skill Journeys Card */}
          <div className="col-span-1 md:col-span-2 rounded-[2rem] border border-[#1e2923] bg-[#121815] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group hover:border-[#00D68F]/30 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00D68F]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#00D68F]/10 transition-all duration-500"></div>
            <div className="max-w-md relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#1a231d] flex items-center justify-center mb-6 text-[#00D68F] border border-white/5 shadow-[0_0_15px_rgba(0,214,143,0.05)]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-serif">Curated Skill Journeys</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Personalized roadmaps driven by predictive analytics to bridge the gap between academia and industry requirements.
              </p>
            </div>
            {/* Progress Bar Visual */}
            <div className="w-full md:w-56 h-2 bg-[#1a231d] rounded-full overflow-hidden shrink-0 relative z-10 mt-4 md:mt-0 shadow-inner">
              <div className="h-full bg-[#00D68F] w-[70%] rounded-full relative">
                <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/40 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Peer Progress Hub Card */}
          <div className="col-span-1 md:col-span-3 rounded-[2rem] border border-[#1e2923] bg-gradient-to-r from-[#121815] to-[#101412] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group hover:border-[#00D68F]/30 transition-colors duration-300 relative overflow-hidden">
             <div className="absolute top-1/2 left-1/4 w-[400px] h-[200px] bg-[#00D68F]/5 rounded-full blur-3xl -translate-y-1/2 group-hover:bg-[#00D68F]/10 transition-all duration-500"></div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#1a231d] flex items-center justify-center text-[#00D68F] border border-white/5 shrink-0 shadow-[0_0_15px_rgba(0,214,143,0.05)]">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 font-serif">Peer Progress Hub</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                  Track cohorts, share insights, and benchmark performance in a collaborative environment.
                </p>
              </div>
            </div>
            {/* Avatars */}
            <div className="flex -space-x-3 shrink-0 relative z-10 mt-4 md:mt-0">
              <div className="w-11 h-11 rounded-full bg-[#233028] border-[3px] border-[#121815] flex items-center justify-center text-sm font-bold text-white shadow-lg">C</div>
              <div className="w-11 h-11 rounded-full bg-[#1e2923] border-[3px] border-[#121815] flex items-center justify-center text-sm font-bold text-white shadow-lg">A</div>
              <div className="w-11 h-11 rounded-full bg-[#00D68F] border-[3px] border-[#121815] flex items-center justify-center text-sm font-bold text-[#041a12] shadow-[0_0_15px_rgba(0,214,143,0.3)]">+12</div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <div className="text-xl font-bold text-slate-300 font-serif">Campus Career Copilot</div>
          <p className="text-slate-400 text-xs">
            © 2024 Campus Career Copilot. <span className="text-[#00D68F]/80">Elite placement engineering.</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-semibold text-slate-400">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/login" className="hover:text-white transition-colors">Institutional Login</Link>
          <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
}
