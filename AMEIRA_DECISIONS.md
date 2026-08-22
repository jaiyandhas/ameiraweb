# Ameira Architectural & Design Decisions (ADR Log)

This document serves as the authoritative record of all architectural, product, and design decisions made for **Ameira**. 

> [!NOTE]
> **Rule**: Previous decisions are never overwritten. New decisions are appended chronologically as the product evolves room by room.

---

## ADR-001: Target User Persona & Radical Simplicity Model

### Problem
Enterprise software like SAP, Odoo, and Zoho fails small and medium business owners (MSMEs) by introducing dense permission matrices, complex CRUD tables, and multi-tab forms. Business owners and elderly shop managers experience cognitive overload and drop off immediately.

### Options Considered
1. **Traditional ERP Module Matrix**: Expose full CRUD tables (Create, Read, Update, Delete across 50+ scopes).
2. **Custom Role Builder**: Provide dynamic checkboxes for granular technical permissions.
3. **Radical Simplicity Model**: Single-purpose screens where every view answers exactly one question, coupled with zero-training UI inspired by Apple Settings, Linear, Stripe, and Notion.

### Chosen Solution
**Option 3: Radical Simplicity Model**.

### Reason
If an elderly business owner cannot understand the interface in under ten minutes without training, the design has failed. We build one room completely before adding another, avoiding placeholder enterprise features.

### Future Considerations
Maintain the "One Question Per Screen" rule as new rooms (Inventory, Orders, Marketplace) are added to Ameira.

---

## ADR-002: Plain-English Domain Terminology

### Problem
Technical jargon like "Tenant", "Entity", "Permission Matrix", "Role Assignment Matrix", and "CRUD Operations" alienate non-technical MSME owners.

### Options Considered
1. **Industry Standard IAM/RBAC Technical Scopes**: Use terms like `tenant_id`, `RBAC_Matrix`, `read_only_grant`.
2. **Abstract Module Scopes**: Use module names like `Admin_Registry`, `User_Management`.
3. **Plain English Terms**: Use human terms: `Business`, `People`, `Roles`, `Access Level`, `Workspace`.

### Chosen Solution
**Option 3: Plain English Terms**.

| Enterprise Term (Avoided) | Ameira Term (Enforced) | Meaning to User |
| :--- | :--- | :--- |
| Tenant / Organization | **Business** | "This is my business." |
| Users / Staff | **People** | "The people who work with me." |
| Permission Matrix | **Access Level** | "What this person can see." |
| Dashboard | **Workspace** | "My daily operational view." |

### Reason
Eliminates mental translation effort for the business owner. Code models and UI components strictly mirror real-world business language.

### Future Considerations
Apply plain-English naming rules to all future module additions (e.g. `Items` instead of `SKU Master`, `Orders` instead of `Fulfillment Entities`).

---

## ADR-003: High-Contrast Accessible Design System & Typography Scale

### Problem
Standard enterprise web applications use small font sizes (12-14px), low-contrast grey text, and dense tables that elderly or busy shop owners struggle to read on mobile or desktop devices.

### Options Considered
1. **Standard Tailwind Baseline Font Scale**: 14px base font size.
2. **Dark Mode Default**: Dark background UI.
3. **High-Contrast Accessible Typography**: Base font size set to 17px/18px, headings 24px-36px, hero titles 48px-72px, with crisp slate/zinc light neutrals (`bg-zinc-50`, `bg-zinc-900`, `text-zinc-900`) and clear focus states.

### Chosen Solution
**Option 3: High-Contrast Accessible Typography Scale**.

### Reason
Accessibility first. Every label, button, and input target must be effortlessly legible and clickable without zooming or external training.

### Future Considerations
Provide an optional high-contrast dark theme variant for night operations in factories or warehouses.

---

## ADR-004: Apple-Style Passwordless & Unified Authentication Architecture

### Problem
Complex password policies ("Must contain 1 uppercase letter, 1 special character") lead to high registration drop-offs and forgotten credentials for small business workers.

