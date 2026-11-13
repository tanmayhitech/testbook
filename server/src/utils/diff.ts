export interface DiffChunk {
  oldLineNumber?: number;
  newLineNumber?: number;
  type: "add" | "delete" | "normal";
  content: string;
}

export interface FileDiff {
  path: string;
  changeType: "ADDED" | "MODIFIED" | "DELETED";
  additions: number;
  deletions: number;
  chunks: DiffChunk[];
}

export interface MergeResult {
  hasConflict: boolean;
  mergedContent: string;
  conflictDetails?: string | undefined;
}

export function computeFileDiff(
  path: string,
  oldText: string | null | undefined,
  newText: string | null | undefined
): FileDiff {
  if (oldText === null || oldText === undefined) {
    // Brand new file
    const newLines = (newText || "").split("\n");
    const chunks: DiffChunk[] = newLines.map((line, idx) => ({
      newLineNumber: idx + 1,
      type: "add",
      content: line,
    }));

    return {
      path,
      changeType: "ADDED",
      additions: newLines.length,
      deletions: 0,
      chunks,
    };
  }

  if (newText === null || newText === undefined) {
    // Deleted file
    const oldLines = oldText.split("\n");
    const chunks: DiffChunk[] = oldLines.map((line, idx) => ({
      oldLineNumber: idx + 1,
      type: "delete",
      content: line,
    }));

    return {
      path,
      changeType: "DELETED",
      additions: 0,
      deletions: oldLines.length,
      chunks,
    };
  }

  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const chunks: DiffChunk[] = [];
  let additions = 0;
  let deletions = 0;

  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx];
    const newLine = newLines[newIdx];

    if (oldIdx < oldLines.length && newIdx < newLines.length && oldLine === newLine) {
      chunks.push({
        oldLineNumber: oldIdx + 1,
        newLineNumber: newIdx + 1,
        type: "normal",
        content: oldLine ?? "",
      });
      oldIdx++;
      newIdx++;
    } else {
      if (oldIdx < oldLines.length && (newIdx >= newLines.length || !newLines.includes(oldLine ?? ""))) {
        chunks.push({
          oldLineNumber: oldIdx + 1,
          type: "delete",
          content: oldLine ?? "",
        });
        deletions++;
        oldIdx++;
      } else if (newIdx < newLines.length) {
        chunks.push({
          newLineNumber: newIdx + 1,
          type: "add",
          content: newLine ?? "",
        });
        additions++;
        newIdx++;
      } else {
        oldIdx++;
        newIdx++;
      }
    }
  }

  return {
    path,
    changeType: "MODIFIED",
    additions,
    deletions,
    chunks,
  };
}

/**
 * Perform a 3-way merge conflict check between base, target, and source contents
 */
export function detectMergeConflict(
  targetContent: string | null | undefined,
  sourceContent: string | null | undefined,
  baseContent?: string | null | undefined
): MergeResult {
  const targetStr = targetContent ?? "";
  const sourceStr = sourceContent ?? "";
  const baseStr = baseContent ?? "";

  // 1. Identical content -> No conflict
  if (targetStr === sourceStr) {
    return { hasConflict: false, mergedContent: targetStr };
  }

  // 2. Only source changed from base -> take source
  if (targetStr === baseStr && sourceStr !== baseStr) {
    return { hasConflict: false, mergedContent: sourceStr };
  }

  // 3. Only target changed from base -> take target
  if (sourceStr === baseStr && targetStr !== baseStr) {
    return { hasConflict: false, mergedContent: targetStr };
  }

  // 4. One branch deleted file while other modified -> Conflict
  if ((targetContent === null && sourceContent !== null) || (targetContent !== null && sourceContent === null)) {
    return {
      hasConflict: true,
      mergedContent: targetStr,
      conflictDetails: "File was modified in one branch and deleted in the other.",
    };
  }

  // 5. Both branches modified file: line-level 3-way merge analysis
  const targetLines = targetStr.split("\n");
  const sourceLines = sourceStr.split("\n");

  // Check if both modified the exact same file without a clean base or differing whole file
  if (!baseContent) {
    // Both added or diverged without common ancestor
    return {
      hasConflict: true,
      mergedContent: `<<<<<<< target\n${targetStr}\n=======\n${sourceStr}\n>>>>>>> source`,
      conflictDetails: "Both branches created or modified this file with conflicting contents.",
    };
  }

  const baseLines = baseStr.split("\n");
  const merged: string[] = [];
  let conflictFound = false;

  const maxLen = Math.max(targetLines.length, sourceLines.length, baseLines.length);
  for (let i = 0; i < maxLen; i++) {
    const tLine = targetLines[i];
    const sLine = sourceLines[i];
    const bLine = baseLines[i];

    if (tLine === sLine) {
      if (tLine !== undefined) merged.push(tLine);
    } else if (tLine === bLine) {
      if (sLine !== undefined) merged.push(sLine);
    } else if (sLine === bLine) {
      if (tLine !== undefined) merged.push(tLine);
    } else {
      // Overlapping conflicting modification on this line
      conflictFound = true;
      merged.push(`<<<<<<< target\n${tLine ?? ""}\n=======\n${sLine ?? ""}\n>>>>>>> source`);
    }
  }

  if (conflictFound) {
    return {
      hasConflict: true,
      mergedContent: merged.join("\n"),
      conflictDetails: "Conflicting line modifications between target and source branch.",
    };
  }

  return {
    hasConflict: false,
    mergedContent: merged.join("\n"),
  };
}
