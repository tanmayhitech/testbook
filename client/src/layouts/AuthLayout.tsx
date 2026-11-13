import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Code2, ShieldCheck } from "lucide-react";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center items-center p-4 selection:bg-sage-500/30 selection:text-sage-200 relative overflow-hidden font-sans">
      {/* Ambient background glow accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sage-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-sage-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Header / Logo */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-matte-50 font-semibold tracking-tight hover:opacity-95 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-matte-900 border border-matte-750 flex items-center justify-center text-sage-400 group-hover:border-sage-500/60 shadow-lg shadow-matte-950/80 transition">
              <Code2 size={20} />
            </div>
            <span className="font-mono text-xl tracking-tight text-matte-50 font-bold">
              testbook<span className="text-sage-400">.</span>
            </span>
          </Link>
          <p className="mt-2 text-xs font-mono text-matte-400">
            Student Collaborative Version-Control Platform
          </p>
        </div>

        {/* Main Glassmorphic Form Box */}
        <div className="w-full bg-[#0a0d14]/90 backdrop-blur-2xl border border-matte-750 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/80">
          <Outlet />
        </div>

        {/* Footer info */}
        <footer className="mt-8 text-center text-xs text-matte-500 font-mono flex items-center gap-2">
          <ShieldCheck size={14} className="text-sage-500" />
          <span>PostgreSQL Verified &middot; Role-Based Security</span>
        </footer>
      </div>
    </div>
  );
};
