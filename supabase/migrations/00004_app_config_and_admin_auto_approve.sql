CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO app_config (key, value) VALUES ('admin_email', 'bardakov.roman99@gmail.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read app_config" ON app_config
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users manage app_config" ON app_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_admin_email text;
BEGIN
  INSERT INTO user_profiles (id, username, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'username');

  SELECT value INTO v_admin_email FROM app_config WHERE key = 'admin_email';

  IF new.email = v_admin_email THEN
    INSERT INTO user_roles (user_id, role) VALUES (new.id, 'admin');
    INSERT INTO user_approvals (user_id, status) VALUES (new.id, 'approved');
  ELSE
    INSERT INTO user_roles (user_id, role) VALUES (new.id, 'user');
    INSERT INTO user_approvals (user_id, status) VALUES (new.id, 'pending');
  END IF;

  INSERT INTO user_xp (user_id) VALUES (new.id);
  INSERT INTO user_skills (user_id) VALUES (new.id);
  INSERT INTO user_streaks (user_id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
