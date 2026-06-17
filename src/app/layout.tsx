import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Montserrat, Sora } from "next/font/google";
import { LocaleProvider } from "@/components/bscl/locale-provider";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "BSCL — Black Squad Competitive League",
    template: "%s · BSCL",
  },
  description:
    "Black Squad's dedicated competitive league. 5v5 PUGs, ELO rankings, teams, and tournaments.",
  metadataBase: new URL("https://bscl.gg"),
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${montserrat.variable} ${sora.variable} ${jetbrains.variable} min-h-dvh min-h-svh overflow-x-hidden`}
      >
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