### Options Considered
1. **Traditional Password Authentication**: Require strict password rules and complex multi-step forms.
2. **OAuth-Only**: Restrict authentication to Google/Apple single sign-on.
3. **Apple-Style Unified Authentication**: A single centered card supporting both passwordless contact verification (Email/Phone OTP) and clean password sign-in with "Remember Me" persistence and inline "Forgot Password" recovery.

### Chosen Solution
**Option 3: Apple-Style Unified Authentication**.

### Reason
Provides maximum security while eliminating onboarding friction for first-time users. Switching between Login, Registration, and Password Reset happens smoothly within a unified interface.

### Future Considerations
Integrate WhatsApp OTP gateway for Indian MSMEs and Passkey/Biometric login for mobile Flutter and native SwiftUI apps.

---

## ADR-005: Data-Driven Modular Workspace Architecture

### Problem
Hardcoding navigation sidebar links or page access checks creates fragile code that breaks as new features ("rooms") are introduced.

### Options Considered
1. **Hardcoded Navigation Components**: Static layout menus.
2. **Per-Page Route Guards**: Ad-hoc role checks inside individual components.
3. **Centralized Data-Driven Workspace Context**: Navigation links and user capability definitions (`CAPABILITY_DEFINITIONS`) generated dynamically from active business configuration and user role assignments.

### Chosen Solution
**Option 3: Centralized Data-Driven Workspace Context (`WorkspaceContext`)**.

### Reason
Scalable, modular architecture. When Room 2 (Inventory / Orders / Marketplace) is introduced, it plugs directly into the workspace shell without modifying core layout logic.

### Future Considerations
Persist capability sets and dynamic module registrations directly in PostgreSQL using FastAPI backend services.

---

## ADR-006: Hero Layout Simplification & Clutter Removal

### Problem
Category pills ("The Operating System for MSMEs") above the main hero title add visual noise and draw visual focus away from the primary value headline.

### Options Considered
1. **Keep Category Pill**: Retain the pill badge above the headline.
2. **Move Pill Below Headline**: Place badge near secondary callouts.
3. **Remove Category Pill Completely**: Allow the primary headline (*"The simple way to run your business."*) to immediately capture user attention without competing top-level containers.

### Chosen Solution
**Option 3: Remove Category Pill Completely**.

### Reason
Aligns directly with Ameira's core principle: *Avoid clutter. Every pixel should serve a clear purpose.* Eliminating decorative badge containers increases headline readability and simplifies page visual hierarchy.

### Future Considerations
Keep hero sections strictly minimalist across all future landing and marketing pages.

---

## ADR-007: Landing Page Value Proposition & Workspace Preview Redesign

### Problem
Generic marketing phrases and features lists failed to communicate the core value proposition of Ameira within ten seconds. Users needed a clear contrast between scattered daily tools (WhatsApp, Excel, paper) and one shared workspace, plus a realistic product preview without misleading analytics charts.

### Options Considered
1. **Generic Marketing Graphics & Charts**: Use stock icons, fake dashboard charts, and feature bullet lists.
2. **ERP Feature Matrix**: List complex modules and enterprise capabilities.
3. **Core Brand Statement & Realistic Workspace Preview**: Anchor around *"Your business. One workspace."*, include a 3-step "How Ameira Works" card grid, a Before-vs-With Ameira comparison, a realistic non-analytics workspace activity preview, and clearly tagged "Coming Soon" roadmap items.

### Chosen Solution
**Option 3: Core Brand Statement & Realistic Workspace Preview**.

### Reason
Focuses strictly on value and trust. Eliminates artificial charts, fake metrics, and dark patterns while demonstrating exactly how Ameira transforms operations for non-technical business owners.

### Future Considerations
Continuously align future product marketing with the "Your business. One workspace." core brand statement.



---

## ADR-008: Dashboard as Authenticated Home — Activity Feed Architecture

### Problem
After sign-in, users landed immediately on the People list with no orientation, context, or sense of "what happened today." The workspace had no home screen.

### Options Considered
1. **KPI Dashboard**: Revenue cards, charts, tables — ERP-style density.
2. **Empty Home Screen**: Just a welcome message with no content.
3. **Activity Feed Home**: A time-aware greeting, a chronological activity feed, quick actions, workspace overview numbers, and a conditional setup checklist.

