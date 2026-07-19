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
