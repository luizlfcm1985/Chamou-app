import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Entrar | Chamou" };

function destinoSeguro(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/app";
  return next;
}

export default async function Entrar({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const destino = destinoSeguro(next);
  const { user } = await getUser();
  if (user) redirect(destino);
  return <LoginForm destino={destino} />;
}
