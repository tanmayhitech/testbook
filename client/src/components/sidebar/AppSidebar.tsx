import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookMarked,
  User,
  Settings,
  FolderGit2,
  Plus,
  Search,
} from "lucide-react";
import { useRepositoriesList } from "../../hooks/useRepositories.js";
import { cn } from "../../lib/utils.js";
import { Monogram } from "../ui/Monogram.js";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen = false,
  onClose,
}) => {
  const { data: repositories, isLoading } = useRepositoriesList();
  const [repoFilter, setRepoFilter] = useState("");

  const mainNavItems = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
      shortcut: "D",
    },
    {
      label: "Repositories",
      to: "/repositories",
      icon: BookMarked,
      shortcut: "R",
    },
    {
      label: "Profile",
      to: "/profile",
      icon: User,
      shortcut: "P",
    },
    {
      label: "Settings",
      to: "/settings",
      icon: Settings,
      shortcut: "S",
    },
  ];

  const filteredRepos = (repositories || []).filter((r) =>
    r.name.toLowerCase().includes(repoFilter.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#07090e]/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 z-40 w-64 bg-[#080b12]/95 border-r border-white/[0.08] flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:h-full md:flex-shrink-0 font-mono select-none backdrop-blur-xl overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Main Navigation Group */}
        <div className="p-3 pt-4 space-y-1 flex-shrink-0">
          <div className="px-3 pb-2 text-[10px] font-semibold text-matte-500 uppercase tracking-widest flex items-center justify-between">
            <span>Navigation</span>
          </div>

          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ease-out group select-none border",
                    isActive
                      ? "bg-white/[0.07] text-matte-50 border-white/[0.08] shadow-sm font-semibold pl-3.5"
                      : "text-matte-400 border-transparent hover:text-matte-100 hover:bg-white/[0.045] hover:border-white/[0.06] hover:translate-x-0.5 active:scale-[0.985]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Clean vertical accent indicator on active */}
                    {isActive && (
                      <span
                        className="absolute left-1.5 top-2 bottom-2 w-[3px] rounded-full bg-sage-400 transition-all duration-200"
                        aria-hidden="true"
                      />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <item.icon
                        size={15}
                        className={cn(
                          "transition-all duration-200 flex-shrink-0",
                          isActive
                            ? "text-sage-400 scale-105"
                            : "text-matte-400 group-hover:text-sage-300 group-hover:scale-105"
                        )}
                      />
                      <span className={cn("truncate tracking-tight", isActive && "text-white font-medium")}>
                        {item.label}
                      </span>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded transition-all duration-200 flex-shrink-0 border",
                        isActive
                          ? "bg-sage-400/10 text-sage-300 border-sage-400/20 font-semibold"
                          : "bg-white/[0.025] text-matte-500 border-white/[0.04] group-hover:bg-white/[0.06] group-hover:text-matte-300 group-hover:border-white/[0.08]"
                      )}
                    >
                      {item.shortcut}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Repositories Section Header */}
        <div className="px-3.5 pt-4 pb-2 flex items-center justify-between border-t border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-matte-500 uppercase tracking-widest">
              Repositories
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/[0.04] text-[9px] text-matte-400 font-mono border border-white/[0.06]">
              {repositories?.length || 0}
            </span>
          </div>

          <NavLink
            to="/repositories"
            className="w-5 h-5 rounded-md flex items-center justify-center text-matte-400 hover:text-sage-300 hover:bg-white/[0.06] transition-all duration-150 active:scale-90"
            title="Create or browse repositories"
          >
            <Plus size={13} />
          </NavLink>
        </div>

        {/* Quick Repository Filter */}
        {repositories && repositories.length > 2 && (
          <div className="px-3 mb-2 flex-shrink-0">
            <div className="relative group">
              <Search
                size={11}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-matte-500 group-focus-within:text-sage-400 transition-colors"
              />
              <input
                type="text"
                value={repoFilter}
                onChange={(e) => setRepoFilter(e.target.value)}
                placeholder="Quick filter..."
                className="w-full h-7 bg-white/[0.025] hover:bg-white/[0.04] focus:bg-white/[0.05] border border-white/[0.07] focus:border-sage-400/60 rounded-full pl-7 pr-2.5 py-0.5 text-[11px] text-matte-200 placeholder:text-matte-600 focus:outline-none font-mono transition-all duration-150"
              />
            </div>
          </div>
        )}

        {/* Repositories Scroll List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 space-y-0.5 scrollbar-thin">
          {isLoading ? (
            <div className="py-4 space-y-2 px-2">
              <div className="h-4 bg-white/[0.03] rounded-lg animate-pulse w-3/4" />
              <div className="h-4 bg-white/[0.03] rounded-lg animate-pulse w-1/2" />
              <div className="h-4 bg-white/[0.03] rounded-lg animate-pulse w-2/3" />
            </div>
          ) : filteredRepos.length > 0 ? (
            filteredRepos.slice(0, 20).map((repo) => (
              <NavLink
                key={repo.id}
                to={`/repositories/${repo.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 ease-out truncate group select-none border",
                    isActive
                      ? "bg-white/[0.07] text-sage-300 font-semibold border-white/[0.08] shadow-sm pl-3"
                      : "text-matte-400 border-transparent hover:text-matte-100 hover:bg-white/[0.04] hover:border-white/[0.06] hover:translate-x-0.5 active:scale-[0.985]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute left-1 top-2 bottom-2 w-[2.5px] rounded-full bg-sage-400"
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <Monogram name={repo.name} size="xs" />
                      <span className="truncate group-hover:text-matte-100 transition-colors">
                        {repo.name}
                      </span>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-mono flex-shrink-0 ml-1.5 px-1.5 py-0.2 rounded transition-colors",
                        isActive
                          ? "text-sage-400 bg-sage-400/10 font-semibold"
                          : "text-matte-600 group-hover:text-matte-400 bg-white/[0.02]"
                      )}
                    >
                      {repo.counts?.branches || 1}b
                    </span>
                  </>
                )}
              </NavLink>
            ))
          ) : (
            <div className="py-6 text-center text-matte-500 text-xs px-2 space-y-1">
              <FolderGit2 size={16} className="mx-auto text-matte-600" />
              <p className="text-[11px]">No repositories found</p>
            </div>
          )}
        </div>

        {/* Minimalist Bottom Status */}
        <div className="p-3 border-t border-white/[0.06] bg-[#05070c]/60 text-[11px] font-mono text-matte-400 flex-shrink-0 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-matte-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-matte-300 font-medium">Operational</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-matte-400 border border-white/[0.06]">
            v1.0
          </span>
        </div>
      </aside>
    </>
  );
};
