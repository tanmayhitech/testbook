import http from "http";
import jwt from "jsonwebtoken";

const PORT = 5000;

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

async function runAudit() {
  console.log("=================================================");
  console.log("TESTBOOK PHASE 3: COMPREHENSIVE PRODUCTION AUDIT");
  console.log("=================================================\n");

  const ts = Date.now();
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // SECTION 1: AUTHENTICATION & TOKEN AUDIT
    // ----------------------------------------------------
    console.log("[1. SECURITY AUDIT — AUTHENTICATION & TOKENS]");

    const noToken = await request("GET", "/api/repos");
    assert(noToken.status === 401, "Protected endpoint without token returns 401");

    const badToken = await request("GET", "/api/repos", null, "invalid-garbage-token");
    assert(badToken.status === 401, "Protected endpoint with malformed token returns 401");

    // Expired token test
    const expiredToken = jwt.sign({ userId: "user_test" }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "-1s",
    });
    const expRes = await request("GET", "/api/repos", null, expiredToken);
    assert(expRes.status === 401, "Protected endpoint with expired token returns 401");

    // Register three users: Owner (Alice), Contributor (Bob), and Viewer/Outsider (Charlie)
    const uAlice = `aud_alice_${ts}`;
    const uBob = `aud_bob_${ts}`;
    const uCharlie = `aud_charlie_${ts}`;

    const rAlice = await request("POST", "/api/auth/register", {
      username: uAlice,
      email: `${uAlice}@testbook.dev`,
      password: "Password123!",
    });
    const aliceToken = rAlice.body.data?.accessToken;
    assert(rAlice.status === 201 && !!aliceToken, "Owner user (Alice) registered");

    const rBob = await request("POST", "/api/auth/register", {
      username: uBob,
      email: `${uBob}@testbook.dev`,
      password: "Password123!",
    });
    const bobToken = rBob.body.data?.accessToken;
    assert(rBob.status === 201 && !!bobToken, "Contributor user (Bob) registered");

    const rCharlie = await request("POST", "/api/auth/register", {
      username: uCharlie,
      email: `${uCharlie}@testbook.dev`,
      password: "Password123!",
    });
    const charlieToken = rCharlie.body.data?.accessToken;
    assert(rCharlie.status === 201 && !!charlieToken, "Viewer user (Charlie) registered");

    // ----------------------------------------------------
    // SECTION 2: ACCESS CONTROL & PRIVATE REPOSITORY
    // ----------------------------------------------------
    console.log("\n[2. SECURITY AUDIT — RBAC & PRIVATE REPO RESTRICTIONS]");

    const repoRes = await request("POST", "/api/repos", {
      name: `audit-repo-${ts}`,
      description: "Confidential private repository",
      visibility: "PRIVATE",
    }, aliceToken);
    const repoId = repoRes.body.data?.id;
    assert(repoRes.status === 201 && !!repoId, "Private repository created by Alice");

    // Charlie is an outsider (not a member) -> attempts to read private repo
    const charlieRead = await request("GET", `/api/repos/${repoId}`, null, charlieToken);
    assert(charlieRead.status === 400 || charlieRead.status === 403 || charlieRead.status === 404, "Outsider cannot read private repo metadata");

    const charlieFiles = await request("GET", `/api/repos/${repoId}/files`, null, charlieToken);
    assert(charlieFiles.status === 400 || charlieFiles.status === 401 || charlieFiles.status === 403, "Outsider cannot view private repo files");

    const charlieActivities = await request("GET", `/api/repos/${repoId}/activities`, null, charlieToken);
    assert(charlieActivities.status === 400 || charlieActivities.status === 401 || charlieActivities.status === 403, "Outsider cannot view private repo activities");

    // Add Bob as CONTRIBUTOR
    const addBob = await request("POST", `/api/repos/${repoId}/members`, {
      username: uBob,
      role: "CONTRIBUTOR",
    }, aliceToken);
    assert(addBob.status === 200 && addBob.body.data?.role === "CONTRIBUTOR", "Bob added as CONTRIBUTOR");

    // Add Charlie as VIEWER
    const addCharlie = await request("POST", `/api/repos/${repoId}/members`, {
      username: uCharlie,
      role: "VIEWER",
    }, aliceToken);
    assert(addCharlie.status === 200 && addCharlie.body.data?.role === "VIEWER", "Charlie added as VIEWER");

    // Verify Bob (CONTRIBUTOR) cannot delete repo or update repo settings
    const bobDelete = await request("DELETE", `/api/repos/${repoId}`, null, bobToken);
    assert(bobDelete.status === 400 || bobDelete.status === 403, "CONTRIBUTOR cannot delete repository");

    const bobSettings = await request("PUT", `/api/repos/${repoId}`, { name: "hacked-name" }, bobToken);
    assert(bobSettings.status === 400 || bobSettings.status === 403, "CONTRIBUTOR cannot update repository settings");

    // Verify Charlie (VIEWER) cannot write files or create branches
    const charlieWrite = await request("POST", `/api/repos/${repoId}/files`, {
      branch: "main",
      path: "hack.txt",
      content: "unauthorized content",
    }, charlieToken);
    assert(charlieWrite.status === 400 || charlieWrite.status === 403, "VIEWER cannot write files");

    const charlieBranch = await request("POST", `/api/repos/${repoId}/branches`, {
      name: "viewer-branch",
    }, charlieToken);
    assert(charlieBranch.status === 400 || charlieBranch.status === 403, "VIEWER cannot create branches");

    // ----------------------------------------------------
    // SECTION 3: VCS RELIABILITY & CONFLICT DETECTION
    // ----------------------------------------------------
    console.log("\n[3. VCS RELIABILITY — BRANCHING, SIMULTANEOUS EDITS & CONFLICTS]");

    // 1. Initial file on main
    const initFile = await request("POST", `/api/repos/${repoId}/files`, {
      branch: "main",
      path: "config.json",
      content: '{\n  "version": "1.0.0",\n  "theme": "light"\n}',
      commitMessage: "chore: init config.json",
    }, aliceToken);
    assert(initFile.status === 200, "Initial file created on 'main'");

    // 2. Branch creation and file inheritance
    const br1 = await request("POST", `/api/repos/${repoId}/branches`, {
      name: "feature/theme",
      sourceBranch: "main",
    }, aliceToken);
    assert(br1.status === 201, "Branch 'feature/theme' created from 'main'");

    // Verify file exists on the new branch
    const brFile = await request("GET", `/api/repos/${repoId}/files/content?branch=feature/theme&path=config.json`, null, aliceToken);
    assert(brFile.status === 200 && brFile.body.data?.content.includes("1.0.0"), "Feature branch inherits file content from main");

    // 3. Prevent deleting default branch 'main'
    const delMain = await request("DELETE", `/api/repos/${repoId}/branches/main`, null, aliceToken);
    assert(delMain.status === 400, "Deletion of default branch 'main' is prohibited");

    // 4. Simultaneous conflicting edits test:
    // Alice edits config.json on main
    await request("POST", `/api/repos/${repoId}/files`, {
      branch: "main",
      path: "config.json",
      content: '{\n  "version": "2.0.0-alice",\n  "theme": "alice-dark"\n}',
      commitMessage: "feat: update config to alice version",
    }, aliceToken);

    // Bob edits config.json on feature/theme with conflicting content
    await request("POST", `/api/repos/${repoId}/files`, {
      branch: "feature/theme",
      path: "config.json",
      content: '{\n  "version": "3.0.0-bob",\n  "theme": "bob-matrix"\n}',
      commitMessage: "feat: update config to bob version",
    }, bobToken);

    // 5. Create Pull Request (feature/theme -> main)
    const prRes = await request("POST", `/api/repos/${repoId}/pulls`, {
      title: "Update config.json theme",
      description: "Conflicting theme change",
      sourceBranch: "feature/theme",
      targetBranch: "main",
    }, bobToken);
    const prNum = prRes.body.data?.number;
    assert(prRes.status === 201 && !!prNum, "Pull request created with conflicting changes");

    // 6. Inspect PR details: verify diffs and conflict detection
    const prDetails = await request("GET", `/api/repos/${repoId}/pulls/${prNum}`, null, aliceToken);
    assert(prDetails.body.data?.hasConflicts === true, "Pull request correctly detects merge conflict");
    assert(prDetails.body.data?.diffs.length > 0, "Pull request provides unified diff chunks");
    assert(prDetails.body.data?.commits.length > 0, "Pull request provides branch commits");

    // 7. Verify merge is blocked when conflict exists!
    const mergeAttempt = await request("POST", `/api/repos/${repoId}/pulls/${prNum}/merge`, null, aliceToken);
    assert(mergeAttempt.status === 400 && mergeAttempt.body.message.includes("conflict"), "Merge operation safely blocked when merge conflict is detected");

    // 8. Non-conflicting clean branch test:
    const brClean = await request("POST", `/api/repos/${repoId}/branches`, {
      name: "feature/docs",
      sourceBranch: "main",
    }, aliceToken);
    assert(brClean.status === 201, "Clean branch 'feature/docs' created");

    await request("POST", `/api/repos/${repoId}/files`, {
      branch: "feature/docs",
      path: "CONTRIBUTING.md",
      content: "# Contributing Guide\n\nPlease follow clean git workflow.",
      commitMessage: "docs: add CONTRIBUTING.md",
    }, bobToken);

    const prClean = await request("POST", `/api/repos/${repoId}/pulls`, {
      title: "docs: add contributing guide",
      description: "Clean new file PR",
      sourceBranch: "feature/docs",
      targetBranch: "main",
    }, bobToken);
    const prCleanNum = prClean.body.data?.number;

    const prCleanDetails = await request("GET", `/api/repos/${repoId}/pulls/${prCleanNum}`, null, aliceToken);
    assert(prCleanDetails.body.data?.hasConflicts === false, "Non-conflicting PR has hasConflicts=false");

    const mergeClean = await request("POST", `/api/repos/${repoId}/pulls/${prCleanNum}/merge`, null, aliceToken);
    assert(mergeClean.status === 200 && mergeClean.body.data?.status === "MERGED", "Clean PR merged successfully");

    // Verify CONTRIBUTING.md now exists on main
    const mergedDoc = await request("GET", `/api/repos/${repoId}/files/content?branch=main&path=CONTRIBUTING.md`, null, aliceToken);
    assert(mergedDoc.status === 200 && mergedDoc.body.data?.content.includes("Contributing Guide"), "Target branch has merged content without corruption");

    // ----------------------------------------------------
    // SECTION 4: COMMIT INTEGRITY & VERSION HISTORY
    // ----------------------------------------------------
    console.log("\n[4. COMMIT INTEGRITY & VERSION HISTORY]");

    const commitsMain = await request("GET", `/api/repos/${repoId}/commits?branch=main`, null, aliceToken);
    assert(commitsMain.status === 200 && commitsMain.body.data?.length >= 3, "Commit history on 'main' accurately records all branch commits");

    const latestCommitSha = commitsMain.body.data[0]?.id;
    const commitDetails = await request("GET", `/api/repos/${repoId}/commits/${latestCommitSha}`, null, aliceToken);
    assert(commitDetails.status === 200 && commitDetails.body.data?.id === latestCommitSha, "Commit SHA lookup returns complete commit details");

    // ----------------------------------------------------
    // SECTION 5: PROFILE & SETTINGS
    // ----------------------------------------------------
    console.log("\n[5. USER PROFILE & PASSWORD VERIFICATION]");

    const prof = await request("GET", "/api/users/profile", null, aliceToken);
    assert(prof.status === 200 && prof.body.data?.repositoriesCount >= 1, "User profile aggregates live repository counts");

    // Bad password update
    const badPass = await request("POST", "/api/users/password", {
      currentPassword: "WrongPassword!",
      newPassword: "NewPassword123!",
    }, aliceToken);
    assert(badPass.status === 400, "Password update rejects incorrect current password");

    // Valid password update
    const goodPass = await request("POST", "/api/users/password", {
      currentPassword: "Password123!",
      newPassword: "NewPassword123!",
    }, aliceToken);
    assert(goodPass.status === 200, "Password update succeeds with correct current password");

    console.log("\n=================================================");
    console.log(`AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("=================================================\n");

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("AUDIT CRASHED:", err);
    process.exitCode = 1;
  }
}

runAudit();
