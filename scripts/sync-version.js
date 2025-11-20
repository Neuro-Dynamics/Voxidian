const fs = require("fs");
const path = require("path");

const cliVersion = process.argv[2];
const pkgPath = path.join(process.cwd(), "package.json");
let version = cliVersion;

if (!version) {
  if (!fs.existsSync(pkgPath)) {
    console.error("package.json not found and no version provided.");
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  version = pkg.version;
}

if (!version) {
  console.error("Usage: node scripts/sync-version.js <version>");
  process.exit(1);
}

const targets = ["manifest.json", "package.json", "package-lock.json"];

for (const file of targets) {
  const fullPath = path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    continue;
  }

  const content = fs.readFileSync(fullPath, "utf8");
  const json = JSON.parse(content);

  json.version = version;

  if (file === "package-lock.json" && json.packages && json.packages[""]) {
    json.packages[""].version = version;
  }

  fs.writeFileSync(fullPath, JSON.stringify(json, null, 2) + "\n");
  console.log(`updated ${file} -> ${version}`);
}