### Chosen Solution
**Option 3: Activity Feed Home.**

### Reason
The dashboard answers exactly one question: "What happened in my business today?" No charts. No revenue. No graphs. The activity feed becomes the spine of the product — every future feature (inventory, orders, marketplace) will push events into it. Quick actions provide the three most common next steps without requiring menu exploration. The setup checklist disappears once complete, so it only exists when useful.

### Future Considerations
- Activity feed will eventually support filtering by type (people, inventory, orders).
- Setup checklist steps will expand as new rooms are built.
- Activity events should eventually persist to the backend and be real-time via websockets.

---

## ADR-009: Workspace Apps Architecture & Plain-English Tooling

### Problem
MSMEs are intimidated by complex ERP jargon like "Modules", "Sub-systems", or "Software Provisioning Matrix". Furthermore, software applications need a clean separation between internal engineering concepts (`features/apps/`, `WorkspaceApp`) and user-facing plain-English language ("Workspace", "tools", "installed tools").

### Options Considered
1. **ERP Module Registry Terminology**: Expose "Modules" in the UI with enable/disable toggle matrices.
2. **Hardcoded Sidebar Navigation**: Manually edit sidebar UI components whenever a new business tool/room is added.
3. **Registry-Driven Workspace Tools Architecture**: Build a centralized registry (`features/apps/registry.ts`) holding `WorkspaceApp` models (internal: `App`, UI: `Workspace`). Expose two calm sections: "Installed" and "Coming Soon". Architect the registry so future tools require zero sidebar changes when dynamic sidebar rendering is enabled.

### Chosen Solution
**Option 3: Registry-Driven Workspace Tools Architecture**.

### Reason
Keeps user experience completely free of technical ERP jargon while establishing a scalable architecture for future extensions. Installing or uninstalling tools automatically emits an `ActivityEvent`, keeping the workspace activity feed alive and transparent.

### Future Considerations
- Allow dynamic sidebar rendering directly from installed `WorkspaceApp` records (`showInSidebar === true`).
- Enable App detail modal for permissions, configuration, and team access scopes per installed app.

---

## ADR-010: Supabase Client & Agent Skills Integration

### Problem
Ameira needs a persistent cloud database backend for real-time business sync, user authentication, and data persistence without adding unnecessary backend server overhead.

### Options Considered
1. **Custom Server Infrastructure**: Self-hosted custom backend API with manual ORM migrations.
2. **Direct Supabase Integration**: `@supabase/supabase-js` client SDK with environmental configuration (`.env.local`) and client helper utilities (`src/utils/supabase/client.ts` & `src/lib/supabase.ts`).

### Chosen Solution
**Option 2: Direct Supabase Integration**.

### Reason
Provides instant PostgreSQL database capabilities, real-time subscriptions, secure auth persistence, and clean agent skills tooling (`.agents/skills/supabase` & `.agents/skills/supabase-postgres-best-practices`).

### Future Considerations
- Connect `WorkspaceContext` state mutations directly to Supabase PostgreSQL tables.
- Enable Supabase Row Level Security (RLS) for multi-tenant business data isolation.

---

## ADR-011: Full Supabase Schema & Real Auth Integration

### Problem
Ameira required a production-grade database schema and real Supabase Auth integration without fake users, hardcoded mock sessions, or bypass files. Furthermore, the database architecture needed a reusable, tenant-isolated pattern so that future business modules (Inventory, Orders, Marketplace) can be added without altering the core Business, People, or Roles engine.

### Options Considered
1. **Isolated Module Schemas**: Write custom authentication and isolated tables for each individual module without shared tenant helper functions or capability registries.
2. **Extensible Shared Spine Pattern**: Establish a shared 3-part spine across every table:
   - Tenant root scoping (`business_id UUID NOT NULL REFERENCES public.businesses(id)`).
   - Global Postgres helper function (`public.current_business_id()`).
   - Dynamic capability registry (`capabilities` table referencing `workspace_apps(slug)`).
   - Unified activity event logging (`activity_events` polymorphic log table).

### Chosen Solution
**Option 2: Extensible Shared Spine Pattern**.

### Key Architectural Conventions & Guidelines

