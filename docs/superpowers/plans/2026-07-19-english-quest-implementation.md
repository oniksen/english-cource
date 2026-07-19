# English Quest — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build English Quest — an RPG-powered English learning platform with authentication, approval system, world map, dungeon lessons, XP progression, skills, achievements, and daily quests.

**Architecture:** Next.js App Router + Supabase (PostgreSQL + Auth) + shadcn/ui with custom RPG theme. Game logic isolated from UI layer for swappable design system.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, TanStack Query, Zustand, Supabase

## Global Constraints

- TypeScript strict mode enabled
- All design tokens in CSS variables under `theme/`
- `components/ui/` — only generic shadcn components, no game logic
- `components/game/` — game components, imports only from `components/ui/`
- `is_active` flag on all content entities for feature toggles
- Speaking & Writing stages have `is_active = false` by default
- Approval system: `pending` → `approved` / `rejected` flow
- Branch: `feat/english-quest-rpg-platform`

---

### Task 1: Initialize Next.js + Tailwind + shadcn/ui + Framer Motion + TanStack Query + Zustand

**Files:**
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Modify: `package.json` (add deps)
- Modify: `src/app/page.tsx`

**Deps to install:**
```json
{
  "next": "^15",
  "react": "^19",
  "react-dom": "^19",
  "typescript": "^5",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "framer-motion": "^12",
  "@tanstack/react-query": "^5",
  "zustand": "^5",
  "class-variance-authority": "^0.7",
  "clsx": "^2",
  "tailwind-merge": "^3",
  "lucide-react": "^0.500",
  "next-themes": "^0.4"
}
```

**Steps:**

- [ ] **Step 1:** Install all deps

```bash
npm install next@latest react@latest react-dom@latest typescript@latest tailwindcss@latest @tailwindcss/postcss@latest framer-motion@latest @tanstack/react-query@latest zustand@latest class-variance-authority@latest clsx@latest tailwind-merge@latest lucide-react@latest next-themes@latest
```

- [ ] **Step 2:** Init shadcn/ui

```bash
npx shadcn@latest init -d --force
```

- [ ] **Step 3:** Add base shadcn components we need

```bash
npx shadcn@latest add button card progress avatar badge separator scroll-area
```

- [ ] **Step 4:** Create `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 5:** Create `src/app/layout.tsx` with QueryClient provider, ThemeProvider, and RPG-themed globals.css import

```tsx
import type { Metadata } from "next";
import { Inter, Cinzel_Decorative } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "English Quest",
  description: "An RPG-powered English learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6:** Create `src/lib/utils.ts` (cn helper)

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7:** Create `src/components/providers/query-provider.tsx`

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**Deliverable:** `npm run dev` starts with no errors, dark theme renders.

---

### Task 2: RPG Theme — CSS Variables & Theme System

**Files:**
- Create: `src/theme/tokens.css`
- Create: `src/theme/themes/rpg.css`
- Modify: `src/app/globals.css`

**RPG Theme Tokens:**

```css
/* src/theme/tokens.css */
@layer base {
  :root {
    --background: 0 0% 4%;
    --foreground: 0 0% 95%;
    --card: 240 6% 10%;
    --card-foreground: 0 0% 95%;
    --popover: 240 6% 10%;
    --popover-foreground: 0 0% 95%;
    --primary: 42 70% 55%;
    --primary-foreground: 0 0% 4%;
    --secondary: 240 6% 14%;
    --secondary-foreground: 0 0% 95%;
    --muted: 240 6% 20%;
    --muted-foreground: 240 5% 65%;
    --accent: 190 100% 50%;
    --accent-foreground: 0 0% 4%;
    --destructive: 350 100% 55%;
    --destructive-foreground: 0 0% 95%;
    --success: 150 100% 50%;
    --success-foreground: 0 0% 4%;
    --border: 240 6% 20%;
    --input: 240 6% 20%;
    --ring: 42 70% 55%;
    --radius: 0.5rem;
    --font-heading: "Cinzel Decorative", serif;
    --font-body: "Inter", sans-serif;
  }
}
```

