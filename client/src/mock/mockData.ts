import { User } from "../types/auth.types.js";
import { Repository } from "../types/repository.types.js";
import {
  Branch,
  FileItem,
  Commit,
  Issue,
  PullRequest,
  ActivityItem,
  UserProfile,
} from "../types/vcs.types.js";

export const MOCK_CURRENT_USER: User = {
  id: "usr_student_01",
  username: "tanmay_dev",
  email: "tanmay@student.edu",
  avatarUrl: null,
  bio: "BCA Final Year Student & Full-Stack Developer. Learning distributed systems and systems design.",
  createdAt: "2026-08-01T10:00:00.000Z",
};

export const MOCK_COLLABORATOR_1: User = {
  id: "usr_collab_02",
  username: "aarav_sharma",
  email: "aarav@student.edu",
  avatarUrl: null,
  bio: "Systems & Algorithms Enthusiast. Contributor to Testbook.",
  createdAt: "2026-08-05T14:30:00.000Z",
};

export const MOCK_PROFESSOR: User = {
  id: "usr_prof_03",
  username: "prof_verma",
  email: "r.verma@faculty.edu",
  avatarUrl: null,
  bio: "Department of Computer Science & Engineering. Faculty Evaluator.",
  createdAt: "2026-07-20T09:00:00.000Z",
};

export const INITIAL_REPOSITORIES: Repository[] = [
  {
    id: "repo_dslab_01",
    name: "data-structures-lab",
    description: "Lab assignments and implementations of BST, AVL trees, graphs and hash maps.",
    visibility: "PUBLIC",
    ownerId: MOCK_CURRENT_USER.id,
    createdAt: "2026-08-20T12:00:00.000Z",
    updatedAt: "2026-09-10T15:45:00.000Z",
    owner: MOCK_CURRENT_USER,
    currentUserRole: "OWNER",
    counts: {
      members: 2,
      branches: 3,
      commits: 6,
      issues: 2,
      pullRequests: 1,
      files: 7,
    },
  },
  {
    id: "repo_compiler_02",
    name: "mini-compiler-toolkit",
    description: "Recursive descent parser, lexer tokenizer and AST evaluation engine written in TypeScript.",
    visibility: "PRIVATE",
    ownerId: MOCK_CURRENT_USER.id,
    createdAt: "2026-09-01T08:30:00.000Z",
    updatedAt: "2026-09-18T18:20:00.000Z",
    owner: MOCK_CURRENT_USER,
    currentUserRole: "OWNER",
    counts: {
      members: 1,
      branches: 2,
      commits: 4,
      issues: 1,
      pullRequests: 0,
      files: 5,
    },
  },
  {
    id: "repo_webos_03",
    name: "web-os-shell",
    description: "Browser-based desktop environment and terminal emulator using React and WebAssembly.",
    visibility: "PUBLIC",
    ownerId: MOCK_PROFESSOR.id,
    createdAt: "2026-08-15T11:00:00.000Z",
    updatedAt: "2026-09-22T09:10:00.000Z",
    owner: MOCK_PROFESSOR,
    currentUserRole: "CONTRIBUTOR",
    counts: {
      members: 3,
      branches: 2,
      commits: 12,
      issues: 3,
      pullRequests: 2,
      files: 9,
    },
  },
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: "br_01_main",
    repositoryId: "repo_dslab_01",
    name: "main",
    isDefault: true,
    createdAt: "2026-08-20T12:00:00.000Z",
    updatedAt: "2026-09-10T15:45:00.000Z",
    lastCommitSha: "c7a4e12",
    commitCount: 4,
  },
  {
    id: "br_01_feature_avl",
    repositoryId: "repo_dslab_01",
    name: "feature/avl-tree",
    isDefault: false,
    createdAt: "2026-09-02T10:00:00.000Z",
    updatedAt: "2026-09-08T16:20:00.000Z",
    lastCommitSha: "b5f3d81",
    commitCount: 2,
  },
  {
    id: "br_01_fix_hashmap",
    repositoryId: "repo_dslab_01",
    name: "fix/hashmap-collision",
    isDefault: false,
    createdAt: "2026-09-09T14:00:00.000Z",
    updatedAt: "2026-09-10T11:30:00.000Z",
    lastCommitSha: "e9d2a6f",
    commitCount: 1,
  },
  {
    id: "br_02_main",
    repositoryId: "repo_compiler_02",
    name: "main",
    isDefault: true,
    createdAt: "2026-09-01T08:30:00.000Z",
    updatedAt: "2026-09-18T18:20:00.000Z",
    lastCommitSha: "f1a2b3c",
    commitCount: 4,
  },
  {
    id: "br_02_dev",
    repositoryId: "repo_compiler_02",
    name: "develop",
    isDefault: false,
    createdAt: "2026-09-05T09:00:00.000Z",
    updatedAt: "2026-09-17T14:10:00.000Z",
    lastCommitSha: "d4e5f6a",
    commitCount: 2,
  },
  {
    id: "br_03_main",
    repositoryId: "repo_webos_03",
    name: "main",
    isDefault: true,
    createdAt: "2026-08-15T11:00:00.000Z",
    updatedAt: "2026-09-22T09:10:00.000Z",
    lastCommitSha: "8a7b6c5",
    commitCount: 12,
  },
];

