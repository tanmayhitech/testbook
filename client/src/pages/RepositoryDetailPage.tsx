import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useRepositoryDetail, useRepositoryLanguages } from "../hooks/useRepositories.js";
import {
  FolderGit2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Settings,
  Lock,
  Globe,
  Shield,
  Copy,
  Check,
} from "lucide-react";
import { CodeExplorer } from "../components/repository/CodeExplorer.js";
import { BranchesList } from "../components/repository/BranchesList.js";
import { CommitsList } from "../components/repository/CommitsList.js";
import { IssuesView } from "../components/repository/IssuesView.js";
import { PullRequestsView } from "../components/repository/PullRequestsView.js";
import { RepoSettingsTab } from "../components/repository/RepoSettingsTab.js";
import { useIssues, usePullRequests, useBranches, useCommits } from "../hooks/useVCS.js";
import { Monogram } from "../components/ui/Monogram.js";

type TabType = "code" | "branches" | "commits" | "issues" | "pulls" | "settings";

export const RepositoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "code";

  const { data: repo, isLoading, error } = useRepositoryDetail(id || "");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Live counts from VCS hooks
  const { data: branches = [] } = useBranches(repo?.id || "");
  const { data: commits = [] } = useCommits(repo?.id || "");
  const { data: issues = [] } = useIssues(repo?.id || "");
  const { data: pulls = [] } = usePullRequests(repo?.id || "");
  const { data: languages = [] } = useRepositoryLanguages(repo?.id || "");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCopyClone = () => {
    if (!repo) return;
    navigator.clipboard.writeText(`http://localhost:5000/api/repos/${repo.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-matte-900 border border-matte-800 rounded-xl animate-pulse space-y-4">
          <div className="h-6 bg-matte-800 rounded w-1/3" />
          <div className="h-4 bg-matte-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="p-8 text-center bg-matte-900 border border-matte-800 rounded-xl space-y-3 font-mono">
        <AlertCircle size={32} className="mx-auto text-red-400" />
        <h2 className="text-base font-bold text-matte-100">Repository not found</h2>
        <p className="text-xs text-matte-400">
          This repository may have been deleted or is not accessible.
        </p>
        <Link
          to="/repositories"
          className="inline-block mt-2 px-3.5 py-1.5 text-xs font-semibold text-matte-950 bg-sage-400 rounded-md"
        >
          Back to Repositories
        </Link>
      </div>
    );
  }

  const openIssuesCount = issues.filter((i) => i.status === "OPEN").length;
  const openPullsCount = pulls.filter((p) => p.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* Repository Header */}
      <div className="space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-matte-50">
            <Monogram name={repo.name} size="sm" glow />
            <span className="text-matte-400">@{repo.owner?.username || "student"}</span>
            <span className="text-matte-600">/</span>
            <span className="text-sage-300">{repo.name}</span>

            <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 rounded-full border border-matte-700 bg-matte-850 text-matte-300 ml-1">
              {repo.visibility === "PUBLIC" ? (
                <>
                  <Globe size={11} className="text-matte-400" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock size={11} className="text-matte-400" />
                  <span>Private</span>
                </>
              )}
            </span>

            {repo.currentUserRole && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-sage-700/60 bg-sage-950/60 text-sage-300">
                <Shield size={10} />
                <span>{repo.currentUserRole}</span>
              </span>
            )}
          </div>

          {/* Clone / API info */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClone}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-matte-900 hover:bg-matte-850 border border-matte-800 hover:border-matte-700 rounded-full text-xs text-matte-200 transition font-mono shadow-sm"
            >
              {copied ? <Check size={12} className="text-sage-400" /> : <Copy size={12} />}
              <span>{copied ? "Copied Endpoint" : "Clone Endpoint"}</span>
            </button>
          </div>
        </div>

        {repo.description && (
          <p className="text-xs text-matte-300 font-sans">{repo.description}</p>
        )}

        {/* Language Statistics Bar */}
        {languages.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-full rounded-full overflow-hidden flex bg-matte-850 border border-matte-800">
              {languages.map((l) => (
                <div
                  key={l.name}
                  style={{ width: `${l.percentage}%`, backgroundColor: l.color }}
                  className="h-full transition-all duration-300"
                  title={`${l.name}: ${l.percentage}% (${(l.bytes / 1024).toFixed(1)} KB)`}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-matte-400">
              {languages.slice(0, 5).map((l) => (
                <span key={l.name} className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="font-semibold text-matte-200">{l.name}</span>
                  <span className="text-matte-500">{l.percentage}%</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 pt-4 pb-1 border-b border-white/[0.08] text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleTabChange("code")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all ${
              activeTab === "code"
                ? "bg-white/[0.08] text-matte-50 font-semibold shadow-sm"
                : "text-matte-400 hover:text-matte-200 hover:bg-white/[0.03]"
            }`}
          >
            <FolderGit2 size={14} className={activeTab === "code" ? "text-sage-400" : "text-matte-400"} />
            <span>Code</span>
          </button>

          <button
            onClick={() => handleTabChange("branches")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all ${
              activeTab === "branches"
                ? "bg-white/[0.08] text-matte-50 font-semibold shadow-sm"
                : "text-matte-400 hover:text-matte-200 hover:bg-white/[0.03]"
            }`}
          >
            <GitBranch size={14} className={activeTab === "branches" ? "text-sage-400" : "text-matte-400"} />
            <span>Branches</span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] text-matte-300 font-mono border border-white/[0.08]">
              {branches.length || 1}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("commits")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all ${
              activeTab === "commits"
                ? "bg-white/[0.08] text-matte-50 font-semibold shadow-sm"
                : "text-matte-400 hover:text-matte-200 hover:bg-white/[0.03]"
            }`}
          >
            <GitCommit size={14} className={activeTab === "commits" ? "text-sage-400" : "text-matte-400"} />
            <span>Commits</span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] text-matte-300 font-mono border border-white/[0.08]">
              {commits.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("issues")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all ${
              activeTab === "issues"
                ? "bg-white/[0.08] text-matte-50 font-semibold shadow-sm"
                : "text-matte-400 hover:text-matte-200 hover:bg-white/[0.03]"
            }`}
          >
            <AlertCircle size={14} className={activeTab === "issues" ? "text-amber-400" : "text-matte-400"} />
            <span>Issues</span>
            {openIssuesCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono">
                {openIssuesCount}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] text-matte-400 font-mono border border-white/[0.08]">
                0
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("pulls")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all ${
              activeTab === "pulls"
                ? "bg-white/[0.08] text-matte-50 font-semibold shadow-sm"
                : "text-matte-400 hover:text-matte-200 hover:bg-white/[0.03]"
            }`}
          >
            <GitPullRequest size={14} className={activeTab === "pulls" ? "text-sage-400" : "text-matte-400"} />
            <span>Pull Requests</span>
            {openPullsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-sage-500/10 text-sage-300 border border-sage-500/20 text-[10px] font-mono">
                {openPullsCount}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] text-matte-400 font-mono border border-white/[0.08]">
                0
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("settings")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all ${
              activeTab === "settings"
                ? "bg-white/[0.08] text-matte-50 font-semibold shadow-sm"
                : "text-matte-400 hover:text-matte-200 hover:bg-white/[0.03]"
            }`}
          >
            <Settings size={14} className={activeTab === "settings" ? "text-sage-400" : "text-matte-400"} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === "code" && (
        <CodeExplorer
          repoId={repo.id}
          defaultBranch={repo.branches?.[0]?.name || "main"}
          repoOwner={repo.owner?.username || "student"}
        />
      )}

      {activeTab === "branches" && (
        <BranchesList
          repoId={repo.id}
          onSelectBranch={() => {
            handleTabChange("code");
          }}
        />
      )}

      {activeTab === "commits" && <CommitsList repoId={repo.id} />}

      {activeTab === "issues" && <IssuesView repoId={repo.id} />}

      {activeTab === "pulls" && <PullRequestsView repoId={repo.id} />}

      {activeTab === "settings" && <RepoSettingsTab repo={repo} />}
    </div>
  );
};
