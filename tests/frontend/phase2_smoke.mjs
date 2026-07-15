import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
for (const [route, moduleName] of [
  ["rate", "CustomerRatePage"],
  ["amc", "CustomerAmcPage"],
  ["notifications", "CustomerNotificationsPage"],
  ["grievances", "AdminGrievancesPage"],
  ["marketing", "AdminMarketingPage"],
  ["analytics", "AdminAnalyticsPage"],
  ["notifications", "ProviderNotificationsPage"],
]) {
  assert.ok(
    app.includes(`path="${route}"`) && app.includes(moduleName),
    `Missing protected route module: ${moduleName}`,
  );
}

const runtimeFiles = globSync("src/**/*.{ts,tsx}");
const runtimeSource = runtimeFiles
  .filter((file) => !file.startsWith("src/data/"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
assert.equal(
  /@\/data\/(admin|customer|demo)/.test(runtimeSource),
  false,
  "Runtime still imports demo data",
);
assert.equal(
  /createServerFn|@tanstack\/react-start/.test(runtimeSource),
  false,
  "TanStack Start code returned",
);

for (const migration of [
  "SQL Schema/phase_5_platform_modules.sql",
  "SQL Schema/phase_6_platform_rpcs_and_automation.sql",
]) {
  const sql = readFileSync(migration, "utf8");
  assert.equal(/service_role/i.test(sql), false, `${migration} contains service-role material`);
}
assert.ok(
  readFileSync("SQL Schema/phase_5_platform_modules.sql", "utf8").includes(
    "ENABLE ROW LEVEL SECURITY",
  ),
  "Phase 2 tables do not enable RLS",
);

console.log(
  `PASS: ${runtimeFiles.length} runtime files and Phase 2 routes passed static smoke checks.`,
);
