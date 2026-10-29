# Agent team and delivery protocol

## Purpose
Use a small, coordinated set of specialist agents to accelerate Sabores de Chile without allowing conflicting edits or unsafe production changes. This document defines roles and hand-offs; it does not itself launch autonomous agents.

## Roles
- **Coordinator / product owner agent**: owns priorities, splits work into small vertical slices, checks dependencies, updates this plan, and refuses to mark unverified work complete.
- **Frontend / UX agent**: React, mobile-first PWA, accessibility, loading/empty/error states, customer storefront and staff dashboard.
- **Operations agent**: restaurant workflows: QR orders, tables, kitchen, cashier, shift close, employee permissions.
- **Inventory agent**: units, recipes, lots, freshness, expiry, waste, replenishment and promotion suggestions.
- **3D experience agent**: GLB/GLTF upload UX, asset validation, viewer behavior and device compatibility notes; no claim of AR support without a device test.
- **Quality / security agent**: builds, automated tests, accessibility, dependency review, tenant isolation and secret handling.
- **Release agent**: checks GitHub commits, Vercel build state, production route and release notes.

## Communication contract
Every task should produce:
1. **Goal** — user-visible behavior and acceptance criteria.
2. **Files touched** — exact repository paths.
3. **Dependencies** — what must be completed first.
4. **Evidence** — build/test output or a clear statement that it was not run.
5. **Risks / open questions** — anything requiring owner decision.
6. **Handoff** — next agent and specific next action.

Agents must not assume another agent's task succeeded merely because a commit exists. The coordinator checks the result before unblocking dependent work. Avoid simultaneous edits to the same file; use isolated branches or sequential changes.

## Iteration loop
1. Inspect repository and current Vercel production deployment.
2. Select one small, cohesive frontend slice (database work is intentionally deferred until the backend phase).
3. Write acceptance criteria before implementation.
4. Implement UI and local interactions; label sample data and never fake server persistence.
5. Run the GitHub Actions quality gate (npm install, npm run build).
6. Review React accessibility, state flow, mobile layout and security boundaries.
7. Deploy to the existing Vercel project.
8. Verify deployment state and the target route; inspect build events if it fails.
9. Update docs/PRODUCT_AND_RELEASE_PLAN.md and hand off the next task.

## Safety rules
- Never commit credentials, tokens, service-role keys or real customer data.
- Do not expose admin functionality as secure merely because it is hidden in the UI.
- Treat all browser-only demo state as temporary.
- Do not execute the Supabase migration or create a production database during the frontend phase.
- Promotions based on freshness/expiry are suggestions requiring manager approval.
- Never mark payments successful from a browser callback alone.
- Never claim 3D or AR works until tested with an actual model and compatible device/browser.

## Current phase
**Frontend and interaction prototyping.** Build the admin workspace and customer PWA shell. Database provisioning, real auth, API, payments, persistence and production business logic remain deferred to the later backend phase.

## Automation boundary
GitHub Actions currently provides a deterministic build gate on pushes and pull requests. It is not an autonomous coding agent and will not invent or commit fixes. A persistent multi-agent runtime (for example Vercel eve) would be a separate service with scoped credentials, budgets, approvals and explicit tool permissions; do not add it to the production app until the owner approves that architecture.
