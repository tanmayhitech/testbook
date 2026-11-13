import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FileText,
  Folder,
  GitBranch,
  Plus,
  Clock,
  ChevronRight,
  FileCode2,
  Trash2,
  Edit3,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Download,
  Search,
  Eye,
  Code2,
  X,
  ChevronDown,
  ChevronUp,
  Replace,
} from "lucide-react";
import { FileItem } from "../../types/vcs.types.js";
import { useFiles, useSaveFile, useDeleteFile, useBranches } from "../../hooks/useVCS.js";
import { timeAgo } from "../../lib/utils.js";
import { MarkdownRenderer } from "./MarkdownRenderer.js";

interface CodeExplorerProps {
  repoId: string;
  defaultBranch?: string;
  repoOwner: string;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({
  repoId,
  defaultBranch = "main",
  repoOwner,
}) => {
  const { data: branches = [] } = useBranches(repoId);
  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
  const { data: files = [], isLoading } = useFiles(repoId, selectedBranch);

  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);
  const [activeFileViewMode, setActiveFileViewMode] = useState<"code" | "preview">("code");

  // Edit/Create Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [filePathInput, setFilePathInput] = useState("");
  const [fileContentInput, setFileContentInput] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [commitMessageInput, setCommitMessageInput] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");

  // Find & Replace state
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const saveFileMutation = useSaveFile(repoId, selectedBranch);
  const deleteFileMutation = useDeleteFile(repoId, selectedBranch);

  const isDirty = useMemo(() => {
    return fileContentInput !== initialContent;
  }, [fileContentInput, initialContent]);