#### 1. Capability Registry Pattern
Instead of fixed Postgres `ENUM` types or hardcoded permission strings:
- Capabilities are rows in `public.capabilities` (`key`, `title`, `description`, `category`, `app_slug`).
- Role permissions are stored in `public.role_capabilities` join table.
- **Adding a new module**: Ship SQL `INSERT INTO public.capabilities ...` referencing your app's `app_slug`. No `ALTER TYPE` or schema rewrites required.

#### 2. Activity Event Convention
- All activity logs use `public.activity_events` (`id`, `business_id`, `actor_person_id`, `event_type`, `entity_type`, `entity_id`, `title`, `payload`, `created_at`).
- Every module writes activity logs to this shared table on create/update/delete instead of creating module-specific activity tables.

#### 3. Exact Steps to Add a New Module Table (e.g. `inventory_items`)
1. Create table with `business_id` and `created_by` references:
   ```sql
   CREATE TABLE public.inventory_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
     created_by UUID REFERENCES public.people(id) ON DELETE SET NULL,
     name TEXT NOT NULL,
     sku TEXT,
     quantity INT NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );

   CREATE INDEX idx_inventory_items_biz ON public.inventory_items(business_id);
   ```
2. Enable Row Level Security (RLS) immediately:
   ```sql
   ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
   ```
3. Apply RLS policies using `public.current_business_id()`:
   ```sql
   CREATE POLICY "Tenant select inventory_items"
     ON public.inventory_items FOR SELECT
     TO authenticated
     USING (business_id = public.current_business_id());

   CREATE POLICY "Tenant insert inventory_items"
     ON public.inventory_items FOR INSERT
     TO authenticated
     WITH CHECK (business_id = public.current_business_id());

   CREATE POLICY "Tenant update inventory_items"
     ON public.inventory_items FOR UPDATE
     TO authenticated
     USING (business_id = public.current_business_id())
     WITH CHECK (business_id = public.current_business_id());

   CREATE POLICY "Tenant delete inventory_items"
     ON public.inventory_items FOR DELETE
     TO authenticated
     USING (business_id = public.current_business_id());
   ```
4. Register capabilities in `public.capabilities` referencing the app slug.
5. Log actions to `public.activity_events`.

### Future Considerations
- Introduce Supabase Edge Functions / FastAPI layer for complex workflow validations.
- Add real-time Supabase Database webhooks for instant client UI feed updates.

---

## ADR-012: Multi-Layer Business Tenant Resolution & State Protection

### Problem
When users switched browser tabs or window focus, Supabase Auth emitted background `TOKEN_REFRESHED` events. If the `people` table query was in-flight or returned empty before session hydration completed, `loadBusinessData` prematurely defaulted `activeStep` to `'create-business'`, kicking authenticated users back to the "Create your business" onboarding screen.

### Options Considered
1. **Single-Query Lookup with False Default**: Rely solely on `people.user_id` query, immediately resetting step to `'create-business'` if empty.
2. **Multi-Layer Business Tenant Resolution with State Guard**:
   - Query `public.people` by `user_id`.
   - Fallback 1: Query `public.businesses` by `owner_id`.
   - Fallback 2: Read `localStorage` cached business metadata.
   - State Guard: Never override active `workspace` state to `'create-business'` if an active business is already loaded in React state or localStorage.

### Chosen Solution
**Option 2: Multi-Layer Business Tenant Resolution with State Guard**.

### Reason
Completely eliminates premature redirect flickers and tab-switch resets while ensuring real user business identity is immediately resolved across multiple fallbacks.

### Future Considerations
- Synchronize active workspace state via BroadcastChannel across concurrent browser tabs.

---

## ADR-013: Three-State Business Check Status (`loading` | `found` | `not_found`)

### Problem
On fresh page refreshes or hard reloads, client state initializes asynchronously. A binary boolean check (`hasBusiness ? <Dashboard> : <CreateBusiness>`) treated in-flight loading queries as "confirmed no business", causing the "Create your business" page to flash briefly before resolving to the Dashboard.

