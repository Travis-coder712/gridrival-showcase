/**
 * Pre-generate Battery Forecast challenge data as static JSON files.
 * Creates index, player-safe, and full challenge files for static serving.
 */
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHALLENGES_DIR = resolve(__dirname, '..', 'server', 'data', 'challenges');
const OUT_DIR = resolve(__dirname, '..', 'public', 'api', 'battery-forecast', 'challenges');

interface BatteryForecastChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  battery: {
    duid: string;
    name: string;
    region: string;
    maxMW: number;
    maxStorageMWh: number;
    roundTripEfficiency: number;
  };
  metadata: Record<string, unknown>;
  initialSOCPercent: number;
  intervals: Array<{
    timestamp: string;
    hour: number;
    predispatchPrice: number;
    actualPrice: number;
  }>;
  batteryActual: Array<{
    hour: number;
    mwOutput: number;
  }>;
}

interface ChallengeSummary {
  id: string;
  date: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  battery: { duid: string; name: string; region: string };
  metadata: Record<string, unknown>;
}

const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(CHALLENGES_DIR).filter(f => f.endsWith('.json'));
const summaries: ChallengeSummary[] = [];

for (const file of files) {
  const raw = readFileSync(resolve(CHALLENGES_DIR, file), 'utf-8');
  const challenge: BatteryForecastChallenge = JSON.parse(raw);

  if (!challenge.id || !challenge.intervals || challenge.intervals.length !== 24) {
    console.warn(`  [skip] ${file} — invalid`);
    continue;
  }

  // Summary for index
  summaries.push({
    id: challenge.id,
    date: challenge.date,
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    tags: challenge.tags,
    battery: {
      duid: challenge.battery.duid,
      name: challenge.battery.name,
      region: challenge.battery.region,
    },
    metadata: challenge.metadata,
  });

  // Player-safe version (no actuals)
  const playerChallenge = {
    ...challenge,
    intervals: challenge.intervals.map(i => ({
      timestamp: i.timestamp,
      hour: i.hour,
      predispatchPrice: i.predispatchPrice,
    })),
    batteryActual: undefined,
  };
  delete (playerChallenge as Record<string, unknown>).batteryActual;

  writeFileSync(
    resolve(OUT_DIR, `${challenge.id}.json`),
    JSON.stringify(playerChallenge),
    'utf-8',
  );

  // Full version (with actuals)
  writeFileSync(
    resolve(OUT_DIR, `${challenge.id}-full.json`),
    JSON.stringify(challenge),
    'utf-8',
  );

  console.log(`  [challenge] ${challenge.id}`);
}

// Sort by difficulty, then date
summaries.sort((a, b) => {
  const d = (DIFFICULTY_ORDER[a.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.difficulty] ?? 1);
  if (d !== 0) return d;
  return a.date.localeCompare(b.date);
});

writeFileSync(
  resolve(OUT_DIR, 'index.json'),
  JSON.stringify(summaries),
  'utf-8',
);

console.log(`[prebuild-challenges] Generated ${summaries.length} challenges + index.`);
