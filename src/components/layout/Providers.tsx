/**
 * components/layout/Providers.tsx
 *
 * Wrapper για όλους τους Client-side Providers.
 *
 * Γιατί χρειάζεται αυτό το αρχείο:
 * Το layout.tsx είναι Server Component by default στο Next.js.
 * Οι Providers (ScheduleProvider, TooltipProvider, SidebarProvider)
 * χρησιμοποιούν React Context που τρέχει ΜΟΝΟ στον browser (client).
 * Οπότε τους βάζουμε σε ξεχωριστό αρχείο με "use client".
 */

"use client";

import { ReactNode } from "react";
import { TooltipProvider }                from "@/components/ui/tooltip";
import { SidebarProvider }                from "@/components/ui/sidebar";
import { ScheduleProvider }               from "@/context/ScheduleContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ScheduleProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ScheduleProvider>
    </TooltipProvider>
  );
}