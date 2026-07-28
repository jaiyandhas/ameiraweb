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

