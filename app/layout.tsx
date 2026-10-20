import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrvianPlace | Inteligência comercial",
  description: "Painel privado de gestão de catálogo, fornecedores e rentabilidade da ORVIAN."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}