import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORVIAN | Moda Fitness Feminina",
  description: "Moda fitness feminina para acompanhar seu ritmo. Orvian — vista sua melhor versão."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}