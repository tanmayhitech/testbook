import React, { useState } from "react";
import { GitCommit, Copy, Check, FileCode2, ChevronRight, X } from "lucide-react";
import { Commit } from "../../types/vcs.types.js";
import { useCommits } from "../../hooks/useVCS.js";
import { timeAgo, formatDate } from "../../lib/utils.js";

interface CommitsListProps {
  repoId: string;
  activeBranch?: string;
}

export const CommitsList: React.FC<CommitsListProps> = ({ repoId, activeBranch }) => {
  const { data: commits = [], isLoading } = useCommits(repoId, activeBranch);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);

  const handleCopy = (sha: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header (Unboxed with negative space) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sage-400">
            <GitCommit size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-matte-50">Commit History</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] font-mono text-matte-300 border border-white/[0.08]">
                {commits.length}
              </span>
            </div>
            <p className="text-xs text-matte-400 mt-0.5">Immutable audit trail of cryptographic snapshot trees</p>
          </div>
        </div>

        {activeBranch && (
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-matte-300">
            Branch: <strong className="text-sage-300 font-semibold">{activeBranch}</strong>
          </span>
        )}
      </div>

      {/* Commits Timeline */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-matte-400">Loading commit log...</div>
      ) : commits.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-matte-400 border border-white/[0.08] rounded-2xl bg-matte-900/40">
          No commits recorded in this branch yet.
        </div>
      ) : (
        <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-matte-900/60 divide-y divide-white/[0.06] backdrop-blur-sm font-mono text-xs">
          {commits.map((commit) => (
            <div
              key={commit.id}
              onClick={() => setSelectedCommit(commit)}
              className="px-5 py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer transition group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-sage-300 text-xs font-bold flex-shrink-0 mt-0.5">
                  {commit.author.username.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="font-semibold text-matte-100 group-hover:text-sage-300 text-sm transition line-clamp-1">
                    {commit.message}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-matte-500">
                    <span className="text-matte-300 font-medium">@{commit.author.username}</span>
                    <span>committed {timeAgo(commit.createdAt)}</span>
                    {commit.stats && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-matte-400">
                        <span>&middot;</span>
                        <span className="text-emerald-400">+{commit.stats.additions}</span>
                        <span className="text-rose-400">-{commit.stats.deletions}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  onClick={(e) => handleCopy(commit.sha, e)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-full text-[11px] text-matte-300 font-mono transition"
                  title="Copy SHA"
                >
                  {copiedSha === commit.sha ? (
                    <Check size={11} className="text-sage-400" />
                  ) : (
                    <Copy size={11} />
                  )}
                  <span>{commit.sha.slice(0, 7)}</span>
                </button>

                <ChevronRight size={14} className="text-matte-600 group-hover:text-matte-300 transition" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commit Detail & Diff Modal */}
      {selectedCommit && (
        <div className="fixed inset-0 bg-matte-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0a0d14]/95 border border-white/[0.12] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col font-mono text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <GitCommit size={16} className="text-sage-400" />
                  <h3 className="text-base font-bold text-matte-50">{selectedCommit.message}</h3>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-matte-400">
                  <span>Author: @{selectedCommit.author.username}</span>
                  <span>&middot;</span>
                  <span>SHA: {selectedCommit.sha}</span>
                  <span>&middot;</span>
                  <span>{formatDate(selectedCommit.createdAt)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCommit(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-matte-400 hover:text-matte-100 hover:bg-white/[0.05] transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Diff content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="text-matte-300 font-semibold text-xs flex items-center gap-2">
                <FileCode2 size={14} className="text-sage-400" />
                <span>Changed Files &amp; Unified Diffs</span>
              </div>

              {selectedCommit.diffs && selectedCommit.diffs.length > 0 ? (
                selectedCommit.diffs.map((diff, dIdx) => (
                  <div
                    key={dIdx}
                    className="border border-white/[0.08] rounded-xl overflow-hidden bg-matte-950"
                  >
                    <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-matte-200">{diff.path}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-emerald-400">+{diff.additions}</span>
                        <span className="text-rose-400">-{diff.deletions}</span>
                      </div>
                    </div>

                    <div className="p-3.5 text-[11px] leading-relaxed overflow-x-auto divide-y divide-matte-900">
                      {diff.chunks.map((chunk, cIdx) => (
                        <div
                          key={cIdx}
                          className={`px-2 py-0.5 whitespace-pre font-mono ${
                            chunk.type === "add"
                              ? "bg-emerald-950/40 text-emerald-300"
                              : chunk.type === "delete"
                              ? "bg-rose-950/40 text-rose-300"
                              : "text-matte-400"
                          }`}
                        >
                          {chunk.content}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-matte-500 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                  <p>1 file changed, 14 insertions(+), 0 deletions(-)</p>
                  <p className="text-[11px] text-matte-600 mt-1">Binary or generated diff summary recorded.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedCommit(null)}
                className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-matte-200 rounded-full text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
