# Sabores de Chile — product and release plan

## Product direction
A restaurant operating system plus a customer discovery marketplace. Each restaurant has its own branded storefront/PWA and tenant-isolated administration; the central marketplace helps diners discover venues and order. The current live web build is an initial visual demo, not yet a production ordering or management system.

## Core modules
1. Restaurant onboarding, branding, locations, opening hours and tenant membership.
2. Customer menu: categories, search, allergens, photos, 3D model URL (.glb/.gltf), QR table entry and cart.
3. Orders: QR, staff and counter channels; one order stream; kitchen states; cancellation reasons and audit trail.
4. Table service: table map, QR token, occupancy and open checks.
5. Cash register: opening float, payments, expenses, withdrawals, expected-vs-counted closing and variance review.
6. Inventory: ingredients, supplier lots, units, minimum stock, recipes, consumption, waste and adjustments.
7. Freshness intelligence: lot expiry, ripeness and freshness score; configurable warnings; promotion suggestions for overripe produce or stock approaching expiry.
8. Promotions: manual approval by a manager, scheduled discounts, campaign history and redemption tracking.
9. Staff roles: owner, manager, cashier, waiter, kitchen and inventory.
10. Central marketplace, customer consent/preferences, loyalty and opt-in location-aware offers.
11. Reporting: sales by item/channel/shift, food cost, waste, stock valuation and cash variance.
12. 3D/AR: first support owner-uploaded optimized GLB/GLTF assets; AR availability depends on device/browser. Do not claim automatic photo-to-3D generation exists until implemented and tested.

## Technical shape
- Frontend: React + Vite, mobile-first PWA, hosted on Vercel.
- Data/Auth: Supabase Auth + PostgreSQL + Row Level Security; tenant ID is required on tenant-owned rows.
- Trusted operations: Supabase Edge Functions (or a secured API) for anonymous QR checkout, price validation, order creation, inventory consumption, cash close and notification dispatch.
- Realtime: Supabase Realtime for order status and kitchen queue.
- Storage: Supabase Storage for restaurant images and 3D assets; validate MIME type and file size.
- Payments: integrate a Chile-supported provider only after merchant credentials and webhook verification are configured. Never mark an order paid from a browser callback alone.
- Notifications: opt-in push/email; proximity offers must be consent-based and respect platform permissions.

## Delivery loop
For each iteration:
1. Inspect repository and current production deployment.
2. Implement one cohesive vertical slice with clear tenant boundaries.
3. Add migration and RLS policy changes before wiring UI.
4. Add validation, error and loading states; do not fake server success.
5. Run build/tests where execution tools permit; record unverified checks honestly.
6. Deploy to the existing Vercel project.
7. Inspect deployment state/logs and verify route availability.
8. Update this plan with completed, blocked and next tasks.

## Acceptance gates for a real pilot
- A user from restaurant A cannot read or mutate restaurant B's data, including through direct API calls.
- QR order prices are recalculated server-side and cannot be altered by the client.
- Order status transitions are validated and auditable.
- Cash close records opening amount, expected cash, counted cash and variance.
- Inventory is lot-aware; selling a recipe consumes ingredients consistently and leaves an auditable stock movement.
- Expiry/ripeness promotions are suggestions with manager approval, never silently discount products.
- Secrets are stored in platform environment variables; no service-role key reaches browser code.
- Payment webhook signatures are verified and webhook handling is idempotent.
- Automated tests cover tenant isolation, price integrity, stock bounds, order lifecycle and cash reconciliation.

## Current status
- [x] Initial React/Vite storefront and demo cart in GitHub.
- [x] Restaurant operations dashboard at /admin (local demonstration state only).
- [x] Responsive admin views for orders, kitchen, menu, stock, cash, team, promotions, 3D and settings.
- [x] GitHub Actions build quality gate and documented specialist-agent hand-off protocol.
- [x] Initial production deployment reached Vercel READY.
- [x] Core multi-tenant schema draft and RLS policies added in repository.
- [ ] SQL migration executed against a real Supabase project.
- [ ] Supabase project and environment variables connected.
- [ ] Real auth, orders, inventory, cash and kitchen workflows.
- [ ] End-to-end tests and production verification.
- [ ] 3D assets, AR compatibility checks, payments, push notifications and marketplace.
