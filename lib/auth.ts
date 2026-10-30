import { supabaseServer } from "./supabase/server";

export async function getUser() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return { sb, user };
}

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const lista = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return lista.includes(email.toLowerCase());
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
