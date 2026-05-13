import { supabase } from "../lib/supabase";

export default async function getSteps(issue_id) {
  const { data, error } = await supabase
    .from("steps")
    .select("*")
    .eq("issue_id", issue_id)
    .order("order", { ascending: true });
  if (error) {
    console.error(error.message);
    return [];
  }

  return data || [];
}
