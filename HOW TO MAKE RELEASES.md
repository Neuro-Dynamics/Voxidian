1. **Bump version in `manifest.json` and `package.json`**

2. **npm run build** to produce updated `main.js` (and `styles.css` if applicable).

3. **Commit & push your changes** as usual from VS Code.
   • Make sure the repo contains whatever you want the tag to point to (e.g., your code after bumping `manifest.json`’s version).

4. **Draft the Release on GitHub**
   • Go to **Releases → Draft a new release**.
   • **Create a tag with the new version**. If you create it here, GitHub will tag the commit you select (by default, the latest on your default branch).
   • **Title** the release with the same version (e.g., `0.1.0`).

5. **Upload the plugin assets**
   • Attach `main.js`, `manifest.json`, and `styles.css` (and `versions.json` if you use it).
   • **Publish** the release.

From that point, BRAT (and later, the Community directory) will pull those exact files from your release assets.

# Two important caveats

1. **The tag still needs a commit to point at.**
   Creating the tag in the GitHub UI is fine, but make sure you’ve already pushed the commit that represents the code you’re releasing. Otherwise, the tag might land on an older commit.

2. **Keep versions aligned.**
   For Obsidian tooling. it’s best if all three match:

* The **release tag**: `0.1.0`
* The **`manifest.json` version** (inside the asset you upload): `0.1.0`
* The **release title**: `0.1.0`
* The **`package.json` version**: `0.1.0`

  If your repo’s copy of `manifest.json` lags behind, it won’t break installs, because Obsidian reads the file from the release asset. But keeping the repo’s `manifest.json` in sync helps future you.


--- FUTURE AUTOMATION ---

# Workflow A. Keep doing it manually. with one small tweak

* Edit `manifest.json` and `package.json` to the same `X.Y.Z`.
* Run `npm install` if you changed dependencies. This updates `package-lock.json` for you.
* Build → commit → tag → release → upload assets.
* **Do not edit `package-lock.json` by hand.** It’s generated.

This is fine if you release rarely.

---

# Workflow B. One-command bumps that keep everything aligned

Use `npm version`. It:

* Updates `package.json` (and `package-lock.json`).
* Makes a commit and a tag for you.
* Triggers the `"version"` npm lifecycle script. Perfect moment to sync `manifest.json` and build.

## 1) Add a tiny sync script

**`scripts/sync-manifest.mjs`**

```js
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
const manPath = "manifest.json";
const man = JSON.parse(fs.readFileSync(manPath,"utf8"));
man.version = pkg.version;                 // keep manifest in lockstep with package.json
fs.writeFileSync(manPath, JSON.stringify(man, null, 2) + "\n");
console.log(`synced manifest.json → ${pkg.version}`);
```

## 2) Wire it into npm’s version lifecycle

**`package.json`**

```json
{
  "scripts": {
    "build": "esbuild main.ts --bundle --platform=browser --format=cjs --target=es2019 --external:obsidian --outfile=main.js",
    "version": "node scripts/sync-manifest.mjs && npm run build && git add manifest.json main.js"
  }
}
```

* When you run `npm version 0.1.3` (or `npm version patch`), npm will:

  1. bump `package.json` and `package-lock.json`,
  2. run the `"version"` script above, which syncs **manifest.json**, builds **main.js**, and stages those files,
  3. create a commit and tag `0.1.3` automatically including the staged files.

Now your repo, tag, **manifest.json**, and **main.js** are in lockstep without extra steps.

## 3) Push and publish the release

```bash
git push && git push --tags
# then draft the GitHub Release for tag 0.1.3 and upload main.js + manifest.json (+ styles.css)
```

If you add a small GitHub Action later, it can upload those assets automatically so you don’t even click “Upload.”

---

# FAQ & gotchas

* **Do I need `package-lock.json` in the repo?**
  It’s optional for a plugin, but keeping it committed gives reproducible builds. Don’t edit it manually.

* **What if I already tagged before building?**
  Retag after rebuilding: `git tag -d X.Y.Z && git push --delete origin X.Y.Z && git tag -a X.Y.Z -m X.Y.Z && git push --tags`. Using Workflow B avoids this.

* **What if `manifest.json` in the repo doesn’t match the one I upload in the release?**
  Obsidian/BRAT read the file you upload to the **release**, so installs still work. But keeping the repo in sync avoids confusion later.

---

If you want, I can also drop a minimal GitHub Actions file that. on any tag like `*.*.*`. builds with esbuild and attaches `main.js` + `manifest.json` to the release automatically.
