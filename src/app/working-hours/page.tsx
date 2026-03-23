/**
 * app/working-hours/page.tsx
 *
 * Σελίδα φόρμας καταχώρησης ωραρίου (route: /working-hours)
 * Εμφανίζει τη φόρμα Working Hours — Day, Location, Start/End Time, Dates.
 */

import { WorkingHoursForm } from "@/components/features/WorkingHoursForm";

export default function WorkingHoursPage() {
  return <WorkingHoursForm />;
}