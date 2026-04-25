import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = "https://seqcppglpoxbbiashkdk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcWNwcGdscG94YmJpYXNoa2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NDQwMTMsImV4cCI6MjA5MTIyMDAxM30.QHjl4-AB_5ubJQ90fh83Q82FaZlpAO1cGJCmD7PAABc"; // Settings → API → anon public

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Inscription ───────────────────────────────────────────────
export async function signUp({ email, password, fullName, skinType }) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) throw error;
  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id, full_name: fullName, skin_type: skinType || "Mixte",
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(), nombre_analyses: 0,
    });
  }
  return data;
}

// ── Connexion ─────────────────────────────────────────────────
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ── Déconnexion ───────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Mot de passe oublié ───────────────────────────────────────
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "skinai://reset-password",
  });
  if (error) throw error;
}

// ── Nouveau mot de passe (flow recovery) ──────────────────────
export async function updatePassword(password) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

// ── Utilisateur courant ───────────────────────────────────────
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Profil complet ────────────────────────────────────────────
export async function getUserProfile(userId) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

// ── Mise à jour profil ────────────────────────────────────────
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles").update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId).select().single();
  if (error) throw error;
  return data;
}

// ── Écoute changements auth ───────────────────────────────────
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}
