Presign Flow Test
-----------------

This script simulates the admin flow: create signed upload URL -> upload file -> process variants (webp, thumb).

Requirements:
- Node.js 18+
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optionally `SUPABASE_CMS_BUCKET`.

Run:
```
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/presign_flow_test.js /path/to/file.jpg
```

The script prints timings, sizes and resulting public URLs.
