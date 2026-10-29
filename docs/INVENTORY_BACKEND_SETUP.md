# Inventory backend rollout

The inventory screen currently runs in browser-demo mode and stores its demo edits in that browser only. It does not represent shared or operational restaurant data.

## Prepared code

- `src/lib/supabase.js` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `src/lib/inventory.js` contains the first data-access helpers for authentication, restaurant onboarding, inventory items, movement history and promotion drafts.
- `.env.example` documents the two browser-safe variables.

## Required before enabling database mode

1. Create/select the Supabase project and configure the two Vercel variables for Preview first. Never place a service-role key in a browser variable.
2. Apply a reviewed SQL migration that creates `restaurants`, `restaurant_members`, `inventory_items`, `inventory_movements` and `promotion_drafts`.
3. Enable row-level security on all tenant tables. Policies must restrict reads and writes to the authenticated user's restaurant membership; inventory movement inserts must record the authenticated actor.
4. Test two separate users/restaurants to prove tenant isolation before connecting the UI.
5. Verify email confirmation and password recovery settings before inviting restaurant owners.

## Important status

The Supabase project URL/key are not configured in Vercel at this time, and the SQL migration has not been applied. The data-access helper is groundwork only and is not yet wired into the inventory screen. Do not claim cloud persistence until the migration, credentials, tenant-isolation tests and live smoke test pass.
