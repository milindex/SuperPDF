import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SwProvider } from "@/components/SwProvider";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import "./globals.scss";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuperPDF",
  description: "Free, browser-native PDF tools. Your files never leave your device.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        <SwProvider>
          <div className="app-shell">
            <Header />
            <main className="app-content">{children}</main>
            <Footer />
          </div>
        </SwProvider>
      </body>
    </html>
  );
}