### Options Considered
1. **Binary Truthy/Falsy Check**: Treat missing/loading state as falsy `hasBusiness = false`, immediately rendering `<CreateBusinessPage>` while query is in flight.
2. **Three-State Explicit Business Status (`loading` | `found` | `not_found`)**:
   - `loading`: Initial state on mount and while Supabase queries are in flight. Render a lightweight loading screen.
   - `found`: Query resolved, business exists. Render `<WorkspaceShell>` / Dashboard.
   - `not_found`: Query resolved, confirmed no business exists. Render `<CreateBusinessPage>`.

### Chosen Solution
**Option 2: Three-State Explicit Business Status (`loading` | `found` | `not_found`)**.

### Reason
Guarantees that `<CreateBusinessPage>` is NEVER rendered while a query is in flight. On page refresh, the UI smoothly displays a lightweight loading screen until the business state is definitively resolved.

### Future Considerations
- Add skeleton placeholder view during initial workspace chunk hydration.

---

## ADR-014: Modular Feature Architecture for Dashboard

### Problem
Monolithic page components make UI features harder to test, maintain, and reuse. The dashboard originally housed all greetings, activity feed, metrics, quick actions, and setup checklist logic in a single file.

### Options Considered
1. **Monolithic Page Component**: Keep all sections embedded inside a single 300-line `DashboardPage.tsx` file.
2. **Modular Feature Sub-Components**: Modularize into `src/features/dashboard/`:
   - `WelcomeHeader.tsx`
   - `ActivityFeed.tsx`
   - `WorkspaceOverview.tsx`
   - `QuickActions.tsx`
   - `SetupChecklist.tsx`
   - `DashboardPage.tsx` as a clean layout assembler.

### Chosen Solution
**Option 2: Modular Feature Sub-Components**.

### Reason
Improves code readability, component reusability, and isolates state/render concerns for each section of the Dashboard.

### Future Considerations
- Allow individual feature modules (like `ActivityFeed`) to be embedded in sub-views (such as Person Detail or Settings).

---

## ADR-015: Real Route Separation for Onboarding & Workspace Screens (React Router)

### Problem
Ameira previously ran a single route (`/`) with screens like Create Business and Dashboard swapped in via client-side state (`activeStep`) rather than real URL navigation. The URL never changed regardless of which screen was showing. This was the root cause behind the refresh-flicker and tab-switch redirect bugs: with no URL to act as source of truth, every mount/refresh/focus event had to reconstruct "where the user is" from scratch via async queries.

### Options Considered
1. **Keep Single-Route State Machine, Add More Guards**: Continue patching `activeStep` logic with additional state layers to paper over timing races.
2. **Real Route Separation via React Router**: Introduce actual routes (`/create-business`, `/dashboard`, `/people`, `/roles`, `/settings`) with route-level guards (`<RequireBusiness>`) that resolve business status *before* protected routes render, replacing the client-reconstructed `activeStep` state machine.

### Chosen Solution
**Option 2: Real Route Separation via React Router**.

### Reason
A URL-backed route is authoritative — the browser and user always know what page they are on. Refresh reloads exactly that page, and tab focus doesn't re-trigger a full "guess where I am" state reconstruction.

### Key Architectural Implementation
- **Routes Defined**:
  - `/` &rarr; Landing Page
  - `/login` & `/register` &rarr; Auth Page
  - `/create-business` &rarr; Create Business Onboarding (wrapped in `<RequireNoBusiness>`)
  - `/dashboard`, `/workspace`, `/people`, `/roles`, `/settings` &rarr; Protected Workspace (wrapped in `<RequireBusiness>`)
- **Route Guards**:
  - `RequireBusiness`: Checks `businessStatus`. Returns `<LoadingScreen>` while loading, redirects to `/login` if unauthenticated, redirects to `/create-business` if no business exists, and renders children when business is confirmed.
  - `RequireNoBusiness`: Redirects authenticated users with a business directly to `/dashboard`.
  - `RedirectIfAuth`: Redirects authenticated users from `/` or `/login` to `/dashboard` or `/create-business`.

### What this does NOT change
- `current_business_id()`, RLS policies, and the Supabase schema from ADR-011 are unaffected.
- The three-state (`loading`/`found`/`not_found`) resolution logic from ADR-013 is preserved, relocated to the route guard.

