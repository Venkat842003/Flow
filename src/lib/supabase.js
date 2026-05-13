import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://woiekqvfmevvivbfmmuh.supabase.co";
const supabaseKey = "sb_publishable_YwlhtMfXGNy-pGoZcKZZPg_Oq7VDCMc";

export const supabase = createClient(supabaseUrl, supabaseKey);
