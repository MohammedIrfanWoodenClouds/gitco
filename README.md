# GITCO Temporary Reporting Application

A temporary reporting portal for the three supplied GITCO Excel/report workflows.

## UI rule

The three supplied HTML dashboards are used directly as the report UI source of truth. The application does not redesign or approximate them.

- Plant Hire & Sales → `public/reports/plant-hire.html`
- Fleet Dashboard → `public/reports/fleet.html`
- Auto Services → `public/reports/auto-services.html`

## Accounts

Exactly three server-side credentials are supported through `.env`:

- Admin → upload/publish Excel workbooks
- Management 1 → reports only
- Management 2 → reports only

## Supabase

Fill these values in `.env`:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Run `supabase.sql` in the Supabase SQL editor. It creates the report version table and storage bucket/policies needed by the admin upload flow.

## Authentication

Set a strong `AUTH_SECRET` and the three account passwords in `.env`.

## Run

```bash
npm install
npm run build
npm start
```

Development:

```bash
npm run dev
```

## Important

The supplied HTML dashboards contain their own report-specific display/calculation logic and embedded report data. The current package preserves those dashboards exactly. The admin upload layer validates and versions the original Excel workbooks in Supabase; wiring new workbook rows into each dashboard's embedded data model is intentionally kept as a separate report-specific pipeline task rather than silently changing business logic.