### Future Considerations
- New modules (Inventory, Orders, Marketplace) will plug directly into their own routes (`/inventory`, `/orders`) wrapped in `<RequireBusiness>`.

---

## ADR-016 (Consolidated): Dynamic Hero Typography & Brand Logo Integration

> This entry consolidates what were originally ten separate entries (ADR-016 through ADR-025), most of which were incremental fixes and re-fixes of the same two features rather than distinct architectural decisions. Kept as one entry going forward; the original trial-and-error trail is preserved below for history but should be treated as superseded by this summary.

### Problem
The landing page hero needed to reflect Ameira's multi-domain reach (`business`, `shop`, `store`, `factory`, `workshop`) without static, one-size-fits-all copy — and without introducing layout jitter, glyph clipping, or busy animation that would violate the calm, minimal brand established in ADR-006/007. Separately, the brand logo needed to move from a placeholder to the official asset, cleanly integrated (transparent background, correct scale) across every surface that displays it.

### Final Chosen Solution

**Hero typography:**
- Pure typography, no pill/badge container (boxed pill styles from early iterations were tried and dropped as too heavy).
- Dynamic gradient text roll (`bg-clip-text text-transparent`) on the cycling word.
- Two-line layout: `Your {word},` / `One workspace.`
- Comma renders coupled directly to the active word inside the same transition span, so punctuation travels naturally with the word instead of sitting at a fixed offset.
- Line width fixed to the longest word in the set (`business`/`workshop`, 8 characters) so `text-center` doesn't cause the whole line to visibly shift as shorter/longer words cycle through.
- `overflow-visible` enforced on ancestor containers with horizontal/vertical bleed padding on the gradient span, to prevent descenders/ascenders (`p`, `e`, `s`, etc.) from being clipped by the gradient's bounding box.
- Respects `prefers-reduced-motion`; screen readers get a static `.sr-only` sentence instead of the animated word.

**Logo:**
- Official asset: transparent PNG, dark navy monogram (`#0F172A`) for light surfaces, with a white variant for any dark surfaces.
- Deployed consistently across `LandingNavbar`, `LandingFooter`, `WorkspaceShell`, `AuthLayout`, `LoadingScreen`, and `WorkspacePreview`, each at a scale appropriate to that surface.
- Background fully removed via alpha-channel extraction (isolating the actual navy stroke/dot pixels, discarding editor-artifact checkerboard pixels that an earlier export had baked in).

### Reason
Delivers the intended calm, premium dynamic headline with zero layout instability, and gets the real brand mark consistently deployed and rendering cleanly (no baked-in backgrounds, no clipping, no artifacts) everywhere it appears.

### Lesson for future entries
Several of the superseded entries below record the same bug (comma/line-width jitter, logo background artifacts) being fixed three times each, because the prior fix wasn't verified in-browser before being logged as resolved. Going forward: implementation fixups and CSS-level corrections don't need their own ADR entry — reserve new entries for decisions with genuine alternatives and lasting consequences (architecture, schema, routing). Verify a fix actually holds before logging it as the chosen solution.

### Future Considerations
- Bundle SVG vector paths for the logo for infinite-zoom sharpness.
- Generate favicon ICO/WebP multi-resolution bundles from the transparent asset.
- Allow custom domain/color theme presets during onboarding, if the product direction calls for it later.

---

<details>
<summary>Superseded entries (ADR-016 through ADR-025, original trial-and-error trail — kept for history)</summary>

### ADR-016: Dynamic Hero Word-Cycle & Brand Headline Alignment (Superseded)
Initial implementation of dynamic word-cycle on the hero.

### ADR-017: Notion-Style Dynamic Pill Hero Headline Layout (Superseded)
Exploration of boxed pill badge enclosing the noun, dropped in favor of clean unboxed typography.

### ADR-018: Stylish Minimalist Glassmorphic Dynamic Pill Badge (Superseded)
Exploration of glassmorphic gradients within pill badge.

### ADR-019: Dynamic Typography Gradient Hero Headline & Vector Monogram Logo Mark (Superseded)
Shifted back to pure typography with dynamic gradients.