export const INITIAL_FILES: FileItem[] = [
  {
    id: "file_01_readme",
    repositoryId: "repo_dslab_01",
    branch: "main",
    path: "README.md",
    name: "README.md",
    type: "file",
    size: 1420,
    updatedAt: "2026-09-10T15:45:00.000Z",
    lastCommitMessage: "docs: update lab instructions and complexity analysis",
    content: `# Data Structures & Algorithms Lab (CS-302)

Official lab repository for collegiate computer science coursework.

## Implemented Structures
- **Binary Search Tree (\`BST\`)**: In-order, pre-order, and post-order traversal with $O(\\log n)$ average operations.
- **AVL Tree (\`AVL\`)**: Self-balancing tree using single and double rotations.
- **Hash Map (\`HashTable\`)**: Quadratic probing with dynamic load factor re-hashing.

## Complexity Benchmark
| Operation | Average Time | Worst Case Time | Space Complexity |
| :--- | :--- | :--- | :--- |
| **BST Search** | $O(\\log n)$ | $O(n)$ | $O(n)$ |
| **AVL Insert** | $O(\\log n)$ | $O(\\log n)$ | $O(n)$ |
| **Hash Lookup** | $O(1)$ | $O(n)$ | $O(n)$ |

## Compilation & Testing
\`\`\`bash
javac src/*.java
java src.BinarySearchTree
\`\`\`
`,
  },
  {
    id: "file_01_bst",
    repositoryId: "repo_dslab_01",
    branch: "main",
    path: "src/BinarySearchTree.java",
    name: "BinarySearchTree.java",
    type: "file",
    size: 2840,
    updatedAt: "2026-09-05T12:00:00.000Z",
    lastCommitMessage: "feat: add recursive tree traversal and search methods",
    content: `package src;

/**
 * Standard generic Binary Search Tree implementation.
 */
public class BinarySearchTree<T extends Comparable<T>> {

    public static class Node<T> {
        public T data;
        public Node<T> left;
        public Node<T> right;

        public Node(T data) {
            this.data = data;
            this.left = null;
            this.right = null;
        }
    }

    private Node<T> root;

    public BinarySearchTree() {
        this.root = null;
    }

    public void insert(T value) {
        this.root = insertRecursive(this.root, value);
    }

    private Node<T> insertRecursive(Node<T> current, T value) {
        if (current == null) {
            return new Node<>(value);
        }

        int cmp = value.compareTo(current.data);
        if (cmp < 0) {
            current.left = insertRecursive(current.left, value);
        } else if (cmp > 0) {
            current.right = insertRecursive(current.right, value);
        }

        return current;
    }

    public boolean search(T value) {
        return searchRecursive(this.root, value);
    }

    private boolean searchRecursive(Node<T> current, T value) {
        if (current == null) return false;
        if (current.data.equals(value)) return true;

        return value.compareTo(current.data) < 0
            ? searchRecursive(current.left, value)
            : searchRecursive(current.right, value);
    }

    public void printInOrder() {
        inOrder(this.root);
        System.out.println();
    }

    private void inOrder(Node<T> node) {
        if (node != null) {
            inOrder(node.left);
            System.out.print(node.data + " ");
            inOrder(node.right);
        }
    }
}
`,
  },
  {
    id: "file_01_avl",
    repositoryId: "repo_dslab_01",
    branch: "main",
    path: "src/AVLTree.java",
    name: "AVLTree.java",
    type: "file",
    size: 3410,
    updatedAt: "2026-09-08T16:20:00.000Z",
    lastCommitMessage: "feat: implement left and right rotation logic",
    content: `package src;

public class AVLTree {

    public static class Node {
        int key, height;
        Node left, right;

        Node(int d) {
            key = d;
            height = 1;
        }
    }

    private Node root;

    int height(Node N) {
        if (N == null) return 0;
        return N.height;
    }

    int max(int a, int b) {
        return (a > b) ? a : b;
    }

    Node rightRotate(Node y) {
        Node x = y.left;
        Node T2 = x.right;

        x.right = y;
        y.left = T2;

        y.height = max(height(y.left), height(y.right)) + 1;
        x.height = max(height(x.left), height(x.right)) + 1;

        return x;
    }

    Node leftRotate(Node x) {
        Node y = x.right;
        Node T2 = y.left;

        y.left = x;
        x.right = T2;

        x.height = max(height(x.left), height(x.right)) + 1;
        y.height = max(height(y.left), height(y.right)) + 1;

        return y;
    }

    int getBalance(Node N) {
        if (N == null) return 0;
        return height(N.left) - height(N.right);
    }
}
`,
  },
  {
    id: "file_01_pkg",
    repositoryId: "repo_dslab_01",
    branch: "main",
    path: "package.json",
    name: "package.json",
    type: "file",
    size: 320,
    updatedAt: "2026-08-20T12:00:00.000Z",
    lastCommitMessage: "init: project setup",
    content: `{
  "name": "data-structures-lab",
  "version": "1.0.0",
  "description": "Collegiate algorithms lab assignments",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "Tanmay Yadav",
  "license": "MIT"
}
`,
  },
  // Feature branch specific file
  {
    id: "file_01_avl_feat",
    repositoryId: "repo_dslab_01",
    branch: "feature/avl-tree",
    path: "src/AVLTree.java",
    name: "AVLTree.java",
    type: "file",
    size: 4200,
    updatedAt: "2026-09-08T16:20:00.000Z",
    lastCommitMessage: "feat: add double rotation and complete insertion balance",
    content: `package src;

public class AVLTree {

    public static class Node {
        int key, height;
        Node left, right;

        Node(int d) {
            key = d;
            height = 1;
        }
    }

    private Node root;

    int height(Node N) {
        if (N == null) return 0;
        return N.height;
    }

    int max(int a, int b) {
        return (a > b) ? a : b;
    }

    Node rightRotate(Node y) {
        Node x = y.left;
        Node T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = max(height(y.left), height(y.right)) + 1;
        x.height = max(height(x.left), height(x.right)) + 1;
        return x;
    }

    Node leftRotate(Node x) {
        Node y = x.right;
        Node T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = max(height(x.left), height(x.right)) + 1;
        y.height = max(height(y.left), height(y.right)) + 1;
        return y;
    }

    int getBalance(Node N) {
        if (N == null) return 0;
        return height(N.left) - height(N.right);
    }

    Node insert(Node node, int key) {
        if (node == null) return (new Node(key));

        if (key < node.key)
            node.left = insert(node.left, key);
        else if (key > node.key)
            node.right = insert(node.right, key);
        else
            return node;

        node.height = 1 + max(height(node.left), height(node.right));
        int balance = getBalance(node);

        // Left Left Case
        if (balance > 1 && key < node.left.key)
            return rightRotate(node);

        // Right Right Case
        if (balance < -1 && key > node.right.key)
            return leftRotate(node);

        // Left Right Case
        if (balance > 1 && key > node.left.key) {
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }

        // Right Left Case
        if (balance < -1 && key < node.right.key) {
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }

        return node;
    }
}
`,
  },
  {
    id: "file_01_readme_feat",
    repositoryId: "repo_dslab_01",
    branch: "feature/avl-tree",
    path: "README.md",
    name: "README.md",
    type: "file",
    size: 1420,
    updatedAt: "2026-09-08T16:20:00.000Z",
    lastCommitMessage: "docs: update lab instructions and complexity analysis",
    content: `# Data Structures & Algorithms Lab (CS-302)\n\nBranch: feature/avl-tree active.\n`,
  },
  // Compiler repo files
  {
    id: "file_02_readme",
    repositoryId: "repo_compiler_02",
    branch: "main",
    path: "README.md",
    name: "README.md",
    type: "file",
    size: 920,
    updatedAt: "2026-09-18T18:20:00.000Z",
    lastCommitMessage: "docs: add compiler grammar BNF notation",
    content: `# Mini Compiler Toolkit

Recursive descent parser for arithmetic expressions and variable assignments.

## Grammar
\`\`\`
Expr   -> Term (( '+' | '-' ) Term)*
Term   -> Factor (( '*' | '/' ) Factor)*
Factor -> NUMBER | IDENTIFIER | '(' Expr ')'
\`\`\`
`,
  },
  {
    id: "file_02_lexer",
    repositoryId: "repo_compiler_02",
    branch: "main",
    path: "src/lexer.ts",
    name: "lexer.ts",
    type: "file",
    size: 1540,
    updatedAt: "2026-09-15T10:00:00.000Z",
    lastCommitMessage: "feat: implement regex tokenizer for keywords and tokens",
    content: `export type TokenType = "NUMBER" | "PLUS" | "MINUS" | "STAR" | "SLASH" | "LPAREN" | "RPAREN" | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const char = source[cursor];
    if (/\\s/.test(char)) {
      cursor++;
      continue;
    }
    if (/\\d/.test(char)) {
      let num = "";
      while (cursor < source.length && /\\d/.test(source[cursor])) {
        num += source[cursor++];
      }
      tokens.push({ type: "NUMBER", value: num, line: 1 });
      continue;
    }
    if (char === "+") { tokens.push({ type: "PLUS", value: "+", line: 1 }); cursor++; continue; }
    if (char === "-") { tokens.push({ type: "MINUS", value: "-", line: 1 }); cursor++; continue; }
    if (char === "*") { tokens.push({ type: "STAR", value: "*", line: 1 }); cursor++; continue; }
    if (char === "/") { tokens.push({ type: "SLASH", value: "/", line: 1 }); cursor++; continue; }
    cursor++;
  }
  tokens.push({ type: "EOF", value: "", line: 1 });
  return tokens;
}
`,
  },
];

