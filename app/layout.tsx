import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Atelier de formulaires | Création et réponses",
  description:
    "Créez des formulaires et recueillez leurs réponses dans votre navigateur.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