**Steps:**

- [ ] **Step 1:** Create `src/theme/tokens.css` with all CSS variables (HSL format for shadcn compatibility)
- [ ] **Step 2:** Create `src/theme/themes/rpg.css` with RPG-specific styles (glow effects, custom progress bars, gold borders, health bar gradients)
- [ ] **Step 3:** Update `src/app/globals.css` to import theme tokens and add base layer styles with shadcn compatibility
- [ ] **Step 4:** Test that shadcn components render with RPG colors

---

### Task 3: Supabase Schema — SQL Migrations

**Files:**
- Create: `supabase/migrations/00001_initial_schema.sql`
- Create: `src/types/database.ts`

**Tables to create:**
- `cefr_levels`, `sublevels`, `modules`, `lessons`, `lesson_stages`
- `vocabulary_items`
- `user_profiles`, `user_roles`, `user_approvals`
- `user_progress`, `user_xp`, `user_skills`, `user_streaks`
- `achievements`, `user_achievements`
- `daily_quests`, `user_daily_quests`
- `review_queue`

**Steps:**

- [ ] **Step 1:** Write migration SQL with all tables, RLS policies, and indexes

```sql
-- Core content tables
CREATE TABLE cefr_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  is_active boolean DEFAULT true
);

CREATE TABLE sublevels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cefr_level_id uuid REFERENCES cefr_levels(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  is_active boolean DEFAULT true
);

CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sublevel_id uuid REFERENCES sublevels(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  difficulty integer DEFAULT 1,
  estimated_minutes integer,
  xp_reward integer DEFAULT 0,
  icon text,
  is_active boolean DEFAULT true
);

CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  xp_reward integer DEFAULT 0,
  is_active boolean DEFAULT true
);

CREATE TABLE lesson_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'boss')),
  title text NOT NULL,
  order_index integer NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true
);

CREATE TABLE vocabulary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  word text NOT NULL,
  translation text NOT NULL,
  example_sentence text,
  part_of_speech text
);

-- User & auth tables
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  title text DEFAULT 'Novice',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

CREATE TABLE user_approvals (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  reject_reason text
);

-- Progress tables
CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id uuid REFERENCES lesson_stages(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  xp_earned integer NOT NULL DEFAULT 0,
  score integer,
  attempts integer DEFAULT 1,
  UNIQUE(user_id, stage_id)
);

CREATE TABLE user_xp (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  xp_to_next_level integer DEFAULT 100
);

CREATE TABLE user_skills (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  grammar integer DEFAULT 0,
  vocabulary integer DEFAULT 0,
  listening integer DEFAULT 0,
  reading integer DEFAULT 0,
  speaking integer DEFAULT 0,
  writing integer DEFAULT 0,
  pronunciation integer DEFAULT 0
);

CREATE TABLE user_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_active_date date
);

-- Achievements & quests
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  category text NOT NULL,
  required_count integer NOT NULL DEFAULT 1,
  xp_reward integer DEFAULT 0,
  is_hidden boolean DEFAULT false
);

CREATE TABLE user_achievements (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  current_count integer DEFAULT 0,
  unlocked_at timestamptz,
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  requirement_type text NOT NULL,
  required_count integer NOT NULL,
  xp_reward integer DEFAULT 0,
  is_active boolean DEFAULT true
);

CREATE TABLE user_daily_quests (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id uuid REFERENCES daily_quests(id) ON DELETE CASCADE,
  date date NOT NULL,
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  PRIMARY KEY (user_id, quest_id, date)
);

CREATE TABLE review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewable_type text NOT NULL,
  reviewable_id uuid NOT NULL,
  next_review_at timestamptz NOT NULL DEFAULT now(),
  interval_days integer DEFAULT 1,
  ease_factor real DEFAULT 2.5
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users read own approval" ON user_approvals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own xp" ON user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own skills" ON user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own quests" ON user_daily_quests FOR SELECT USING (auth.uid() = user_id);

-- Content tables are readable by all authenticated users
ALTER TABLE cefr_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sublevels ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users read cefr" ON cefr_levels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users read sublevels" ON sublevels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users read modules" ON modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users read lessons" ON lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users read stages" ON lesson_stages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users read vocab" ON vocabulary_items FOR SELECT USING (auth.role() = 'authenticated');

-- Admin can read all approvals
CREATE POLICY "Admin read approvals" ON user_approvals FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update approvals" ON user_approvals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Insert on signup
CREATE POLICY "Users insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Insert own approval" ON user_approvals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Insert own xp" ON user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Insert own skills" ON user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Insert own streaks" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers: auto-create profile, xp, skills, streaks on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, username, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'username');
  INSERT INTO user_roles (user_id, role) VALUES (new.id, 'user');
  INSERT INTO user_approvals (user_id, status) VALUES (new.id, 'pending');
  INSERT INTO user_xp (user_id) VALUES (new.id);
  INSERT INTO user_skills (user_id) VALUES (new.id);
  INSERT INTO user_streaks (user_id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

- [ ] **Step 2:** Apply migration via Supabase

```bash
npx supabase migration new initial_schema
# copy SQL above into the migration file
npx supabase db push
```

- [ ] **Step 3:** Generate TypeScript types from Supabase

```bash
npx supabase gen types typescript --local > src/types/database.ts
```

---

### Task 4: Auth Pages (Login / Register)

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/lib/auth/actions.ts`

