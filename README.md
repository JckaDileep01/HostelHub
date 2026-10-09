# HostelHub — Intelligent Hostel Management Platform

A modern, full-featured Hostel Management System built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL + RLS)**. Designed for hostel owners, caretakers, and property managers to manage multi-hostel properties, room allocations, tenant agreements, payments, KYC verification, voice AI calls, and maintenance tasks.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm
- A Supabase project (or local Supabase instance)

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Your `.env` should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for seed & administrative scripts
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Default Demo Account credentials
DEMO_EMAIL=demo.owner@hostelhub.test
DEMO_PASSWORD=DemoHostel123!
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Seeding
If you are connecting to a fresh Supabase instance, run the migrations located in `supabase/migrations/` in chronological order via the Supabase SQL Editor or Supabase CLI.

To seed the complete demo dataset (Floors, Rooms, Beds, Tenants, Invoices, Payments, Maintenance):
```bash
npm run seed:reseed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Demo Owner Login**:
  - Email: `demo.owner@hostelhub.test`
  - Password: `DemoHostel123!`

---

## 📁 Repository Structure

```
├── app/                        # Next.js 13+ App Router
│   ├── app/                    # Authenticated workspace (/app/*)
│   │   ├── dashboard/          # Key metrics, revenue charts, urgent alerts
│   │   ├── rooms/              # Floor-by-floor visual room matrix & bed allocation
│   │   ├── tenants/            # Tenant registry, onboarding, agreements, KYC
│   │   ├── payments/           # Invoicing, dues tracking, cash recording, receipts
│   │   ├── ai-calls/           # Automated voice collection logs & tenant call controls
│   │   ├── maintenance/        # Maintenance request ticketing & assignment
│   │   ├── settings/           # Hostel profile, owner details, theme, security
│   │   └── layout.tsx          # Authenticated AppShell wrapper
│   ├── login/                  # User authentication (sign-in)
│   ├── signup/                 # Owner registration & hostel onboarding
│   ├── globals.css             # Tailwind & design token configurations
│   └── layout.tsx              # Root layout & providers (Auth, Theme, Toaster)
│
├── components/                 # Reusable UI Components
│   ├── ui/                     # Design system primitives (Radix UI + Tailwind)
│   ├── app-shell.tsx           # Responsive sidebar, header, navigation, & mobile nav
│   ├── hostel-switcher.tsx     # Instant multi-hostel switcher (no re-login required)
│   ├── no-hostel-linked.tsx    # Empty state for unlinked owner workspaces
│   └── sw-register.tsx         # Progressive Web App service worker registration
│
├── hooks/                      # Custom React Hooks
│   ├── use-hostel-scope.ts     # Central hostel context provider for scoped queries
│   └── use-toast.ts            # Toast notification management
│
├── lib/                        # Core Utilities & Configuration
│   ├── auth-context.tsx        # Supabase authentication provider & session state
│   ├── theme-provider.tsx     # Dark/Light mode theme state
│   ├── types.ts                # TypeScript domain models and relational types
│   ├── utils.ts                # CSS class merger (`cn`)
│   └── supabase/
│       ├── client.ts           # Browser-side Supabase client with auth session
│       └── server.ts           # Server-side Supabase client
│
├── scripts/                    # Maintenance & Seeding Scripts
│   ├── fix-and-reseed.mjs      # Complete demo data generation script
│   └── seed-demo-data.mjs      # Minimal bootstrap seed script
│
└── supabase/
    └── migrations/             # SQL Migrations (Tables, Triggers, RLS Policies, RPC)
        ├── 20261001091249_hostel_management_schema.sql
        ├── 20261001094517_harden_hostel_access_controls.sql
        └── 20261001100709_create_owner_workspace_setup.sql
```

---

## 🏗️ Architectural Core Concepts

### 1. Multi-Hostel Context Scoping (`useHostelScope`)
Owners can operate multiple hostels under one account. Rather than managing hostel IDs manually in each component:
- The active hostel is stored in `profile.hostel_id`.
- The [useHostelScope()](file:///c:/Users/Admin/OneDrive/Desktop/project/hooks/use-hostel-scope.ts) hook provides `{ hostelId, profile, isReady, hasHostel }`.
- When switching hostels via [HostelSwitcher](file:///c:/Users/Admin/OneDrive/Desktop/project/components/hostel-switcher.tsx), `profile.hostel_id` updates in Supabase and the active page instantly re-fetches data for the selected property.

### 2. Relational Disambiguation in PostgREST
The `beds` and `tenants` tables share two foreign key relationships:
1. `beds.tenant_id` → `tenants.id` (Who is occupying this bed)
2. `tenants.assigned_bed_id` → `beds.id` (Which bed is assigned to this tenant)

When joining tenants from the `rooms -> beds` path in Supabase queries, always specify the foreign key constraint:
```ts
// ✅ Correct (disambiguated relation):
supabase.from('rooms').select('*, beds(*, tenant:tenants!beds_tenant_id_fkey(*)), floor:floors(*)')

// ❌ Incorrect (will trigger PGRST201 ambiguity error):
supabase.from('rooms').select('*, beds(*, tenant:tenants(*)), floor:floors(*)')
```

### 3. Row-Level Security (RLS)
All database tables enforce PostgreSQL Row-Level Security:
- Hostel owners can only query/mutate data belonging to their owned hostels (`hostel_id = profile.hostel_id`).
- Caretakers and wardens only have operational access to their assigned hostels.
- Sensitive financial transactions and invoices are strictly isolated per property.

---

## 🛠️ Developer Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Compile optimized production build |
| `npm run typecheck` | Run TypeScript compiler checks without emitting files (`tsc --noEmit`) |
| `npm run lint` | Run ESLint validation |
| `npm run seed:reseed` | Re-seed all floors, rooms, beds, tenants, and payment records |

---

---

## ☁️ Deploying to Cloudflare Pages & Supabase

HostelHub is pre-configured for deployment with **Cloudflare Pages** (frontend CDN) and **Supabase** (backend DB, Auth & Storage):

### Step 1: Backend Deployment (Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in Supabase and run the migrations in [supabase/migrations/](file:///c:/Users/Admin/OneDrive/Desktop/project/supabase/migrations) in order:
   - `20261001091249_hostel_management_schema.sql`
   - `20261001094517_harden_hostel_access_controls.sql`
   - `20261001100709_create_owner_workspace_setup.sql`
3. In **Storage**, create a bucket named `kyc-documents` (private, with file size limit ~10MB).
4. Run the seed script to populate initial demo data if needed:
   ```bash
   npm run seed:reseed
   ```

### Step 2: Frontend Deployment (Cloudflare Pages)
1. Push this repository to your GitHub or GitLab.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/):
   - Go to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
   - Select your repository.
3. Configure Build Settings:
   - **Framework preset**: `None` or `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
4. Set Environment Variables in Cloudflare Pages:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anonymous key
   - `NODE_VERSION`: `20.10.0`
5. Click **Save and Deploy**. Cloudflare will build and distribute the app across its global edge network.

### Step 3: Configure Auth Redirect URL in Supabase
In your Supabase project under **Authentication** -> **URL Configuration**:
- Set **Site URL** to your Cloudflare Pages domain (e.g. `https://your-hostelhub.pages.dev`).
- Add `https://your-hostelhub.pages.dev/**` to **Redirect URLs**.

