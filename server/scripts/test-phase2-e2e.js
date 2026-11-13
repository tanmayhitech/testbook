import http from "http";
import app from "../dist/app.js";

const PORT = 5099;
let server;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      "Content-Type": "application/json",
    };
    if (data) {
      headers["Content-Length"] = Buffer.byteLength(data);
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        host: "localhost",
        port: PORT,
        method,
        path,
        headers,
      },
      (res) => {
        let resBody = "";
        res.on("data", (chunk) => (resBody += chunk));
        res.on("end", () => {
          try {
            const parsed = resBody ? JSON.parse(resBody) : {};
            resolve({ status: res.statusCode, body: parsed });
          } catch (err) {
            resolve({ status: res.statusCode, text: resBody });
          }
        });
      }
    );

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  server = app.listen(PORT);
  console.log(`Test server running on port ${PORT}`);

  try {
    const timestamp = Date.now();
    const aliceUser = `alice_${timestamp}`;
    const bobUser = `bob_${timestamp}`;

    console.log("\n--- TEST 1: Health Check ---");
    const health = await request("GET", "/api/health");
    console.log("GET /api/health:", health.status, health.body.success);
    if (health.status !== 200) throw new Error("Health check failed");

    console.log("\n--- TEST 2: Health DB Check ---");
    const healthDb = await request("GET", "/api/health/db");
    console.log("GET /api/health/db:", healthDb.status, healthDb.body.success);
    if (healthDb.status !== 200) throw new Error("DB Health check failed");

    console.log("\n--- TEST 3: User Registration (Alice & Bob) ---");
    const regAlice = await request("POST", "/api/auth/register", {
      username: aliceUser,
      email: `${aliceUser}@testbook.dev`,
      password: "Password123!",
    });
    console.log("Register Alice:", regAlice.status, regAlice.body.message);
    if (regAlice.status !== 201) throw new Error("Failed to register Alice");
    const aliceToken = regAlice.body.data.accessToken;

    const regBob = await request("POST", "/api/auth/register", {
      username: bobUser,
      email: `${bobUser}@testbook.dev`,
      password: "Password123!",
    });
    console.log("Register Bob:", regBob.status, regBob.body.message);
    if (regBob.status !== 201) throw new Error("Failed to register Bob");
    const bobToken = regBob.body.data.accessToken;

    console.log("\n--- TEST 4: Current User / Auth Me ---");
    const meAlice = await request("GET", "/api/auth/me", null, aliceToken);
    console.log("GET /api/auth/me:", meAlice.status, meAlice.body.data.user.username);
    if (meAlice.body.data.user.username !== aliceUser) throw new Error("Mismatch in getMe");

    console.log("\n--- TEST 5: User Profile & Update ---");
    const prof = await request("GET", "/api/users/profile", null, aliceToken);
    console.log("GET /api/users/profile:", prof.status, prof.body.data.username);

    const updateProf = await request("PATCH", "/api/users/profile", {
      bio: "Full stack engineer and student at Testbook",
    }, aliceToken);
    console.log("PATCH /api/users/profile:", updateProf.status, updateProf.body.data.bio);

    console.log("\n--- TEST 6: Repository Creation (Alice) ---");
    const createRepo = await request("POST", "/api/repos", {
      name: `repo-${timestamp}`,
      description: "A collaborative demo repository",
      visibility: "PRIVATE",
    }, aliceToken);
    console.log("POST /api/repos:", createRepo.status, createRepo.body.data.name);
    if (createRepo.status !== 201) throw new Error("Failed to create repo");
    const repoId = createRepo.body.data.id;

    console.log("\n--- TEST 7: File Management (Save & Content) on 'main' ---");
    const saveReadme = await request("POST", `/api/repos/${repoId}/files`, {
      branch: "main",
      path: "README.md",
      content: "# Welcome to Testbook Demo\n\nInitial commit of README.",
      commitMessage: "docs: add initial README.md",
    }, aliceToken);
    console.log("POST /api/repos/:id/files:", saveReadme.status, saveReadme.body.message);
    if (saveReadme.status !== 200) throw new Error("Failed to save README");

    const getReadme = await request("GET", `/api/repos/${repoId}/files/content?branch=main&path=README.md`, null, aliceToken);
    console.log("GET /api/repos/:id/files/content:", getReadme.status, "Length:", getReadme.body.data.content.length);

    console.log("\n--- TEST 8: Branch Creation ('feature/navbar') ---");
    const createBr = await request("POST", `/api/repos/${repoId}/branches`, {
      name: "feature/navbar",
      sourceBranch: "main",
    }, aliceToken);
    console.log("POST /api/repos/:id/branches:", createBr.status, createBr.body.data.name);
    if (createBr.status !== 201) throw new Error("Failed to create branch");

    console.log("\n--- TEST 9: Add File to Feature Branch ---");
    const saveNav = await request("POST", `/api/repos/${repoId}/files`, {
      branch: "feature/navbar",
      path: "src/Navbar.tsx",
      content: "export const Navbar = () => <nav>Testbook Navbar</nav>;",
      commitMessage: "feat: implement responsive Navbar component",
    }, aliceToken);
    console.log("Save Navbar.tsx:", saveNav.status, saveNav.body.message);

    console.log("\n--- TEST 10: Commits List ---");
    const commits = await request("GET", `/api/repos/${repoId}/commits?branch=feature/navbar`, null, aliceToken);
    console.log("GET /api/repos/:id/commits:", commits.status, "Count:", commits.body.data.length);
    if (commits.body.data.length === 0) throw new Error("Expected at least 1 commit");

    console.log("\n--- TEST 11: Add Bob as Contributor (RBAC) ---");
    const addCollab = await request("POST", `/api/repos/${repoId}/members`, {
      username: bobUser,
      role: "CONTRIBUTOR",
    }, aliceToken);
    console.log("Add Bob:", addCollab.status, addCollab.body.data.role);
    if (addCollab.status !== 200) throw new Error("Failed to add collaborator");

    console.log("\n--- TEST 12: Issue Creation (by Bob) ---");
    const createIss = await request("POST", `/api/repos/${repoId}/issues`, {
      title: "Add dark mode toggle",
      description: "Navbar should support switching dark mode theme.",
    }, bobToken);
    console.log("Bob opens issue:", createIss.status, "Issue #:", createIss.body.data.number);
    const issueNum = createIss.body.data.number;

    console.log("\n--- TEST 13: Issue Comment & Status Change (by Alice) ---");
    const addComment = await request("POST", `/api/repos/${repoId}/issues/${issueNum}/comments`, {
      content: "Great suggestion! Dark mode is supported by default.",
    }, aliceToken);
    console.log("Alice comments:", addComment.status, "Comments count:", addComment.body.data.commentsCount);

    const closeIss = await request("PATCH", `/api/repos/${repoId}/issues/${issueNum}/status`, {
      status: "CLOSED",
    }, aliceToken);
    console.log("Alice closes issue:", closeIss.status, "Status:", closeIss.body.data.status);

    console.log("\n--- TEST 14: Pull Request Creation (Alice) ---");
    const createPr = await request("POST", `/api/repos/${repoId}/pulls`, {
      title: "feat: add navbar component",
      description: "Includes Navbar component and header styles",
      sourceBranch: "feature/navbar",
      targetBranch: "main",
    }, aliceToken);
    console.log("Create PR:", createPr.status, "PR #:", createPr.body.data.number);
    const prNum = createPr.body.data.number;

    console.log("\n--- TEST 15: Pull Request Review (Bob) ---");
    const reviewPr = await request("POST", `/api/repos/${repoId}/pulls/${prNum}/reviews`, {
      status: "APPROVED",
      comment: "Looks clean and tested!",
    }, bobToken);
    console.log("Bob reviews PR:", reviewPr.status, "Review status:", reviewPr.body.data.reviews[0]?.status);

    console.log("\n--- TEST 16: Merge Pull Request (Alice) ---");
    const mergePr = await request("POST", `/api/repos/${repoId}/pulls/${prNum}/merge`, null, aliceToken);
    console.log("Alice merges PR:", mergePr.status, "PR status:", mergePr.body.data.status);
    if (mergePr.body.data.status !== "MERGED") throw new Error("Expected PR to be MERGED");

    console.log("\n--- TEST 17: Verify Merged Content on Target Branch ('main') ---");
    const mergedNav = await request("GET", `/api/repos/${repoId}/files/content?branch=main&path=src/Navbar.tsx`, null, aliceToken);
    console.log("GET Navbar.tsx on main:", mergedNav.status, "Found content:", mergedNav.body.data.content.includes("Testbook Navbar"));

    console.log("\n--- TEST 18: Activity Feed ---");
    const acts = await request("GET", "/api/activities", null, aliceToken);
    console.log("GET /api/activities:", acts.status, "Total activities:", acts.body.data.length);
    if (acts.body.data.length < 5) throw new Error("Expected multiple logged activities");

    console.log("\n========================================================");
    console.log("🎉 ALL 18 END-TO-END BACKEND INTEGRATION TESTS PASSED! 🎉");
    console.log("========================================================\n");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
}

runTests();
