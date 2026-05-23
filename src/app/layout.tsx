import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SessionProvider } from "@/components/providers/session-provider";
import { CartProvider } from "@/components/providers/cart-context";
import { UIProvider } from "@/components/ui";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "KelectronicaEC | Hardware & PC Master Race",
  description: "Tu arsenal tecnológico en Ecuador. Las mejores computadoras y componentes para tu setup. Ensamblaje personalizado de alto nivel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`h-full ${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <UIProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </UIProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
