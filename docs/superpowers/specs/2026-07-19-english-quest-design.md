# English Quest — Design Specification

> An RPG-powered English learning platform. A1–C1 CEFR curriculum with character progression.

## Tech Stack

- **Runtime:** Node.js (Next.js)
- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict)
- **UI:** Tailwind CSS, shadcn/ui, Framer Motion
- **State:** Zustand (client), TanStack Query (server state)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email + magic link, Google OAuth, GitHub OAuth)
- **Storage:** Supabase Storage
- **Deployment:** Vercel

## MVP Scope (Phase 1)

1. Authentication (register / login / pending approval)
2. Admin approval system (moderate new users)
3. Character Dashboard (avatar, level, XP bar, streak, stats)
4. World Map (CEFR levels A1 → C1 as clickable regions)
5. Module (Dungeon) page with lesson list
6. Lesson page with stages (vocab → grammar → reading → listening → boss)
7. XP & level-up system (1–100, titles)
8. Skill stats (Grammar, Vocabulary, Listening, Reading, Speaking, Writing, Pronunciation)
9. Basic achievements (first lesson, 100 words, etc.)
10. Daily quests (3–4 per day)
11. Review queue (failed vocabulary/grammar → spaced repetition)

## Architecture

### Next.js App Router Structure

```
src/
├── app/
│   ├── (auth)/login/        # login page
│   ├── (auth)/register/     # register page
│   ├── (auth)/pending/      # pending approval page
│   ├── dashboard/           # main dashboard
│   ├── map/                 # world map
│   ├── modules/[id]/        # module (dungeon) page
│   ├── lessons/[id]/        # lesson with stages
│   ├── admin/approvals/     # user approval panel
│   ├── profile/             # character profile, achievements
│   └── layout.tsx           # root layout with theme
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # dashboard widgets
│   ├── map/                 # world map components
│   ├── lesson/              # stage renderers
│   ├── admin/               # admin panel components
│   └── shared/              # reusable components
├── lib/
│   ├── supabase/client.ts   # browser client
│   ├── supabase/server.ts   # server client
│   ├── game/xp.ts           # XP formulas, level-up logic
│   ├── game/skills.ts       # skill calculation
│   └── quests/daily.ts      # daily quest generation
├── hooks/
│   ├── use-user.ts          # user data
│   ├── use-xp.ts            # XP hooks
│   └── use-progress.ts      # lesson/module progress
├── types/
│   └── database.ts          # Supabase types
└── data/
    └── curriculum.yaml      # full A1–C1 curriculum plan
```

### Database Schema (Supabase)

#### Core Content Tables

```sql
cefr_levels
  id: uuid PK
  code: text UNIQUE (A1, A2, B1, B2, C1)
  title: text
  description: text
  order_index: integer
  is_active: boolean default true

sublevels
  id: uuid PK
  cefr_level_id: uuid FK
  code: text (A1.1, A1.2, ...)
  title: text
  order_index: integer
  is_active: boolean default true

modules
  id: uuid PK
  sublevel_id: uuid FK
  title: text
  description: text
  order_index: integer
  difficulty: integer (1–5)
  estimated_minutes: integer
  xp_reward: integer
  icon: text
  is_active: boolean default true

lessons
  id: uuid PK
  module_id: uuid FK
  title: text
  description: text
  order_index: integer
  xp_reward: integer
  is_active: boolean default true

lesson_stages
  id: uuid PK
  lesson_id: uuid FK
  type: text (vocabulary, grammar, reading, listening, speaking, writing, boss)
  title: text
  order_index: integer
  content: jsonb  (type-specific content)
  is_active: boolean default true

  -- is_active = false for speaking/writing by default (future AI check)
```

#### Vocabulary & Content

```sql
vocabulary_items
  id: uuid PK
  lesson_id: uuid FK
  word: text
  translation: text
  example_sentence: text
  part_of_speech: text
```

#### User & Progress

```sql
user_profiles
  id: uuid PK (references auth.users)
  username: text UNIQUE
  display_name: text
  avatar_url: text
  title: text
  created_at: timestamptz

user_roles
  user_id: uuid PK FK
  role: text (admin | user)

user_approvals
  user_id: uuid PK FK
  status: text (pending | approved | rejected)
  requested_at: timestamptz
  reviewed_by: uuid FK nullable
  reviewed_at: timestamptz nullable
  reject_reason: text nullable

user_progress
  id: uuid PK
  user_id: uuid FK
  stage_id: uuid FK
  completed_at: timestamptz
  xp_earned: integer
  score: integer nullable (0–100)
  attempts: integer default 1

user_xp
  user_id: uuid PK FK
  total_xp: integer default 0
  level: integer default 1
  xp_to_next: integer default 100

user_skills
  user_id: uuid PK FK
  grammar: integer default 0
  vocabulary: integer default 0
  listening: integer default 0
  reading: integer default 0
  speaking: integer default 0
  writing: integer default 0
  pronunciation: integer default 0

user_streaks
  user_id: uuid PK FK
  current_streak: integer default 0
  longest_streak: integer default 0
  last_active_date: date
```

#### Achievements & Quests

