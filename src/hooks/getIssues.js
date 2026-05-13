import { supabase } from "../lib/supabase";

export default async function getIssues() {
  const { data, error } = await supabase.from("issues").select("*");


  if (error) {
    console.error(error.message);
  }else{
    return data
  }
}
