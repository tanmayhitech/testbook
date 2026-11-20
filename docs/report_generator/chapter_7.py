import os
from docx.shared import Inches, Pt
from styles import (
    NAVY_COLOR, CHARCOAL_COLOR,
    add_h1, add_h2, add_h3, add_p, add_bullet, add_table, add_callout, add_code_block, add_image_figure, add_page_break
)

def build_chapter_7(doc, media_dir):
    # ==========================================
    # CHAPTER 7: SYSTEM DESIGN & IMPLEMENTATION
    # ==========================================
    add_h1(doc, "CHAPTER 7: SYSTEM DESIGN & IMPLEMENTATION")

    add_h2(doc, "7.1 Form Design & User Interface Specifications")
    add_p(doc,
        "The Testbook frontend is designed around modular, reusable React components, providing responsive layouts styled with Tailwind CSS. "
        "Each view balances aesthetic minimalism with high technical density, catering to undergraduate developers:"
    )

    ui_headers = ["View / Component", "Route Path", "Design Purpose & Interactive Elements"]
    ui_rows = [
        ["Landing Page", "/", "Welcomes visitors, showcases core VCS capabilities, provides login/register CTA buttons, displays beginner guidance."],
        ["User Registration", "/register", "Captures username, email, and password; performs client-side Zod validation with real-time feedback."],
        ["User Login", "/login", "Authenticates existing users, handles JWT token issuance, stores token securely in localStorage, redirects to dashboard."],
        ["Developer Dashboard", "/dashboard", "Central developer hub; displays repository cards, branch counts, commit statistics, moving infrastructure ticker."],
        ["Create Repo Modal", "/repos (modal)", "Form capturing repository name, description, and visibility radio selector (PUBLIC vs. PRIVATE)."],
        ["Repository Detail", "/repos/:id", "Comprehensive workspace tab bar: Code Explorer, Commits, Branches, Issues, Pull Requests, and Settings."],
        ["Code Explorer", "/repos/:id (code)", "Interactive file tree, folder breadcrumb navigation, raw file preview, markdown documentation renderer."],
        ["In-Browser Editor", "/repos/:id (edit)", "Full-screen code editing modal featuring dynamic line counting, Tab indentation, Find & Replace, commit message inputs."],
        ["Commit History", "/repos/:id/commits", "Chronological list of commits per branch, showing commit SHA, author avatar, message, and timestamp."],
        ["Branch Manager", "/repos/:id/branches", "Lists active branches, indicates default 'main' branch, provides branch creation modal and deletion safeguards."],
        ["Pull Requests Tab", "/repos/:id/pulls", "Filterable list of PRs (ALL, OPEN, MERGED, CLOSED); detailed comparison screen with unified diff chunks."],
        ["Code Review Panel", "/repos/:id/pulls/:id", "Reviewers submit verdicts (APPROVED, CHANGES_REQUESTED) with markdown comments; triggers safe merge execution."]
    ]
    add_table(doc, ui_headers, ui_rows, col_widths=[1.5, 1.4, 3.5])

    add_h2(doc, "7.2 Core Source Code Listings")
    add_p(doc,
        "The following listings showcase actual production TypeScript source code from the Testbook codebase, demonstrating clean architecture, "
        "defensive programming, and algorithmic rigor:"
    )

    # Listing 7.1: auth.service.ts
    add_h3(doc, "7.2.1 Authentication & Password Hashing (auth.service.ts)")
    add_p(doc,
        "The authentication service encapsulates bcrypt password hashing with 12 computational salt rounds and generates stateless "
        "JSON Web Tokens containing the user ID payload:"
    )
    add_code_block(doc,
        "// server/src/services/auth.service.ts\n"
        "import bcrypt from 'bcrypt';\n"
        "import { prisma } from '../config/prisma.js';\n"
        "import { generateAccessToken } from '../utils/jwt.js';\n"
        "\n"
        "export const registerUser = async ({ username, email, password }: RegisterInput) => {\n"
        "  const existingUser = await prisma.user.findFirst({\n"
        "    where: { OR: [{ email }, { username }] },\n"
        "  });\n"
        "  if (existingUser) {\n"
        "    throw new Error('Username or email already exists');\n"
        "  }\n"
        "  // Salt and hash password with 12 rounds\n"
        "  const passwordHash = await bcrypt.hash(password, 12);\n"
        "  const user = await prisma.user.create({\n"
        "    data: { username, email, passwordHash },\n"
        "  });\n"
        "  const accessToken = generateAccessToken(user.id);\n"
        "  return { user: sanitizeUser(user), accessToken };\n"
        "};\n"
        "\n"
        "export const loginUser = async ({ email, password }: LoginInput) => {\n"
        "  const user = await prisma.user.findUnique({ where: { email } });\n"
        "  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {\n"
        "    throw new Error('Invalid email or password');\n"
        "  }\n"
        "  const accessToken = generateAccessToken(user.id);\n"
        "  return { user: sanitizeUser(user), accessToken };\n"
        "};",
        title="Listing 7.1: Production Authentication Service (auth.service.ts)"
    )

    # Listing 7.2: rate-limit.middleware.ts
    add_h3(doc, "7.2.2 Sliding-Window Rate Limiting Middleware (rate-limit.middleware.ts)")
    add_p(doc,
        "The sliding-window rate limiter tracks IP request volumes within a configured time window, automatically expiring records and "
        "returning HTTP 429 with standard Retry-After headers when limits are breached:"
    )
    add_code_block(doc,
        "// server/src/middleware/rate-limit.middleware.ts\n"
        "export const createRateLimiter = (options: RateLimitOptions) => {\n"
        "  const { windowMs, maxRequests, message = 'Too many requests. Please try again later.' } = options;\n"
        "  const hits = new Map<string, ClientRecord>();\n"
        "\n"
        "  // Automatic cleanup timer to prune stale IP records every 2 minutes\n"
        "  const cleanupTimer = setInterval(() => {\n"
        "    const now = Date.now();\n"
        "    for (const [ip, record] of hits.entries()) {\n"
        "      if (now > record.resetTime) hits.delete(ip);\n"
        "    }\n"
        "  }, 120000);\n"
        "  if (cleanupTimer.unref) cleanupTimer.unref();\n"
        "\n"
        "  return (req: Request, res: Response, next: NextFunction) => {\n"
        "    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown-ip';\n"
        "    const now = Date.now();\n"
        "    const record = hits.get(clientIp);\n"
        "    if (!record || now > record.resetTime) {\n"
        "      hits.set(clientIp, { count: 1, resetTime: now + windowMs });\n"
        "      return next();\n"
        "    }\n"
        "    if (record.count >= maxRequests) {\n"
        "      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);\n"
        "      res.setHeader('Retry-After', retryAfterSeconds.toString());\n"
        "      return res.status(429).json({ success: false, message });\n"
        "    }\n"
        "    record.count++;\n"
        "    next();\n"
        "  };\n"
        "};",
        title="Listing 7.2: Production Sliding-Window Rate Limiter (rate-limit.middleware.ts)"
    )

    # Listing 7.3: storage.ts
    add_h3(doc, "7.3.3 Sandboxed Storage & Path Traversal Prevention (storage.ts)")
    add_p(doc,
        "The storage utility isolates repository workspaces on disk and executes canonical path boundary checks to intercept directory traversal attacks:"
    )
    add_code_block(doc,
        "// server/src/utils/storage.ts\n"
        "const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');\n"
        "\n"
        "export const getFilePath = (repositoryId: string, branch: string, filePath: string) => {\n"
        "  const safeRepoId = repositoryId.replace(/[^a-zA-Z0-9_\\-]/g, '_');\n"
        "  const safeBranch = branch.replace(/[^a-zA-Z0-9_\\-\\.]/g, '_');\n"
        "  const normalizedFilePath = filePath.replace(/^[\\/\\\\]+/, '').replace(/\\\\/g, '/');\n"
        "  const branchRoot = path.join(STORAGE_ROOT, 'repos', safeRepoId, safeBranch);\n"
        "  const resolved = path.resolve(branchRoot, normalizedFilePath);\n"
        "\n"
        "  // Security Guard: Prevent directory traversal outside branch sandbox\n"
        "  if (!resolved.startsWith(branchRoot)) {\n"
        "    throw new Error('Invalid file path: Path traversal attempt detected');\n"
        "  }\n"
        "  return resolved;\n"
        "};",
        title="Listing 7.3: Path Traversal Interception Guard (storage.ts)"
    )

    # Listing 7.4: branch.service.ts
    add_h3(doc, "7.2.4 Branch Management & Active PR Deletion Guard (branch.service.ts)")
    add_p(doc,
        "The branch service protects the default branch ('main') from deletion and prevents deleting feature branches involved in active pull requests:"
    )
    add_code_block(doc,
        "// server/src/services/branch.service.ts\n"
        "export const deleteBranch = async (repositoryId: string, userId: string, branchName: string) => {\n"
        "  if (branchName === 'main') {\n"
        "    throw new Error(\"Cannot delete default branch 'main'\");\n"
        "  }\n"
        "  const branch = await prisma.branch.findUnique({\n"
        "    where: { repositoryId_name: { repositoryId, name: branchName } },\n"
        "  });\n"
        "  if (!branch) throw new Error(`Branch '${branchName}' not found`);\n"
        "\n"
        "  // Safeguard: Prevent deleting branch referenced by active pull requests\n"
        "  const activePr = await prisma.pullRequest.findFirst({\n"
        "    where: {\n"
        "      repositoryId,\n"
        "      status: { in: [PullRequestStatus.OPEN, PullRequestStatus.APPROVED, PullRequestStatus.CHANGES_REQUESTED] },\n"
        "      OR: [{ sourceBranchId: branch.id }, { targetBranchId: branch.id }],\n"
        "    },\n"
        "    select: { id: true, title: true },\n"
        "  });\n"
        "  if (activePr) {\n"
        "    throw new Error(`Cannot delete branch '${branchName}': it is part of active pull request \"${activePr.title}\"`);\n"
        "  }\n"
        "  await prisma.branch.delete({ where: { id: branch.id } });\n"
        "  return { message: `Branch '${branchName}' deleted successfully` };\n"
        "};",
        title="Listing 7.4: Branch Deletion Guard (branch.service.ts)"
    )

    # Listing 7.5: pull-request.service.ts
    add_h3(doc, "7.2.5 3-Way Merge Conflict & PR Merge Engine (pull-request.service.ts)")
    add_p(doc,
        "The pull request service evaluates diffs, identifies overlapping modifications, blocks conflicting merges, and writes merge commits:"
    )
    add_code_block(doc,
        "// server/src/services/pull-request.service.ts (Excerpt)\n"
        "export const mergePullRequest = async (repositoryId: string, prNumber: number, userId: string) => {\n"
        "  const pr = await getPullRequestByNumber(repositoryId, prNumber, userId);\n"
        "  if (pr.hasConflicts) {\n"
        "    throw new Error('Cannot merge: Pull request has merge conflicts that must be resolved');\n"
        "  }\n"
        "  if (pr.status === PullRequestStatus.MERGED) {\n"
        "    throw new Error('Pull request is already merged');\n"
        "  }\n"
        "  // Apply non-conflicting file modifications to target branch disk\n"
        "  for (const diff of pr.diffs) {\n"
        "    if (diff.changeType === 'DELETED') {\n"
        "      await deleteStorageFile(repositoryId, pr.targetBranch, diff.path);\n"
        "    } else {\n"
        "      const content = await readStorageFile(repositoryId, pr.sourceBranch, diff.path);\n"
        "      if (content !== null) await writeStorageFile(repositoryId, pr.targetBranch, diff.path, content);\n"
        "    }\n"
        "  }\n"
        "  // Create formal merge commit and update status\n"
        "  const updatedPr = await prisma.pullRequest.update({\n"
        "    where: { id: pr.id },\n"
        "    data: { status: PullRequestStatus.MERGED, mergedAt: new Date() },\n"
        "  });\n"
        "  return updatedPr;\n"
        "};",
        title="Listing 7.5: Pull Request Merge Execution Engine (pull-request.service.ts)"
    )

    # Listing 7.6: diff.ts
    add_h3(doc, "7.2.6 Unified Diff Calculation Algorithm (diff.ts)")
    add_p(doc,
        "The diff engine parses file contents into lines and generates unified addition, deletion, and context chunks:"
    )
    add_code_block(doc,
        "// server/src/utils/diff.ts (Excerpt)\n"
        "export function computeFileDiff(path: string, oldText: string | null, newText: string | null): FileDiff {\n"
        "  if (oldText === null) {\n"
        "    const newLines = (newText || '').split('\\n');\n"
        "    return { path, changeType: 'ADDED', additions: newLines.length, deletions: 0,\n"
        "      chunks: newLines.map((line, idx) => ({ newLineNumber: idx + 1, type: 'add', content: line })) };\n"
        "  }\n"
        "  if (newText === null) {\n"
        "    const oldLines = oldText.split('\\n');\n"
        "    return { path, changeType: 'DELETED', additions: 0, deletions: oldLines.length,\n"
        "      chunks: oldLines.map((line, idx) => ({ oldLineNumber: idx + 1, type: 'delete', content: line })) };\n"
        "  }\n"
        "  // Process modified files with line comparison\n"
        "  const oldLines = oldText.split('\\n');\n"
        "  const newLines = newText.split('\\n');\n"
        "  // ... generates chunks with line type 'add', 'delete', or 'normal'\n"
        "  return { path, changeType: 'MODIFIED', additions, deletions, chunks };\n"
        "}",
        title="Listing 7.6: Unified Diff Generation Engine (diff.ts)"
    )

    # Listing 7.7: CodeExplorer.tsx
    add_h3(doc, "7.2.7 In-Browser Code Explorer & Syntax Editor (CodeExplorer.tsx)")
    add_p(doc,
        "The React CodeExplorer component provides a lightweight, in-browser code editor featuring tab indentation, line numbering, and find/replace:"
    )
    add_code_block(doc,
        "// client/src/components/repository/CodeExplorer.tsx (Excerpt)\n"
        "export const CodeExplorer: React.FC<CodeExplorerProps> = ({ repoId, defaultBranch = 'main' }) => {\n"
        "  const { data: files = [], isLoading } = useFiles(repoId, selectedBranch);\n"
        "  const [activeFile, setActiveFile] = useState<FileItem | null>(null);\n"
        "  const [editorMode, setEditorMode] = useState<'CREATE' | 'EDIT'>('CREATE');\n"
        "  const [fileContentInput, setFileContentInput] = useState('');\n"
        "  const [commitMessageInput, setCommitMessageInput] = useState('');\n"
        "\n"
        "  // Handle tab key indentation inside code editor\n"
        "  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {\n"
        "    if (e.key === 'Tab') {\n"
        "      e.preventDefault();\n"
        "      const start = e.currentTarget.selectionStart;\n"
        "      const end = e.currentTarget.selectionEnd;\n"
        "      setFileContentInput(prev => prev.substring(0, start) + '  ' + prev.substring(end));\n"
        "    }\n"
        "  };\n"
        "  // ... renders file explorer tree, line-numbered textarea, and Markdown preview\n"
        "};",
        title="Listing 7.7: In-Browser Code Explorer Component (CodeExplorer.tsx)"
    )

    # Listing 7.8: ThemeContext.tsx
    add_h3(doc, "7.2.8 Dual-Theme Engine (ThemeContext.tsx)")
    add_p(doc,
        "The ThemeContext manages runtime switching between Developer Matte Black and Soft Baby Pink, persisting preferences to localStorage:"
    )
    add_code_block(doc,
        "// client/src/contexts/ThemeContext.tsx\n"
        "export type AccentMode = 'sage' | 'pink';\n"
        "\n"
        "export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n"
        "  const [accent, setAccentState] = useState<AccentMode>(() => {\n"
        "    try {\n"
        "      return localStorage.getItem('testbook_accent_mode') === 'pink' ? 'pink' : 'sage';\n"
        "    } catch { return 'sage'; }\n"
        "  });\n"
        "\n"
        "  useEffect(() => {\n"
        "    localStorage.setItem('testbook_accent_mode', accent);\n"
        "    document.documentElement.setAttribute('data-accent', accent);\n"
        "    document.body.setAttribute('data-accent', accent);\n"
        "  }, [accent]);\n"
        "\n"
        "  const toggleAccent = () => setAccentState(prev => (prev === 'sage' ? 'pink' : 'sage'));\n"
        "  return <ThemeContext.Provider value={{ accent, toggleAccent }}>{children}</ThemeContext.Provider>;\n"
        "};",
        title="Listing 7.8: Dual Theme Provider (ThemeContext.tsx)"
    )

    add_page_break(doc)

    # ==========================================
    # 7.3 SCREENSHOTS & INTERFACE WALKTHROUGHS
    # ==========================================
    add_h2(doc, "7.3 Project Output Screenshots & Interface Walkthroughs")
    add_p(doc,
        "The following figures showcase genuine screenshots captured from the live, fully operational Testbook platform. "
        "Each screen demonstrates functional capabilities, responsive styling, and accessibility features:"
    )

    # Fig 7.1: Landing Page
    img_71 = os.path.join(media_dir, "media_1790056067827.png")
    add_image_figure(doc, img_71, "Figure 7.1: Testbook Landing Page & Feature Showcase", width_in=5.6)
    add_p(doc,
        "Walkthrough of Figure 7.1 (Landing Page):\n"
        "The landing page introduces prospective student developers to Testbook. The top navigation bar presents the brand identity, "
        "direct links to documentation, and quick-action buttons ('Sign In' and 'Get Started'). The hero section displays the core value "
        "proposition: a simplified Git repository platform with visual branching and beginner guidance. Feature cards outline "
        "key capabilities: Branch Sandboxes, Unified Line Diffs, Peer Code Reviews, and Role-Based Access Control."
    )

    # Fig 7.2: User Registration
    img_72 = os.path.join(media_dir, "media_1794317578832_56c75c37.jpg")
    add_image_figure(doc, img_72, "Figure 7.2: User Registration Interface with Real-Time Validation", width_in=5.4)
    add_p(doc,
        "Walkthrough of Figure 7.2 (Registration Page):\n"
        "The registration interface captures account details (Username, Email Address, and Password). Form validation is implemented "
        "with React Hook Form and Zod schemas, enforcing username constraints (alphanumeric, 3–30 characters) and strong password "
        "rules (minimum 8 characters, requiring numbers and special characters). Submitting the form triggers a POST request to "
        "`/api/auth/register`, which hashes the password with bcrypt (12 rounds) and creates the user account."
    )

    # Fig 7.3: User Login
    img_73 = os.path.join(media_dir, "media_1794319393516_db67b644.jpg")
    add_image_figure(doc, img_73, "Figure 7.3: User Login & Secure JWT Session Initiation", width_in=5.4)
    add_p(doc,
        "Walkthrough of Figure 7.3 (Login Page):\n"
        "The login form accepts email and password credentials. Upon submission, the backend compares the password against the stored "
        "bcrypt hash. If valid, a cryptographically signed JSON Web Token is returned in the response payload. The client application "
        "persists the token in browser storage and initializes the authenticated user session, redirecting the developer to the Dashboard."
    )

    # Fig 7.4: Developer Dashboard (Matte Black)
    img_74 = os.path.join(media_dir, "media_1794330608733_927ef929.png")
    add_image_figure(doc, img_74, "Figure 7.4: Developer Dashboard (Matte Black Theme)", width_in=5.6)
    add_p(doc,
        "Walkthrough of Figure 7.4 (Developer Dashboard - Dark Theme):\n"
        "The main dashboard provides an overview of the developer's workspaces. Repository summary cards display repository names, "
        "visibility badges (PUBLIC vs. PRIVATE), description excerpts, primary programming languages, and recent activity timestamps. "
        "Quick-action buttons enable instant repository creation and profile customization."
    )

    # Fig 7.5: Developer Dashboard (Baby Pink)
    img_75 = os.path.join(media_dir, "media_1794334589489_6daa7109.png")
    add_image_figure(doc, img_75, "Figure 7.5: Developer Dashboard (Baby Pink Theme - Active Lab Infrastructure Overview)", width_in=5.6)
    add_p(doc,
        "Walkthrough of Figure 7.5 (Baby Pink Theme & Infrastructure Bar):\n"
        "This screenshot highlights the accessible Baby Pink palette and the active laboratory infrastructure overview. "
        "The top moving status ribbon dynamically reports: 'MERGE READY • ROLE-BASED ACCESS CONTROL (RBAC) ENFORCED • COLOR MODE & MONOGRAM ENGINE v1.0 • VCS REPOSITORY SYNC ACTIVE ONLINE'. "
        "The infrastructure panel aggregates real-time metrics across 8 Repositories, 10 Isolated Branches, 9 Commits, and confirms 'Healthy: Zero merge collisions'."
    )

    # Fig 7.6: Repository Creation
    img_76 = os.path.join(media_dir, "media_1794331358379_8428b469.png")
    add_image_figure(doc, img_76, "Figure 7.6: Repository Creation Modal with Visibility Selection", width_in=5.6)
    add_p(doc,
        "Walkthrough of Figure 7.6 (Repository Creation Modal):\n"
        "The modal allows developers to initialize a new repository. Users specify the repository name, optional description, "
        "and select visibility between 'Public' (visible to all students) and 'Private' (restricted to approved collaborators). "
        "Upon creation, the backend initializes the default 'main' branch and creates the sandboxed storage workspace on disk."
    )

    # Fig 7.7: Repository Overview & File Browser
    img_77 = os.path.join(media_dir, "media_1794331942828_cb4417e0.png")
    add_image_figure(doc, img_77, "Figure 7.7: Repository Overview, File Browser & Language Distribution Bar", width_in=5.6)
    add_p(doc,
        "Walkthrough of Figure 7.7 (Repository Overview & File Explorer):\n"
        "The repository detail view displays the branch switcher dropdown, commit counter, file explorer table, and language distribution bar. "
        "The file table lists directories and files with last commit messages and modification times. The language breakdown bar "
        "dynamically calculates code byte percentages (e.g., TypeScript, CSS, Markdown) with designated color indicators."
    )

    # Fig 7.8: In-Browser Code Explorer
    img_78 = os.path.join(media_dir, "media_1794332474427_bf35997b.png")
    add_image_figure(doc, img_78, "Figure 7.8: In-Browser Code Explorer with Line Numbers & Tab Indentation", width_in=5.6)
    add_p(doc,
        "Walkthrough of Figure 7.8 (In-Browser Code Editor):\n"
        "The in-browser code editor enables direct file creation and editing without local IDEs. Key features include dynamic line numbering, "
        "Tab key indentation support, Find & Replace toolbars, and commit message entry fields. Saving a file triggers an automated "
        "commit recorded in the repository commit DAG."
    )

    # Fig 7.9: Branch Management
    img_79 = os.path.join(media_dir, "media_1794333086282_5f98e7bb.png")
    add_image_figure(doc, img_79, "Figure 7.9: Branch Management Tab with Active PR Safeguards", width_in=5.6)
    add_p(doc,
        "Walkthrough of Figure 7.9 (Branch Management View):\n"
        "The branch management interface enumerates all branches in the repository, flagging the default 'main' branch with an immutable badge. "
        "Developers can branch from existing branches to create feature workspaces. The system safeguards against accidental branch "
        "deletion by checking for active open pull requests before permitting branch removal."
    )

    # Fig 7.10: Pull Request Review & 3-Way Merge
    img_710 = os.path.join(media_dir, "media_1790056170677.png")
    add_image_figure(doc, img_710, "Figure 7.10: Pull Request Review, Unified Diff Chunks & Automated Merge", width_in=5.6)
    add_p(doc,
        "Walkthrough of Figure 7.10 (Pull Request Review & Merge View):\n"
        "The pull request interface displays source and target branch comparisons, unified diff chunks (green for additions, red for deletions), "
        "and peer review actions. Collaborators can approve changes or request modifications. When no conflicts exist, the repository owner "
        "or contributor can execute a 1-click merge, integrating changes into the target branch."
    )

    add_page_break(doc)
