import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  MessageSquare,
  Search,
  Send,
  X,
  Loader2,
} from "lucide-react";
import { Issue } from "../../types/vcs.types.js";
import {
  useIssues,
  useCreateIssue,
  useAddIssueComment,
  useUpdateIssueStatus,
} from "../../hooks/useVCS.js";
import { timeAgo, formatDate } from "../../lib/utils.js";

interface IssuesViewProps {
  repoId: string;
}

export const IssuesView: React.FC<IssuesViewProps> = ({ repoId }) => {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: issues = [], isLoading } = useIssues(repoId, statusFilter);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLabels, setNewLabels] = useState("");
  const [commentInput, setCommentInput] = useState("");

  const createIssueMutation = useCreateIssue(repoId);
  const addCommentMutation = useAddIssueComment(repoId, selectedIssue?.number || 0);
  const updateStatusMutation = useUpdateIssueStatus(repoId, selectedIssue?.number || 0);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const labels = newLabels
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    await createIssueMutation.mutateAsync({
      title: newTitle.trim(),
      description: newDesc.trim(),
      labels: labels.length > 0 ? labels : ["bug"],
    });

    setNewTitle("");
    setNewDesc("");
    setNewLabels("");
    setIsNewModalOpen(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedIssue) return;

    const updated = await addCommentMutation.mutateAsync(commentInput.trim());
    setSelectedIssue(updated);
    setCommentInput("");
  };

  const handleToggleStatus = async () => {
    if (!selectedIssue) return;
    const newStatus = selectedIssue.status === "OPEN" ? "CLOSED" : "OPEN";
    const updated = await updateStatusMutation.mutateAsync(newStatus);
    setSelectedIssue(updated);
  };

  const filteredIssues = issues.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.labels.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Action and Filter Bar (Unboxed with negative space) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filters */}
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-full text-xs transition ${
                statusFilter === "ALL"
                  ? "bg-white/[0.1] text-matte-50 font-semibold shadow-sm"
                  : "text-matte-400 hover:text-matte-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("OPEN")}
              className={`px-3 py-1 rounded-full text-xs transition ${
                statusFilter === "OPEN"
                  ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                  : "text-matte-400 hover:text-matte-200"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter("CLOSED")}
              className={`px-3 py-1 rounded-full text-xs transition ${
                statusFilter === "CLOSED"
                  ? "bg-purple-500/15 text-purple-300 font-semibold"
                  : "text-matte-400 hover:text-matte-200"
              }`}
            >
              Closed
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-48 sm:w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-matte-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or label..."
              className="w-full h-8 bg-white/[0.04] border border-white/[0.08] rounded-full pl-8 pr-3 text-xs text-matte-200 placeholder:text-matte-500 focus:outline-none focus:border-sage-400 font-mono transition"
            />
          </div>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-sage-400 hover:bg-sage-300 text-matte-950 font-semibold rounded-full text-xs transition shadow-sm"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Issue</span>
        </button>
      </div>

      {/* Issues Table */}
      {isLoading ? (
        <div className="p-12 text-center text-matte-400">Loading issues...</div>
      ) : filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-matte-900/40 border border-white/[0.08] rounded-2xl space-y-3">
          <AlertCircle size={32} className="mx-auto text-matte-600" />
          <h4 className="text-sm font-bold text-matte-200">No issues found</h4>
          <p className="text-matte-500 max-w-sm mx-auto text-xs">
            Everything is running smoothly! You can open an issue to report bugs or request features.
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-matte-900/60 divide-y divide-white/[0.06] backdrop-blur-sm">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => setSelectedIssue(issue)}
              className="px-5 py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer transition group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {issue.status === "OPEN" ? (
                  <AlertCircle size={17} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 size={17} className="text-purple-400 flex-shrink-0 mt-0.5" />
                )}

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-matte-100 group-hover:text-sage-300 text-sm transition">
                      {issue.title}
                    </span>
                    {issue.labels.map((lbl, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-matte-300"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-matte-500">
                    <span>#{issue.number} opened {timeAgo(issue.createdAt)} by @{issue.author.username}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-matte-400 text-xs">
                {issue.commentsCount > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare size={13} />
                    <span>{issue.commentsCount}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Detail Discussion Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-matte-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-matte-900 border border-matte-700 rounded-xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-matte-800 pb-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-matte-400 text-sm font-bold">#{selectedIssue.number}</span>
                  <h3 className="text-sm font-bold text-matte-50">{selectedIssue.title}</h3>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                      selectedIssue.status === "OPEN"
                        ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                        : "bg-purple-950/60 border-purple-700 text-purple-300"
                    }`}
                  >
                    {selectedIssue.status === "OPEN" ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
                    <span>{selectedIssue.status}</span>
                  </span>
                  <span className="text-matte-400">
                    Opened by @{selectedIssue.author.username} &middot; {formatDate(selectedIssue.createdAt)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="text-matte-400 hover:text-matte-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: Description & Comments Timeline */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Original Description */}
              <div className="border border-matte-800 rounded-lg p-4 bg-matte-950 space-y-2">
                <div className="flex items-center justify-between text-matte-400 text-[11px] border-b border-matte-850 pb-2">
                  <span className="font-semibold text-matte-200">@{selectedIssue.author.username}</span>
                  <span>{timeAgo(selectedIssue.createdAt)}</span>
                </div>
                <p className="text-matte-200 leading-relaxed font-sans text-xs whitespace-pre-wrap">
                  {selectedIssue.description || "No description provided."}
                </p>
              </div>

              {/* Comments Thread */}
              {selectedIssue.comments.map((comm) => (
                <div
                  key={comm.id}
                  className="border border-matte-800 rounded-lg p-3 bg-matte-950/60 space-y-2 ml-4"
                >
                  <div className="flex items-center justify-between text-matte-400 text-[11px] border-b border-matte-850 pb-1.5">
                    <span className="font-semibold text-matte-200">@{comm.author.username}</span>
                    <span>{timeAgo(comm.createdAt)}</span>
                  </div>
                  <p className="text-matte-300 leading-relaxed font-sans text-xs whitespace-pre-wrap">
                    {comm.content}
                  </p>
                </div>
              ))}

              {/* Add Comment Box */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                <label className="block text-matte-300 font-semibold">Leave a comment</label>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  rows={3}
                  placeholder="Share a reproduction step, diagnostic log, or question..."
                  className="w-full bg-matte-950 border border-matte-700 rounded p-2.5 text-matte-100 focus:outline-none focus:border-sage-500 font-sans"
                  required
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`px-3 py-1.5 rounded border transition flex items-center gap-1.5 ${
                      selectedIssue.status === "OPEN"
                        ? "border-matte-700 hover:bg-matte-800 text-matte-300"
                        : "border-emerald-700 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60"
                    }`}
                  >
                    {selectedIssue.status === "OPEN" ? "Close Issue" : "Reopen Issue"}
                  </button>

                  <button
                    type="submit"
                    disabled={addCommentMutation.isPending}
                    className="px-4 py-1.5 bg-sage-500 hover:bg-sage-400 text-matte-950 font-semibold rounded transition flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    <span>Comment</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Issue */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-matte-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-matte-900 border border-matte-700 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-matte-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-matte-50">Create New Issue</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-matte-400 hover:text-matte-200 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-matte-300 mb-1 font-medium">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Array index out of bounds in quicksort"
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
                  placeholder="Describe the bug or task in detail..."
                  className="w-full bg-matte-950 border border-matte-700 rounded p-2.5 text-matte-100 focus:outline-none focus:border-sage-500"
                />
              </div>

              <div>
                <label className="block text-matte-300 mb-1 font-medium">Labels (comma-separated)</label>
                <input
                  type="text"
                  value={newLabels}
                  onChange={(e) => setNewLabels(e.target.value)}
                  placeholder="e.g. bug, algorithms, assignment-1"
                  className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-2 text-matte-100 focus:outline-none focus:border-sage-500"
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
                  disabled={createIssueMutation.isPending}
                  className="px-4 py-1.5 bg-sage-500 hover:bg-sage-400 text-matte-950 font-semibold rounded transition flex items-center gap-1.5 shadow"
                >
                  {createIssueMutation.isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Issue</span>
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
