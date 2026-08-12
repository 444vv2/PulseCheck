import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "PulseCheck",
  description: "Availability monitoring for websites and APIs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
