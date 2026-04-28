import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dwpgthprluxlrsrapcyv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cGd0aHBybHV4bHJzcmFwY3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjk2MDksImV4cCI6MjA5MjkwNTYwOX0.vyccpwArHC8iWg5LKvUsTMmcCnD9VfPlrj8LFKah8E4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);