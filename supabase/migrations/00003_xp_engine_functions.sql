CREATE OR REPLACE FUNCTION increment_skill(p_user_id uuid, p_skill text, p_points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format(
    'UPDATE user_skills SET %I = COALESCE(%I, 0) + $1 WHERE user_id = $2',
    p_skill, p_skill
  ) USING p_points, p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION award_xp(p_user_id uuid, p_xp integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_xp SET total_xp = total_xp + p_xp WHERE user_id = p_user_id;
END;
$$;
