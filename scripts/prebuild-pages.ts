/**
 * Pre-render server HTML pages to static files for GitHub Pages.
 * Reads each getXxxHTML() function and writes the output to public/api/*.html
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '..', 'public');

// Import all page generators
import { getPreReadHTML } from '../server/pages/pre-read.ts';
import { getTechnicalNotesHTML } from '../server/pages/technical-notes.ts';
import { getVibeCodingNotesHTML } from '../server/pages/vibe-coding-notes.ts';
import { getGameMasterGuideHTML } from '../server/pages/game-master-guide.ts';
import { getRecommendedImprovementsHTML } from '../server/pages/recommended-improvements.ts';
import { getGameplaySummaryHTML } from '../server/pages/gameplay-summary.ts';
import { getCinematicTrailerHTML } from '../server/pages/cinematic-trailer.ts';
import { getEducationalCompendiumHTML } from '../server/pages/educational-compendium.ts';
import { getEnhancementConceptsHTML } from '../server/pages/enhancement-concepts.ts';
import { getTransmissionEducationHTML } from '../server/pages/transmission-education.ts';
import { getLearnNemHTML } from '../server/pages/learn-nem.ts';

// Use directory/index.html so /api/pre-read resolves without .html extension
const pages: Array<{ path: string; html: string }> = [
  { path: 'api/pre-read/index.html', html: getPreReadHTML() },
  { path: 'api/game-master-guide/index.html', html: getGameMasterGuideHTML() },
  { path: 'api/gameplay-summary/index.html', html: getGameplaySummaryHTML() },
  { path: 'api/educational-compendium/index.html', html: getEducationalCompendiumHTML() },
  { path: 'api/enhancement-concepts/index.html', html: getEnhancementConceptsHTML() },
  { path: 'api/transmission-education/index.html', html: getTransmissionEducationHTML() },
  { path: 'api/learn-nem/index.html', html: getLearnNemHTML() },
  { path: 'api/trailer/index.html', html: getCinematicTrailerHTML() },
  { path: 'api/recommended-improvements/index.html', html: getRecommendedImprovementsHTML() },
  { path: 'api/notes/technical/index.html', html: getTechnicalNotesHTML() },
  { path: 'api/notes/vibe-coding/index.html', html: getVibeCodingNotesHTML() },
];

// Mobile-friendly CSS injected before </head> to prevent horizontal overflow
const mobileFixCSS = `<style>
  html { overflow-x: hidden; }
  body { overflow-x: hidden; max-width: 100vw; }
  table { display: block; overflow-x: auto; max-width: 100%; }
  pre, .staircase { overflow-x: auto; max-width: 100%; }
  img { max-width: 100%; height: auto; }
</style>`;

for (const page of pages) {
  const outPath = resolve(PUBLIC, page.path);
  mkdirSync(dirname(outPath), { recursive: true });
  // Inject mobile fix CSS before </head>
  const html = page.html.replace('</head>', mobileFixCSS + '\n</head>');
  writeFileSync(outPath, html, 'utf-8');
  console.log(`  [pages] ${page.path} (${(html.length / 1024).toFixed(1)} KB)`);
}

console.log(`[prebuild-pages] Generated ${pages.length} static HTML pages.`);
