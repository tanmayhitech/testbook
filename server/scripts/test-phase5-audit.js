import http from "http";
import app from "../dist/app.js";
import {
  writeStorageFile,
  readStorageFile,
  deleteStorageFile,
} from "../dist/utils/storage.js";

const PORT = 5098;
let server;

function request(method, path, body = null, token = null, headersOverride = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      "Content-Type": "application/json",
      ...headersOverride,
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
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: parsed,
            });
          } catch (err) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              text: resBody,
            });
          }
        });
      }
    );

    req.on("error", reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

const runTests = async () => {
  console.log("=================================================");
  console.log("   TESTBOOK PHASE 5 QUALITY & VCS AUDIT SUITE    ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(desc, condition, details = "") {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc} - ${details}`);
      failed++;
    }
  }

  // 1. Rate Limiting Tests
  console.log("\n--- SECTION 1: AUTH RATE LIMITING ---");
  const testIp = "198.51.100." + Math.floor(Math.random() * 200 + 10);
  let got429 = false;
  let retryAfterHeader = null;

  for (let i = 1; i <= 22; i++) {
    const res = await request(
      "POST",
      "/api/auth/login",
      { username: "unknown_rate_user", password: "wrong_password" },
      null,
      { "x-forwarded-for": testIp }
    );

    if (i <= 20) {
      if (res.status === 429) {
        assert(`Request #${i} should not be rate-limited prematurely`, false, `Got 429 on request #${i}`);
      }
    } else {
      if (res.status === 429) {
        got429 = true;
        retryAfterHeader = res.headers["retry-after"];
      }
    }
  }

  assert("Strict limiter activates after 20 attempts with HTTP 429", got429);
  assert("HTTP 429 response includes Retry-After header", Boolean(retryAfterHeader));

  // 2. Setup user and repo for VCS tests
  console.log("\n--- SECTION 2: VCS BRANCH DELETION GUARD ---");
  const rand = Date.now();
  const regRes = await request("POST", "/api/auth/register", {
    username: `vcs_audit_${rand}`,
    email: `vcs_${rand}@testbook.edu`,
    password: "Password123!",
  });

  assert("Test user registered", regRes.status === 201 && Boolean(regRes.body.data?.accessToken));
  const token = regRes.body.data?.accessToken;

  const repoRes = await request(
    "POST",
    "/api/repos",
    {
      name: `vcs-guard-${rand}`,
      description: "Testing Phase 5 VCS protections",
      visibility: "PUBLIC",
    },
    token
  );
  assert("Test repository created", repoRes.status === 201);
  const repoId = repoRes.body.data.id;

  // Create branch 'guard-check'
  const branchRes = await request(
    "POST",
    `/api/repos/${repoId}/branches`,
    { name: "guard-check", sourceBranch: "main" },
    token
  );
  assert("Feature branch created", branchRes.status === 201);

  // Add a file to feature branch
  const fileRes = await request(
    "POST",
    `/api/repos/${repoId}/files`,
    {
      branch: "guard-check",
      path: "src/calculator.ts",
      content: "export const add = (a: number, b: number) => a + b;\n",
      commitMessage: "feat: add calculator function",
    },
    token
  );
  assert("File committed to feature branch", fileRes.status === 200);

  // Open Pull Request from 'guard-check' to 'main'
  const prRes = await request(
    "POST",
    `/api/repos/${repoId}/pulls`,
    {
      title: "Add calculator utility",
      description: "PR to verify branch deletion guards",
      sourceBranch: "guard-check",
      targetBranch: "main",
    },
    token
  );
  assert("Pull request created with OPEN status", prRes.status === 201);
  const prNumber = prRes.body.data.number;

  // ATTEMPT TO DELETE BRANCH WHILE PR IS OPEN
  const deleteAttemptRes = await request(
    "DELETE",
    `/api/repos/${repoId}/branches/${encodeURIComponent("guard-check")}`,
    null,
    token
  );
  assert(
    "Branch deletion rejected when active open PR exists (HTTP 400)",
    deleteAttemptRes.status === 400,
    `Status was ${deleteAttemptRes.status}`
  );
  assert(
    "Rejection message explicitly cites active pull request",
    Boolean(deleteAttemptRes.body.message && deleteAttemptRes.body.message.includes("active pull request")),
    deleteAttemptRes.body.message
  );

  // Close the PR
  const closePrRes = await request(
    "POST",
    `/api/repos/${repoId}/pulls/${prNumber}/close`,
    null,
    token
  );
  assert("Pull request closed", closePrRes.status === 200);

  // Now delete the branch
  const deleteAfterCloseRes = await request(
    "DELETE",
    `/api/repos/${repoId}/branches/${encodeURIComponent("guard-check")}`,
    null,
    token
  );
  assert(
    "Branch deletion succeeds after PR is closed (HTTP 200)",
    deleteAfterCloseRes.status === 200,
    deleteAfterCloseRes.body.message
  );

  // 3. Language Statistics Endpoint
  console.log("\n--- SECTION 3: LANGUAGE STATISTICS CALCULATION ---");
  // Add another file in CSS to main
  await request(
    "POST",
    `/api/repos/${repoId}/files`,
    {
      branch: "main",
      path: "styles/theme.css",
      content: "body { background: #0c0d0e; color: #f2f3f5; }\n",
      commitMessage: "style: add dark theme styles",
    },
    token
  );

  const langRes = await request("GET", `/api/repos/${repoId}/languages`, null, token);
  assert("GET /api/repos/:id/languages returns HTTP 200", langRes.status === 200);
  assert("Languages list returned as array", Array.isArray(langRes.body.data));

  const languages = langRes.body.data || [];
  const hasCssOrTs = languages.some((l) => l.name === "CSS" || l.name === "TypeScript");
  assert("Identifies language extensions accurately (e.g. CSS, TypeScript)", hasCssOrTs);
  assert("Language statistics include color hex code", Boolean(languages[0]?.color));
  assert("Language statistics include byte counts and percentages", typeof languages[0]?.percentage === "number");

  // 4. Pluggable Storage & Traversal Prevention
  console.log("\n--- SECTION 4: STORAGE ADAPTER & SECURITY ---");
  const testRepoId = `storage-test-${rand}`;
  const testFile = "src/modules/sample.ts";
  const testContent = "console.log('Testbook Storage Provider OK');";

  // Write and Read via storage provider
  await writeStorageFile(testRepoId, "main", testFile, testContent);
  const readBack = await readStorageFile(testRepoId, "main", testFile);
  assert("StorageProvider writes and reads files successfully", readBack === testContent);

  // Delete via storage provider
  const delOk = await deleteStorageFile(testRepoId, "main", testFile);
  assert("StorageProvider deletes file cleanly", delOk === true);

  // Path Traversal Security Test
  let traversalCaught = false;
  try {
    await writeStorageFile(testRepoId, "main", "../../etc/passwd", "malicious payload");
  } catch (err) {
    if (err.message && err.message.includes("Path traversal attempt detected")) {
      traversalCaught = true;
    }
  }
  assert("Path traversal attacks (../../) are strictly intercepted and blocked", traversalCaught);

  console.log("\n=================================================");
  console.log(`PHASE 5 AUDIT FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  server.close();
  process.exit(failed > 0 ? 1 : 0);
};

server = app.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error("Test execution error:", err);
    server.close();
    process.exit(1);
  }
});
