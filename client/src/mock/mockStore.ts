import { Repository, CreateRepositoryPayload, UpdateRepositoryPayload, RepositoryMember } from "../types/repository.types.js";
import { User, LoginCredentials, RegisterCredentials } from "../types/auth.types.js";
import {
  Branch,
  FileItem,
  Commit,
  Issue,
  PullRequest,
  ActivityItem,
  UserProfile,
  ReviewStatus,
} from "../types/vcs.types.js";
import {
  MOCK_CURRENT_USER,
  MOCK_COLLABORATOR_1,
  INITIAL_REPOSITORIES,
  INITIAL_BRANCHES,
  INITIAL_FILES,
  INITIAL_COMMITS,
  INITIAL_ISSUES,
  INITIAL_PULL_REQUESTS,
  INITIAL_ACTIVITIES,
  INITIAL_USER_PROFILE,
} from "./mockData.js";

const STORAGE_KEYS = {
  USER: "testbook_mock_user",
  PROFILE: "testbook_mock_profile",
  REPOSITORIES: "testbook_mock_repos",
  BRANCHES: "testbook_mock_branches",
  FILES: "testbook_mock_files",
  COMMITS: "testbook_mock_commits",
  ISSUES: "testbook_mock_issues",
  PULL_REQUESTS: "testbook_mock_pulls",
  ACTIVITIES: "testbook_mock_activities",
  MEMBERS: "testbook_mock_members",
};

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

class MockStore {
  // Auth
  getCurrentUser(): User {
    return getFromStorage<User>(STORAGE_KEYS.USER, MOCK_CURRENT_USER);
  }

