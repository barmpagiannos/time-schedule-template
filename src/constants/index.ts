/**
 * constants/index.ts
 *
 * Κεντρικό αρχείο σταθερών τιμών για το StaffSync project.
 *
 * Γιατί υπάρχει αυτό το αρχείο:
 * Αντί να γράφουμε ["Mon","Tue",...] σε κάθε component ξεχωριστά,
 * τα ορίζουμε μία φορά εδώ. Έτσι αν χρειαστεί αλλαγή (π.χ. να
 * προσθέσουμε Σαββατοκύριακο), την κάνουμε σε ένα μόνο σημείο.
 *
 * Importing: import { DAYS, LOCATIONS } from "@/constants"
 */

// ─────────────────────────────────────────────
// ΗΜΕΡΕΣ ΕΒΔΟΜΑΔΑΣ
// ─────────────────────────────────────────────

/**
 * Συντομογραφίες ημερών — χρησιμοποιούνται ως κλειδιά στα WeekShifts objects
 * και ως επικεφαλίδες στηλών στους πίνακες.
 */
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

/**
 * Τύπος που προκύπτει από τον πίνακα DAYS.
 * Επιτρέπει στο TypeScript να ελέγχει ότι οι ημέρες είναι πάντα έγκυρες.
 * Π.χ.: "Mon" | "Tue" | "Wed" | "Thu" | "Fri"
 */
export type DayKey = (typeof DAYS)[number];

/**
 * Αντιστοίχιση συντομογραφίας → πλήρους ονόματος ημέρας.
 * Χρησιμοποιείται στις επικεφαλίδες του Excel grid και στο editor modal.
 */
export const DAY_FULL: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
};

// ─────────────────────────────────────────────
// ΤΟΠΟΘΕΣΙΕΣ
// ─────────────────────────────────────────────

/**
 * Διαθέσιμες τοποθεσίες εργασίας.
 * Εμφανίζονται στο dropdown της φόρμας και στον inline editor.
 */
export const LOCATIONS = [
  "Grand Slam USA",
  "Management",
  "HQ Downtown",
  "Branch East",
  "Remote",
] as const;

/** Τύπος για έγκυρες τοποθεσίες — αντίστοιχος του DayKey */
export type LocationKey = (typeof LOCATIONS)[number];

// ─────────────────────────────────────────────
// ΧΡΟΝΙΚΕΣ ΠΕΡΙΟΔΟΙ
// ─────────────────────────────────────────────

/** AM / PM για τα dropdowns της φόρμας Working Hours */
export const PERIODS = ["AM", "PM"] as const;

// ─────────────────────────────────────────────
// ΧΡΩΜΑΤΑ ΥΠΑΛΛΗΛΩΝ
// ─────────────────────────────────────────────

/**
 * Προκαθορισμένα χρώματα για τα avatars των υπαλλήλων.
 * Κάθε νέος υπάλληλος παίρνει αυτόματα το επόμενο διαθέσιμο χρώμα.
 * Επιλέχθηκαν για να έχουν καλό contrast με λευκό κείμενο.
 */
export const AVATAR_COLORS = [
  "#6366f1", // indigo  — Emma
  "#f59e0b", // amber   — James
  "#10b981", // emerald — Bale
  "#ec4899", // pink    — Nova
  "#e8630a", // orange  — Mark M
  "#0891b2", // cyan    — επόμενος υπάλληλος
  "#7c3aed", // violet
  "#059669", // green
] as const;

// ─────────────────────────────────────────────
// ΧΡΩΜΑΤΑ BADGE ΣΥΝΟΛΟΥ ΕΒΔΟΜΑΔΑΣ
// ─────────────────────────────────────────────

/**
 * Αντιστοίχιση χρώματος avatar → ανοιχτό χρώμα για το "σύνολο εβδομάδας" badge.
 *
 * Γιατί δεν χρησιμοποιούμε color-mix():
 * Η CSS συνάρτηση color-mix() δεν υποστηρίζεται σε όλα τα περιβάλλοντα
 * (π.χ. σε artifact renderers). Γι' αυτό ορίζουμε στατικά τα ανοιχτά
 * χρώματα για κάθε avatar color.
 */
export const TOTAL_BADGE_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "#6366f1": { bg: "#ede9fe", text: "#4338ca", border: "#c4b5fd" },
  "#f59e0b": { bg: "#fef3c7", text: "#b45309", border: "#fcd34d" },
  "#10b981": { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  "#ec4899": { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
  "#e8630a": { bg: "#ffedd5", text: "#c2410c", border: "#fdba74" },
  "#0891b2": { bg: "#e0f2fe", text: "#0369a1", border: "#7dd3fc" },
  "#7c3aed": { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
  "#059669": { bg: "#ecfdf5", text: "#047857", border: "#6ee7b7" },
};

// ─────────────────────────────────────────────
// ΜΗΝΥΜΑΤΑ AUTO-ASSIGN
// ─────────────────────────────────────────────

/**
 * Μηνύματα που εμφανίζονται διαδοχικά κατά τη διαδικασία auto-assign.
 * Κάθε μήνυμα αντιστοιχεί σε ένα "βήμα" της animation.
 */
export const AUTO_ASSIGN_MESSAGES = [
  "Evaluating Mon 09:00 AM @ Grand Slam USA",
  "Evaluating Tue 07:00 AM @ Management",
  "Evaluating Wed 08:00 AM @ HQ Downtown",
  "Assigning available staff…",
  "Finalizing schedule…",
] as const;

/** Καθυστέρηση σε milliseconds μεταξύ κάθε βήματος της auto-assign animation */
export const AUTO_ASSIGN_INTERVAL_MS = 700;

// ─────────────────────────────────────────────
// DEFAULT ΤΙΜΕΣ ΦΟΡΜΑΣ
// ─────────────────────────────────────────────

/**
 * Default τιμές για μια νέα γραμμή φόρμας Working Hours.
 * Χρησιμοποιούνται κατά την αρχικοποίηση και το reset της φόρμας.
 */
export const DEFAULT_FORM_ROW = {
  location:    "Grand Slam USA",
  startTime:   "08:00",
  startPeriod: "AM",
  endTime:     "17:00",
  endPeriod:   "PM",
  startDate:   "",
  endDate:     "",
} as const;