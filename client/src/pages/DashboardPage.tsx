import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useRepositoriesList } from "../hooks/useRepositories.js";
import { useActivities } from "../hooks/useVCS.js";
import {
  BookMarked,
  Plus,
  GitBranch,
  Lock,
  Globe,
  Activity,
  FolderGit2,
  Users,
  Search,
  AlertCircle,
  Clock,
  Code2,
  GitPullRequest,
  X,
  ExternalLink,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { timeAgo, cn } from "../lib/utils.js";
import { Monogram } from "../components/ui/Monogram.js";
import { MovingTicker } from "../components/ui/MovingTicker.js";
import { CreateRepositoryModal } from "../components/repository/CreateRepositoryModal.js";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: repositories = [], isLoading, error, refetch } = useRepositoriesList();
  const { data: activities = [] } = useActivities();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeVisibilityFilter, setActiveVisibilityFilter] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");

  const filteredRepositories = repositories.filter((r) => {
    const matchesQuery = r.name.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesVisibility =
      activeVisibilityFilter === "ALL" || r.visibility === activeVisibilityFilter;
    return matchesQuery && matchesVisibility;
  });

  // Top 2 recently updated repositories
  const recentRepos = [...repositories]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 2);

  const totalBranches = repositories.reduce((acc, r) => acc + (r.counts?.branches || 1), 0);
  const totalCommits = repositories.reduce((acc, r) => acc + (r.counts?.commits || 4), 0);

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto antialiased">
      
      {/* ============================================================== */}
      {/* SECTION 1: WORKSPACE HERO & ACTIONS                            */}
      {/* ============================================================== */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-2 pb-4 text-left">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-matte-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
            <span>Developer Workspace &middot; Version Control</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-matte-50 leading-[1.08] text-balance">
            Welcome back,
            <br />
            <span className="animate-shimmer-text">
              {user?.username}
              <span className="inline-block w-2 sm:w-2.5 h-2 sm:h-2.5 bg-sage-400 rounded-sm ml-2 align-baseline shadow-sm" />
            </span>
          </h1>

          <p className="text-sm sm:text-base text-matte-400 font-sans leading-relaxed">
            Manage your repositories, branch graphs, and pull request reviews in an isolated environment.
          </p>
        </div>

        {/* Signature Capsule Buttons */}
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <Link
            to="/repositories"
            className="btn-interactive inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.07] text-matte-300 hover:text-matte-100 border border-white/[0.08] hover:border-white/[0.16] rounded-full text-xs font-medium transition shadow-sm"
          >
            <span>All Repositories</span>
            <ExternalLink size={12} className="text-matte-400" />
          </Link>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-interactive group inline-flex items-center gap-2.5 px-5 py-2.5 bg-matte-900 hover:bg-matte-850 text-matte-50 border border-white/[0.12] hover:border-white/[0.2] rounded-full text-xs font-semibold transition-all shadow-lg shadow-black/40"
          >
            <span>New Repository</span>
            <span className="w-4 h-4 rounded-md bg-sage-400 text-matte-950 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
              +
            </span>
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: EDITORIAL SIGNATURE BAR                             */}
      {/* ============================================================== */}
      <div className="w-full border-t border-b border-white/[0.08] py-3.5 px-2 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-matte-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-matte-200">&copy;Testbook 2026</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-semibold">All Systems Operational</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-matte-300">
          <Monogram name={user?.username} size="xs" status="online" />
          <span className="font-medium text-matte-200">@{user?.username}</span>
        </div>
      </div>

      {/* CONTINUOUS MOVING TICKER STREAM */}
      <MovingTicker />

      {/* ============================================================== */}
      {/* SECTION 3: THE VCS SPOTLIGHT STAGE (Vibe Stage & Stats)        */}
      {/* ============================================================== */}
      <section className="relative w-full rounded-3xl overflow-hidden border border-white/[0.08] bg-[#05070c] p-6 sm:p-10 shadow-2xl interactive-card">
        {/* Ambient atmospheric backlight glow */}
        <div className="absolute inset-0 bg-radial-gradient from-sage-600/15 via-emerald-600/5 to-transparent opacity-80 pointer-events-none blur-[140px] animate-pulse-glow" />

        {/* Large Architectural Watermark */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
          <span className="text-[120px] sm:text-[180px] md:text-[240px] font-black tracking-tighter text-white/[0.03] font-sans leading-none uppercase">
            TESTBOOK
          </span>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Top Banner Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4 font-mono text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
              <span className="text-sage-300 font-semibold tracking-wider uppercase text-[11px]">
                Active Lab Infrastructure Overview
              </span>
            </div>

            {/* Platform Node Status & Quick Refresh */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-matte-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Isolated VCS Sandbox</span>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                title="Sync and refresh stats"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-matte-300 hover:text-white transition-all duration-150 active:scale-95"
              >
                <RefreshCw size={11} className={isLoading ? "animate-spin text-sage-400" : "text-matte-400"} />
                <span>Sync Node</span>
              </button>
            </div>
          </div>

          {/* 4-Metric Grid with Generous Tabular Precision */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-left">
            <div className="p-6 rounded-2xl bg-[#090d16]/80 border border-white/[0.08] space-y-2 backdrop-blur-md shadow-sm interactive-card">
              <div className="text-[11px] text-matte-500 uppercase tracking-wider font-semibold">
                Repositories
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-matte-50 tabular-nums">
                {repositories.length}
              </div>
              <div className="text-[11px] text-matte-400 flex items-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400" />
                <span>Tracked workspaces</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#090d16]/80 border border-white/[0.08] space-y-2 backdrop-blur-md shadow-sm interactive-card">
              <div className="text-[11px] text-matte-500 uppercase tracking-wider font-semibold">
                Isolated Branches
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-sage-400 tabular-nums">
                {totalBranches}
              </div>
              <div className="text-[11px] text-matte-400 flex items-center gap-1.5 pt-1">
                <GitBranch size={11} className="text-sage-400" />
                <span>Feature pointers</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#090d16]/80 border border-white/[0.08] space-y-2 backdrop-blur-md shadow-sm interactive-card">
              <div className="text-[11px] text-matte-500 uppercase tracking-wider font-semibold">
                Total Commits
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-matte-50 tabular-nums">
                {totalCommits}
              </div>
              <div className="text-[11px] text-matte-400 flex items-center gap-1.5 pt-1">
                <span className="text-matte-500">SHA hash chain</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#090d16]/80 border border-white/[0.08] space-y-2 backdrop-blur-md shadow-sm interactive-card">
              <div className="text-[11px] text-matte-500 uppercase tracking-wider font-semibold">
                System Status
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400 flex items-center gap-2 pt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Healthy</span>
              </div>
              <div className="text-[11px] text-matte-400 flex items-center gap-1.5 pt-1">
                <span className="text-emerald-400">Zero merge collisions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: RECENTLY ACTIVE SPOTLIGHT CARDS                     */}
      {/* ============================================================== */}
      {recentRepos.length > 0 && !filterQuery && (
        <section className="space-y-4 font-mono text-left">
          <div className="flex items-center gap-2 text-xs text-matte-400">
            <Clock size={13} className="text-sage-400" />
            <span className="font-semibold text-matte-300 uppercase tracking-wider text-[11px]">
              Recently Active Repositories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recentRepos.map((repo) => (
              <div
                key={repo.id}
                className="p-6 bg-[#090d16]/70 border border-white/[0.08] hover:border-white/[0.18] rounded-2xl transition-all duration-200 flex flex-col justify-between gap-5 shadow-sm backdrop-blur-sm group hover:bg-[#0c111e]/90"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Monogram name={repo.name} size="md" glow />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/repositories/${repo.id}`}
                            className="text-base sm:text-lg font-bold text-matte-100 group-hover:text-sage-300 transition-colors line-clamp-1"
                          >
                            {repo.name}
                          </Link>
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-matte-300 flex-shrink-0">
                            {repo.visibility === "PUBLIC" ? (
                              <>
                                <Globe size={10} className="text-sage-400" />
                                <span>Public</span>
                              </>
                            ) : (
                              <>
                                <Lock size={10} className="text-matte-400" />
                                <span>Private</span>
                              </>
                            )}
                          </span>
                        </div>
                        <div className="text-[10px] text-matte-500 font-mono flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <GitBranch size={10} className="text-sage-400" />
                            {repo.counts?.branches || 1} branches
                          </span>
                          <span>&middot;</span>
                          <span>{repo.counts?.commits || 4} commits</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-matte-400 font-sans line-clamp-2 leading-relaxed">
                    {repo.description || "Project repository without description."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-[11px] text-matte-400">
                  <span className="text-matte-500 flex items-center gap-1.5">
                    <Clock size={11} className="text-matte-600" />
                    <span>Updated {timeAgo(repo.updatedAt)}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/repositories/${repo.id}?tab=code`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] text-matte-300 hover:text-white transition-all duration-150 border border-white/[0.06] hover:border-white/[0.12] active:scale-95"
                    >
                      <Code2 size={12} className="text-sage-400" />
                      <span>Code</span>
                    </Link>
                    <Link
                      to={`/repositories/${repo.id}?tab=pulls`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] text-matte-300 hover:text-white transition-all duration-150 border border-white/[0.06] hover:border-white/[0.12] active:scale-95"
                    >
                      <GitPullRequest size={12} className="text-sage-400" />
                      <span>PRs</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 5: MAIN REPOSITORIES & REAL ACTIVITY STREAM            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        
        {/* Left 2 Cols: Repositories List */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <BookMarked size={16} className="text-sage-400" />
              <h2 className="text-sm font-bold text-matte-100 font-mono uppercase tracking-wider">
                Repositories
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[11px] font-mono text-matte-300 border border-white/[0.08]">
                {filteredRepositories.length}
              </span>
            </div>

            {/* Repositories Controls: Filter Pills + Search + Quick New */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Pills */}
              <div className="inline-flex items-center bg-white/[0.03] border border-white/[0.08] rounded-full p-0.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveVisibilityFilter("ALL")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs transition-all duration-150",
                    activeVisibilityFilter === "ALL"
                      ? "bg-white/[0.12] text-matte-50 font-semibold shadow-sm"
                      : "text-matte-400 hover:text-matte-200"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVisibilityFilter("PUBLIC")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs transition-all duration-150",
                    activeVisibilityFilter === "PUBLIC"
                      ? "bg-sage-500/20 text-sage-300 font-semibold shadow-sm"
                      : "text-matte-400 hover:text-matte-200"
                  )}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVisibilityFilter("PRIVATE")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs transition-all duration-150",
                    activeVisibilityFilter === "PRIVATE"
                      ? "bg-white/[0.12] text-matte-200 font-semibold shadow-sm"
                      : "text-matte-400 hover:text-matte-200"
                  )}
                >
                  Private
                </button>
              </div>

              {/* Search Filter Input */}
              <div className="relative font-mono">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-matte-500" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter..."
                  className="w-32 sm:w-44 h-8 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-sage-400/80 rounded-full pl-8 pr-7 text-xs text-matte-200 placeholder:text-matte-500 focus:outline-none transition-all duration-150 font-mono"
                />
                {filterQuery && (
                  <button
                    onClick={() => setFilterQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-matte-500 hover:text-matte-300"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Quick New Repository Action */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="h-8 px-3.5 bg-sage-400 hover:bg-sage-300 text-matte-950 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 shadow-sm active:scale-95 font-mono"
              >
                <Plus size={13} className="stroke-[2.5]" />
                <span>New</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 bg-white/[0.02] border border-white/[0.08] rounded-2xl animate-pulse space-y-3"
                >
                  <div className="h-4 bg-white/[0.05] rounded w-1/3" />
                  <div className="h-3 bg-white/[0.05] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center justify-between font-mono">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} />
                <span>Failed to load repositories from API.</span>
              </div>
              <button
                onClick={() => refetch()}
                className="px-4 py-1.5 bg-red-900/40 hover:bg-red-900 border border-red-500/40 rounded-full text-[11px] text-red-200 transition"
              >
                Retry
              </button>
            </div>
          ) : filteredRepositories.length > 0 ? (
            <div className="space-y-4 font-mono">
              {filteredRepositories.map((repo) => (
                <Link
                  key={repo.id}
                  to={`/repositories/${repo.id}`}
                  className="block p-5 sm:p-6 bg-[#090d16]/70 hover:bg-[#0d1220]/90 border border-white/[0.08] hover:border-white/[0.18] rounded-2xl transition-all duration-200 group shadow-sm space-y-3 backdrop-blur-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Monogram name={repo.name} size="md" glow />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-base font-semibold text-matte-100 group-hover:text-sage-300 transition-colors truncate">
                            {repo.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-matte-300 flex-shrink-0">
                            {repo.visibility === "PUBLIC" ? (
                              <>
                                <Globe size={10} className="text-sage-400" />
                                <span>Public</span>
                              </>
                            ) : (
                              <>
                                <Lock size={10} className="text-matte-400" />
                                <span>Private</span>
                              </>
                            )}
                          </span>
                        </div>
                        {repo.description ? (
                          <p className="text-xs text-matte-400 font-sans line-clamp-1 leading-relaxed">
                            {repo.description}
                          </p>
                        ) : (
                          <p className="text-xs text-matte-600 italic font-sans">
                            No description provided
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-matte-400 text-xs flex-shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
                        <GitBranch size={12} className="text-sage-400" />
                        <span>{repo.counts?.branches || 1} branches</span>
                      </span>
                      <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
                        <Users size={12} className="text-matte-400" />
                        <span>{repo.counts?.members || 1}</span>
                      </span>
                      <ArrowRight size={15} className="text-matte-600 group-hover:text-sage-400 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-matte-500">
                    <span>Owner: @{repo.owner?.username || "student"}</span>
                    <span>Updated {timeAgo(repo.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : filterQuery ? (
            <div className="p-12 text-center bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-3 font-mono">
              <Search size={28} className="mx-auto text-matte-600" />
              <h3 className="text-sm font-medium text-matte-200">
                No repositories matching "{filterQuery}"
              </h3>
              <p className="text-xs text-matte-400 font-sans">
                Try clearing your search query to see all your repositories.
              </p>
              <button
                onClick={() => setFilterQuery("")}
                className="px-4 py-1.5 text-xs text-sage-400 hover:text-sage-300 border border-white/[0.08] rounded-full transition"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="p-12 text-center bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-4 font-mono">
              <FolderGit2 size={36} className="mx-auto text-matte-600" />
              <h3 className="text-base font-medium text-matte-200">No repositories created yet</h3>
              <p className="text-xs text-matte-400 max-w-sm mx-auto font-sans leading-relaxed">
                Create your first repository to start version controlling your code files.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-matte-950 bg-sage-400 hover:bg-sage-300 rounded-full transition shadow-sm"
              >
                <Plus size={14} />
                <span>Create Repository</span>
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Activity Stream & Collegiate Guide */}
        <div className="space-y-6 font-mono">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-sage-400" />
            <h2 className="text-sm font-bold text-matte-100 uppercase tracking-wider">
              Recent Activity
            </h2>
          </div>

          <div className="border border-white/[0.08] rounded-2xl bg-[#090d16]/60 backdrop-blur-sm overflow-hidden divide-y divide-white/[0.06] text-xs shadow-sm">
            {activities.length > 0 ? (
              activities.slice(0, 7).map((act) => (
                <div key={act.id} className="p-4 flex items-start gap-3 hover:bg-white/[0.02] transition group">
                  <Monogram name={act.user.username} size="sm" glow status="online" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-matte-500">
                      <span className="text-sage-400 font-semibold truncate">{act.repositoryName}</span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Clock size={10} />
                        <span>{timeAgo(act.createdAt)}</span>
                      </span>
                    </div>
                    <div className="text-matte-200 text-xs leading-relaxed font-sans">
                      <span className="font-semibold text-matte-100 font-mono">@{act.user.username} </span>
                      <span className="text-matte-300">{act.message}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-matte-500 text-xs">
                No recent activity recorded yet.
              </div>
            )}
          </div>

          {/* Structured Workflow Guide */}
          <div className="p-6 bg-[#090d16]/60 border border-white/[0.08] rounded-2xl space-y-4 text-xs text-matte-300 font-sans shadow-sm backdrop-blur-sm">
            <div className="font-mono font-bold text-matte-100 uppercase text-[11px] tracking-wider pb-2 border-b border-white/[0.06] flex items-center justify-between">
              <span>Workflow Guide</span>
              <span className="text-[10px] text-sage-400 font-normal">Best Practices</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sage-400/10 text-sage-300 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
                01
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-matte-200 block text-xs">Topic Branch Isolation</span>
                <span className="text-matte-400 text-xs leading-relaxed">
                  Isolate work into feature branches (<code className="text-sage-300 font-mono text-[11px]">feature/auth</code>) to protect main branches from accidental overwrites.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sage-400/10 text-sage-300 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
                02
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-matte-200 block text-xs">Peer Pull Request Review</span>
                <span className="text-matte-400 text-xs leading-relaxed">
                  Review teammate diffs line-by-line, write review comments, and grant approval before code is integrated.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sage-400/10 text-sage-300 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
                03
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-matte-200 block text-xs">Safe 3-Way Merge</span>
                <span className="text-matte-400 text-xs leading-relaxed">
                  Automated conflict detection prevents regressions, preserving an immutable audit trail and linear commit graph.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Create Repository Modal (Unified, perfectly centered in workspace) */}
      <CreateRepositoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
