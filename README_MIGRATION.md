Migration instructions — SafeTrace

This repository includes a migration SQL file at:

  migrations/2026-04-30-add-columns-and-rls.sql

Use one of the following approaches to apply it to your hosted Supabase project.

1) Quick: Paste into Supabase SQL editor (UI)
- Open your Supabase project -> SQL -> New Query
- Paste the full contents of the migration file and run it.
- Verify tables/columns/policies in the Table Editor.

2) Using psql (recommended when you have a DB connection string)
- Get your DB connection string from Supabase: Settings -> Database -> Connection string.
- Use the `psql` command (example):

```powershell
# Windows PowerShell example
$PG = "postgresql://postgres:<DB_PASSWORD>@db.<project_ref>.supabase.co:5432/postgres"
psql $PG -f migrations/2026-04-30-add-columns-and-rls.sql
```

Replace `<DB_PASSWORD>` and the host with your actual connection string. Running as the DB owner (the provided connection string) is required to enable RLS and create triggers.

3) Using the Supabase CLI (migrations flow)
- If you use the Supabase CLI with a migrations folder, you can copy this SQL into your project's migrations and run `supabase db push` or `supabase db reset` depending on your workflow. See Supabase docs for details.

Important notes and post-migration steps
- Backup your production database before running migrations.
- Ensure `Auth -> Settings` in your Supabase project has Email + Password provider enabled if you plan to use email/password signups.
- Add the app redirect URL(s) under `Auth -> Settings -> Redirect URLs` (e.g., `https://your-production-domain/auth/callback`).
- After migration, run the app with your production env vars set and verify that creating contacts, updating profile, and triggering an alert create rows in the new tables.
- Use a service role key only when necessary (server migrations); do NOT embed the service role key in client code or commit it to source control.

If you'd like, I can:
- Generate a one-click script that runs the SQL via `psql` after you paste a DB connection string into a local `.env.migration` file.
- Add a Supabase CLI `migrations/` layout for `supabase db push` automation.
 
One-click migration script
- Copy `.env.migration.example` to `.env.migration` and set `MIGRATION_DATABASE_URL` to your DB connection string.
- Run the helper script locally:

```powershell
npm run migrate:run
```

By default the script runs `migrations/2026-04-30-add-columns-and-rls.sql`. You can pass a different path:

```powershell
node scripts/run-migration.js migrations/2026-04-30-add-columns-and-rls.sql
```

The runner uses a PG transaction and will `ROLLBACK` if an error occurs. Do not commit or share `.env.migration`.