export const INITIAL_COMMITS: Commit[] = [
  {
    id: "cmt_01",
    sha: "c7a4e12",
    repositoryId: "repo_dslab_01",
    branch: "main",
    message: "docs: update lab instructions and complexity analysis",
    status: "ACTIVE",
    createdAt: "2026-09-10T15:45:00.000Z",
    author: MOCK_CURRENT_USER,
    stats: { filesChanged: 1, additions: 24, deletions: 4 },
    diffs: [
      {
        path: "README.md",
        changeType: "MODIFIED",
        additions: 24,
        deletions: 4,
        chunks: [
          { type: "normal", content: " ## Implemented Structures" },
          { type: "delete", content: "- Binary Search Tree (BST)" },
          { type: "add", content: "- **Binary Search Tree (`BST`)**: In-order, pre-order, and post-order traversal with $O(\\log n)$ operations." },
          { type: "add", content: "- **AVL Tree (`AVL`)**: Self-balancing tree using single and double rotations." },
          { type: "add", content: "- **Hash Map (`HashTable`)**: Quadratic probing with dynamic load factor re-hashing." },
        ],
      },
    ],
  },
  {
    id: "cmt_02",
    sha: "b5f3d81",
    repositoryId: "repo_dslab_01",
    branch: "main",
    message: "feat: implement left and right rotation logic for AVL Tree",
    status: "ACTIVE",
    createdAt: "2026-09-08T16:20:00.000Z",
    author: MOCK_COLLABORATOR_1,
    stats: { filesChanged: 1, additions: 68, deletions: 0 },
    diffs: [
      {
        path: "src/AVLTree.java",
        changeType: "ADDED",
        additions: 68,
        deletions: 0,
        chunks: [
          { type: "add", content: "package src;" },
          { type: "add", content: "public class AVLTree {" },
          { type: "add", content: "    Node rightRotate(Node y) { ... }" },
          { type: "add", content: "    Node leftRotate(Node x) { ... }" },
          { type: "add", content: "}" },
        ],
      },
    ],
  },
  {
    id: "cmt_03",
    sha: "a1e9c40",
    repositoryId: "repo_dslab_01",
    branch: "main",
    message: "feat: add recursive tree traversal and search methods",
    status: "ACTIVE",
    createdAt: "2026-09-05T12:00:00.000Z",
    author: MOCK_CURRENT_USER,
    stats: { filesChanged: 1, additions: 75, deletions: 2 },
  },
  {
    id: "cmt_04",
    sha: "9d2a6f0",
    repositoryId: "repo_dslab_01",
    branch: "main",
    message: "init: project setup and starter files",
    status: "ACTIVE",
    createdAt: "2026-08-20T12:00:00.000Z",
    author: MOCK_CURRENT_USER,
    stats: { filesChanged: 2, additions: 45, deletions: 0 },
  },
  {
    id: "cmt_05",
    sha: "f1a2b3c",
    repositoryId: "repo_compiler_02",
    branch: "main",
    message: "docs: add compiler grammar BNF notation",
    status: "ACTIVE",
    createdAt: "2026-09-18T18:20:00.000Z",
    author: MOCK_CURRENT_USER,
    stats: { filesChanged: 1, additions: 15, deletions: 0 },
  },
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: "iss_01",
    number: 1,
    repositoryId: "repo_dslab_01",
    title: "NullPointerException when deleting leaf nodes in BST",
    description: "When invoking `delete(T value)` on a leaf node without children, the parent pointer is set to null but the garbage collection dereference throws an unhandled NullPointerException in edge cases.",
    status: "CLOSED",
    createdAt: "2026-08-25T11:00:00.000Z",
    updatedAt: "2026-08-28T16:30:00.000Z",
    closedAt: "2026-08-28T16:30:00.000Z",
    author: MOCK_COLLABORATOR_1,
    assignee: MOCK_CURRENT_USER,
    labels: ["bug", "BST", "resolved"],
    commentsCount: 2,
    comments: [
      {
        id: "ic_01",
        issueId: "iss_01",
        author: MOCK_CURRENT_USER,
        content: "Reproduced. The issue occurs when the root itself is the only node and is deleted. I will push a fix checking `parent != null`.",
        createdAt: "2026-08-26T09:15:00.000Z",
      },
      {
        id: "ic_02",
        issueId: "iss_01",
        author: MOCK_COLLABORATOR_1,
        content: "Fix verified in commit a1e9c40. Closing issue.",
        createdAt: "2026-08-28T16:30:00.000Z",
      },
    ],
  },
  {
    id: "iss_02",
    number: 2,
    repositoryId: "repo_dslab_01",
    title: "Implement double rotation (LR and RL) for AVL Tree",
    description: "The current AVL implementation only has single right and left rotations. We need double rotations (Left-Right and Right-Left) to handle zigzag unbalanced insertions.",
    status: "OPEN",
    createdAt: "2026-09-02T14:15:00.000Z",
    updatedAt: "2026-09-04T10:00:00.000Z",
    author: MOCK_CURRENT_USER,
    assignee: MOCK_COLLABORATOR_1,
    labels: ["enhancement", "AVL", "in-progress"],
    commentsCount: 1,
    comments: [
      {
        id: "ic_03",
        issueId: "iss_02",
        author: MOCK_COLLABORATOR_1,
        content: "Working on this in branch `feature/avl-tree`. Will raise a pull request once test assertions pass.",
        createdAt: "2026-09-04T10:00:00.000Z",
      },
    ],
  },
  {
    id: "iss_03",
    number: 1,
    repositoryId: "repo_compiler_02",
    title: "Support floating point numbers in tokenizer",
    description: "Currently `lexer.ts` only consumes digits `0-9`. It drops decimal points in floating point literals like `3.14159`.",
    status: "OPEN",
    createdAt: "2026-09-17T11:00:00.000Z",
    updatedAt: "2026-09-17T11:00:00.000Z",
    author: MOCK_CURRENT_USER,
    assignee: null,
    labels: ["lexer", "enhancement"],
    commentsCount: 0,
    comments: [],
  },
];