```sql
achievements
  id: uuid PK
  code: text UNIQUE
  title: text
  description: text
  icon: text
  category: text (beginner, grammar, vocabulary, speaking, listening, consistency, hidden)
  required_count: integer
  xp_reward: integer
  is_hidden: boolean default false

user_achievements
  user_id: uuid PK FK
  achievement_id: uuid PK FK
  current_count: integer default 0
  unlocked_at: timestamptz nullable

daily_quests
  id: uuid PK
  title: text
  description: text
  requirement_type: text (complete_lessons, learn_words, speak_minutes, review_lessons)
  required_count: integer
  xp_reward: integer
  is_active: boolean default true

user_daily_quests
  user_id: uuid PK FK
  quest_id: uuid PK FK
  date: date PK
  progress: integer default 0
  completed: boolean default false

-- Review queue for spaced repetition
review_queue
  id: uuid PK
  user_id: uuid FK
  reviewable_type: text (vocabulary | grammar | lesson)
  reviewable_id: uuid
  next_review_at: timestamptz
  interval_days: integer default 1
  ease_factor: real default 2.5
```

### Auth Flow

1. User registers with username, email, password
2. Supabase Auth creates auth.users entry
3. After sign-up, user_approvals row created with status = 'pending'
4. User redirected to /pending page (cannot access other routes)
5. Admin visits /admin/approvals, reviews list
6. Admin approves → status = 'approved', email sent (optional)
7. Admin rejects → status = 'rejected', user cannot login
8. Middleware checks approval status on every protected route

### XP & Level System

```typescript
// Formula
xpToNextLevel(level: number): number {
  if (level >= 100) return Infinity;
  const base = [100, 120, 150, 200, 250, 300, 400, 500, 600, 800];
  const tier = Math.floor((level - 1) / 10);
  return level * base[Math.min(tier, base.length - 1)];
}

// Title based on level
getTitle(level: number): string {
  const tiers = [
    [1, 'Novice'], [10, 'Explorer'], [20, 'Scholar'],
    [30, 'Linguist'], [40, 'Communicator'], [50, 'Fluent'],
    [60, 'Master'], [70, 'Elite'], [80, 'Professor'],
    [90, 'Legend'], [100, 'Native-like']
  ];
  // find matching tier
}
```

### Stage Types & Auto-Grading

| Stage | Grading | Active (MVP) |
|-------|---------|--------------|
| Vocabulary | auto (match, multiple choice, fill gap) | ✅ |
| Grammar | auto (fill gap, transform, error hunt) | ✅ |
| Reading | auto (T/F/NG, multiple choice) | ✅ |
| Listening | auto (fill gap in transcript) | ✅ |
| Speaking | self-assessment (UI ready) | ❌ (skipped) |
| Writing | self-assessment (UI ready) | ❌ (skipped) |
| Boss | auto (mixed types + timer) | ✅ |

### Feature Flags (`is_active`)

Every content entity has `is_active`. When disabled:
- Not rendered in navigation / map / lists
- Skipped in progress tracking (user advances past)
- XP and skill contributions are omitted
- Admins toggle via admin panel

Default state:
- Speaking stages: `is_active = false`
- Writing stages: `is_active = false`
- All CEFR levels above A1: `is_active = false` (enabled one-by-one)

### World Map UI

React Canvas / SVG-based world map showing CEFR regions:
```
Tutorial Island (intro)
    ↓
A1 Village (with sub-regions for modules)
    ↓
A2 Mountains (locked until A1 complete)
    ↓
B1 Kingdom (locked)
    ↓
B2 Empire (locked)
    ↓
C1 Academy (locked)
```

Each region shows completion % and is clickable when unlocked.

### Lesson UI (Dungeon)

```
┌──────────────────────────────┐
│ Present Perfect              │
│ ★★★ Difficulty  35 min       │
│                              │
│ [1/7] Vocabulary  ✅         │
│ [2/7] Grammar     ✅         │
│ [3/7] Reading     ◻          │
│ [4/7] Listening   🔒         │
│ [5/7] Speaking    ⛔ (soon)  │
│ [6/7] Writing     ⛔ (soon)  │
│ [7/7] Boss Fight  🔒         │
└──────────────────────────────┘
```

### Feature Toggle Architecture (per-component)

Instead of complex admin UI for content management, we use **database-driven feature flags**:

- Each entity has `is_active` column
- Admins toggle via simple SQL or future admin UI
- Middleware/content queries filter by `is_active`
- Progress ignores inactive entities (no gaps in user journey)

### Content Delivery

Curriculum is defined in `src/data/curriculum.yaml` as source of truth.
A seed script (`scripts/seed-curriculum.ts`) reads YAML and inserts into Supabase.
This keeps content version-controlled and reviewable.

## Design Decisions

1. **Supabase over Prisma** — existing setup, simpler for serverless
2. **Supabase Auth over Auth.js** — already configured, approval flow built on top
3. **self-assessment for speaking/writing** — reduces cost, feature toggle ready for AI
4. **is_active flags** — flexible content rollout, no code deploys needed
5. **YAML curriculum → DB seed** — content as code, reviewable in PRs
6. **Feature toggle by entity** — not by environment variables, so non-devs can toggle

## Future Phases (Post-MVP)

- AI-powered speaking evaluation (Whisper + Gemini)
- AI-powered writing evaluation (Gemini/Groq)
- Collections (idioms, phrasal verbs, slang — 700+/400+/300+)
- Boss fights with animated health bars
- Seasons, leagues (Bronze → Master)
- Cosmetic rewards (avatars, frames, titles)
- Inventory & badges
- Spaced repetition review queue
- Monthly stats & calendar heatmap
- Hidden achievements
