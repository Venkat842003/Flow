import { supabase } from "../lib/supabase";

export async function getIssueById(id) {
  const {data} = await supabase.from("issues").select().eq("id", id).single();
  return data;
}
