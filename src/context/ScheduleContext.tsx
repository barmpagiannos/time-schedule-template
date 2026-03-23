/**
 * context/ScheduleContext.tsx
 *
 * Context Provider που μοιράζει το state του useSchedule
 * σε όλες τις σελίδες της εφαρμογής.
 *
 * Χωρίς αυτό, κάθε σελίδα έχει το δικό της ξεχωριστό state —
 * αλλαγές στο WorkingHours δεν φαίνονται στο StaffDashboard.
 * Με αυτό, υπάρχει ΕΝΑ κεντρικό state για όλη την εφαρμογή.
 */

"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSchedule } from "@/hooks/useSchedule";

// Τύπος του Context — ίδιος με το return type του useSchedule
type ScheduleContextType = ReturnType<typeof useSchedule>;

// Δημιουργία του Context με null ως αρχική τιμή
const ScheduleContext = createContext<ScheduleContextType | null>(null);

/**
 * Provider που τυλίγει την εφαρμογή και παρέχει το κοινό state.
 * Μπαίνει στο layout.tsx.
 */
export function ScheduleProvider({ children }: { children: ReactNode }) {
  // Το useSchedule καλείται ΕΔΩ — μία φορά για όλη την εφαρμογή
  const schedule = useSchedule();

  return (
    <ScheduleContext.Provider value={schedule}>
      {children}
    </ScheduleContext.Provider>
  );
}

/**
 * Custom hook για πρόσβαση στο κοινό state.
 * Χρησιμοποιείται αντί του useSchedule() στα components.
 *
 * Χρήση: const { staffList, selectStaff } = useScheduleContext();
 */
export function useScheduleContext(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useScheduleContext πρέπει να χρησιμοποιείται μέσα στο ScheduleProvider");
  }
  return context;
}