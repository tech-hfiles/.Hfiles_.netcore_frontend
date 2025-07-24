import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Poppins, Red_Hat_Display } from "next/font/google";
// import "./styles/index4.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const redHat = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-red-hat",
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HFiles",
  description: "health files medico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
 className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${montserrat.variable} ${redHat.variable} antialiased`}
      >
        <div id="global-loader" className="loader-overlay">
          <div className="loader"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
