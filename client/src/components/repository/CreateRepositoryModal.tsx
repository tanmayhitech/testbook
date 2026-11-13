import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useCreateRepository } from "../../hooks/useRepositories.js";
import {
  X,
  Lock,
  Globe,
  Loader2,
  AlertCircle,
  FolderGit2,
} from "lucide-react";
import { cn } from "../../lib/utils.js";
import { extractErrorMessage } from "../../services/api.js";

interface CreateRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (repoId: string) => void;
}

export const CreateRepositoryModal: React.FC<CreateRepositoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const createMutation = useCreateRepository();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [formError, setFormError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setVisibility("PRIVATE");
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Repository name is required");
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        name: trimmedName,
        description: description.trim() || undefined,
        visibility,
      });

      onClose();
      if (onSuccess && created?.id) {
        onSuccess(created.id);
      }
    } catch (err) {
      setFormError(extractErrorMessage(err, "Failed to create repository"));
    }
  };

  const starterPresets = [
    { label: "Web App", name: "fullstack-web-app", desc: "Fullstack web application" },
    { label: "REST API", name: "node-express-api", desc: "Node.js & Express RESTful API" },
    { label: "Algorithms", name: "algorithms-core", desc: "Data structures & algorithms" },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="simple-modal-title"
      onClick={onClose}
      className="fixed top-14 inset-x-0 bottom-0 z-40 bg-[#07090e]/60 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0e131f] border border-white/[0.1] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 select-none text-left"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage-400/10 border border-sage-400/20 text-sage-400 flex items-center justify-center flex-shrink-0">
              <FolderGit2 size={16} />
            </div>
            <div>
              <h2 id="simple-modal-title" className="text-base font-bold text-matte-50 font-mono">
                Create a new repository
              </h2>
              <p className="text-xs text-matte-400 font-sans mt-0.5">
                Initialize an isolated version-controlled workspace.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-matte-400 hover:text-white hover:bg-white/[0.06] transition"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error notice */}
        {formError && (
          <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {/* Quick templates */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-matte-500 text-[11px]">Templates:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {starterPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setName(preset.name);
                    setDescription(preset.desc);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs transition border font-mono",
                    name === preset.name
                      ? "bg-sage-400/15 border-sage-400/40 text-sage-300 font-semibold"
                      : "bg-white/[0.03] border-white/[0.08] text-matte-400 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Repository Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-matte-200 font-mono">
              Repository name <span className="text-sage-400">*</span>
            </label>
            <div className="flex items-center bg-[#070a12] border border-white/[0.12] focus-within:border-sage-400 focus-within:ring-1 focus-within:ring-sage-400/30 rounded-xl px-3.5 h-10 transition">
              <span className="text-xs text-matte-500 font-mono select-none">
                @{user?.username || "student"}&nbsp;/&nbsp;
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                placeholder="e.g. data-structures-core"
                className="w-full bg-transparent text-xs text-white font-mono placeholder:text-matte-600 focus:outline-none"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-matte-200 font-mono">
              Description <span className="text-matte-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of your repository..."
              className="w-full h-10 bg-[#070a12] border border-white/[0.1] hover:border-white/[0.16] focus:border-sage-400 focus:ring-1 focus:ring-sage-400/30 rounded-xl px-3.5 text-xs text-white placeholder:text-matte-600 focus:outline-none transition"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-matte-200 font-mono">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility("PRIVATE")}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-start gap-2.5 transition",
                  visibility === "PRIVATE"
                    ? "bg-sage-400/10 border-sage-400/50 text-white shadow-sm"
                    : "bg-[#070a12]/70 border-white/[0.08] hover:border-white/[0.14] text-matte-400 hover:text-matte-200"
                )}
              >
                <Lock size={15} className={visibility === "PRIVATE" ? "text-sage-400 mt-0.5" : "text-matte-500 mt-0.5"} />
                <div>
                  <div className="text-xs font-semibold font-mono">Private</div>
                  <div className="text-[11px] text-matte-400 font-sans mt-0.5">Only you and invited collaborators</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("PUBLIC")}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-start gap-2.5 transition",
                  visibility === "PUBLIC"
                    ? "bg-sage-400/10 border-sage-400/50 text-white shadow-sm"
                    : "bg-[#070a12]/70 border-white/[0.08] hover:border-white/[0.14] text-matte-400 hover:text-matte-200"
                )}
              >
                <Globe size={15} className={visibility === "PUBLIC" ? "text-sage-400 mt-0.5" : "text-matte-500 mt-0.5"} />
                <div>
                  <div className="text-xs font-semibold font-mono">Public</div>
                  <div className="text-[11px] text-matte-400 font-sans mt-0.5">Anyone on collegiate network</div>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08] font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-matte-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2 bg-sage-400 hover:bg-sage-300 text-matte-950 text-xs font-semibold rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create repository</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
