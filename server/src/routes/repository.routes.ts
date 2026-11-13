import { Router } from "express";
import {
  handleCreateRepository,
  handleListRepositories,
  handleGetRepository,
  handleUpdateRepository,
  handleDeleteRepository,
  handleListMembers,
  handleAddMember,
  handleRemoveMember,
  handleGetRepositoryLanguages,
} from "../controllers/repository.controller.js";
import {
  handleGetBranches,
  handleCreateBranch,
  handleDeleteBranch,
} from "../controllers/branch.controller.js";
import {
  handleGetFiles,
  handleGetFileContent,
  handleSaveFile,
  handleDeleteFile,
} from "../controllers/file.controller.js";
import {
  handleGetCommits,
  handleGetCommitBySha,
} from "../controllers/commit.controller.js";
import {
  handleGetIssues,
  handleGetIssueByNumber,
  handleCreateIssue,
  handleUpdateIssueStatus,
  handleAddIssueComment,
} from "../controllers/issue.controller.js";
import {
  handleGetPulls,
  handleGetPullByNumber,
  handleCreatePull,
  handleAddPullReview,
  handleAddPullComment,
  handleMergePull,
  handleClosePull,
} from "../controllers/pull-request.controller.js";
import { handleGetActivities } from "../controllers/activity.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Repository CRUD
router.post("/", authenticate, handleCreateRepository);
router.get("/", authenticate, handleListRepositories);
router.get("/:id", optionalAuthenticate, handleGetRepository);
router.put("/:id", authenticate, handleUpdateRepository);
router.delete("/:id", authenticate, handleDeleteRepository);
router.get("/:id/languages", optionalAuthenticate, handleGetRepositoryLanguages);

// Repository Members (RBAC)
router.get("/:id/members", optionalAuthenticate, handleListMembers);
router.post("/:id/members", authenticate, handleAddMember);
router.delete("/:id/members/:userId", authenticate, handleRemoveMember);

// Branches
router.get("/:id/branches", optionalAuthenticate, handleGetBranches);
router.post("/:id/branches", authenticate, handleCreateBranch);
router.delete("/:id/branches/:branchName", authenticate, handleDeleteBranch);

// Files
router.get("/:id/files", optionalAuthenticate, handleGetFiles);
router.get("/:id/files/content", optionalAuthenticate, handleGetFileContent);
router.post("/:id/files", authenticate, handleSaveFile);
router.delete("/:id/files", authenticate, handleDeleteFile);

// Commits
router.get("/:id/commits", optionalAuthenticate, handleGetCommits);
router.get("/:id/commits/:sha", optionalAuthenticate, handleGetCommitBySha);

// Issues
router.get("/:id/issues", optionalAuthenticate, handleGetIssues);
router.post("/:id/issues", authenticate, handleCreateIssue);
router.get("/:id/issues/:number", optionalAuthenticate, handleGetIssueByNumber);
router.patch("/:id/issues/:number/status", authenticate, handleUpdateIssueStatus);
router.post("/:id/issues/:number/comments", authenticate, handleAddIssueComment);

// Pull Requests
router.get("/:id/pulls", optionalAuthenticate, handleGetPulls);
router.post("/:id/pulls", authenticate, handleCreatePull);
router.get("/:id/pulls/:number", optionalAuthenticate, handleGetPullByNumber);
router.post("/:id/pulls/:number/reviews", authenticate, handleAddPullReview);
router.post("/:id/pulls/:number/comments", authenticate, handleAddPullComment);
router.post("/:id/pulls/:number/merge", authenticate, handleMergePull);
router.post("/:id/pulls/:number/close", authenticate, handleClosePull);

// Activities
router.get("/:id/activities", optionalAuthenticate, handleGetActivities);

export default router;
