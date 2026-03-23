/**
 * components/layout/Sidebar.tsx
 *
 * Πλαϊνό μενού πλοήγησης της εφαρμογής StaffSync.
 *
 * Χρησιμοποιεί το shadcn/ui Sidebar component ως βάση.
 * Το shadcn Sidebar χειρίζεται αυτόματα:
 *   - Άνοιγμα/κλείσιμο με animation
 *   - Collapsible σε mobile
 *   - Keyboard navigation
 *   - Accessibility (ARIA attributes)
 */

"use client"; // Χρειάζεται γιατί χρησιμοποιεί usePathname (client-side hook)

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, // Εικονίδιο για Staff Dashboard
  Clock,           // Εικονίδιο για Working Hours
  CalendarDays,    // Εικονίδιο για Shift Coverage
  Users,           // Εικονίδιο για το λογότυπο
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// ── Στοιχεία μενού πλοήγησης ─────────────────────────────────
// Κάθε item έχει: label (κείμενο), href (URL), icon (Lucide component)

const NAV_ITEMS = [
  {
    label: "Staff Dashboard",
    href:  "/",
    icon:  LayoutDashboard,
  },
  {
    label: "Working Hours",
    href:  "/working-hours",
    icon:  Clock,
  },
  {
    label: "Shift Coverage",
    href:  "/shift-coverage",
    icon:  CalendarDays,
  },
] as const;

// ── AppSidebar Component ──────────────────────────────────────

export function AppSidebar() {
  // usePathname επιστρέφει το τρέχον URL path, π.χ. "/working-hours"
  // Το χρησιμοποιούμε για να "τονίσουμε" το ενεργό menu item
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">

      {/* ── Header: Λογότυπο εφαρμογής ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                {/* Avatar-style λογότυπο */}
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">StaffSync</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content: Μενού πλοήγησης ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Πλοήγηση</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                // Ελέγχουμε αν το τρέχον path ταιριάζει με το href του item
                // Για το "/" κάνουμε exact match, για τα άλλα startsWith
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label} // Εμφανίζεται όταν το sidebar είναι collapsed
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: Πληροφορίες έκδοσης ── */}
      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground">
          <p className="font-medium">StaffSync</p>
          <p>Σύστημα Διαχείρισης Ωραρίου</p>
        </div>
      </SidebarFooter>

    </Sidebar>
  );
}