### ADR-020: Stationary Comma Positioning & Brand PNG Logo Asset Retention (Superseded)
Initial attempt at fixed offset comma positioning.

### ADR-021: Zero-Jitter Invariant Line Length & Native PNG Logo Integration (Superseded)
Extended character width to prevent text-center layout shift.

### ADR-022: Dynamic Comma Alignment & Transparent High-Resolution Logo Scaling (Superseded)
Connected comma directly to the dynamic word.

### ADR-023: Transparent High-Resolution Logo Asset Deployment (Superseded)
Initial transparent logo deployment.

### ADR-024: Pure Pixel Extraction for Monogram Logo & Dynamic Hero Typography (Superseded)
Stripped fake baked-in checkerboard artifact using RGBA alpha thresholding.

### ADR-025: Gradient Bounding-Box Bleed & Glyph Clipping Fix (Superseded)
Added horizontal bleed padding (`pr-2 pb-1`) to eliminate character cutoff on `p`, `e`, `s`.

</details>

---

## ADR-026: Core Rooms Completion — People, Access Levels (Roles), and Settings

### Problem
Before any new business module (Inventory, Orders, Marketplace) is started, Ameira's three foundational rooms — People, Access Levels (Roles), and Settings — must be genuinely complete, not placeholders. Every screen must answer exactly one question (ADR-001), use plain-English terminology (ADR-002), maintain real route separation (ADR-015), and hook into `activity_events` (ADR-008).

### Final Chosen Solution

**Room 1: People (`/people`)**
- `/people` — Scannable team directory with name, contact info, Access Level badge, and status filter tabs (All / Active / Pending). Answer: *"Who's in my business?"*
- `/people/invite` — Two-step invite form: (1) Name & Email/Phone, (2) Access Level selection. Pending invites are represented as rows in `public.people` with `status = 'invited'` and nullable `user_id` until accepted. Answer: *"Who am I adding, and what can they do?"*
- `/people/:id` — Person detail view with interactive Access Level modifier, recent activity history, and "Remove Person" action. Includes a sole-owner lockout guard preventing removal or demotion of the last active Owner. Answer: *"What does this person do here?"*

**Room 2: Access Levels (`/roles`)**
- `/roles` — Access Level gallery showing name, description, assigned member count, and granted capabilities. Answer: *"What levels of access exist?"*
- `/roles/new` & `/roles/:id` — Creation and detail/edit view driven dynamically by rows from `public.capabilities` table. Capability toggles reflect the installed apps without frontend hardcoding. Preset Owner role is protected from deletion or permission modification. Answer: *"What can someone at this level do?"*

**Room 3: Settings (`/settings`)**
- `/settings` (Profile) — Manage business name, street address, city/region, contact email, contact phone, and currency format against `public.businesses`. Answer: *"What is my business called and where is it?"*
- `/settings/apps` (Workspace Tools) — View active installed tools and upcoming roadmap tools. Answer: *"What tools does my business use?"*
- `/settings/account` (My Account) — Manage user identity, view user ID, trigger password reset instructions, and sign out. Answer: *"How do I manage my own account?"*

**Cross-Cutting Architecture:**
- Real URL routes wrapped in `<RequireBusiness>`.
- All write actions (inviting a person, changing a role, deleting a role, updating settings) automatically log human-readable events to `public.activity_events`.
- Strict plain-English terminology enforced throughout (e.g. "Access Level", "Tools", "People" — zero RBAC/CRUD/Tenant jargon).

### Reason
Establishes an unbreakable, unified foundation for identity, authorization, activity logging, and business configuration that all future modules will build upon.

### Future Considerations
- Implement email/SMS delivery webhooks for invite links upon backend FastAPI service initialization.

---

## ADR-027: FastAPI Capability-Enforcement Layer (Hybrid Architecture)

### Problem
Certain core business operations (role changes, access level creation/edit/deletion, member removal, and invite acceptance) require server-side workflow enforcement, multi-table transactions, and complex business rules (e.g. sole-owner lockout prevention, preset immutability) that Postgres RLS cannot easily express alone. However, routing simple reads through a backend would add latency and defeat the direct Supabase read performance.

