import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useTheme } from "../../contexts/ThemeContext.js";
import { Monogram } from "../ui/Monogram.js";
import {
  BookMarked,
  Plus,
  Search,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  Code2,
  ChevronDown,
  LayoutDashboard,
  Command,
  Sparkles,
} from "lucide-react";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, logout } = useAuth();
  const { accent, setAccent, toggleAccent } = useTheme();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/repositories?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("navbar-quick-search");
        if (input) input.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-14 border-b border-matte-800 bg-[#07090e]/85 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors flex-shrink-0">
      {/* Left: Mobile menu toggle + Brand Logo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-matte-400 hover:text-matte-100 hover:bg-matte-850 transition"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}

        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 text-matte-50 font-semibold tracking-tight hover:opacity-95 transition group"
        >
          <Monogram icon={Code2} size="sm" glow />
          <span className="font-mono text-sm tracking-tight text-matte-50 font-bold">
            testbook<span className="text-sage-400">.</span>
          </span>
          <span className="hidden sm:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sage-500/10 text-sage-300 border border-sage-500/20 font-semibold">
            v1.0
          </span>
        </Link>
      </div>

      {/* Middle: Quick Search with Cmd+K hint */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden sm:flex items-center flex-1 max-w-md mx-6"
      >
        <div
          className={`relative w-full rounded-full transition-all ${
            searchFocused
              ? "ring-1 ring-sage-500/50 border-sage-500/60"
              : "border-matte-800 hover:border-matte-700"
          }`}
        >
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-matte-500 pointer-events-none"
          />
          <input
            id="navbar-quick-search"
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search repositories, branches, commits..."
            className="w-full bg-matte-950/80 border border-inherit rounded-full pl-9 pr-12 py-1.5 text-xs text-matte-100 placeholder:text-matte-500 focus:outline-none transition font-mono"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-matte-500 px-1.5 py-0.5 rounded bg-matte-900 border border-matte-800 pointer-events-none">
            <Command size={9} />
            <span>K</span>
          </div>
        </div>
      </form>

      {/* Right: Actions, Platform status & User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Color Mode / Theme Accent Toggle */}
        <button
          onClick={toggleAccent}
          title={`Current Theme: ${accent === "pink" ? "Baby Pink" : "Sage Green"}. Click to toggle!`}
          className={`btn-interactive flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono transition-all duration-150 shadow-sm active:scale-95 ${
            accent === "pink"
              ? "bg-white border border-[#f472b6] shadow-[0_2px_8px_rgba(244,114,182,0.3)]"
              : "bg-white/[0.035] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15]"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-transform duration-300 ${
              accent === "pink"
                ? "bg-[#ec4899] shadow-[0_0_8px_#ec4899] scale-110"
                : "bg-sage-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
            }`}
          />
          <span
            className={`hidden sm:inline text-[11px] font-medium transition-colors ${
              accent === "pink" ? "text-[#831843] font-bold" : "text-matte-300"
            }`}
          >
            {accent === "pink" ? "Baby Pink" : "Sage"}
          </span>
        </button>

        {/* Live Status indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.025] border border-white/[0.06] text-[11px] font-mono text-matte-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-matte-300">Live VCS</span>
        </div>

        {/* New Repo Quick Action */}
        <Link
          to="/repositories?create=true"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-matte-950 bg-sage-400 hover:bg-sage-300 rounded-full transition-all duration-150 shadow-sm font-mono active:scale-95"
        >
          <Plus size={13} className="stroke-[2.5]" />
          <span className="hidden sm:inline">New Repo</span>
        </Link>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-150 select-none group active:scale-95"
          >
            <Monogram name={user?.username} size="sm" status="online" />
            <span className="hidden md:inline text-xs font-mono text-matte-200 font-medium group-hover:text-white transition-colors">
              {user?.username}
            </span>
            <ChevronDown size={12} className="hidden md:inline text-matte-500 group-hover:text-matte-300 transition-colors" />
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-matte-900/95 backdrop-blur-xl border border-matte-750 rounded-xl shadow-2xl py-1.5 z-50 text-xs font-mono">
                <div className="px-3.5 py-2.5 border-b border-matte-800 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-matte-500 text-[10px] uppercase tracking-wider font-semibold">
                      Developer
                    </p>
                    <span className="px-1.5 py-0.2 rounded bg-sage-950 text-sage-300 border border-sage-800 text-[9px]">
                      Student
                    </span>
                  </div>
                  <p className="font-semibold text-matte-100 truncate text-xs">
                    @{user?.username}
                  </p>
                  <p className="text-matte-400 text-[11px] truncate font-sans">
                    {user?.email}
                  </p>
                </div>

                {/* Color Mode Option in Menu */}
                <div className="px-3 py-2 border-b border-matte-800 flex items-center justify-between text-[11px]">
                  <span className="text-matte-400 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-sage-400" />
                    <span>Color Mode</span>
                  </span>
                  <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-full border border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setAccent("sage")}
                      className={`px-2 py-0.5 rounded-full text-[10px] transition ${
                        accent === "sage"
                          ? "bg-sage-400 text-matte-950 font-bold shadow-sm"
                          : "text-matte-400 hover:text-matte-200"
                      }`}
                    >
                      Sage
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccent("pink")}
                      className={`px-2 py-0.5 rounded-full text-[10px] transition ${
                        accent === "pink"
                          ? "bg-[#f472b6] text-matte-950 font-bold shadow-sm"
                          : "text-matte-400 hover:text-matte-200"
                      }`}
                    >
                      Pink
                    </button>
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-matte-300 hover:bg-matte-800 hover:text-matte-100 transition"
                  >
                    <LayoutDashboard size={13} className="text-sage-400" />
                    <span>Workspace</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-matte-300 hover:bg-matte-800 hover:text-matte-100 transition"
                  >
                    <User size={13} className="text-sage-400" />
                    <span>Profile &amp; Activity</span>
                  </Link>

                  <Link
                    to="/repositories"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-matte-300 hover:bg-matte-800 hover:text-matte-100 transition"
                  >
                    <BookMarked size={13} className="text-sage-400" />
                    <span>All Repositories</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-matte-300 hover:bg-matte-800 hover:text-matte-100 transition"
                  >
                    <Settings size={13} className="text-sage-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="border-t border-matte-800 pt-1 px-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition text-left"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
