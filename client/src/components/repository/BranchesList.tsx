import React, { useState } from "react";
import { GitBranch, Plus, Trash2, Clock, CheckCircle2, Loader2, GitCommit } from "lucide-react";
import { useBranches, useCreateBranch, useDeleteBranch } from "../../hooks/useVCS.js";
import { formatDate } from "../../lib/utils.js";

interface BranchesListProps {
  repoId: string;
  onSelectBranch?: (branchName: string) => void;
}

export const BranchesList: React.FC<BranchesListProps> = ({ repoId, onSelectBranch }) => {
  const { data: branches = [], isLoading } = useBranches(repoId);
  const createBranchMutation = useCreateBranch(repoId);
  const deleteBranchMutation = useDeleteBranch(repoId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [sourceBranch, setSourceBranch] = useState("main");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!newBranchName.trim()) {
      setErrorMsg("Branch name is required");
      return;
    }

    try {
      await createBranchMutation.mutateAsync(newBranchName.trim());
      setNewBranchName("");
      setIsModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create branch");
    }
  };

  const handleDelete = async (branchName: string) => {
    if (!window.confirm(`Delete branch "${branchName}"?`)) return;
    try {
      await deleteBranchMutation.mutateAsync(branchName);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete branch");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions (Unboxed with negative space) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sage-400">
            <GitBranch size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-matte-50">Repository Branches</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] font-mono text-matte-300 border border-white/[0.08]">
                {branches.length}
              </span>
            </div>
            <p className="text-xs text-matte-400 mt-0.5">Isolated feature workflows and release branches</p>
          </div>
        </div>

        <button
          onClick={() => {
            setSourceBranch(branches.find((b) => b.isDefault)?.name || "main");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-sage-400 hover:bg-sage-300 text-matte-950 font-semibold text-xs rounded-full transition shadow-sm"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Branch</span>
        </button>
      </div>

      {/* Branches Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-matte-400 space-y-3">
          <Loader2 size={20} className="animate-spin mx-auto text-sage-400" />
          <p>Loading branches...</p>
        </div>
      ) : (
        <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-matte-900/60 divide-y divide-white/[0.06] backdrop-blur-sm">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="px-5 py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-white/[0.02] transition font-mono text-xs"
            >
              <div className="flex items-center gap-3.5">
                <GitBranch
                  size={16}
                  className={branch.isDefault ? "text-sage-400" : "text-matte-500"}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectBranch && onSelectBranch(branch.name)}
                      className="font-semibold text-matte-100 hover:text-sage-300 text-sm transition"
                    >
                      {branch.name}
                    </button>
                    {branch.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sage-500/10 text-sage-300 border border-sage-500/20 font-sans">
                        <CheckCircle2 size={10} />
                        <span>default</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-matte-500 mt-1">
                    <span className="flex items-center gap-1">
                      <GitCommit size={11} />
                      <span>{branch.commitCount} commits</span>
                    </span>
                    <span>&middot;</span>
                    <span className="text-matte-400">sha: {branch.lastCommitSha.slice(0, 7)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-matte-500 flex items-center gap-1">
                  <Clock size={11} />
                  <span>{formatDate(branch.updatedAt || branch.createdAt)}</span>
                </span>

                {!branch.isDefault && (
                  <button
                    onClick={() => handleDelete(branch.name)}
                    className="p-1.5 text-matte-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete branch"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Branch */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-matte-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0d14]/95 border border-white/[0.12] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-bold text-matte-50">Create New Branch</h3>
                <p className="text-xs text-matte-400 mt-0.5">Initialize an isolated branch pointer</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-matte-400 hover:text-matte-100 hover:bg-white/[0.05] transition"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-300 text-xs rounded-xl font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="block text-matte-300 font-medium">Branch Name *</label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. feature/graph-traversal"
                  className="w-full h-10 bg-matte-950/80 border border-white/[0.1] rounded-xl px-3.5 text-matte-100 focus:outline-none focus:border-sage-400 font-mono transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-matte-300 font-medium">Base Branch</label>
                <select
                  value={sourceBranch}
                  onChange={(e) => setSourceBranch(e.target.value)}
                  className="w-full h-10 bg-matte-950/80 border border-white/[0.1] rounded-xl px-3.5 text-matte-100 focus:outline-none focus:border-sage-400 cursor-pointer font-mono transition"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} {b.isDefault ? "(default)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-matte-400 hover:text-matte-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBranchMutation.isPending}
                  className="px-5 py-2 bg-sage-400 hover:bg-sage-300 text-matte-950 font-semibold rounded-full transition flex items-center gap-1.5 shadow-sm"
                >
                  {createBranchMutation.isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Branch</span>
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
