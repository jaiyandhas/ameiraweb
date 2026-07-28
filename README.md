# Ameira

> **The Operating System for MSMEs (Micro, Small & Medium Enterprises)**

Ameira is a simple, configurable business workspace designed for small and medium businesses—including retailers, manufacturers, wholesalers, and textile companies. 

Instead of overwhelming non-technical business owners with dense ERP permission matrices, CRUD tables, and complex dashboards, Ameira is built on **radical simplicity**: every screen answers exactly one question.

---

## 🌟 Core Design Principles

- **Zero-Training Usability**: If an elderly business owner can understand the interface in under 10 minutes without assistance, the design is successful.
- **Plain-English Access Controls**: Replaces permission matrices (`Create`, `Read`, `Update`, `Delete` tables) with simple human capability cards (*"Invite & Manage People"*, *"Create & Edit Roles"*, *"Update Business Profile"*).
- **One Room at a Time**: We build one room completely before adding another. Zero placeholder enterprise complexity.
- **High Contrast & Accessible**: Large, high-legibility typography scale (17px+ base font, 24-36px headings) with crisp contrast.
- **Modern Aesthetic**: Clean, calm, modern interface inspired by Stripe Dashboard, Notion, Apple Settings, and Linear.

---

## 🏗️ Technical Stack & Architecture

- **Frontend Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, Lucide Icons
- **State Architecture**: Centralized Data-Driven Workspace Context (`WorkspaceContext.tsx`)
- **Code Optimization**: Dynamic chunk lazy loading via `React.lazy` and `React.Suspense`
- **Architectural Decision Tracking**: Documented in [`AMEIRA_DECISIONS.md`](./AMEIRA_DECISIONS.md)

---

## 📦 What's Built in Version 0.1 (Room 1)

1. **Landing Page**: Targeted value proposition for Retailers, Manufacturers, Textile Businesses, and Wholesalers.
2. **Apple-Style Authentication**: Unified Login, Registration, and Password Reset flow with "Remember Me" persistence and passwordless OTP verification support.
3. **Business Onboarding**: Instant single-field business creation (`/onboarding/create-business`).
4. **Workspace Shell**: Responsive header with active business identity, Owner badge, and Left Rail Sidebar.
5. **People Directory**: Member list with real-time search, status indicators (`Active`, `Pending Invite`), WhatsApp/Email invite links, and person profile detail controls.
6. **Roles & Capabilities Control**: Pre-configured system presets (**Owner**, **Manager**, **Staff**) and custom role builder with plain-English capability cards.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jaiyandhas/ameiraweb.git
   cd ameiraweb
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📋 Architectural Decisions (ADR Log)

All core technical and design choices are documented chronologically in [`AMEIRA_DECISIONS.md`](./AMEIRA_DECISIONS.md):

- **ADR-001**: Target User Persona & Radical Simplicity Model
- **ADR-002**: Plain-English Domain Terminology
- **ADR-003**: High-Contrast Accessible Design System & Typography Scale
- **ADR-004**: Passwordless & Apple-Style Authentication Architecture
- **ADR-005**: Data-Driven Modular Workspace Architecture
- **ADR-006**: Hero Layout Simplification & Clutter Removal

---

## 📄 License

Copyright &copy; 2026 Ameira. Built with extreme simplicity for small businesses everywhere.