**Auth Actions:**

```typescript
// src/lib/auth/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const supabase = await createClient();
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/pending");
}
```

**Steps:**
- [ ] **Step 1:** Create `src/lib/auth/actions.ts` with login/register server actions
- [ ] **Step 2:** Create `src/app/(auth)/layout.tsx` (centered card layout with RPG theme, English Quest logo)
- [ ] **Step 3:** Create `src/app/(auth)/login/page.tsx` (email + password form, link to register)
- [ ] **Step 4:** Create `src/app/(auth)/register/page.tsx` (username + email + password form, link to login)

---

### Task 5: Approval System — Middleware + Pending Page

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/(auth)/pending/page.tsx`
- Create: `src/app/(auth)/error/page.tsx`

**Middleware:**

```typescript
// src/middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Steps:**

- [ ] **Step 1:** Create `src/lib/supabase/middleware.ts` with session update logic
- [ ] **Step 2:** Create `src/middleware.ts` that checks user approval status
- [ ] **Step 3:** Create `src/app/(auth)/pending/page.tsx` ("Your account is pending approval" page with RPG-styled message)
- [ ] **Step 4:** Test the full auth flow

---

### Task 6: Admin Approval Panel

**Files:**
- Create: `src/app/admin/approvals/page.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/lib/admin/actions.ts`

**Steps:**

- [ ] **Step 1:** Create `src/lib/admin/actions.ts` with `approveUser(userId)` and `rejectUser(userId, reason)` server actions
- [ ] **Step 2:** Create `src/app/admin/layout.tsx` (admin layout with sidebar, protected by role check)
- [ ] **Step 3:** Create `src/app/admin/approvals/page.tsx` (table of pending users with approve/reject buttons)

---

### Task 7: Dashboard — Character Header

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/components/dashboard/character-header.tsx`
- Create: `src/components/game/xp-bar.tsx`
- Create: `src/lib/game/xp.ts`

**XP System:**

```typescript
// src/lib/game/xp.ts
export function xpToNextLevel(level: number): number {
  if (level >= 100) return 0;
  const base = [100, 120, 150, 200, 250, 300, 400, 500, 600, 800];
  const tier = Math.min(Math.floor((level - 1) / 10), base.length - 1);
  return level * base[tier];
}