  getUserProfile(username?: string): UserProfile {
    const currentProfile = getFromStorage<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE);
    if (!username || username === currentProfile.username) {
      return currentProfile;
    }
    return {
      ...MOCK_COLLABORATOR_1,
      headline: "Contributor & Peer Reviewer",
      institution: "Faculty of Computer Applications",
      location: "Bengaluru, India",
      skills: ["Algorithms", "Java", "System Design"],
      repositoriesCount: 1,
      starsReceived: 5,
      contributionsThisYear: 64,
    };
  }

  updateUserProfile(payload: Partial<UserProfile>): UserProfile {
    const existing = this.getUserProfile();
    const updated = { ...existing, ...payload };
    saveToStorage(STORAGE_KEYS.PROFILE, updated);
    if (payload.username || payload.email || payload.bio) {
      const curUser = this.getCurrentUser();
      saveToStorage(STORAGE_KEYS.USER, {
        ...curUser,
        username: payload.username || curUser.username,
        email: payload.email || curUser.email,
        bio: payload.bio ?? curUser.bio,
      });
    }
    return updated;
  }

  login(credentials: LoginCredentials): { user: User; accessToken: string } {
    let user = this.getCurrentUser();
    if (credentials.email) {
      user = { ...user, email: credentials.email };
      saveToStorage(STORAGE_KEYS.USER, user);
    }
    return {
      user,
      accessToken: "mock_jwt_token_" + Date.now(),
    };
  }

  register(credentials: RegisterCredentials): { user: User; accessToken: string } {
    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      username: credentials.username,
      email: credentials.email,
      avatarUrl: null,
      bio: "Student developer on Testbook",
      createdAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.USER, newUser);
    const newProfile: UserProfile = {
      ...newUser,
      skills: ["Git", "TypeScript"],
      repositoriesCount: 0,
      starsReceived: 0,
      contributionsThisYear: 1,
    };
    saveToStorage(STORAGE_KEYS.PROFILE, newProfile);
    return {
      user: newUser,
      accessToken: "mock_jwt_token_" + Date.now(),
    };
  }

  // Repositories
  getRepositories(): Repository[] {
    return getFromStorage<Repository[]>(STORAGE_KEYS.REPOSITORIES, INITIAL_REPOSITORIES);
  }

  getRepositoryById(id: string): Repository | undefined {
    const repos = this.getRepositories();
    return repos.find((r) => r.id === id || r.name.toLowerCase() === id.toLowerCase());
  }

  createRepository(payload: CreateRepositoryPayload): Repository {
    const repos = this.getRepositories();
    const user = this.getCurrentUser();
    const repoId = "repo_" + Math.random().toString(36).substring(2, 9);

    const newRepo: Repository = {
      id: repoId,
      name: payload.name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: payload.description || null,
      visibility: payload.visibility || "PRIVATE",
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: user,
      currentUserRole: "OWNER",
      counts: {
        members: 1,
        branches: 1,
        commits: 1,
        issues: 0,
        pullRequests: 0,
        files: 1,
      },
    };

    repos.unshift(newRepo);
    saveToStorage(STORAGE_KEYS.REPOSITORIES, repos);

    // Initial default branch
    this.createBranch(repoId, "main", true);

    // Initial README.md file
    this.saveFile(
      repoId,
      "main",
      "README.md",
      `# ${newRepo.name}\n\n${newRepo.description || "Project repository created on Testbook."}\n`,
      "Initial commit"
    );

    // Log Activity
    this.logActivity({
      repositoryId: repoId,
      repositoryName: newRepo.name,
      user,
      type: "REPOSITORY_CREATED",
      message: `created repository ${newRepo.name}`,
    });

    return newRepo;
  }

  updateRepository(id: string, payload: UpdateRepositoryPayload): Repository {
    const repos = this.getRepositories();
    const index = repos.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Repository not found");

    const existing = repos[index]!;
    const updated: Repository = {
      ...existing,
      name: payload.name ? payload.name.trim().toLowerCase().replace(/\s+/g, "-") : existing.name,
      description: payload.description !== undefined ? payload.description : existing.description,
      visibility: payload.visibility || existing.visibility,
      updatedAt: new Date().toISOString(),
    };

    repos[index] = updated;
    saveToStorage(STORAGE_KEYS.REPOSITORIES, repos);
    return updated;
  }

  deleteRepository(id: string): void {
    const repos = this.getRepositories().filter((r) => r.id !== id);
    saveToStorage(STORAGE_KEYS.REPOSITORIES, repos);
  }

  // Repository Collaborators / Members
  getRepositoryMembers(repoId: string): RepositoryMember[] {
    const allMembers = getFromStorage<Record<string, RepositoryMember[]>>(
      STORAGE_KEYS.MEMBERS,
      {
        repo_dslab_01: [
          {
            id: "mem_01",
            role: "OWNER",
            createdAt: "2026-08-20T12:00:00.000Z",
            user: MOCK_CURRENT_USER,
          },
          {
            id: "mem_02",
            role: "CONTRIBUTOR",
            createdAt: "2026-08-22T14:00:00.000Z",
            user: MOCK_COLLABORATOR_1,
          },
        ],
      }
    );
    return allMembers[repoId] || [
      {
        id: "mem_def_" + repoId,
        role: "OWNER",
        createdAt: new Date().toISOString(),
        user: this.getCurrentUser(),
      },
    ];
  }

  addRepositoryMember(repoId: string, username: string, role: "CONTRIBUTOR" | "VIEWER"): RepositoryMember {
    const allMembers = getFromStorage<Record<string, RepositoryMember[]>>(STORAGE_KEYS.MEMBERS, {});
    const members = allMembers[repoId] || this.getRepositoryMembers(repoId);

    const newMember: RepositoryMember = {
      id: "mem_" + Math.random().toString(36).substring(2, 9),
      role,
      createdAt: new Date().toISOString(),
      user: {
        id: "usr_" + username,
        username,
        email: `${username}@student.edu`,
        avatarUrl: null,
        bio: "Testbook collaborator",
        createdAt: new Date().toISOString(),
      },
    };

    members.push(newMember);
    allMembers[repoId] = members;
    saveToStorage(STORAGE_KEYS.MEMBERS, allMembers);
    return newMember;
  }

  removeRepositoryMember(repoId: string, memberId: string): void {
    const allMembers = getFromStorage<Record<string, RepositoryMember[]>>(STORAGE_KEYS.MEMBERS, {});
    const members = (allMembers[repoId] || this.getRepositoryMembers(repoId)).filter(
      (m) => m.id !== memberId && m.user.id !== memberId
    );
    allMembers[repoId] = members;
    saveToStorage(STORAGE_KEYS.MEMBERS, allMembers);
  }

  // Branches
  getBranches(repoId: string): Branch[] {
    const branches = getFromStorage<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
    return branches.filter((b) => b.repositoryId === repoId);
  }

  createBranch(repoId: string, name: string, isDefault = false): Branch {
    const branches = getFromStorage<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, "-");

    const existing = branches.find((b) => b.repositoryId === repoId && b.name === cleanName);
    if (existing) return existing;

    const newBranch: Branch = {
      id: "br_" + Math.random().toString(36).substring(2, 9),
      repositoryId: repoId,
      name: cleanName,
      isDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCommitSha: Math.random().toString(36).substring(2, 9),
      commitCount: 1,
    };

    branches.push(newBranch);
    saveToStorage(STORAGE_KEYS.BRANCHES, branches);

    // Copy files from main branch if exists
    const files = getFromStorage<FileItem[]>(STORAGE_KEYS.FILES, INITIAL_FILES);
    const mainFiles = files.filter((f) => f.repositoryId === repoId && f.branch === "main");
    mainFiles.forEach((mf) => {
      files.push({
        ...mf,
        id: "file_" + Math.random().toString(36).substring(2, 9),
        branch: cleanName,
      });
    });
    saveToStorage(STORAGE_KEYS.FILES, files);

    const user = this.getCurrentUser();
    this.logActivity({
      repositoryId: repoId,
      repositoryName: this.getRepositoryById(repoId)?.name || repoId,
      user,
      type: "BRANCH_CREATED",
      message: `created branch ${cleanName}`,
    });

    return newBranch;
  }

  deleteBranch(repoId: string, branchName: string): void {
    if (branchName === "main") throw new Error("Cannot delete the default branch");
    const branches = getFromStorage<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES).filter(
      (b) => !(b.repositoryId === repoId && b.name === branchName)
    );
    saveToStorage(STORAGE_KEYS.BRANCHES, branches);
  }

  // Files & File Tree
  getFiles(repoId: string, branch = "main"): FileItem[] {
    const files = getFromStorage<FileItem[]>(STORAGE_KEYS.FILES, INITIAL_FILES);
    return files.filter((f) => f.repositoryId === repoId && f.branch === branch);
  }

  getFileContent(repoId: string, branch: string, path: string): FileItem | undefined {
    const files = this.getFiles(repoId, branch);
    return files.find((f) => f.path.toLowerCase() === path.toLowerCase());
  }

  saveFile(
    repoId: string,
    branch: string,
    path: string,
    content: string,
    commitMessage: string
  ): { file: FileItem; commit: Commit } {
    const files = getFromStorage<FileItem[]>(STORAGE_KEYS.FILES, INITIAL_FILES);
    const cleanPath = path.trim().replace(/^\/+/, "");
    const name = cleanPath.split("/").pop() || cleanPath;

    let targetFile = files.find(
      (f) => f.repositoryId === repoId && f.branch === branch && f.path === cleanPath
    );

    const isNew = !targetFile;

    if (targetFile) {
      targetFile.content = content;
      targetFile.size = content.length;
      targetFile.updatedAt = new Date().toISOString();
      targetFile.lastCommitMessage = commitMessage;
    } else {
      targetFile = {
        id: "file_" + Math.random().toString(36).substring(2, 9),
        repositoryId: repoId,
        branch,
        path: cleanPath,
        name,
        type: "file",
        size: content.length,
        content,
        updatedAt: new Date().toISOString(),
        lastCommitMessage: commitMessage,
      };
      files.push(targetFile);
    }

    saveToStorage(STORAGE_KEYS.FILES, files);

    // Create a commit
    const commit = this.createCommit(repoId, branch, commitMessage, [
      {
        path: cleanPath,
        changeType: isNew ? "ADDED" : "MODIFIED",
        additions: content.split("\n").length,
        deletions: isNew ? 0 : 2,
        chunks: [{ type: "add", content: `+ ${content.slice(0, 80)}...` }],
      },
    ]);

    return { file: targetFile, commit };
  }

  deleteFile(repoId: string, branch: string, path: string, commitMessage: string): void {
    const files = getFromStorage<FileItem[]>(STORAGE_KEYS.FILES, INITIAL_FILES).filter(
      (f) => !(f.repositoryId === repoId && f.branch === branch && f.path === path)
    );
    saveToStorage(STORAGE_KEYS.FILES, files);

    this.createCommit(repoId, branch, commitMessage, [
      {
        path,
        changeType: "DELETED",
        additions: 0,
        deletions: 10,
        chunks: [{ type: "delete", content: `- ${path}` }],
      },
    ]);
  }

  // Commits
  getCommits(repoId: string, branch?: string): Commit[] {
    const commits = getFromStorage<Commit[]>(STORAGE_KEYS.COMMITS, INITIAL_COMMITS);
    return commits.filter((c) => {
      if (c.repositoryId !== repoId) return false;
      if (branch && c.branch !== branch) return false;
      return true;
    });
  }

  getCommitBySha(repoId: string, sha: string): Commit | undefined {
    const commits = this.getCommits(repoId);
    return commits.find((c) => c.sha.toLowerCase().startsWith(sha.toLowerCase()));
  }

  createCommit(
    repoId: string,
    branch: string,
    message: string,
    diffs?: Commit["diffs"]
  ): Commit {
    const commits = getFromStorage<Commit[]>(STORAGE_KEYS.COMMITS, INITIAL_COMMITS);
    const user = this.getCurrentUser();
    const sha = Math.random().toString(16).substring(2, 9);

    const newCommit: Commit = {
      id: "cmt_" + Math.random().toString(36).substring(2, 9),
      sha,
      repositoryId: repoId,
      branch,
      message,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      author: user,
      diffs,
      stats: {
        filesChanged: diffs?.length || 1,
        additions: diffs?.reduce((acc, d) => acc + d.additions, 0) || 12,
        deletions: diffs?.reduce((acc, d) => acc + d.deletions, 0) || 1,
      },
    };

    commits.unshift(newCommit);
    saveToStorage(STORAGE_KEYS.COMMITS, commits);

    this.logActivity({
      repositoryId: repoId,
      repositoryName: this.getRepositoryById(repoId)?.name || repoId,
      user,
      type: "COMMIT_CREATED",
      message: `pushed commit ${sha} to ${branch}: "${message}"`,
    });

    return newCommit;
  }

  // Issues
  getIssues(repoId: string, statusFilter?: "ALL" | "OPEN" | "CLOSED"): Issue[] {
    const issues = getFromStorage<Issue[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    return issues.filter((iss) => {
      if (iss.repositoryId !== repoId) return false;
      if (statusFilter && statusFilter !== "ALL" && iss.status !== statusFilter) return false;
      return true;
    });
  }

  getIssueByNumber(repoId: string, issueNumber: number): Issue | undefined {
    const issues = this.getIssues(repoId);
    return issues.find((i) => i.number === issueNumber);
  }

  createIssue(repoId: string, title: string, description: string, labels: string[] = []): Issue {
    const issues = getFromStorage<Issue[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const existingForRepo = issues.filter((i) => i.repositoryId === repoId);
    const nextNumber = existingForRepo.length > 0 ? Math.max(...existingForRepo.map((i) => i.number)) + 1 : 1;
    const user = this.getCurrentUser();

    const newIssue: Issue = {
      id: "iss_" + Math.random().toString(36).substring(2, 9),
      number: nextNumber,
      repositoryId: repoId,
      title: title.trim(),
      description: description.trim(),
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: user,
      assignee: null,
      labels: labels.length > 0 ? labels : ["task"],
      commentsCount: 0,
      comments: [],
    };

    issues.unshift(newIssue);
    saveToStorage(STORAGE_KEYS.ISSUES, issues);

    this.logActivity({
      repositoryId: repoId,
      repositoryName: this.getRepositoryById(repoId)?.name || repoId,
      user,
      type: "ISSUE_CREATED",
      message: `opened Issue #${nextNumber}: ${newIssue.title}`,
    });

    return newIssue;
  }

  addIssueComment(repoId: string, issueNumber: number, content: string): Issue {
    const issues = getFromStorage<Issue[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const issueIndex = issues.findIndex((i) => i.repositoryId === repoId && i.number === issueNumber);
    if (issueIndex === -1) throw new Error("Issue not found");

    const issue = issues[issueIndex]!;
    const user = this.getCurrentUser();

    const newComment = {
      id: "ic_" + Math.random().toString(36).substring(2, 9),
      issueId: issue.id,
      author: user,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    issue.comments.push(newComment);
    issue.commentsCount = issue.comments.length;
    issue.updatedAt = new Date().toISOString();

    issues[issueIndex] = issue;
    saveToStorage(STORAGE_KEYS.ISSUES, issues);
    return issue;
  }

  updateIssueStatus(repoId: string, issueNumber: number, status: "OPEN" | "CLOSED"): Issue {
    const issues = getFromStorage<Issue[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const issueIndex = issues.findIndex((i) => i.repositoryId === repoId && i.number === issueNumber);
    if (issueIndex === -1) throw new Error("Issue not found");

    const issue = issues[issueIndex]!;
    issue.status = status;
    issue.closedAt = status === "CLOSED" ? new Date().toISOString() : null;
    issue.updatedAt = new Date().toISOString();

    issues[issueIndex] = issue;
    saveToStorage(STORAGE_KEYS.ISSUES, issues);

    const user = this.getCurrentUser();
    this.logActivity({
      repositoryId: repoId,
      repositoryName: this.getRepositoryById(repoId)?.name || repoId,
      user,
      type: status === "CLOSED" ? "ISSUE_CLOSED" : "ISSUE_CREATED",
      message: `${status === "CLOSED" ? "closed" : "reopened"} Issue #${issueNumber}: ${issue.title}`,
    });

    return issue;
  }

  // Pull Requests
  getPullRequests(repoId: string, statusFilter?: "ALL" | "OPEN" | "MERGED" | "CLOSED"): PullRequest[] {
    const pulls = getFromStorage<PullRequest[]>(STORAGE_KEYS.PULL_REQUESTS, INITIAL_PULL_REQUESTS);
    return pulls.filter((pr) => {
      if (pr.repositoryId !== repoId) return false;
      if (statusFilter && statusFilter !== "ALL" && pr.status !== statusFilter) return false;
      return true;
    });
  }

  getPullRequestByNumber(repoId: string, prNumber: number): PullRequest | undefined {
    const pulls = this.getPullRequests(repoId);
    return pulls.find((pr) => pr.number === prNumber);
  }

  createPullRequest(
    repoId: string,
    payload: { title: string; description: string; sourceBranch: string; targetBranch: string }
  ): PullRequest {
    const pulls = getFromStorage<PullRequest[]>(STORAGE_KEYS.PULL_REQUESTS, INITIAL_PULL_REQUESTS);
    const existing = pulls.filter((p) => p.repositoryId === repoId);
    const nextNumber = existing.length > 0 ? Math.max(...existing.map((p) => p.number)) + 1 : 1;
    const user = this.getCurrentUser();

    const newPR: PullRequest = {
      id: "pr_" + Math.random().toString(36).substring(2, 9),
      number: nextNumber,
      repositoryId: repoId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      sourceBranch: payload.sourceBranch,
      targetBranch: payload.targetBranch || "main",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: user,
      reviews: [],
      comments: [],
      reviewComments: [],
      commits: this.getCommits(repoId, payload.sourceBranch),
      diffs: [
        {
          path: "src/FeatureChanges.ts",
          changeType: "ADDED",
          additions: 32,
          deletions: 0,
          chunks: [
            { type: "add", content: "+ export function featureImplementation() { ... }" },
            { type: "add", content: "+   // Branch changes ready to review" },
          ],
        },
      ],
    };

    pulls.unshift(newPR);
    saveToStorage(STORAGE_KEYS.PULL_REQUESTS, pulls);

    this.logActivity({
      repositoryId: repoId,
      repositoryName: this.getRepositoryById(repoId)?.name || repoId,
      user,
      type: "PULL_REQUEST_CREATED",
      message: `opened Pull Request #${nextNumber} (${payload.sourceBranch} -> ${payload.targetBranch}): ${newPR.title}`,
    });

    return newPR;
  }

  addPullRequestReview(
    repoId: string,
    prNumber: number,
    review: { status: ReviewStatus; comment?: string }
  ): PullRequest {
    const pulls = getFromStorage<PullRequest[]>(STORAGE_KEYS.PULL_REQUESTS, INITIAL_PULL_REQUESTS);
    const prIndex = pulls.findIndex((p) => p.repositoryId === repoId && p.number === prNumber);
    if (prIndex === -1) throw new Error("Pull request not found");

    const pr = pulls[prIndex]!;
    const user = this.getCurrentUser();

    pr.reviews.push({
      id: "rev_" + Math.random().toString(36).substring(2, 9),
      pullRequestId: pr.id,
      reviewer: user,
      status: review.status,
      comment: review.comment,
      createdAt: new Date().toISOString(),
    });

    pr.updatedAt = new Date().toISOString();
    pulls[prIndex] = pr;
    saveToStorage(STORAGE_KEYS.PULL_REQUESTS, pulls);

    this.logActivity({
      repositoryId: repoId,
      repositoryName: this.getRepositoryById(repoId)?.name || repoId,
      user,
      type: "REVIEW_SUBMITTED",
      message: `submitted review [${review.status}] on PR #${prNumber}`,
    });

    return pr;
  }

  addPullRequestComment(repoId: string, prNumber: number, content: string): PullRequest {
    const pulls = getFromStorage<PullRequest[]>(STORAGE_KEYS.PULL_REQUESTS, INITIAL_PULL_REQUESTS);
    const prIndex = pulls.findIndex((p) => p.repositoryId === repoId && p.number === prNumber);
    if (prIndex === -1) throw new Error("Pull request not found");

    const pr = pulls[prIndex]!;
    const user = this.getCurrentUser();

    pr.comments.push({
      id: "prc_" + Math.random().toString(36).substring(2, 9),
      pullRequestId: pr.id,
      author: user,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });

    pr.updatedAt = new Date().toISOString();
    pulls[prIndex] = pr;
    saveToStorage(STORAGE_KEYS.PULL_REQUESTS, pulls);
    return pr;
  }

  mergePullRequest(repoId: string, prNumber: number): PullRequest {
    const pulls = getFromStorage<PullRequest[]>(STORAGE_KEYS.PULL_REQUESTS, INITIAL_PULL_REQUESTS);
    const prIndex = pulls.findIndex((p) => p.repositoryId === repoId && p.number === prNumber);
    if (prIndex === -1) throw new Error("Pull request not found");

    const pr = pulls[prIndex]!;
    pr.status = "MERGED";
    pr.mergedAt = new Date().toISOString();
    pr.updatedAt = new Date().toISOString();

    pulls[prIndex] = pr;
    saveToStorage(STORAGE_KEYS.PULL_REQUESTS, pulls);

    // Merge source files into target branch
    const files = getFromStorage<FileItem[]>(STORAGE_KEYS.FILES, INITIAL_FILES);
    const sourceFiles = files.filter((f) => f.repositoryId === repoId && f.branch === pr.sourceBranch);
    sourceFiles.forEach((sf) => {
      const existingInTarget = files.find(
        (f) => f.repositoryId === repoId && f.branch === pr.targetBranch && f.path === sf.path
      );
      if (existingInTarget) {
        existingInTarget.content = sf.content;
        existingInTarget.updatedAt = new Date().toISOString();
        existingInTarget.lastCommitMessage = `Merge PR #${prNumber} from ${pr.sourceBranch}`;
      } else {
        files.push({
          ...sf,
          id: "file_" + Math.random().toString(36).substring(2, 9),
          branch: pr.targetBranch,
          lastCommitMessage: `Merge PR #${prNumber} from ${pr.sourceBranch}`,
        });
      }
    });
    saveToStorage(STORAGE_KEYS.FILES, files);

    // Create merge commit
    this.createCommit(
      repoId,
      pr.targetBranch,
      `Merge pull request #${prNumber} from ${pr.sourceBranch}`,
      pr.diffs
    );

    const user = this.getCurrentUser();
    this.logActivity({
      repositoryId: repoId,
      repositoryName: this.getRepositoryById(repoId)?.name || repoId,
      user,
      type: "PULL_REQUEST_MERGED",
      message: `merged Pull Request #${prNumber} (${pr.sourceBranch} -> ${pr.targetBranch})`,
    });

    return pr;
  }

  closePullRequest(repoId: string, prNumber: number): PullRequest {
    const pulls = getFromStorage<PullRequest[]>(STORAGE_KEYS.PULL_REQUESTS, INITIAL_PULL_REQUESTS);
    const prIndex = pulls.findIndex((p) => p.repositoryId === repoId && p.number === prNumber);
    if (prIndex === -1) throw new Error("Pull request not found");

    const pr = pulls[prIndex]!;
    pr.status = "CLOSED";
    pr.closedAt = new Date().toISOString();
    pr.updatedAt = new Date().toISOString();

    pulls[prIndex] = pr;
    saveToStorage(STORAGE_KEYS.PULL_REQUESTS, pulls);
    return pr;
  }

  // Activity Feed
  getActivities(repoId?: string): ActivityItem[] {
    const activities = getFromStorage<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    if (!repoId) return activities;
    return activities.filter((a) => a.repositoryId === repoId);
  }

  logActivity(activity: Omit<ActivityItem, "id" | "createdAt">): void {
    const activities = getFromStorage<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    const newActivity: ActivityItem = {
      ...activity,
      id: "act_" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    activities.unshift(newActivity);
    saveToStorage(STORAGE_KEYS.ACTIVITIES, activities);
  }
}

export const mockStore = new MockStore();
