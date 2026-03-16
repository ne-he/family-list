import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family ToDo",
  description: "Manajemen tugas harian keluarga",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