export const INITIAL_PULL_REQUESTS: PullRequest[] = [
  {
    id: "pr_01",
    number: 1,
    repositoryId: "repo_dslab_01",
    title: "feat: implement complete AVL tree balancing and double rotations",
    description: `### Overview
This pull request introduces complete self-balancing operations for the AVL Tree:
- Implemented **Left-Right (LR)** double rotation
- Implemented **Right-Left (RL)** double rotation
- Added balance factor checking during recursive insertion

### Testing
- Tested insertion of sorted array \`[10, 20, 30, 40, 50, 25]\`
- Verified height remains $\\le \\log_2(n) + 1$
`,
    sourceBranch: "feature/avl-tree",
    targetBranch: "main",
    status: "OPEN",
    createdAt: "2026-09-08T17:00:00.000Z",
    updatedAt: "2026-09-09T12:00:00.000Z",
    author: MOCK_COLLABORATOR_1,
    reviews: [
      {
        id: "rev_01",
        pullRequestId: "pr_01",
        reviewer: MOCK_CURRENT_USER,
        status: "APPROVED",
        comment: "Great work! The rotation logic is clean and matches the standard textbook formula. Ready to merge.",
        createdAt: "2026-09-09T11:30:00.000Z",
      },
    ],
    comments: [
      {
        id: "prc_01",
        pullRequestId: "pr_01",
        author: MOCK_COLLABORATOR_1,
        content: "Please review the height calculation on line 42 to make sure it handles null subtrees safely.",
        createdAt: "2026-09-08T17:10:00.000Z",
      },
    ],
    reviewComments: [
      {
        id: "rc_01",
        author: MOCK_CURRENT_USER,
        filePath: "src/AVLTree.java",
        lineNumber: 48,
        content: "Using `max(height(left), height(right)) + 1` is optimal here.",
        createdAt: "2026-09-09T11:25:00.000Z",
      },
    ],
    commits: [
      {
        id: "cmt_pr_01",
        sha: "b5f3d81",
        repositoryId: "repo_dslab_01",
        branch: "feature/avl-tree",
        message: "feat: add double rotation and complete insertion balance",
        status: "ACTIVE",
        createdAt: "2026-09-08T16:20:00.000Z",
        author: MOCK_COLLABORATOR_1,
      },
    ],
    diffs: [
      {
        path: "src/AVLTree.java",
        changeType: "MODIFIED",
        additions: 45,
        deletions: 2,
        chunks: [
          { type: "normal", content: "         int balance = getBalance(node);" },
          { type: "normal", content: "         // Left Left Case" },
          { type: "add", content: "        // Left Right Case" },
          { type: "add", content: "        if (balance > 1 && key > node.left.key) {" },
          { type: "add", content: "            node.left = leftRotate(node.left);" },
          { type: "add", content: "            return rightRotate(node);" },
          { type: "add", content: "        }" },
          { type: "add", content: "        // Right Left Case" },
          { type: "add", content: "        if (balance < -1 && key < node.right.key) {" },
          { type: "add", content: "            node.right = rightRotate(node.right);" },
          { type: "add", content: "            return leftRotate(node);" },
          { type: "add", content: "        }" },
        ],
      },
    ],
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act_01",
    repositoryId: "repo_dslab_01",
    repositoryName: "data-structures-lab",
    user: MOCK_CURRENT_USER,
    type: "COMMIT_CREATED",
    message: "pushed commit c7a4e12 to main",
    createdAt: "2026-09-10T15:45:00.000Z",
  },
  {
    id: "act_02",
    repositoryId: "repo_dslab_01",
    repositoryName: "data-structures-lab",
    user: MOCK_CURRENT_USER,
    type: "REVIEW_SUBMITTED",
    message: "approved Pull Request #1",
    createdAt: "2026-09-09T11:30:00.000Z",
  },
  {
    id: "act_03",
    repositoryId: "repo_dslab_01",
    repositoryName: "data-structures-lab",
    user: MOCK_COLLABORATOR_1,
    type: "PULL_REQUEST_CREATED",
    message: "opened Pull Request #1: feat: implement complete AVL tree balancing",
    createdAt: "2026-09-08T17:00:00.000Z",
  },
  {
    id: "act_04",
    repositoryId: "repo_compiler_02",
    repositoryName: "mini-compiler-toolkit",
    user: MOCK_CURRENT_USER,
    type: "REPOSITORY_CREATED",
    message: "created repository mini-compiler-toolkit",
    createdAt: "2026-09-01T08:30:00.000Z",
  },
  {
    id: "act_05",
    repositoryId: "repo_dslab_01",
    repositoryName: "data-structures-lab",
    user: MOCK_COLLABORATOR_1,
    type: "ISSUE_CLOSED",
    message: "closed Issue #1: NullPointerException when deleting leaf nodes in BST",
    createdAt: "2026-08-28T16:30:00.000Z",
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  ...MOCK_CURRENT_USER,
  headline: "BCA Computer Science Student | Aspiring Software Engineer",
  institution: "Faculty of Computer Applications, National Institute",
  location: "New Delhi, India",
  website: "https://tanmayyadav.dev",
  githubUsername: "tanmay-dev",
  skills: ["Java", "Data Structures", "TypeScript", "React", "PostgreSQL", "Git", "REST APIs"],
  repositoriesCount: 3,
  starsReceived: 18,
  contributionsThisYear: 142,
};
