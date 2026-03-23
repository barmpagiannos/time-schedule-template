/**
 * app/page.tsx
 *
 * Αρχική σελίδα της εφαρμογής (route: /)
 * Εμφανίζει το Staff Dashboard — επιλογή υπαλλήλου + Excel grid.
 *
 * Είναι Server Component by default στο Next.js App Router.
 * Το "use client" ΔΕΝ χρειάζεται εδώ γιατί απλά κάνει render
 * το StaffDashboard component που είναι Client Component.
 */

import { StaffDashboard } from "@/components/features/StaffDashboard";

export default function HomePage() {
  return <StaffDashboard />;
}