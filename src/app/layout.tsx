/**
 * app/layout.tsx
 *
 * Root Layout — Server Component.
 * Δεν περιέχει Client-side λογική — μόνο HTML skeleton,
 * γραμματοσειρές και το Providers wrapper.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers }   from "@/components/layout/Providers";
import { AppSidebar }  from "@/components/layout/Sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

// ── Γραμματοσειρές ────────────────────────────────────────────
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets:  ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets:  ["latin"],
});

// ── Metadata ──────────────────────────────────────────────────
export const metadata: Metadata = {
  title:       "StaffSync — Διαχείριση Ωραρίου",
  description: "Σύστημα διαχείρισης ωραρίου και βαρδιών εργαζομένων",
};

// ── Root Layout ───────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="el">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        {/*
          Providers: τυλίγει ΟΛΑ με TooltipProvider + ScheduleProvider + SidebarProvider.
          Είναι "use client" αρχείο — γι' αυτό το βάλαμε ξεχωριστά.
        */}
        <Providers>
          <AppSidebar />

          <main className="flex flex-col flex-1 min-h-svh">
            <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">StaffSync</span>
                <span className="text-muted-foreground text-sm">
                  — Διαχείριση Ωραρίου Εργαζομένων
                </span>
              </div>
            </header>

            <div className="flex-1 p-6">
              {children}
            </div>
          </main>
        </Providers>

      </body>
    </html>
  );
}