import React, { useState } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Plus,
  GitMerge,
  GitBranch,
  MessageSquare,
  Check,
  ShieldCheck,
  Send,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { PullRequest, ReviewStatus } from "../../types/vcs.types.js";
import {
  usePullRequests,
  useCreatePullRequest,
  useSubmitReview,
  useAddPullRequestComment,
  useMergePullRequest,
  useClosePullRequest,
  useBranches,
} from "../../hooks/useVCS.js";
import { timeAgo, formatDate } from "../../lib/utils.js";

interface PullRequestsViewProps {
  repoId: string;
}

export const PullRequestsView: React.FC<PullRequestsViewProps> = ({ repoId }) => {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "MERGED" | "CLOSED">("ALL");
  const { data: pulls = [], isLoading } = usePullRequests(repoId, statusFilter);
  const { data: branches = [] } = useBranches(repoId);

  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"conversation" | "commits" | "diff">("conversation");

  // New PR Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [sourceBranch, setSourceBranch] = useState("");
  const [targetBranch, setTargetBranch] = useState("main");

  // Review / Comment states
  const [commentInput, setCommentInput] = useState("");
  const [reviewCommentInput, setReviewCommentInput] = useState("");
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("APPROVED");

  const createPRMutation = useCreatePullRequest(repoId);
  const submitReviewMutation = useSubmitReview(repoId, selectedPR?.number || 0);
  const addCommentMutation = useAddPullRequestComment(repoId, selectedPR?.number || 0);
  const mergePRMutation = useMergePullRequest(repoId, selectedPR?.number || 0);
  const closePRMutation = useClosePullRequest(repoId, selectedPR?.number || 0);

  const handleOpenNewModal = () => {
    const nonDefault = branches.find((b) => !b.isDefault);
    setSourceBranch(nonDefault ? nonDefault.name : branches[0]?.name || "main");
    setTargetBranch("main");
    setNewTitle("");
    setNewDesc("");
    setIsNewModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createPRMutation.mutateAsync({
      title: newTitle.trim(),
      description: newDesc.trim(),
      sourceBranch,
      targetBranch,
    });

    setIsNewModalOpen(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPR) return;

    const updated = await submitReviewMutation.mutateAsync({
      status: reviewStatus,
      comment: reviewCommentInput.trim() || undefined,
    });
    setSelectedPR(updated);
    setReviewCommentInput("");
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedPR) return;

    const updated = await addCommentMutation.mutateAsync(commentInput.trim());
    setSelectedPR(updated);
    setCommentInput("");
  };

  const handleMerge = async () => {
    if (!selectedPR) return;
    if (!window.confirm(`Merge pull request #${selectedPR.number} into ${selectedPR.targetBranch}?`)) return;

    const updated = await mergePRMutation.mutateAsync();
    setSelectedPR(updated);
  };

  const handleClose = async () => {
    if (!selectedPR) return;
    const updated = await closePRMutation.mutateAsync();
    setSelectedPR(updated);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Actions & Filters (Unboxed with negative space) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-full text-xs transition ${
                statusFilter === "ALL" ? "bg-white/[0.1] text-matte-50 font-semibold shadow-sm" : "text-matte-400 hover:text-matte-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("OPEN")}
              className={`px-3 py-1 rounded-full text-xs transition ${
                statusFilter === "OPEN" ? "bg-emerald-500/15 text-emerald-300 font-semibold" : "text-matte-400 hover:text-matte-200"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter("MERGED")}
              className={`px-3 py-1 rounded-full text-xs transition ${
                statusFilter === "MERGED" ? "bg-purple-500/15 text-purple-300 font-semibold" : "text-matte-400 hover:text-matte-200"
              }`}
            >
              Merged
            </button>
            <button
              onClick={() => setStatusFilter("CLOSED")}
              className={`px-3 py-1 rounded-full text-xs transition ${
                statusFilter === "CLOSED" ? "bg-rose-500/15 text-rose-300 font-semibold" : "text-matte-400 hover:text-matte-200"
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-sage-400 hover:bg-sage-300 text-matte-950 font-semibold rounded-full text-xs transition shadow-sm"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Pull Request</span>
        </button>
      </div>

      {/* Pull Requests List */}
      {isLoading ? (
        <div className="p-12 text-center text-matte-400">Loading pull requests...</div>
      ) : pulls.length === 0 ? (
        <div className="p-12 text-center bg-matte-900/40 border border-white/[0.08] rounded-2xl space-y-3">
          <GitPullRequest size={32} className="mx-auto text-matte-600" />
          <h4 className="text-sm font-bold text-matte-200">No pull requests</h4>
          <p className="text-matte-500 max-w-sm mx-auto text-xs">
            Pull requests allow students and teammates to collaborate, review code changes, and merge feature branches.
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-matte-900/60 divide-y divide-white/[0.06] backdrop-blur-sm">
          {pulls.map((pr) => (
            <div
              key={pr.id}
              onClick={() => {
                setSelectedPR(pr);
                setActiveModalTab("conversation");
              }}
              className="px-5 py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer transition group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {pr.status === "OPEN" ? (
                  <GitPullRequest size={17} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : pr.status === "MERGED" ? (
                  <GitMerge size={17} className="text-purple-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={17} className="text-rose-400 flex-shrink-0 mt-0.5" />
                )}

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-matte-100 group-hover:text-sage-300 text-sm transition">
                      {pr.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-matte-300 flex items-center gap-1 font-mono">
                      <GitBranch size={10} />
                      <span>{pr.sourceBranch} &rarr; {pr.targetBranch}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-matte-500">
                    <span>#{pr.number} by @{pr.author.username}</span>
                    <span>&middot;</span>
                    <span>opened {timeAgo(pr.createdAt)}</span>
                    {pr.reviews.some((r) => r.status === "APPROVED") && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold ml-1">
                        <Check size={11} />
                        <span>Approved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-matte-400 text-xs">
                {pr.comments.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare size={13} />
                    <span>{pr.comments.length}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pull Request Detail & Review Modal */}
      {selectedPR && (
        <div className="fixed inset-0 bg-matte-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-matte-900 border border-matte-700 rounded-xl p-5 shadow-2xl space-y-4 max-h-[92vh] flex flex-col font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-matte-800 pb-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-matte-400 text-sm font-bold">#{selectedPR.number}</span>
                  <h3 className="text-sm font-bold text-matte-50">{selectedPR.title}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${
                      selectedPR.status === "OPEN"
                        ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                        : selectedPR.status === "MERGED"
                        ? "bg-purple-950/60 border-purple-700 text-purple-300"
                        : "bg-rose-950/60 border-rose-700 text-rose-300"
                    }`}
                  >
                    {selectedPR.status === "OPEN" ? (
                      <GitPullRequest size={11} />
                    ) : selectedPR.status === "MERGED" ? (
                      <GitMerge size={11} />
                    ) : (
                      <XCircle size={11} />
                    )}
                    <span>{selectedPR.status}</span>
                  </span>

                  <span className="text-matte-400">
                    wants to merge into <strong className="text-matte-200">{selectedPR.targetBranch}</strong> from{" "}
                    <strong className="text-sage-300">{selectedPR.sourceBranch}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPR(null)}
                className="text-matte-400 hover:text-matte-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Sub-navigation */}
            <div className="flex items-center gap-2 border-b border-matte-800 text-xs">
              <button
                onClick={() => setActiveModalTab("conversation")}
                className={`px-3 py-2 border-b-2 font-medium transition ${
                  activeModalTab === "conversation"
                    ? "border-sage-500 text-matte-50 font-semibold"
                    : "border-transparent text-matte-400 hover:text-matte-200"
                }`}
              >
                Conversation ({selectedPR.comments.length})
              </button>
              <button
                onClick={() => setActiveModalTab("commits")}
                className={`px-3 py-2 border-b-2 font-medium transition ${
                  activeModalTab === "commits"
                    ? "border-sage-500 text-matte-50 font-semibold"
                    : "border-transparent text-matte-400 hover:text-matte-200"
                }`}
              >
                Commits ({selectedPR.commits.length})
              </button>
              <button
                onClick={() => setActiveModalTab("diff")}
                className={`px-3 py-2 border-b-2 font-medium transition ${
                  activeModalTab === "diff"
                    ? "border-sage-500 text-matte-50 font-semibold"
                    : "border-transparent text-matte-400 hover:text-matte-200"
                }`}
              >
                Files Changed ({selectedPR.diffs.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {activeModalTab === "conversation" && (
                <div className="space-y-4">
                  {/* PR Description Box */}
                  <div className="border border-matte-800 rounded-lg p-4 bg-matte-950 space-y-2">
                    <div className="flex items-center justify-between text-matte-400 text-[11px] border-b border-matte-850 pb-2">
                      <span className="font-semibold text-matte-200">@{selectedPR.author.username}</span>
                      <span>{formatDate(selectedPR.createdAt)}</span>
                    </div>
                    <p className="text-matte-200 leading-relaxed font-sans text-xs whitespace-pre-wrap">
                      {selectedPR.description || "No description provided."}
                    </p>
                  </div>

                  {/* Reviews Box */}
                  {selectedPR.reviews.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-matte-400 text-[11px] font-semibold uppercase tracking-wider">
                        Peer Reviews ({selectedPR.reviews.length})
                      </div>
                      {selectedPR.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="border border-matte-800 rounded-lg p-3 bg-matte-950/70 flex items-start gap-3"
                        >
                          <ShieldCheck
                            size={16}
                            className={
                              rev.status === "APPROVED"
                                ? "text-emerald-400 mt-0.5"
                                : "text-amber-400 mt-0.5"
                            }
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-matte-200">@{rev.reviewer.username}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  rev.status === "APPROVED"
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    : "bg-amber-950 text-amber-300 border border-amber-800"
                                }`}
                              >
                                {rev.status}
                              </span>
                              <span className="text-matte-500 text-[10px]">{timeAgo(rev.createdAt)}</span>
                            </div>
                            {rev.comment && (
                              <p className="text-matte-300 font-sans text-xs">{rev.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comments */}
                  {selectedPR.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="border border-matte-800 rounded-lg p-3 bg-matte-950/50 space-y-1.5 ml-4"
                    >
                      <div className="flex items-center justify-between text-matte-400 text-[11px] border-b border-matte-850 pb-1">
                        <span className="font-semibold text-matte-200">@{comm.author.username}</span>
                        <span>{timeAgo(comm.createdAt)}</span>
                      </div>
                      <p className="text-matte-300 font-sans text-xs">{comm.content}</p>
                    </div>
                  ))}

                  {/* Add Review & Comment Panel */}
                  <div className="p-4 bg-matte-950 border border-matte-800 rounded-xl space-y-3">
                    <h4 className="font-semibold text-matte-100 text-xs">Submit Peer Review</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-matte-400 text-[11px]">Verdict:</label>
                        <select
                          value={reviewStatus}
                          onChange={(e) => setReviewStatus(e.target.value as ReviewStatus)}
                          className="bg-matte-900 border border-matte-700 rounded px-2.5 py-1 text-matte-100 text-xs"
                        >
                          <option value="APPROVED">Approve (Ready to merge)</option>
                          <option value="CHANGES_REQUESTED">Request Changes</option>
                          <option value="COMMENTED">General Comment</option>
                        </select>
                      </div>

                      <textarea
                        value={reviewCommentInput}
                        onChange={(e) => setReviewCommentInput(e.target.value)}
                        placeholder="Write constructive code review notes..."
                        rows={2}
                        className="w-full bg-matte-900 border border-matte-700 rounded p-2 text-matte-100 font-sans text-xs focus:outline-none focus:border-sage-500"
                      />

                      <button
                        type="submit"
                        disabled={submitReviewMutation.isPending}
                        className="px-3.5 py-1.5 bg-sage-500 hover:bg-sage-400 text-matte-950 font-semibold rounded text-xs transition"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>

                  {/* Leave general comment */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Leave a message on this PR..."
                      className="flex-1 bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 text-xs focus:outline-none focus:border-sage-500 font-sans"
                    />
                    <button
                      type="submit"
                      disabled={addCommentMutation.isPending}
                      className="px-3 py-1.5 bg-matte-800 hover:bg-matte-700 text-matte-200 rounded text-xs flex items-center gap-1"
                    >
                      <Send size={12} />
                      <span>Reply</span>
                    </button>
                  </form>
                </div>
              )}

              {activeModalTab === "commits" && (
                <div className="space-y-2">
                  {selectedPR.commits.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-matte-950 border border-matte-800 rounded-lg flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="font-semibold text-matte-100">{c.message}</span>
                        <div className="text-[11px] text-matte-500">
                          @{c.author.username} &middot; {timeAgo(c.createdAt)}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-matte-850 border border-matte-700 text-matte-300 font-mono text-[11px]">
                        {c.sha.slice(0, 7)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeModalTab === "diff" && (
                <div className="space-y-3">
                  {selectedPR.diffs.map((diff, idx) => (
                    <div
                      key={idx}
                      className="border border-matte-800 rounded-lg overflow-hidden bg-matte-950"
                    >
                      <div className="px-3 py-2 bg-matte-850 border-b border-matte-800 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-matte-200">{diff.path}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">+{diff.additions}</span>
                          <span className="text-rose-400">-{diff.deletions}</span>
                        </div>
                      </div>

                      <div className="p-3 text-[11px] leading-relaxed overflow-x-auto divide-y divide-matte-900">
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
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer with Merge & Close Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-matte-800">
              <div className="flex items-center gap-2">
                {selectedPR.status === "OPEN" ? (
                  <>
                    <button
                      onClick={handleMerge}
                      disabled={mergePRMutation.isPending}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition flex items-center gap-1.5 shadow"
                    >
                      <GitMerge size={14} />
                      <span>{mergePRMutation.isPending ? "Merging..." : "Merge Pull Request"}</span>
                    </button>

                    <button
                      onClick={handleClose}
                      disabled={closePRMutation.isPending}
                      className="px-3 py-2 bg-matte-800 hover:bg-matte-700 text-rose-400 rounded text-xs transition"
                    >
                      Close PR
                    </button>
                  </>
                ) : selectedPR.status === "MERGED" ? (
                  <span className="inline-flex items-center gap-1.5 text-purple-400 font-semibold text-xs">
                    <CheckCircle2 size={14} />
                    <span>Pull Request successfully merged into {selectedPR.targetBranch}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                    <XCircle size={14} />
                    <span>This Pull Request is closed</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedPR(null)}
                className="px-3 py-1.5 text-matte-400 hover:text-matte-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Pull Request */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-matte-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-matte-900 border border-matte-700 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-matte-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-matte-50">Compare &amp; Open Pull Request</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-matte-400 hover:text-matte-200 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 font-mono text-xs">
              {/* Branch Selector */}
              <div className="p-3 bg-matte-950 border border-matte-800 rounded-lg flex items-center justify-between gap-2">
                <div className="flex-1">
                  <label className="block text-matte-400 text-[10px] uppercase mb-1">Target Base</label>
                  <select
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    className="w-full bg-matte-900 border border-matte-700 rounded px-2.5 py-1 text-matte-100 text-xs"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-matte-500 font-bold">&larr;</span>

                <div className="flex-1">
                  <label className="block text-matte-400 text-[10px] uppercase mb-1">Source Compare</label>
                  <select
                    value={sourceBranch}
                    onChange={(e) => setSourceBranch(e.target.value)}
                    className="w-full bg-matte-900 border border-matte-700 rounded px-2.5 py-1 text-matte-100 text-xs"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {sourceBranch === targetBranch && (
                <div className="p-2.5 bg-amber-950/40 border border-amber-800/80 rounded text-amber-300 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  <span>The source and target branches are identical. Choose different branches to compare.</span>
                </div>
              )}

              <div>
                <label className="block text-matte-300 mb-1 font-medium">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. feat: complete AVL tree rotations"
                  className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-2 text-matte-100 focus:outline-none focus:border-sage-500"
                  required
                />
              </div>

              <div>
                <label className="block text-matte-300 mb-1 font-medium">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  placeholder="Provide context, motivation, and verification steps..."
                  className="w-full bg-matte-950 border border-matte-700 rounded p-2.5 text-matte-100 focus:outline-none focus:border-sage-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-matte-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 text-matte-400 hover:text-matte-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPRMutation.isPending || sourceBranch === targetBranch}
                  className="px-4 py-1.5 bg-sage-500 hover:bg-sage-400 disabled:opacity-50 text-matte-950 font-semibold rounded transition flex items-center gap-1.5 shadow"
                >
                  {createPRMutation.isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Opening PR...</span>
                    </>
                  ) : (
                    <span>Create Pull Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
