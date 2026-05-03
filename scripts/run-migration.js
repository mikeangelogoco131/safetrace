#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function parseEnvFile(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) return result;
  const contents = fs.readFileSync(filePath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    result[key] = val.replace(/^"|"$/g, '');
  }
  return result;
}

async function run() {
  const repoRoot = path.resolve(__dirname, '..');
  const envFile = path.join(repoRoot, '.env.migration');
  const exampleFile = path.join(repoRoot, '.env.migration.example');
  const env = parseEnvFile(envFile);

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-n');
  const migrationArg = args.find((arg) => !arg.startsWith('-'));

  const databaseUrl = process.env.MIGRATION_DATABASE_URL || env.MIGRATION_DATABASE_URL || env.DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl && !dryRun) {
    console.error('No database connection string found. Create `.env.migration` with `MIGRATION_DATABASE_URL=` or export MIGRATION_DATABASE_URL.');
    if (fs.existsSync(exampleFile)) console.error('See .env.migration.example for format.');
    process.exit(1);
  }

  const migrationPath = migrationArg
    ? path.resolve(repoRoot, migrationArg)
    : path.join(repoRoot, 'migrations', '2026-04-30-add-columns-and-rls.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error('Migration file not found at', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  if (dryRun) {
    console.log('--- DRY RUN: printing SQL from', migrationPath, '---\n');
    console.log(sql);
    console.log('\n--- END DRY RUN ---');
    process.exit(0);
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Running migration:', migrationPath);
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    try { await client.query('ROLLBACK'); } catch (e) {}
    process.exit(2);
  } finally {
    await client.end();
  }
}

run();
