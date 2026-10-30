import Link from "next/link";

export function Marca({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Chamou" focusable="false">
      <path
        fill="var(--brand)"
        d="M20 6H44A16 16 0 0 1 60 22V34A16 16 0 0 1 44 50H28L12 60L14 48.8A16 16 0 0 1 4 34V22A16 16 0 0 1 20 6Z"
      />
      <path fill="none" stroke="#12172B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" d="M21 29L29 37L44 20" />
    </svg>
  );
}

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="logo" aria-label="Chamou, página inicial">
      <Marca />
      <span>Chamou</span>
    </Link>
  );
}