export function getTitle(level: number): string {
  if (level >= 100) return "Native-like";
  const tiers = [
    [1, "Novice"], [10, "Explorer"], [20, "Scholar"],
    [30, "Linguist"], [40, "Communicator"], [50, "Fluent"],
    [60, "Master"], [70, "Elite"], [80, "Professor"], [90, "Legend"],
  ];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (level >= tiers[i][0]) return tiers[i][1];
  }
  return "Novice";
}
```

**Steps:**

- [ ] **Step 1:** Create `src/lib/game/xp.ts` with XP formulas
- [ ] **Step 2:** Create `src/components/game/xp-bar.tsx` (health/mana-style XP bar with gold gradient)
- [ ] **Step 3:** Create `src/components/dashboard/character-header.tsx` (avatar, level badge, XP bar, streak fire icon, title)
- [ ] **Step 4:** Create `src/app/dashboard/layout.tsx` (authenticated layout with sidebar navigation)
- [ ] **Step 5:** Create `src/app/dashboard/page.tsx` (assembles header + stats + quests)

---

### Task 8: Dashboard — Skills Panel & Stats Widget

**Files:**
- Create: `src/components/dashboard/stats-panel.tsx`
- Create: `src/components/game/skill-stat.tsx`

**Steps:**

- [ ] **Step 1:** Create `src/components/game/skill-stat.tsx` (single skill with name, progress bar, percentage — uses shadcn `<Progress />`)
- [ ] **Step 2:** Create `src/components/dashboard/stats-panel.tsx` (grid of all 7 skills with RPG-themed styling)

---

### Task 9: Dashboard — Daily Quests Widget

**Files:**
- Create: `src/components/dashboard/daily-quests.tsx`
- Create: `src/lib/quests/daily.ts`

**Steps:**

- [ ] **Step 1:** Create `src/lib/quests/daily.ts` with daily quest assignment logic
- [ ] **Step 2:** Create `src/components/dashboard/daily-quests.tsx` (quest cards with progress)

---

### Task 10: World Map

**Files:**
- Create: `src/app/map/page.tsx`
- Create: `src/components/map/world-map.tsx`
- Create: `src/components/map/region-node.tsx`

**Steps:**

- [ ] **Step 1:** Create `src/components/map/region-node.tsx` (single CEFR region node with progress %, lock state, hover glow)
- [ ] **Step 2:** Create `src/components/map/world-map.tsx` (connected region nodes in RPG-themed SVG layout)
- [ ] **Step 3:** Create `src/app/map/page.tsx` (full screen world map with animated connections)

---

### Task 11: Seed Curriculum Data

**Files:**
- Create: `scripts/seed-curriculum.ts`
- Create: `src/lib/supabase/seed-client.ts`

**Steps:**

- [ ] **Step 1:** Write seed script that reads `src/data/curriculum.yaml` and inserts all levels/sublevels/modules/lessons/stages/vocabulary into Supabase using the Supabase JS client
- [ ] **Step 2:** Run seed script

```bash
npx tsx scripts/seed-curriculum.ts
```

---

### Task 12: Module (Dungeon) Page

**Files:**
- Create: `src/app/modules/[id]/page.tsx`
- Create: `src/components/game/dungeon-lesson-list.tsx`
- Create: `src/components/game/lesson-card.tsx`

**Steps:**

- [ ] **Step 1:** Create `src/components/game/lesson-card.tsx` (lesson card with difficulty stars, XP reward, completion status)
- [ ] **Step 2:** Create `src/components/game/dungeon-lesson-list.tsx` (list of lessons with locked/unlocked states)
- [ ] **Step 3:** Create `src/app/modules/[id]/page.tsx` (dungeon header + lesson list + boss fight teaser)

---

### Task 13: Lesson Page — Stage Navigation

**Files:**
- Create: `src/app/lessons/[id]/page.tsx`
- Create: `src/components/lesson/stage-navigator.tsx`
- Create: `src/components/lesson/stage-progress.tsx`

**Steps:**

- [ ] **Step 1:** Create `src/components/lesson/stage-progress.tsx` (1/7, 2/7... progress with dungeon theme)
- [ ] **Step 2:** Create `src/components/lesson/stage-navigator.tsx` (switches between stages)
- [ ] **Step 3:** Create `src/app/lessons/[id]/page.tsx` (lesson wrapper with stage navigation)

---

### Task 14: Stage Renderers (Vocabulary, Grammar, Reading, Listening)

**Files:**
- Create: `src/components/lesson/stage-renderer.tsx`
- Create: `src/components/lesson/vocabulary-stage.tsx`
- Create: `src/components/lesson/grammar-stage.tsx`
- Create: `src/components/lesson/reading-stage.tsx`
- Create: `src/components/lesson/listening-stage.tsx`

**Steps:**

- [ ] **Step 1:** Create vocabulary stage (match, multiple choice, fill gap)
- [ ] **Step 2:** Create grammar stage (fill gap, transform, error hunt)
- [ ] **Step 3:** Create reading stage (T/F/NG, multiple choice)
- [ ] **Step 4:** Create listening stage (fill gap in transcript)
- [ ] **Step 5:** Create stage renderer that dispatches to the right component based on `type`

---

### Task 15: Boss Fight

**Files:**
- Create: `src/components/lesson/boss-stage.tsx`
- Create: `src/components/game/boss-health-bar.tsx`

**Steps:**

- [ ] **Step 1:** Create boss health bar (RPG-style HP bar with red gradient, damage animation)
- [ ] **Step 2:** Create boss stage (mixed questions, timer, HP mechanic)

---

### Task 16: XP & Skill Engine

**Files:**
- Create: `src/lib/game/xp-actions.ts`
- Create: `src/lib/game/skills-actions.ts`

**Steps:**

- [ ] **Step 1:** Create XP awarding server action (award xp → check level up → check achievements)
- [ ] **Step 2:** Create skill update server action (skill points from stage completion)
- [ ] **Step 3:** Integrate into stage completion flow

---

### Task 17: Achievement System

**Files:**
- Create: `src/app/achievements/page.tsx`
- Create: `src/components/game/achievement-card.tsx`
- Create: `src/lib/game/achievement-actions.ts`

**Steps:**

- [ ] **Step 1:** Create achievement check engine
- [ ] **Step 2:** Create achievement card component
- [ ] **Step 3:** Create `/achievements` page with categories

---

### Task 18: Streak Tracking

**Files:**
- Create: `src/lib/game/streak-actions.ts`

**Steps:**

- [ ] **Step 1:** Create streak update on daily login
- [ ] **Step 2:** Integrate with dashboard header

---

### Task 19: Daily Quest Logic

**Files:**
- Create: `src/lib/quests/quest-actions.ts`

**Steps:**

- [ ] **Step 1:** Create daily quest assignment (pick 3-4 quests per day)
- [ ] **Step 2:** Create progress tracking for quests
- [ ] **Step 3:** Integrate with dashboard

---

### Task 20: Framer Motion Animations

**Files:**
- Modify: `src/components/game/xp-bar.tsx`
- Modify: `src/components/lesson/stage-navigator.tsx`
- Create: `src/components/shared/animations.tsx`

**Steps:**

- [ ] **Step 1:** Create reusable animation components (fade-in, slide-up, XP counter animation)
- [ ] **Step 2:** Add stage transition animations
- [ ] **Step 3:** Add level-up celebration animation

---

### Task 21: Profile Page

**Files:**
- Create: `src/app/profile/page.tsx`
- Create: `src/components/dashboard/activity-calendar.tsx`

**Steps:**

- [ ] **Step 1:** Create profile page with all stats, skills, achievements, activity calendar
- [ ] **Step 2:** Create GitHub-style activity heatmap

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-19-english-quest-implementation.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — execute in this session using executing-plans skill, batch execution with checkpoints

Which approach?
