# Bootstrap Next.js Admin/Public Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the initial Ricanos web app foundation with Next.js, TypeScript, Tailwind, shadcn-compatible structure, Supabase Auth wiring, Drizzle wiring, protected admin routes, and public view-only route shell.

**Architecture:** This slice intentionally creates a thin vertical foundation, not tournament behavior. The app has a small auth seam, a database seam, protected admin shell, public event shell, and smoke tests proving routing and auth helpers work. Domain modules from the PRD are not implemented yet.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase SSR client, Drizzle ORM, Vitest, Testing Library, Playwright-ready structure.

---

## File Structure

Create or modify these files:

- `package.json` — app scripts and dependencies.
- `next.config.ts` — Next.js config.
- `tsconfig.json` — TypeScript config.
- `postcss.config.mjs` — Tailwind/PostCSS config.
- `tailwind.config.ts` — Tailwind content/theme config.
- `vitest.config.ts` — unit test config.
- `src/app/layout.tsx` — root HTML layout.
- `src/app/page.tsx` — marketing/home redirect shell.
- `src/app/admin/page.tsx` — protected admin landing page.
- `src/app/admin/login/page.tsx` — admin login page shell.
- `src/app/events/[slug]/page.tsx` — public event dashboard shell.
- `src/app/globals.css` — Tailwind base styles.
- `src/lib/env.ts` — typed environment reader.
- `src/lib/supabase/server.ts` — server Supabase client helper.
- `src/lib/supabase/middleware.ts` — middleware Supabase session refresh helper.
- `src/lib/db/schema.ts` — initial Drizzle schema placeholder for admins/events later.
- `src/lib/db/index.ts` — Drizzle client factory.
- `src/middleware.ts` — protects `/admin` except `/admin/login`.
- `src/test/env.test.ts` — environment helper tests.
- `src/test/public-shell.test.tsx` — public shell render test.
- `.env.example` — required environment variables.
- `.gitignore` — Node/Next/env ignores.
- `README.md` — local setup instructions.

## Task 1: Create Next.js project foundation

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `.gitignore`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "ricanos",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "drizzle-orm": "latest",
    "lucide-react": "latest",
    "next": "latest",
    "postgres": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "autoprefixer": "latest",
    "drizzle-kit": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "jsdom": "latest",
    "postcss": "latest",
    "tailwindcss": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Write framework config files**

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

`tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        court: "#2563eb",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Write base app files**

`src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  margin: 0;
  background: #f8fafc;
  color: #0f172a;
}
```

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ricanos",
  description: "Padel Americano and Mexicano event management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
        Ricanos Padel Community
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Run Americano and Mexicano events without spreadsheet chaos.
      </h1>
      <p className="text-lg text-slate-600">
        Admins manage events and scores. Players follow public view-only leaderboards and matches.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white" href="/admin">
          Admin area
        </Link>
        <Link className="rounded-lg border border-slate-300 px-5 py-3 font-semibold" href="/events/demo">
          View demo event shell
        </Link>
      </div>
    </main>
  );
}
```

`.gitignore`:

```gitignore
node_modules
.next
.env
.env*.local
.vercel
coverage
dist
.DS_Store
.worktrees
```

- [ ] **Step 4: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and install exits with code 0.

- [ ] **Step 5: Verify build tooling starts compiling**

Run:

```bash
npm run typecheck
```

Expected: command exits with code 0.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts src/app/globals.css src/app/layout.tsx src/app/page.tsx .gitignore
git commit -m "feat: bootstrap Next.js app shell"
```

## Task 2: Add typed environment and database seam

**Files:**
- Create: `.env.example`
- Create: `drizzle.config.ts`
- Create: `src/lib/env.ts`
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `vitest.config.ts`
- Create: `src/test/env.test.ts`

- [ ] **Step 1: Write failing environment tests**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

`src/test/env.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readServerEnv } from "@/lib/env";

describe("readServerEnv", () => {
  it("returns configured values", () => {
    const env = readServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      DATABASE_URL: "postgres://user:pass@localhost:5432/ricanos",
    });

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key");
    expect(env.DATABASE_URL).toBe("postgres://user:pass@localhost:5432/ricanos");
  });

  it("throws a readable error when a required value is missing", () => {
    expect(() => readServerEnv({})).toThrow("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/test/env.test.ts
```

Expected: FAIL because `@/lib/env` does not exist.

- [ ] **Step 3: Implement environment and database seam**

`.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
```

`src/lib/env.ts`:

```ts
type EnvInput = Record<string, string | undefined>;

export type ServerEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  DATABASE_URL: string;
};

function requireValue(env: EnvInput, key: keyof ServerEnv): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function readServerEnv(env: EnvInput = process.env): ServerEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: requireValue(env, "NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requireValue(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    DATABASE_URL: requireValue(env, "DATABASE_URL"),
  };
}
```

`src/lib/db/schema.ts`:

```ts
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const eventStatus = pgEnum("event_status", ["draft", "ready", "live", "completed", "archived"]);
export const eventFormat = pgEnum("event_format", ["americano", "mexicano"]);
export const pairingMode = pgEnum("pairing_mode", ["individual", "fixed_team"]);

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  publicSlug: text("public_slug").notNull().unique(),
  status: eventStatus("status").notNull().default("draft"),
  format: eventFormat("format").notNull(),
  pairingMode: pairingMode("pairing_mode").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

`src/lib/db/index.ts`:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readServerEnv } from "@/lib/env";
import * as schema from "./schema";

