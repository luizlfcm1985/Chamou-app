import { createClient } from "@supabase/supabase-js";

// Cliente com chave de serviço: ignora as regras de acesso do banco. Usar SÓ em rotas de servidor.
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
