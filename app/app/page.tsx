import { redirect } from "next/navigation";
import Editor, { type Ent } from "@/components/Editor";
import { getUser, isAdmin } from "@/lib/auth";
import { sanitizeResume } from "@/lib/resume";
import { isTemplateId, type TemplateId } from "@/lib/templates";

export const metadata = { title: "Meu currículo | Chamou" };
export const dynamic = "force-dynamic";

export default async function AppPage({ searchParams }: { searchParams: Promise<{ pago?: string }> }) {
  const { sb, user } = await getUser();
  if (!user) redirect("/entrar?next=/app");
  const { pago } = await searchParams;

  const [{ data: r }, { data: e }] = await Promise.all([
    sb.from("resumes").select("data, template").eq("user_id", user.id).maybeSingle(),
    sb.from("entitlements").select("can_download, ai_credits, cover_letter_credits, linkedin_credits").eq("user_id", user.id).maybeSingle(),
  ]);

  const dados = sanitizeResume(r?.data);
  if (!dados.email && user.email) dados.email = user.email;
  const modelo: TemplateId = isTemplateId(r?.template) ? r!.template : "classico";
  const ent: Ent = e ?? { can_download: false, ai_credits: 0, cover_letter_credits: 0, linkedin_credits: 0 };

  return <Editor userId={user.id} initial={dados} initialTemplate={modelo} ent={ent} pago={pago === "1"} admin={isAdmin(user.email)} />;
}
