/**
 * Auto-bumps the patch version in public/version.json and stamps build time.
 * Run as part of the build pipeline so every deploy gets a unique version.
 */
import fs from 'fs';
import path from 'path';

const versionFile = path.resolve(import.meta.dirname, '../public/version.json');
const data = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));

// Bump patch: 1.1.0 → 1.1.1
const parts = (data.version as string).split('.').map(Number);
parts[2] += 1;
data.version = parts.join('.');
data.buildTime = new Date().toISOString();

fs.writeFileSync(versionFile, JSON.stringify(data, null, 2) + '\n');
console.log(`[bump-version] → v${data.version}  (${data.buildTime})`);