### Final Chosen Solution

**Minimal-Hybrid Split**:
- **Direct Supabase Reads**: People list, Roles list, Settings reads, Workspace Apps, and Dashboard activity feed stay on direct Supabase client calls.
- **FastAPI Capability Enforcement (`backend/`)**:
  - `POST /api/people/{person_id}/role`: Enforces `canManagePeople` capability, verifies tenant isolation, enforces sole-Owner demotion lockout, updates role, and logs to `activity_events`.
  - `POST /api/people/{person_id}/remove`: Enforces `canManagePeople` capability, enforces sole-Owner removal lockout guard, deletes person, and logs to `activity_events`.
  - `POST /api/roles` / `PATCH /api/roles/{role_id}` / `DELETE /api/roles/{role_id}`: Enforces `canManageRoles`, protects system presets (Owner), guards against deleting roles with active assignees, links capabilities, and logs to `activity_events`.
  - `POST /api/invites/{invite_id}/accept`: Securely links an authenticated user to their pending `people` row, sets `status = 'active'`, and logs to `activity_events`.

**Service Architecture**:
- Python FastAPI with `asyncpg.create_pool` connection pooling (min 5, max 20 connections).
- JWT Authentication Dependency: Validates Supabase-issued Bearer token on every request, extracts `user_id`, and derives `person_id`, `business_id`, and granted capabilities strictly server-side (never trusts client-supplied tenant IDs).
- Service role key kept strictly in backend environment variables.
- Colocation note: Backend service is designed to be hosted alongside the Postgres instance (e.g. on Fly.io / AWS ECS in the same cloud region) to keep DB latency under 5ms.

### Reason
Combines the speed of direct database reads with bulletproof server-side capability and workflow enforcement, preventing tenant bypass and workspace lockout while preserving clean architecture.

### Future Considerations
- Wire future business modules (Inventory stock adjustments, Order status transitions) through dedicated capability-enforced endpoints as they are introduced.

---

## ADR-028: Live Schema Audit, Local PostgreSQL Test Cluster, and Real-Database Test Verification

### Problem
A thorough audit revealed that while SQL migrations were authored locally (`supabase/migrations/20260822000000_core_schema.sql`), they had not yet been executed on the live remote Supabase project (returning 404 PGRST205 across all tables). Furthermore, early unit tests were passing using mocked responses rather than hitting actual Postgres transactions and foreign keys, masking edge cases like `NULL` business IDs on global presets and UUID format constraints on `people.user_id`.

### Final Chosen Solution

1. **Schema Finalization**:
   - `supabase/migrations/20260822000000_core_schema.sql` finalized with all ADR-026 profile columns (`address`, `city`, `contact_email`, `contact_phone`, `currency`), `current_business_id()` security definer function, and full RLS policies.
   - Seed data established for `workspace_apps`, `capabilities`, and baseline system presets (`Owner`, `Manager`, `Staff`).

2. **Real Database Testing Harness**:
   - Spun up an isolated local PostgreSQL 18 instance via `initdb` and `pg_ctl` on port 54332.
   - Initialized `ameira_test` database with full schema, foreign keys, and RLS tables.
   - Rewrote `backend/tests/test_enforcement.py` to connect via real `asyncpg` connection pools.

3. **Bugs Uncovered & Fixed via Real Database Testing**:
   - **Global Preset Role Verification Bug**: In `roles.py`, preset roles with `business_id IS NULL` were incorrectly failing tenant isolation checks with 404 instead of proceeding to the preset immutability guard (400). Fixed to explicitly handle `NULL` global business presets.
   - **Foreign Key Enforcement**: Verified Postgres enforces `people.user_id REFERENCES auth.users(id)` and UUID format validations.
   - **Email Match Enforcement**: Verified `POST /api/invites/{id}/accept` strictly rejects mismatched authenticated email addresses with 403 Forbidden.

4. **Test Suite Results**:
   - 15 out of 15 tests execute and pass in **0.56s** against real Postgres transactions, table inserts, and deletes.

### Reason
Ensures the capability enforcement layer and database schema are tested against genuine PostgreSQL behavior, locking down data integrity before any future business modules are added.




















