#!/usr/bin/env node
/**
 * Release script: bumps the shared marketing version and kicks off a
 * production build + store submission for both platforms.
 *
 * iOS and Android stay in sync by construction — both read `expo.version`
 * from app.json (package.json is kept identical so tooling agrees). Build
 * numbers (ios.buildNumber / android.versionCode) are NOT touched here: EAS
 * remote versioning owns them (eas.json `appVersionSource: "remote"` +
 * production `autoIncrement: true`).
 *
 * `runtimeVersion.policy` is "appVersion", so every bump also starts a fresh
 * OTA runtime — updates published after this release only reach this release.
 *
 * Usage: yarn release [patch|minor|major]   (default: minor)
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const bumpType = process.argv[2] ?? 'minor';
if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error(`Unknown bump type "${bumpType}" — use patch, minor, or major.`);
  process.exit(1);
}

const appJsonPath = path.join(__dirname, '..', 'app.json');
const pkgPath = path.join(__dirname, '..', 'package.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// app.json is the source of truth (it's what EAS builds actually ship).
const current = appJson.expo.version;
const parts = current.split('.').map(Number);
if (parts.length !== 3 || parts.some(Number.isNaN)) {
  console.error(`app.json expo.version "${current}" is not semver (x.y.z).`);
  process.exit(1);
}
const [major, minor, patch] = parts;
const next =
  bumpType === 'major'
    ? `${major + 1}.0.0`
    : bumpType === 'minor'
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;

appJson.expo.version = next;
pkg.version = next;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Version bumped ${current} → ${next} (app.json + package.json, iOS + Android in sync)`);

const result = spawnSync(
  'npx',
  ['eas-cli', 'build', '--profile', 'production', '--platform', 'all', '--auto-submit'],
  { stdio: 'inherit', cwd: path.join(__dirname, '..') }
);
process.exit(result.status ?? 1);
