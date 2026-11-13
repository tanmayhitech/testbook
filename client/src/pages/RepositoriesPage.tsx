import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRepositoriesList } from "../hooks/useRepositories.js";
import {
  BookMarked,
  Plus,
  GitBranch,
  Lock,
  Globe,
  Search,
  FolderGit2,
  Users,
  X,
} from "lucide-react";
import { timeAgo } from "../lib/utils.js";
import { Monogram } from "../components/ui/Monogram.js";
import { CreateRepositoryModal } from "../components/repository/CreateRepositoryModal.js";

type VisibilityFilter = "ALL" | "PUBLIC" | "PRIVATE";

export const RepositoriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCreate = searchParams.get("create") === "true";

  const { data: repositories = [], isLoading, error } = useRepositoriesList();

  const [filterQuery, setFilterQuery] = useState(initialSearch);
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(initialCreate);

  // Sync search / create param if url changes
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null && q !== filterQuery) {
      setFilterQuery(q);
    }
    if (searchParams.get("create") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (searchParams.get("create")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("create");
      setSearchParams(nextParams, { replace: true });
    }
  };

  const filtered = repositories.filter((r) => {
    const matchesName = r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(filterQuery.toLowerCase()));
    if (!matchesName) return false;

    if (visibilityFilter === "PUBLIC") return r.visibility === "PUBLIC";
    if (visibilityFilter === "PRIVATE") return r.visibility === "PRIVATE";
    return true;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-matte-800">
        <div>
          <h1 className="text-lg font-bold text-matte-50 flex items-center gap-2">
            <BookMarked size={18} className="text-sage-400" />
            <span>Repositories</span>
            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-matte-850 border border-matte-750 text-matte-400 ml-1">
              {repositories.length} total
            </span>
          </h1>
          <p className="text-xs text-matte-400 mt-0.5 font-sans">
            Manage and explore version-controlled code repositories
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-matte-950 bg-sage-400 hover:bg-sage-300 rounded-full transition shadow-sm self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:outline-none"
        >
          <Plus size={14} />
          <span>New Repository</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-matte-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search repositories by name or description..."
            className="w-full bg-matte-900 border border-matte-800 hover:border-matte-700 rounded-lg pl-9 pr-8 py-2 text-xs text-matte-100 placeholder:text-matte-500 focus:outline-none focus:border-sage-500 transition font-mono"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-matte-500 hover:text-matte-200"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-matte-900 p-1 rounded-lg border border-matte-800 text-[11px]">
          <button
            type="button"
            onClick={() => setVisibilityFilter("ALL")}
            className={`px-3 py-1 rounded-md transition ${
              visibilityFilter === "ALL"
                ? "bg-matte-800 text-matte-50 font-semibold"
                : "text-matte-400 hover:text-matte-200"
            }`}
          >
            All ({repositories.length})
          </button>
          <button
            type="button"
            onClick={() => setVisibilityFilter("PUBLIC")}
            className={`px-3 py-1 rounded-md transition ${
              visibilityFilter === "PUBLIC"
                ? "bg-matte-800 text-matte-50 font-semibold"
                : "text-matte-400 hover:text-matte-200"
            }`}
          >
            Public ({repositories.filter((r) => r.visibility === "PUBLIC").length})
          </button>
          <button
            type="button"
            onClick={() => setVisibilityFilter("PRIVATE")}
            className={`px-3 py-1 rounded-md transition ${
              visibilityFilter === "PRIVATE"
                ? "bg-matte-800 text-matte-50 font-semibold"
                : "text-matte-400 hover:text-matte-200"
            }`}
          >
            Private ({repositories.filter((r) => r.visibility === "PRIVATE").length})
          </button>
        </div>
      </div>

      {/* Repository Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 bg-matte-900 border border-matte-800 rounded-xl animate-pulse space-y-3"
            >
              <div className="h-4 bg-matte-800 rounded w-1/2" />
              <div className="h-3 bg-matte-800 rounded w-3/4" />
              <div className="h-3 bg-matte-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/30 border border-red-800/60 rounded-xl text-red-300 text-xs">
          Failed to load repositories. Please check server status.
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((repo) => (
            <div
              key={repo.id}
              className="p-5 bg-matte-900/90 hover:bg-matte-850/70 border border-matte-800 hover:border-matte-700 rounded-xl transition flex flex-col justify-between group shadow-sm space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Monogram name={repo.name} size="md" glow />
                    <Link
                      to={`/repositories/${repo.id}`}
                      className="font-mono text-sm font-bold text-matte-100 group-hover:text-sage-300 transition truncate"
                    >
                      {repo.name}
                    </Link>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-matte-750 bg-matte-850 text-matte-300 flex-shrink-0">
                    {repo.visibility === "PUBLIC" ? (
                      <>
                        <Globe size={10} className="text-matte-400" />
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

                <p className="text-xs text-matte-400 line-clamp-2 min-h-[32px] font-sans">
                  {repo.description || "No description provided."}
                </p>
              </div>

              {/* Bottom stats & Quick links */}
              <div className="pt-3 border-t border-matte-800/80 flex items-center justify-between text-[11px] font-mono text-matte-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <GitBranch size={12} className="text-matte-500" />
                    <span>{repo.counts?.branches || 1} branch</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} className="text-matte-500" />
                    <span>{repo.counts?.members || 1}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/repositories/${repo.id}?tab=code`}
                    className="px-2 py-0.5 rounded bg-matte-800 hover:bg-matte-750 text-matte-300 hover:text-matte-100 text-[10px] transition"
                  >
                    Code
                  </Link>
                  <Link
                    to={`/repositories/${repo.id}?tab=pulls`}
                    className="px-2 py-0.5 rounded bg-matte-800 hover:bg-matte-750 text-matte-300 hover:text-matte-100 text-[10px] transition"
                  >
                    PRs
                  </Link>
                  <span className="text-matte-600 hidden sm:inline">&middot;</span>
                  <span className="text-matte-500 text-[10px] hidden sm:inline">
                    {timeAgo(repo.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-matte-900 border border-matte-800 rounded-xl space-y-3 font-mono">
          <FolderGit2 size={36} className="mx-auto text-matte-600" />
          <h3 className="text-sm font-medium text-matte-200">No repositories found</h3>
          <p className="text-xs text-matte-400 max-w-sm mx-auto font-sans">
            {filterQuery
              ? `No repository matches "${filterQuery}".`
              : "Create your first repository to begin version controlling code."}
          </p>
          {filterQuery && (
            <button
              onClick={() => {
                setFilterQuery("");
                setVisibilityFilter("ALL");
              }}
              className="mt-2 text-xs text-sage-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Create Repository Modal (Unified, perfectly centered in workspace) */}
      <CreateRepositoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
