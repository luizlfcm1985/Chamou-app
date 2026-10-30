import type { Metadata, Viewport } from "next";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "Chamou: currículo pronto pra ser chamado",
  description:
    "Monte seu currículo pelo celular, escolha um modelo profissional e baixe em Word. Pagamento único, sem assinatura.",
  icons: { icon: "/icon.svg", apple: "/app-icon.svg" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Chamou: currículo pronto pra ser chamado",
    description: "Monte pelo celular e baixe em Word. Pagamento único, sem assinatura.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12172B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Figtree:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
