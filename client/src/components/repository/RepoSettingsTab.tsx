import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Users,
  Shield,
  Trash2,
  Lock,
  Globe,
  Plus,
  Loader2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Repository } from "../../types/repository.types.js";
import {
  useUpdateRepository,
  useDeleteRepository,
  useRepositoryMembers,
} from "../../hooks/useRepositories.js";
import { repositoryService } from "../../services/repository.service.js";
import { useQueryClient } from "@tanstack/react-query";
import { repositoryMembersQueryKey } from "../../hooks/useRepositories.js";

interface RepoSettingsTabProps {
  repo: Repository;
}

export const RepoSettingsTab: React.FC<RepoSettingsTabProps> = ({ repo }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState(repo.name);
  const [description, setDescription] = useState(repo.description || "");
  const [visibility, setVisibility] = useState(repo.visibility);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Members state
  const { data: members = [], isLoading: isMembersLoading } = useRepositoryMembers(repo.id);
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"CONTRIBUTOR" | "VIEWER">("CONTRIBUTOR");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  const updateMutation = useUpdateRepository(repo.id);
  const deleteMutation = useDeleteRepository();

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      visibility,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberUsername.trim()) return;
    setMemberError(null);
    setIsAddingMember(true);

    try {
      await repositoryService.addMember(repo.id, newMemberUsername.trim(), newMemberRole);
      queryClient.invalidateQueries({ queryKey: repositoryMembersQueryKey(repo.id) });
      setNewMemberUsername("");
    } catch (err: unknown) {
      setMemberError(err instanceof Error ? err.message : "Failed to add collaborator");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string, username: string) => {
    if (!window.confirm(`Remove @${username} from repository collaborators?`)) return;
    try {
      await repositoryService.removeMember(repo.id, memberId);
      queryClient.invalidateQueries({ queryKey: repositoryMembersQueryKey(repo.id) });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to remove collaborator");
    }
  };

  const handleDeleteRepository = async () => {
    const confirmation = window.prompt(
      `To permanently delete this repository, type its name "${repo.name}":`
    );
    if (confirmation !== repo.name) return;

    await deleteMutation.mutateAsync(repo.id);
    navigate("/repositories");
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-4xl">
      {/* General Settings */}
      <div className="p-5 bg-matte-900 border border-matte-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-matte-800 pb-3">
          <Settings size={16} className="text-sage-400" />
          <h3 className="text-sm font-bold text-matte-50">General Information</h3>
        </div>

        <form onSubmit={handleUpdateGeneral} className="space-y-4">
          <div>
            <label className="block text-matte-300 font-medium mb-1">Repository Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full sm:w-80 bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500"
              required
            />
          </div>

          <div>
            <label className="block text-matte-300 font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-matte-950 border border-matte-700 rounded p-2.5 text-matte-100 focus:outline-none focus:border-sage-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-matte-300 font-medium mb-2">Visibility</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setVisibility("PRIVATE")}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition ${
                  visibility === "PRIVATE"
                    ? "bg-matte-800 border-sage-500 text-matte-50"
                    : "bg-matte-950 border-matte-800 text-matte-400"
                }`}
              >
                <Lock size={15} className="mt-0.5 text-sage-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-matte-100">Private</div>
                  <div className="text-[11px] text-matte-500 mt-0.5">Only you and authorized collaborators</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("PUBLIC")}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition ${
                  visibility === "PUBLIC"
                    ? "bg-matte-800 border-sage-500 text-matte-50"
                    : "bg-matte-950 border-matte-800 text-matte-400"
                }`}
              >
                <Globe size={15} className="mt-0.5 text-sage-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-matte-100">Public</div>
                  <div className="text-[11px] text-matte-500 mt-0.5">Visible to any student or faculty on campus</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-1.5 bg-sage-500 hover:bg-sage-400 text-matte-950 font-semibold rounded text-xs transition flex items-center gap-1.5 shadow"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>

            {savedSuccess && (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <Check size={12} />
                <span>Changes saved successfully</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Collaborators & RBAC */}
      <div className="p-5 bg-matte-900 border border-matte-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-matte-800 pb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-sage-400" />
            <h3 className="text-sm font-bold text-matte-50">Collaborators &amp; RBAC</h3>
          </div>
          <span className="text-[11px] text-matte-400">{members.length} members</span>
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAddMemberSubmit} className="p-3 bg-matte-950 border border-matte-800 rounded-lg space-y-3">
          <div className="font-semibold text-matte-200 text-xs">Add Collaborator</div>
          {memberError && <div className="text-rose-400 text-[11px]">{memberError}</div>}

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={newMemberUsername}
              onChange={(e) => setNewMemberUsername(e.target.value)}
              placeholder="Student username..."
              className="flex-1 min-w-[180px] bg-matte-900 border border-matte-700 rounded px-3 py-1.5 text-matte-100 text-xs focus:outline-none focus:border-sage-500"
              required
            />

            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as "CONTRIBUTOR" | "VIEWER")}
              className="bg-matte-900 border border-matte-700 rounded px-2.5 py-1.5 text-matte-100 text-xs"
            >
              <option value="CONTRIBUTOR">Contributor (Push / PR / Review)</option>
              <option value="VIEWER">Viewer (Read only)</option>
            </select>

            <button
              type="submit"
              disabled={isAddingMember}
              className="px-3.5 py-1.5 bg-sage-500 hover:bg-sage-400 text-matte-950 font-semibold rounded text-xs transition flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Members List */}
        {isMembersLoading ? (
          <div className="text-matte-500 py-3">Loading collaborators...</div>
        ) : (
          <div className="divide-y divide-matte-800/80 border border-matte-800 rounded-lg overflow-hidden bg-matte-950">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3 flex items-center justify-between gap-2 hover:bg-matte-900/50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-matte-800 border border-matte-700 flex items-center justify-center text-sage-300 font-bold text-xs">
                    {member.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-matte-100">@{member.user.username}</div>
                    <div className="text-[10px] text-matte-500">{member.user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${
                      member.role === "OWNER"
                        ? "bg-sage-950 text-sage-300 border-sage-800"
                        : member.role === "CONTRIBUTOR"
                        ? "bg-blue-950/60 text-blue-300 border-blue-800"
                        : "bg-matte-850 text-matte-400 border-matte-700"
                    }`}
                  >
                    <Shield size={10} />
                    <span>{member.role}</span>
                  </span>

                  {member.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.user.username)}
                      className="p-1 text-matte-500 hover:text-red-400 transition"
                      title="Remove member"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="p-5 bg-red-950/20 border border-red-900/40 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle size={16} />
          <h3 className="text-sm font-bold">Danger Zone</h3>
        </div>

        <p className="text-matte-400 text-xs">
          Deleting a repository will permanently remove its code files, branches, commit history, issues, and pull requests.
        </p>

        <button
          onClick={handleDeleteRepository}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 bg-red-900/60 hover:bg-red-800 border border-red-700 text-red-200 rounded text-xs font-semibold transition"
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete this repository"}
        </button>
      </div>
    </div>
  );
};
