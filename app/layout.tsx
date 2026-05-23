import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/components/providers/query-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Auto Garden — Workshop Management",
    template: "%s | Auto Garden",
  },
  description: "Auto Garden Pvt. Ltd. — Workshop Management System, Bharatpur, Chitwan",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "var(--font-geist-sans)",
                },
              }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}