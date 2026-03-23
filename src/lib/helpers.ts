/**
 * lib/helpers.ts
 *
 * Καθαρές βοηθητικές συναρτήσεις (pure functions) για το StaffSync project.
 *
 * Τι σημαίνει "pure function":
 * Μια συνάρτηση που για τα ίδια inputs δίνει πάντα τα ίδια outputs,
 * και δεν αλλάζει τίποτα έξω από τον εαυτό της (no side effects).
 * Αυτές είναι εύκολο να τεστάρεις και να επαναχρησιμοποιείς.
 *
 * Importing: import { calcHours, weekTotal, shiftColor } from "@/lib/helpers"
 */

import type { Shift, ShiftColorResult, Week } from "@/types";
import { DAYS, TOTAL_BADGE_STYLES } from "@/constants";

// ─────────────────────────────────────────────
// ΥΠΟΛΟΓΙΣΜΟΙ ΧΡΟΝΟΥ
// ─────────────────────────────────────────────

/**
 * Μετατρέπει μια ώρα σε μορφή "HH:MM" σε λεπτά από την αρχή της ημέρας.
 *
 * Παράδειγμα: "09:30" → 570 (= 9*60 + 30)
 * Αυτό διευκολύνει τους αριθμητικούς υπολογισμούς διάρκειας.
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Υπολογίζει τη διάρκεια μιας βάρδιας σε ώρες (δεκαδικός αριθμός).
 *
 * Παράδειγμα: start="09:20", end="17:10" → 7.8 ώρες
 * Επιστρέφει 0 αν οι ώρες είναι κενές ή αν η λήξη είναι πριν την έναρξη.
 */
export function calcHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const diff = timeToMinutes(end) - timeToMinutes(start);
  // Αρνητική διαφορά = λάθος δεδομένα, επιστρέφουμε 0
  return diff > 0 ? +(diff / 60).toFixed(1) : 0;
}

/**
 * Αθροίζει τις εργάσιμες ώρες μιας ολόκληρης εβδομάδας.
 * Μετράει μόνο τις ημέρες με type="shift" — αγνοεί leave και off.
 *
 * Παράδειγμα: 5 μέρες × 7.8h = "39.0"
 * Επιστρέφει string με ένα δεκαδικό ψηφίο για εμφάνιση.
 */
export function weekTotal(shifts: Week["shifts"]): string {
  const total = DAYS.reduce((sum, day) => {
    const shift = shifts[day];
    // Αν η μέρα είναι βάρδια, προσθέτουμε τις ώρες — αλλιώς 0
    return sum + (shift?.type === "shift" ? calcHours(shift.start, shift.end) : 0);
  }, 0);
  return total.toFixed(1);
}

/**
 * Μορφοποιεί δεκαδικές ώρες σε εύκολα αναγνώσιμη μορφή "Xh Ym".
 *
 * Παράδειγμα: 7.8 → "7h 48m" | 8.0 → "8h"
 * Χρησιμοποιείται στο summary strip του Overview tab.
 */
export function formatHours(decimalHours: number): string {
  const hours   = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

// ─────────────────────────────────────────────
// ΧΡΩΜΑΤΑ ΒΑΡΔΙΩΝ
// ─────────────────────────────────────────────

/**
 * Επιστρέφει το σύνολο χρωμάτων (bg, text, border) για έναν τύπο βάρδιας.
 *
 * Γιατί δεν χρησιμοποιούμε Tailwind classes εδώ:
 * Επειδή τα χρώματα εφαρμόζονται δυναμικά βάσει του type, το Tailwind
 * δεν μπορεί να τα "δει" κατά το build και τα αφαιρεί (tree-shaking).
 * Γι' αυτό χρησιμοποιούμε inline hex values μέσω style prop.
 *
 * Παράδειγμα χρήσης:
 *   const col = shiftColor("leave");
 *   <span style={{ background: col.bg, color: col.text }}>Leave</span>
 */
export function shiftColor(type: Shift["type"]): ShiftColorResult {
  switch (type) {
    case "leave":
      return { bg: "#fde8e8", text: "#9f1239", border: "#fca5a5" }; // κόκκινο
    case "off":
      return { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" }; // γκρι
    case "shift":
    default:
      return { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" }; // πράσινο
  }
}

/**
 * Επιστρέφει τα χρώματα για το "σύνολο εβδομάδας" badge βάσει του
 * χρώματος avatar ενός υπαλλήλου.
 *
 * Γιατί δεν χρησιμοποιούμε color-mix():
 * Η CSS color-mix() δεν υποστηρίζεται παντού. Αντίθετα, χρησιμοποιούμε
 * στατικό map από το TOTAL_BADGE_STYLES constant.
 * Αν το χρώμα δεν βρεθεί στο map, επιστρέφεται neutral fallback.
 */
export function totalBadgeStyle(
  avatarColor: string
): { bg: string; text: string; border: string } {
  return (
    TOTAL_BADGE_STYLES[avatarColor] ?? {
      bg: "#f1f5f9",
      text: "#334155",
      border: "#e2e8f0",
    }
  );
}

// ─────────────────────────────────────────────
// ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ UI
// ─────────────────────────────────────────────

/**
 * Εξάγει τα αρχικά (initials) από ένα πλήρες όνομα.
 *
 * Παράδειγμα: "Emma Johnson" → "EJ" | "Mark M" → "MM"
 * Παίρνει το πρώτο γράμμα από τις πρώτες δύο λέξεις (κεφαλαίο).
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Επιστρέφει την ετικέτα ενός κελιού βάρδιας για εμφάνιση στον πίνακα.
 *
 * Παράδειγμα:
 *   type="shift", start="09:20", end="17:10" → "09:20 – 17:10"
 *   type="leave"                             → "Leave"
 *   type="off"                               → "—"
 */
export function shiftLabel(shift: Shift | undefined): string {
  if (!shift || shift.type === "off") return "—";
  if (shift.type === "leave") return "Leave";
  return `${shift.start} – ${shift.end}`;
}

/**
 * Επιστρέφει το CSS class name για ένα κελί του Shift Coverage πίνακα.
 * Οι classes "ci-s", "ci-l", "ci-e" ορίζονται στο globals.css.
 */
export function shiftCellClass(shift: Shift | undefined): string {
  if (!shift || shift.type === "off") return "ci ci-e";
  if (shift.type === "leave") return "ci ci-l";
  return "ci ci-s";
}

// ─────────────────────────────────────────────
// ΔΕΔΟΜΕΝΑ
// ─────────────────────────────────────────────

/**
 * Δημιουργεί έναν νέο μοναδικό ID για υπάλληλο ή εβδομάδα.
 * Χρησιμοποιεί timestamp — αρκετά μοναδικό για client-side χρήση.
 * (Σε production environment θα χρησιμοποιούσαμε UUID ή server-generated ID.)
 */
export function generateId(): number {
  return Date.now();
}

/**
 * Επιλέγει αυτόματα το επόμενο διαθέσιμο χρώμα avatar
 * για έναν νέο υπάλληλο, βάσει πόσοι υπάλληλοι υπάρχουν ήδη.
 * Κάνει cycle αν τελειώσουν τα χρώματα.
 */
export function pickAvatarColor(
  existingCount: number,
  colors: readonly string[]
): string {
  return colors[existingCount % colors.length] ?? "#6366f1";
}