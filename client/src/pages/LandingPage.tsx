import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  GitBranch,
  GitPullRequest,
  ShieldCheck,
  ArrowRight,
  Layers,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../contexts/ThemeContext.js";
import { Monogram } from "../components/ui/Monogram.js";
import { MovingTicker } from "../components/ui/MovingTicker.js";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { accent, toggleAccent } = useTheme();
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      id: "branches",
      watermark: "BRANCHES",
      tagline: "01 / 04 — TOPIC BRANCH ISOLATION",
      title: "Isolated Feature Workspaces",
      command: "$ git checkout -b feature/auth-flow",
      file: "server/src/routes/auth.routes.ts",
      code: `// Isolated branch pointer guarantees zero collisions with main\nexport const authRouter = Router();\n\nauthRouter.post('/login', authRateLimiter, handleLogin);\nauthRouter.post('/register', authRateLimiter, handleRegister);\nauthRouter.get('/me', authenticate, handleCurrentUser);`,
      benefit: "Lab partners build simultaneously in isolated branches without risk of overwriting teammate code.",
      badge: "Cryptographic VCS Tree",
      ambientGlow: "from-amber-600/20 via-rose-600/10 to-transparent",
    },
    {
      id: "editor",
      watermark: "EDITOR",
      tagline: "02 / 04 — IN-BROWSER CODE EDITOR",
      title: "Real-Time Code Editing & Hot Commits",
      command: "$ testbook edit client/src/components/Navbar.tsx",
      file: "client/src/components/Navbar.tsx",
      code: `// Line numbers, 2-space tab indent & Ctrl+S shortcuts\nexport const Navbar: React.FC = () => {\n  const { user } = useAuth();\n  return (\n    <header className="backdrop-blur-xl border-b border-white/[0.08] px-6">\n      <BrandLogo />\n    </header>\n  );\n};`,
      benefit: "Engineered specifically for web development labs with atomic commit generation and line gutters.",
      badge: "In-Memory Diff Engine",
      ambientGlow: "from-sage-600/20 via-emerald-600/10 to-transparent",
    },
    {
      id: "review",
      watermark: "REVIEW",
      tagline: "03 / 04 — PEER CODE REVIEW & PRS",
      title: "Structured Pull Requests & Line Annotations",
      command: "$ testbook pr review #42 --status APPROVED",
      file: "PR #42: Add Role-Based Access Control",
      code: `@@ -12,4 +12,7 @@\n+ // Verified: VIEWER cannot commit or delete branches\n+ if (role === MemberRole.VIEWER) {\n+   throw new Error("Unauthorized: Read-only access");\n+ }`,
      benefit: "Line-by-line unified diff chunks, comment threads, and explicit peer approval before merge.",
      badge: "Role-Based Governance",
      ambientGlow: "from-blue-600/20 via-indigo-600/10 to-transparent",
    },
    {
      id: "merge",
      watermark: "MERGE",
      tagline: "04 / 04 — 3-WAY CONFLICT PROTECTION",
      title: "Atomic Merges with Conflict Guard",
      command: "$ testbook pr merge #42 --target main",
      file: "VCS 3-Way Merge Engine",
      code: `[MERGE ENGINE] Performing 3-way analysis between base, source & target...\n[VERIFICATION] Zero overlapping conflict markers detected.\n[ATOMIC MERGE] Branch 'feature/auth-flow' integrated into 'main'.\n[RESULT] Clean commit history preserved.`,
      benefit: "3-way merge conflict detection protects target branches from silent file corruption.",
      badge: "Zero-Collision Guarantee",
      ambientGlow: "from-rose-600/20 via-amber-600/10 to-transparent",
    },
  ];

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevSlide();
      if (e.key === "ArrowRight") handleNextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeSlide = slides[currentSlide]!;

  return (
    <div className="min-h-screen bg-[#07090e] text-matte-100 flex flex-col font-sans selection:bg-sage-500/20 selection:text-sage-300 antialiased overflow-x-hidden">
      {/* Ambient background glow accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-sage-500/[0.08] via-sage-500/[0.03] to-transparent blur-[160px] rounded-full" />
        <div className="absolute top-[1000px] -left-48 w-[700px] h-[500px] bg-white/[0.015] blur-[180px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <header className="h-16 border-b border-white/[0.06] bg-[#07090e]/80 backdrop-blur-xl px-6 sm:px-14 flex items-center justify-between sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Monogram icon={Code2} size="sm" glow />
            <span className="font-mono text-base font-bold tracking-tight text-matte-50">
              testbook<span className="text-sage-400">.</span>
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-matte-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Version Control</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-matte-400">
          <a href="#vcs-stage" className="hover:text-matte-100 transition">
            VCS Showcase
          </a>
          <a href="#workflows" className="hover:text-matte-100 transition">
            Workflows
          </a>
          <a href="#standards" className="hover:text-matte-100 transition">
            Engineering
          </a>
          <Link to="/repositories" className="hover:text-matte-100 transition">
            Repositories
          </Link>
        </nav>

        <div className="flex items-center gap-3 font-mono text-xs">
          {/* Color Mode Toggle */}
          <button
            onClick={toggleAccent}
            title={`Current Theme: ${accent === "pink" ? "Baby Pink" : "Sage Green"}`}
            className="btn-interactive flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono transition shadow-sm"
          >
            <span
              className={`w-2 h-2 rounded-full transition-transform duration-300 ${
                accent === "pink"
                  ? "bg-[#f472b6] shadow-[0_0_8px_#f472b6] scale-110"
                  : "bg-sage-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
              }`}
            />
            <span className="hidden sm:inline text-[11px] text-matte-300 font-medium">
              {accent === "pink" ? "Baby Pink" : "Sage"}
            </span>
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 font-semibold text-matte-950 bg-sage-400 hover:bg-sage-300 rounded-full transition shadow-sm"
            >
              <span>Workspace</span>
              <ArrowRight size={13} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 font-medium text-matte-400 hover:text-matte-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2 font-semibold text-matte-950 bg-sage-400 hover:bg-sage-300 rounded-full transition shadow-sm"
              >
                <span>Get Started</span>
                <span className="text-matte-950/70 font-bold">+</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-6 sm:px-12 py-10 sm:py-16 space-y-16">
        
        {/* ============================================================== */}
        {/* SECTION 1: WORKSPACE HERO & EDITORIAL METADATA                 */}
        {/* ============================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start pt-4 sm:pt-8 pb-10">
          
          {/* LEFT COLUMN: Headline & Pill Micro-Action */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-matte-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
              <span>Collegiate Version Control Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-matte-50 leading-[1.06] text-balance">
              Have a Great Project?
              <br />
              <span className="text-matte-100">
                Let's Collaborate<span className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 bg-sage-400 rounded-sm ml-1.5 align-baseline" />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-matte-400 max-w-xl leading-relaxed font-sans font-normal">
              Testbook gives college software students a professional version-control workflow.
              Practice structured branching, pull request peer reviews, and conflict-protected 3-way merges.
            </p>

            {/* Signature Pill Buttons */}
            <div className="flex flex-wrap items-center gap-4 font-mono pt-2">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="group inline-flex items-center gap-3 px-6 py-3 bg-matte-900 hover:bg-matte-850 text-matte-50 border border-white/[0.12] hover:border-white/[0.2] rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-black/40"
              >
                <span>{isAuthenticated ? "Enter Workspace" : "Get in Touch"}</span>
                <span className="w-5 h-5 rounded-md bg-sage-400 text-matte-950 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                  +
                </span>
              </Link>

              <Link
                to="/repositories"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.02] hover:bg-white/[0.06] text-matte-300 hover:text-matte-100 border border-white/[0.08] hover:border-white/[0.14] rounded-full text-xs sm:text-sm font-medium transition shadow-sm"
              >
                <span>Explore Repositories</span>
                <ExternalLink size={13} className="text-matte-400" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: 4 Metadata Columns (Aligned Alongside Headline) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-x-8 gap-y-10 text-left font-mono pt-4 sm:pt-6">
            
            {/* Metadata Col 1: Campus / Location */}
            <div className="space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider text-matte-500 font-semibold">
                Location
              </div>
              <div className="text-xs text-matte-300 leading-relaxed font-sans">
                <div className="text-matte-100 font-medium font-mono text-xs">BCA Project Labs</div>
                <div className="text-matte-400 text-xs">Department of Computer Applications, Campus Tech Block</div>
              </div>
            </div>

            {/* Metadata Col 2: Contact / Endpoint */}
            <div className="space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider text-matte-500 font-semibold">
                Contact
              </div>
              <div className="text-xs text-matte-300 leading-relaxed font-mono">
                <div className="text-matte-100 font-semibold">+91 98765 43210</div>
                <div className="text-sage-400 hover:underline cursor-pointer">dev@testbook.edu</div>
              </div>
            </div>

            {/* Metadata Col 3: Ecosystem Stack */}
            <div className="space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider text-matte-500 font-semibold">
                Ecosystem
              </div>
              <div className="text-xs text-matte-300 space-y-1.5 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sage-400 rounded-sm" />
                  <span className="text-matte-200">React 19 &amp; Vite</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sage-400 rounded-sm" />
                  <span className="text-matte-200">Node / Express</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sage-400 rounded-sm" />
                  <span className="text-matte-200">PostgreSQL &amp; Prisma</span>
                </div>
              </div>
            </div>

            {/* Metadata Col 4: Governance / Links */}
            <div className="space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider text-matte-500 font-semibold">
                Governance
              </div>
              <div className="text-xs text-matte-400 space-y-1.5 font-mono">
                <div className="flex items-center gap-2 text-matte-300">
                  <span className="w-1.5 h-1.5 bg-sage-400 rounded-sm" />
                  <span>OWNER &middot; CONTRIBUTOR</span>
                </div>
                <div className="text-xs text-matte-400">
                  <span>3-Way Conflict Engine</span>
                </div>
                <div>
                  <Link to="/repositories" className="text-sage-400 hover:underline text-xs">
                    Public Repositories &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: EDITORIAL SIGNATURE BAR                             */}
        {/* ============================================================== */}
        <div className="w-full border-t border-b border-white/[0.08] py-4 px-2 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-matte-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-matte-200">&copy;Testbook 2026</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-matte-300">All Systems Operational &middot; Live Version Control</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-matte-400">
            <Monogram name="TB" size="xs" glow />
            <span className="font-semibold text-matte-200 tracking-wider">Testbook VCS Core</span>
          </div>
        </div>

        {/* CONTINUOUS MOVING TICKER */}
        <MovingTicker />

        {/* ============================================================== */}
        {/* SECTION 3: THE CINEMATIC SHOWCASE STAGE & CAROUSEL */}
        {/* ============================================================== */}
        <section
          id="vcs-stage"
          className="relative w-full rounded-3xl overflow-hidden border border-white/[0.1] bg-[#05070c] shadow-2xl transition-all duration-700 min-h-[580px] sm:min-h-[660px] flex flex-col justify-between p-6 sm:p-12 interactive-card"
        >
          {/* Atmospheric ambient backlight glow that transitions with slides */}
          <div
            className={`absolute inset-0 bg-radial-gradient ${activeSlide.ambientGlow} opacity-70 pointer-events-none transition-all duration-700 blur-[120px]`}
          />

          {/* Top Stage Bar: Slide Tagline & Carousel Indicators */}
          <div className="relative z-20 flex items-center justify-between border-b border-white/[0.08] pb-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-sage-400 animate-ping" />
              <span className="text-sage-300 font-semibold tracking-wider uppercase text-[11px]">
                {activeSlide.tagline}
              </span>
            </div>

            {/* Slide Pill Dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx
                      ? "w-8 bg-sage-400"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Jump to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Architectural Watermark Typography */}
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
            <span className="text-[130px] sm:text-[220px] md:text-[320px] lg:text-[380px] font-black tracking-tighter text-white/[0.035] font-sans leading-none uppercase transition-all duration-500 transform scale-100">
              {activeSlide.watermark}
            </span>
          </div>

          {/* FLOATING CAROUSEL CONTROLS: Left (<) and Right (>) Circular Arrows */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-matte-950/80 hover:bg-matte-900 text-matte-200 hover:text-white border border-white/[0.12] hover:border-white/[0.25] flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 group"
            aria-label="Previous Showcase Slide"
          >
            <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={handleNextSlide}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-matte-950/80 hover:bg-matte-900 text-matte-200 hover:text-white border border-white/[0.12] hover:border-white/[0.25] flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 group"
            aria-label="Next Showcase Slide"
          >
            <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* CENTER STAGE: Interactive Live Terminal / Preview Box */}
          <div className="relative z-10 max-w-3xl mx-auto w-full my-auto py-8">
            <div className="bg-[#080b12]/95 border border-white/[0.12] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-left font-mono text-xs">
              
              {/* Terminal Chrome Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-matte-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-semibold text-matte-200 ml-1">
                    {activeSlide.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-sage-500/10 text-sage-300 border border-sage-500/20 text-[10px]">
                    {activeSlide.badge}
                  </span>
                </div>
              </div>

              {/* Command Header */}
              <div className="flex items-center justify-between text-[11px] text-matte-400">
                <span className="text-sage-300 font-semibold font-mono">
                  {activeSlide.command}
                </span>
                <span className="text-matte-500">{activeSlide.file}</span>
              </div>

              {/* Code Gutter & Content */}
              <pre className="p-4 bg-matte-950/80 rounded-xl border border-white/[0.06] text-matte-200 overflow-x-auto leading-relaxed text-xs">
                <code>{activeSlide.code}</code>
              </pre>

              {/* Footer Benefit Statement */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-matte-400">
                <span className="text-matte-300 font-sans">
                  &bull; {activeSlide.benefit}
                </span>
                <span className="text-emerald-400 font-mono font-semibold self-end sm:self-auto flex items-center gap-1">
                  <Check size={12} />
                  <span>Production Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Stage Footer: Quick Slide Jump Tabs */}
          <div className="relative z-20 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-white/[0.08] text-xs font-mono">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                  currentSlide === idx
                    ? "bg-white/[0.12] text-matte-50 font-semibold border border-white/[0.2]"
                    : "text-matte-400 hover:text-matte-200 hover:bg-white/[0.04]"
                }`}
              >
                {s.watermark}
              </button>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: ENGINEERING STANDARDS & 3 PILLARS */}
        {/* ============================================================== */}
        <section id="standards" className="w-full text-left space-y-10 pt-8">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-matte-50 flex items-center gap-3">
              <Layers size={22} className="text-sage-400" />
              <span>Collegiate Engineering Standards</span>
            </h2>
            <p className="text-sm text-matte-400 font-sans leading-relaxed">
              Designed specifically to bridge academic coursework with production-ready software engineering workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.14] transition space-y-4 shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sage-400 group-hover:border-sage-500/40 transition">
                <GitBranch size={19} />
              </div>
              <h3 className="text-base font-semibold text-matte-100 font-sans">
                Topic Branch Isolation
              </h3>
              <p className="text-xs sm:text-sm text-matte-400 leading-relaxed font-sans font-normal">
                Lab partners work simultaneously in separate branches. New branches automatically
                inherit files from the parent branch with full physical storage isolation.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.14] transition space-y-4 shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sage-400 group-hover:border-sage-500/40 transition">
                <GitPullRequest size={19} />
              </div>
              <h3 className="text-base font-semibold text-matte-100 font-sans">
                Peer Review &amp; 3-Way Diffs
              </h3>
              <p className="text-xs sm:text-sm text-matte-400 leading-relaxed font-sans font-normal">
                Create pull requests with unified diff chunks. Lab partners review code line-by-line,
                submit comments, and grant approval before changes are merged.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.14] transition space-y-4 shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sage-400 group-hover:border-sage-500/40 transition">
                <ShieldCheck size={19} />
              </div>
              <h3 className="text-base font-semibold text-matte-100 font-sans">
                Conflict Protection &amp; RBAC
              </h3>
              <p className="text-xs sm:text-sm text-matte-400 leading-relaxed font-sans font-normal">
                Automated 3-way conflict detection prevents file overwrites. Strict OWNER,
                CONTRIBUTOR, and VIEWER roles guarantee proper access control.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: METRICS DISPLAY */}
        {/* ============================================================== */}
        <div className="w-full p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.06] font-mono grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-matte-50 tabular-nums">13</div>
            <div className="text-[11px] text-matte-500 uppercase tracking-wider">
              Prisma Entities
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-sage-400 tabular-nums">71 / 71</div>
            <div className="text-[11px] text-matte-500 uppercase tracking-wider">
              Automated Tests
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-matte-50 tabular-nums">349 kB</div>
            <div className="text-[11px] text-matte-500 uppercase tracking-wider">
              Minified Bundle
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-emerald-400 tabular-nums">100%</div>
            <div className="text-[11px] text-matte-500 uppercase tracking-wider">
              PostgreSQL ACID Safety
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 6: BOTTOM CALL TO ACTION */}
        {/* ============================================================== */}
        <div className="w-full py-14 px-8 sm:px-12 rounded-3xl bg-gradient-to-r from-matte-900 via-matte-850 to-matte-900 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="text-left space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold font-sans text-matte-50 tracking-tight">
              Ready to Practice Real Version Control?
            </h3>
            <p className="text-sm text-matte-400 font-sans">
              Sign up in 30 seconds with your collegiate credentials.
            </p>
          </div>

          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="flex items-center gap-2.5 px-7 py-3.5 text-xs font-semibold text-matte-950 bg-sage-400 hover:bg-sage-300 rounded-full transition shadow-sm font-mono flex-shrink-0"
          >
            <span>{isAuthenticated ? "Launch Dashboard" : "Create Account Free"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </main>

      {/* Modern Minimalist Collegiate Footer */}
      <footer className="border-t border-white/[0.06] bg-[#07090e] py-12 px-6 sm:px-14 text-xs font-mono text-matte-400 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-matte-200 font-bold">
            <Code2 size={16} className="text-sage-400" />
            <span>testbook<span className="text-sage-400">.</span></span>
          </div>
          <span className="text-matte-600">&middot;</span>
          <span className="text-matte-500">&copy; 2026 Testbook. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4 text-matte-400 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Operational &middot; 99.9%</span>
          </span>
          <span className="text-matte-600">&middot;</span>
          <span>Crafted for Student Software Engineers</span>
        </div>
      </footer>
    </div>
  );
};