export function createDb(databaseUrl = readServerEnv().DATABASE_URL) {
  const client = postgres(databaseUrl, { prepare: false });
  return drizzle(client, { schema });
}
```

`drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";
import { readServerEnv } from "./src/lib/env";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: readServerEnv().DATABASE_URL,
  },
});
```

- [ ] **Step 4: Run tests and typecheck**

Run:

```bash
npm test -- src/test/env.test.ts
npm run typecheck
```

Expected: both commands exit with code 0.

- [ ] **Step 5: Commit**

```bash
git add .env.example drizzle.config.ts vitest.config.ts src/lib/env.ts src/lib/db/schema.ts src/lib/db/index.ts src/test/env.test.ts
git commit -m "feat: add environment and database seams"
```

## Task 3: Add Supabase auth helpers and admin route protection

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Implement Supabase server helper**

`src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readServerEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const env = readServerEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
```

- [ ] **Step 2: Implement middleware session refresh helper**

`src/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readServerEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = readServerEnv();

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  return { response, user: data.user };
}
```

- [ ] **Step 3: Protect admin routes**

`src/middleware.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 4: Add admin pages**

`src/app/admin/page.tsx`:

```tsx
export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Event management</h1>
        <p className="mt-2 text-slate-600">
          Create and manage Americano and Mexicano events. Event creation arrives in the next slice.
        </p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">No events yet</h2>
        <p className="mt-2 text-slate-600">This shell is protected by Supabase Auth.</p>
      </section>
    </main>
  );
}
```

`src/app/admin/login/page.tsx`:

```tsx
export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin login</p>
        <h1 className="mt-2 text-2xl font-bold">Sign in to manage events</h1>
        <p className="mt-3 text-slate-600">
          Supabase email login UI will be connected after project credentials are configured.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Run verification**

Run:

```bash
npm run typecheck
npm run build
```

Expected: both commands exit with code 0 when required environment variables are present. If build fails due to missing environment variables, create a temporary local `.env` using `.env.example` keys and valid placeholder values, then rerun.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/server.ts src/lib/supabase/middleware.ts src/middleware.ts src/app/admin/page.tsx src/app/admin/login/page.tsx
git commit -m "feat: add Supabase admin auth shell"
```

## Task 4: Add public event dashboard shell and tests

**Files:**
- Create: `src/app/events/[slug]/page.tsx`
- Create: `src/test/public-shell.test.tsx`

- [ ] **Step 1: Write failing public shell render test**

`src/test/public-shell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PublicEventPage from "@/app/events/[slug]/page";

describe("PublicEventPage", () => {
  it("renders a view-only leaderboard-first event shell", async () => {
    const ui = await PublicEventPage({ params: Promise.resolve({ slug: "demo" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
    expect(screen.getByText("View-only public event"));
    expect(screen.getByText("Current and upcoming matches"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/test/public-shell.test.tsx
```

Expected: FAIL because the public event page does not exist or jest-dom matchers are not configured.

- [ ] **Step 3: Add public event page**

`src/app/events/[slug]/page.tsx`:

```tsx
type PublicEventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="rounded-xl bg-blue-600 p-6 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-100">View-only public event</p>
        <h1 className="mt-2 text-3xl font-bold">Event: {slug}</h1>
        <p className="mt-2 text-blue-100">Leaderboard updates after refresh. Auto-refresh arrives in a later slice.</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <button className="rounded-lg border border-slate-300 px-4 py-2 font-semibold" type="button">
            Refresh
          </button>
        </div>
        <p className="mt-3 text-slate-600">No scores yet.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Current and upcoming matches</h2>
        <p className="mt-3 text-slate-600">Matches will appear here after an admin creates the schedule.</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Configure jest-dom matcher setup**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Modify `vitest.config.ts` to:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
npm test
npm run typecheck
```

Expected: both commands exit with code 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/events/[slug]/page.tsx src/test/public-shell.test.tsx src/test/setup.ts vitest.config.ts
git commit -m "feat: add public event dashboard shell"
```

## Task 5: Add setup documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

`README.md`:

```md
# Ricanos

Ricanos is a mobile-first padel community event manager for Americano and Mexicano formats.

## Stack

- Next.js App Router
- TypeScript
- Supabase Auth/Postgres
- Drizzle ORM
- Tailwind CSS
- Vitest

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in Supabase and database values in `.env.local`.

4. Run development server:

   ```bash
   npm run dev
   ```

## Verification

```bash
npm test
npm run typecheck
npm run build
```

## Product docs

- PRD: `docs/prd-padel-community-platform.md`
- Proposed issues: `docs/issues/proposed-issues.md`
```

- [ ] **Step 2: Run final verification**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: commands exit with code 0 when required environment variables are configured.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add project setup instructions"
```

## Self-Review

- This plan implements Issue 1 only: app bootstrap, admin auth shell, public shell, env/database seams, and docs.
- It intentionally does not implement event CRUD, player roster, scheduling, leaderboard logic, score entry, audit log, CSV export, or deployment.
- It creates testable seams for environment reading and public view-only shell rendering.
- It uses small vertical slices with commits after each task.