  // Synchronize scroll between gutter and textarea
  const handleEditorScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Find matches calculation
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const matches: number[] = [];
    let pos = fileContentInput.toLowerCase().indexOf(searchQuery.toLowerCase());
    while (pos !== -1) {
      matches.push(pos);
      pos = fileContentInput.toLowerCase().indexOf(searchQuery.toLowerCase(), pos + 1);
    }
    return matches;
  }, [fileContentInput, searchQuery]);

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIdx);
    highlightMatch(searchMatches[nextIdx]!);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIdx);
    highlightMatch(searchMatches[prevIdx]!);
  };

  const highlightMatch = (startIndex: number) => {
    if (!textareaRef.current) return;
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(startIndex, startIndex + searchQuery.length);
  };

  const handleReplaceCurrent = () => {
    if (searchMatches.length === 0 || !textareaRef.current) return;
    const targetPos = searchMatches[currentMatchIndex] ?? searchMatches[0]!;
    const updated =
      fileContentInput.substring(0, targetPos) +
      replaceQuery +
      fileContentInput.substring(targetPos + searchQuery.length);
    setFileContentInput(updated);
  };

  const handleReplaceAll = () => {
    if (!searchQuery.trim()) return;
    const updated = fileContentInput.split(searchQuery).join(replaceQuery);
    setFileContentInput(updated);
  };

  // Tab key and keyboard shortcuts in code editor
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Outdent 2 spaces
        const before = fileContentInput.substring(0, start);
        const after = fileContentInput.substring(end);
        if (before.endsWith("  ")) {
          setFileContentInput(before.slice(0, -2) + after);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = Math.max(
                0,
                start - 2
              );
            }
          }, 0);
        }
      } else {
        // Indent 2 spaces
        const updated = fileContentInput.substring(0, start) + "  " + fileContentInput.substring(end);
        setFileContentInput(updated);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSaveFileSubmit(e as unknown as React.FormEvent);
    } else if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      setIsFindOpen((prev) => !prev);
    }
  };

  // Global ESC key listener to close modal or search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFindOpen) {
          setIsFindOpen(false);
        } else if (isEditorOpen) {
          setIsEditorOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFindOpen, isEditorOpen]);

  // Filter files by folder level
  const displayedItems = useMemo(() => {
    const itemsMap = new Map<string, { type: "file" | "dir"; item?: FileItem; name: string }>();

    files.forEach((file) => {
      let relative = file.path;
      if (currentFolder) {
        if (!file.path.startsWith(currentFolder + "/")) return;
        relative = file.path.slice(currentFolder.length + 1);
      }

      const parts = relative.split("/");
      if (parts.length === 1) {
        itemsMap.set(parts[0]!, { type: "file", item: file, name: parts[0]! });
      } else {
        const dirName = parts[0]!;
        if (!itemsMap.has(dirName)) {
          itemsMap.set(dirName, { type: "dir", name: dirName });
        }
      }
    });

    return Array.from(itemsMap.values()).sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [files, currentFolder]);

  // Root README file
  const rootReadmeFile = useMemo(() => {
    if (currentFolder !== "") return null;
    return files.find(
      (f) =>
        f.path.toLowerCase() === "readme.md" ||
        f.path.toLowerCase() === "readme" ||
        f.name.toLowerCase() === "readme.md"
    );
  }, [files, currentFolder]);

  const handleOpenFolder = (dirName: string) => {
    setCurrentFolder((prev) => (prev ? `${prev}/${dirName}` : dirName));
    setActiveFile(null);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentFolder("");
      setActiveFile(null);
      return;
    }
    const parts = currentFolder.split("/").slice(0, index + 1);
    setCurrentFolder(parts.join("/"));
    setActiveFile(null);
  };

  const handleOpenFile = (file: FileItem) => {
    setActiveFile(file);
    setActiveFileViewMode(file.name.toLowerCase().endsWith(".md") ? "preview" : "code");
  };

  const handleOpenCreateModal = () => {
    setEditorMode("CREATE");
    setFilePathInput(currentFolder ? `${currentFolder}/` : "");
    const initial = "// Enter code here\n";
    setFileContentInput(initial);
    setInitialContent(initial);
    setCommitMessageInput("feat: add new file");
    setEditorTab("edit");
    setIsFindOpen(false);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (file: FileItem) => {
    setEditorMode("EDIT");
    setFilePathInput(file.path);
    const content = file.content || "";
    setFileContentInput(content);
    setInitialContent(content);
    setCommitMessageInput(`update ${file.name}`);
    setEditorTab("edit");
    setIsFindOpen(false);
    setIsEditorOpen(true);
  };

  const handleSaveFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePathInput.trim()) return;

    await saveFileMutation.mutateAsync({
      path: filePathInput.trim(),
      content: fileContentInput,
      commitMessage: commitMessageInput.trim() || `update ${filePathInput.trim()}`,
    });

    setIsEditorOpen(false);
    if (activeFile && activeFile.path === filePathInput.trim()) {
      setActiveFile({
        ...activeFile,
        content: fileContentInput,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (!window.confirm(`Are you sure you want to delete ${file.path}?`)) return;
    await deleteFileMutation.mutateAsync({
      path: file.path,
      commitMessage: `delete ${file.path}`,
    });
    if (activeFile?.id === file.id) {
      setActiveFile(null);
    }
  };

  const handleCopyCode = () => {
    if (!activeFile?.content) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadFile = (file: FileItem) => {
    const blob = new Blob([file.content || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name || "download.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lineCount = useMemo(() => {
    return fileContentInput.split("\n").length;
  }, [fileContentInput]);

  return (
    <div className="space-y-6">
      {/* Branch selector & Actions Toolbar (Unboxed with negative space) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-3">
          {/* Branch Dropdown */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full">
            <GitBranch size={13} className="text-sage-400" />
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setActiveFile(null);
              }}
              className="bg-transparent text-xs text-matte-100 font-mono focus:outline-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.name} className="bg-matte-900 text-matte-100">
                  {b.name} {b.isDefault ? "(default)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Breadcrumb Path */}
          <div className="hidden sm:flex items-center gap-1.5 text-matte-400 text-xs">
            <button
              onClick={() => handleNavigateBreadcrumb(-1)}
              className="hover:text-matte-100 font-semibold transition"
            >
              root
            </button>
            {currentFolder &&
              currentFolder.split("/").map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight size={12} className="text-matte-600" />
                  <button
                    onClick={() => handleNavigateBreadcrumb(idx)}
                    className="hover:text-matte-100 transition"
                  >
                    {crumb}
                  </button>
                </React.Fragment>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {activeFile && (
            <button
              onClick={() => setActiveFile(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-matte-300 hover:text-matte-100 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-full text-xs transition"
            >
              <ArrowLeft size={13} />
              <span>Back to files</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-sage-400 hover:bg-sage-300 text-matte-950 font-semibold rounded-full text-xs transition shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add File</span>
          </button>
        </div>
      </div>

      {/* Main File Browser or File Viewer */}
      {activeFile ? (
        /* File Viewer Mode */
        <div className="border border-matte-800 rounded-xl overflow-hidden bg-matte-900 shadow-md">
          {/* File Header Bar */}
          <div className="px-4 py-3 bg-matte-850 border-b border-matte-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <FileCode2 size={16} className="text-sage-400" />
              <span className="font-semibold text-matte-100">{activeFile.path}</span>
              <span className="text-matte-500 text-[11px]">
                ({(activeFile.size / 1024).toFixed(1)} KB)
              </span>

              {/* Toggle Preview / Code for Markdown files */}
              {activeFile.name.toLowerCase().endsWith(".md") && (
                <div className="flex items-center bg-matte-800 border border-matte-700 rounded p-0.5 ml-2">
                  <button
                    type="button"
                    onClick={() => setActiveFileViewMode("preview")}
                    className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition ${
                      activeFileViewMode === "preview"
                        ? "bg-sage-500/20 text-sage-300 font-semibold"
                        : "text-matte-400 hover:text-matte-200"
                    }`}
                  >
                    <Eye size={11} />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFileViewMode("code")}
                    className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition ${
                      activeFileViewMode === "code"
                        ? "bg-sage-500/20 text-sage-300 font-semibold"
                        : "text-matte-400 hover:text-matte-200"
                    }`}
                  >
                    <Code2 size={11} />
                    <span>Raw Code</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadFile(activeFile)}
                className="flex items-center gap-1 px-2.5 py-1 bg-matte-800 hover:bg-matte-750 border border-matte-700 rounded text-matte-300 text-xs transition"
                title="Download file"
              >
                <Download size={12} />
                <span>Download</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 bg-matte-800 hover:bg-matte-750 border border-matte-700 rounded text-matte-300 text-xs transition"
              >
                {copiedCode ? <Check size={12} className="text-sage-400" /> : <Copy size={12} />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={() => handleOpenEditModal(activeFile)}
                className="flex items-center gap-1 px-2.5 py-1 bg-matte-800 hover:bg-matte-750 border border-matte-700 rounded text-matte-300 text-xs transition"
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDeleteFile(activeFile)}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 rounded text-red-300 text-xs transition"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* View Content: Formatted Preview vs Raw Code */}
          {activeFileViewMode === "preview" && activeFile.name.toLowerCase().endsWith(".md") ? (
            <div className="p-6 bg-matte-950 text-matte-100 min-h-[300px]">
              <MarkdownRenderer content={activeFile.content || ""} />
            </div>
          ) : (
            <div className="p-4 bg-matte-950 text-xs font-mono overflow-x-auto text-matte-200">
              <table className="w-full border-collapse">
                <tbody>
                  {(activeFile.content || "// File is empty").split("\n").map((line, idx) => (
                    <tr key={idx} className="hover:bg-matte-900/60 transition group">
                      <td className="w-12 select-none text-right pr-4 text-matte-600 group-hover:text-matte-400 border-r border-matte-850">
                        {idx + 1}
                      </td>
                      <td className="pl-4 whitespace-pre font-mono text-matte-200">{line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* File Tree Table */
        <div className="space-y-6">
          <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-matte-900/60 backdrop-blur-sm shadow-sm">
            <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between text-xs font-mono text-matte-400">
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-matte-200">@{repoOwner}</span>
                <span className="text-matte-500 line-clamp-1">
                  Latest updates in branch [{selectedBranch}]
                </span>
              </div>
              <span className="text-[11px] text-matte-500">{files.length} tracked files</span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs font-mono text-matte-400 space-y-3">
                <Loader2 size={20} className="animate-spin mx-auto text-sage-400" />
                <p>Reading repository tree...</p>
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-matte-400 space-y-3">
                <FileText size={28} className="mx-auto text-matte-600" />
                <p>No files in this folder.</p>
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-2 text-sage-400 hover:underline font-semibold"
                >
                  Create a file now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06] text-xs font-mono">
                {/* Back to parent folder button if inside subfolder */}
                {currentFolder && (
                  <div
                    onClick={() => {
                      const parts = currentFolder.split("/");
                      parts.pop();
                      setCurrentFolder(parts.join("/"));
                    }}
                    className="px-5 py-3 flex items-center gap-2.5 text-matte-400 hover:bg-white/[0.02] cursor-pointer transition select-none"
                  >
                    <Folder size={15} className="text-matte-500" />
                    <span>..</span>
                  </div>
                )}

                {displayedItems.map((entry) => (
                  <div
                    key={entry.name}
                    onClick={() => {
                      if (entry.type === "dir") {
                        handleOpenFolder(entry.name);
                      } else if (entry.item) {
                        handleOpenFile(entry.item);
                      }
                    }}
                    className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 text-matte-200 min-w-0">
                      {entry.type === "dir" ? (
                        <Folder size={16} className="text-sage-400 flex-shrink-0" />
                      ) : (
                        <FileText size={16} className="text-matte-400 flex-shrink-0" />
                      )}
                      <span className="truncate group-hover:text-sage-300 font-medium text-sm transition">
                        {entry.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-matte-500 text-[11px] flex-shrink-0">
                      {entry.item?.lastCommitMessage && (
                        <span className="hidden md:inline line-clamp-1 max-w-xs text-matte-400">
                          {entry.item.lastCommitMessage}
                        </span>
                      )}
                      {entry.item && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>{timeAgo(entry.item.updatedAt)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Root README Card Display */}
          {rootReadmeFile && (
            <div className="border border-matte-800 rounded-xl bg-matte-900 overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-matte-850 border-b border-matte-800 flex items-center justify-between text-xs font-mono text-matte-300">
                <div className="flex items-center gap-2 font-semibold">
                  <FileText size={14} className="text-sage-400" />
                  <span>{rootReadmeFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenFile(rootReadmeFile)}
                    className="text-matte-400 hover:text-matte-200 text-[11px] underline"
                  >
                    View raw
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(rootReadmeFile)}
                    className="text-sage-400 hover:text-sage-300 text-[11px]"
                  >
                    Edit README
                  </button>
                </div>
              </div>
              <div className="p-6 bg-matte-950">
                <MarkdownRenderer content={rootReadmeFile.content || ""} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* In-Browser Pro Code Editor Modal */}
      {isEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-modal-title"
          className="fixed inset-0 bg-matte-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5"
        >
          <div className="w-full max-w-4xl bg-matte-900 border border-matte-700 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-matte-800 flex items-center justify-between bg-matte-850">
              <div className="flex items-center gap-2.5 font-mono text-xs">
                <Edit3 size={15} className="text-sage-400" />
                <h3 id="editor-modal-title" className="font-bold text-matte-50">
                  {editorMode === "CREATE" ? "New File" : "Edit File"}
                </h3>
                <span className="text-matte-500 font-normal">on [{selectedBranch}]</span>

                {/* Unsaved changes badge */}
                {isDirty && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/80 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Unsaved</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Find Bar Toggle */}
                <button
                  type="button"
                  onClick={() => setIsFindOpen((p) => !p)}
                  className={`p-1.5 rounded text-xs transition ${
                    isFindOpen
                      ? "bg-sage-500/20 text-sage-300"
                      : "text-matte-400 hover:text-matte-200 hover:bg-matte-800"
                  }`}
                  title="Find / Replace (Ctrl+F)"
                >
                  <Search size={14} />
                </button>

                {/* Markdown Tabs (if .md) */}
                {filePathInput.toLowerCase().endsWith(".md") && (
                  <div className="flex items-center bg-matte-800 border border-matte-700 rounded p-0.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setEditorTab("edit")}
                      className={`px-2.5 py-1 rounded transition ${
                        editorTab === "edit"
                          ? "bg-sage-500/20 text-sage-300 font-semibold"
                          : "text-matte-400 hover:text-matte-200"
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("preview")}
                      className={`px-2.5 py-1 rounded transition ${
                        editorTab === "preview"
                          ? "bg-sage-500/20 text-sage-300 font-semibold"
                          : "text-matte-400 hover:text-matte-200"
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-matte-400 hover:text-matte-200 p-1 text-sm font-mono"
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Floating Find & Replace Bar */}
            {isFindOpen && (
              <div className="px-4 py-2 bg-matte-850/95 border-b border-matte-800 flex flex-wrap items-center gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 bg-matte-950 border border-matte-700 rounded px-2 py-1">
                  <Search size={12} className="text-matte-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find..."
                    className="bg-transparent text-matte-100 text-xs focus:outline-none w-32 sm:w-44"
                    autoFocus
                  />
                  <span className="text-[10px] text-matte-500">
                    {searchMatches.length > 0
                      ? `${currentMatchIndex + 1}/${searchMatches.length}`
                      : "0 matches"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMatch}
                    disabled={searchMatches.length === 0}
                    className="p-1 hover:bg-matte-800 rounded text-matte-300 disabled:opacity-40"
                    title="Previous match"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMatch}
                    disabled={searchMatches.length === 0}
                    className="p-1 hover:bg-matte-800 rounded text-matte-300 disabled:opacity-40"
                    title="Next match"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-matte-950 border border-matte-700 rounded px-2 py-1">
                  <Replace size={12} className="text-matte-500" />
                  <input
                    type="text"
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    placeholder="Replace with..."
                    className="bg-transparent text-matte-100 text-xs focus:outline-none w-32 sm:w-44"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleReplaceCurrent}
                  disabled={searchMatches.length === 0}
                  className="px-2 py-1 bg-matte-800 hover:bg-matte-750 text-matte-200 border border-matte-700 rounded text-[11px] disabled:opacity-40"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleReplaceAll}
                  disabled={!searchQuery.trim()}
                  className="px-2 py-1 bg-matte-800 hover:bg-matte-750 text-matte-200 border border-matte-700 rounded text-[11px] disabled:opacity-40"
                >
                  All
                </button>
              </div>
            )}

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveFileSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 space-y-3 flex-1 flex flex-col min-h-0 overflow-y-auto">
                <div>
                  <label className="block text-xs font-mono font-medium text-matte-300 mb-1">
                    File Path
                  </label>
                  <input
                    type="text"
                    value={filePathInput}
                    onChange={(e) => setFilePathInput(e.target.value)}
                    placeholder="e.g. src/index.ts or docs/README.md"
                    disabled={editorMode === "EDIT"}
                    className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-xs text-matte-100 font-mono focus:outline-none focus:border-sage-500 disabled:opacity-60"
                    required
                  />
                </div>

                {/* Editor or Preview Pane */}
                <div className="flex-1 flex flex-col min-h-[260px] border border-matte-750 rounded-lg overflow-hidden bg-matte-950">
                  {editorTab === "preview" && filePathInput.toLowerCase().endsWith(".md") ? (
                    <div className="p-5 overflow-y-auto flex-1 bg-matte-950 text-matte-100">
                      <MarkdownRenderer content={fileContentInput} />
                    </div>
                  ) : (
                    <div className="flex flex-1 min-h-[260px] font-mono text-xs overflow-hidden">
                      {/* Synchronized Line Numbers Gutter */}
                      <div
                        ref={gutterRef}
                        className="select-none text-right pr-3 pl-3 py-3 text-matte-600 bg-matte-900/60 border-r border-matte-800 overflow-hidden leading-relaxed font-mono text-xs select-none"
                      >
                        {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>

                      {/* Code Textarea with Tab & Ctrl+S interception */}
                      <textarea
                        ref={textareaRef}
                        value={fileContentInput}
                        onChange={(e) => setFileContentInput(e.target.value)}
                        onKeyDown={handleEditorKeyDown}
                        onScroll={handleEditorScroll}
                        rows={14}
                        spellCheck={false}
                        className="flex-1 p-3 bg-transparent text-matte-100 font-mono text-xs leading-relaxed resize-none focus:outline-none overflow-y-auto whitespace-pre font-mono"
                        placeholder="Write source code... (Press Tab to indent, Ctrl+S to save, Ctrl+F to find)"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-matte-300 mb-1">
                    Commit Message
                  </label>
                  <input
                    type="text"
                    value={commitMessageInput}
                    onChange={(e) => setCommitMessageInput(e.target.value)}
                    placeholder="e.g. feat: implement algorithm or update documentation"
                    className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-xs text-matte-100 font-mono focus:outline-none focus:border-sage-500"
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 border-t border-matte-800 bg-matte-850 flex items-center justify-between text-xs font-mono">
                <div className="text-matte-500 text-[11px] hidden sm:block">
                  <span>Tab: 2 spaces &middot; Ctrl+S: commit &middot; Ctrl+F: find &middot; Esc: exit</span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-3.5 py-1.5 text-matte-400 hover:text-matte-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveFileMutation.isPending}
                    className="px-4 py-1.5 bg-sage-500 hover:bg-sage-400 text-matte-950 font-semibold rounded transition flex items-center gap-1.5 shadow-sm disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:outline-none"
                  >
                    {saveFileMutation.isPending ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Committing...</span>
                      </>
                    ) : (
                      <span>Commit Changes</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
