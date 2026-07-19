"use server";

import { createClient } from "@/lib/supabase/server";

export async function getStreak(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}
