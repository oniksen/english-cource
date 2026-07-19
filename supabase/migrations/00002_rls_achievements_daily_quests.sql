ALTER TABLE IF EXISTS public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users read achievements" ON public.achievements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users read daily quests" ON public.daily_quests
  FOR SELECT USING (auth.role() = 'authenticated');
