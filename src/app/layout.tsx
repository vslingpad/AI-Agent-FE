import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nelto",
  description:
    "Nelto resolves support requests from start to finish. It checks your policy, makes the change in your systems and confirms the outcome with the customer. When a request is outside your rules, it hands off to your team with the work done. Start your free trial today.",
  openGraph: {
    title: "Nelto",
    description:
      "Nelto resolves support requests from start to finish. It checks your policy, makes the change in your systems and confirms the outcome with the customer. When a request is outside your rules, it hands off to your team with the work done. Start your free trial today.",
    images: ["/logo.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/favicon-light.png",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
      },
      {
        url: "/favicon-dark.png",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <ClerkProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
