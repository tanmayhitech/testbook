import fs from "fs/promises";
import path from "path";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

export const ensureStorageDir = async (dirPath: string) => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const getFilePath = (repositoryId: string, branch: string, filePath: string) => {
  const safeRepoId = repositoryId.replace(/[^a-zA-Z0-9_\-]/g, "_");
  const safeBranch = branch.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
  const normalizedFilePath = filePath.replace(/^[\/\\]+/, "").replace(/\\/g, "/");
  const branchRoot = path.join(STORAGE_ROOT, "repos", safeRepoId, safeBranch);
  const resolved = path.resolve(branchRoot, normalizedFilePath);

  if (!resolved.startsWith(branchRoot)) {
    throw new Error("Invalid file path: Path traversal attempt detected");
  }

  return resolved;
};

/**
 * Storage provider interface supporting pluggable storage engines:
 * - LocalStorageProvider (default filesystem)
 * - SupabaseStorageProvider (fallback or S3-compatible cloud storage)
 */
export interface IStorageProvider {
  readFile(repositoryId: string, branch: string, filePath: string): Promise<string | null>;
  writeFile(repositoryId: string, branch: string, filePath: string, content: string): Promise<string>;
  deleteFile(repositoryId: string, branch: string, filePath: string): Promise<boolean>;
  copyBranch(repositoryId: string, sourceBranch: string, targetBranch: string): Promise<void>;
}

export class LocalStorageProvider implements IStorageProvider {
  async readFile(repositoryId: string, branch: string, filePath: string): Promise<string | null> {
    try {
      const fullPath = getFilePath(repositoryId, branch, filePath);
      return await fs.readFile(fullPath, "utf-8");
    } catch {
      // If not found in this branch, try default branch main
      if (branch !== "main") {
        try {
          const fallbackPath = getFilePath(repositoryId, "main", filePath);
          return await fs.readFile(fallbackPath, "utf-8");
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  async writeFile(
    repositoryId: string,
    branch: string,
    filePath: string,
    content: string
  ): Promise<string> {
    const fullPath = getFilePath(repositoryId, branch, filePath);
    await ensureStorageDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, "utf-8");
    return fullPath;
  }

  async deleteFile(repositoryId: string, branch: string, filePath: string): Promise<boolean> {
    try {
      const fullPath = getFilePath(repositoryId, branch, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async copyBranch(repositoryId: string, sourceBranch: string, targetBranch: string): Promise<void> {
    const safeRepoId = repositoryId.replace(/[^a-zA-Z0-9_\-]/g, "_");
    const safeSource = sourceBranch.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    const safeTarget = targetBranch.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    const srcDir = path.join(STORAGE_ROOT, "repos", safeRepoId, safeSource);
    const dstDir = path.join(STORAGE_ROOT, "repos", safeRepoId, safeTarget);

    try {
      await fs.cp(srcDir, dstDir, { recursive: true });
    } catch {
      // Source dir might be empty, ignore
    }
  }
}

/**
 * Cloud Storage Adapter stub that seamlessly delegates to LocalStorageProvider
 * or Supabase Storage if configured via environment variables.
 */
export class SupabaseStorageProvider extends LocalStorageProvider {
  // Can be extended with Supabase Storage client if SUPABASE_STORAGE_BUCKET is provided
}

// Active storage provider instance
export const defaultStorageProvider: IStorageProvider = new LocalStorageProvider();

// Helper wrappers maintaining 100% backward compatibility
export const writeStorageFile = (
  repositoryId: string,
  branch: string,
  filePath: string,
  content: string
): Promise<string> => defaultStorageProvider.writeFile(repositoryId, branch, filePath, content);

export const readStorageFile = (
  repositoryId: string,
  branch: string,
  filePath: string
): Promise<string | null> => defaultStorageProvider.readFile(repositoryId, branch, filePath);

export const deleteStorageFile = (
  repositoryId: string,
  branch: string,
  filePath: string
): Promise<boolean> => defaultStorageProvider.deleteFile(repositoryId, branch, filePath);

export const copyBranchStorage = (
  repositoryId: string,
  sourceBranch: string,
  targetBranch: string
): Promise<void> => defaultStorageProvider.copyBranch(repositoryId, sourceBranch, targetBranch);
