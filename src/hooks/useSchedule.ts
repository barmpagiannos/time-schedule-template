/**
 * hooks/useSchedule.ts
 *
 * Custom hook που διαχειρίζεται όλο το state και τη λογική
 * της εφαρμογής StaffSync.
 */

"use client";

import { useState } from "react";
import type { Staff, Week, Shift, EditCell, FormRow, AutoAssignState } from "@/types";
import { DAYS, AVATAR_COLORS, AUTO_ASSIGN_MESSAGES, AUTO_ASSIGN_INTERVAL_MS } from "@/constants";
import { generateId, pickAvatarColor } from "@/lib/helpers";

// ─────────────────────────────────────────────
// ΑΡΧΙΚΑ ΔΕΔΟΜΕΝΑ
// ─────────────────────────────────────────────

const INITIAL_STAFF: Staff[] = [
  {
    id: 1, name: "Βασίλης", role: "Senior Manager", avatar: "ΒΑ", color: "#6366f1",
    weeks: [
      {
        weekLabel: "26 Ιουν – 30 Ιουν 2025",
        shifts: {
          Mon: { start: "09:00", end: "17:00", location: "Grand Slam USA", type: "shift" },
          Tue: { start: "09:00", end: "17:00", location: "Grand Slam USA", type: "shift" },
          Wed: { start: "09:00", end: "17:00", location: "Management",     type: "shift" },
          Thu: { start: "09:00", end: "17:00", location: "HQ Downtown",    type: "shift" },
          Fri: { start: "",      end: "",      location: "",               type: "off"   },
        },
      },
    ],
  },
  {
    id: 2, name: "Δημήτρης", role: "Field Coordinator", avatar: "ΔΗ", color: "#f59e0b",
    weeks: [
      {
        weekLabel: "26 Ιουν – 30 Ιουν 2025",
        shifts: {
          Mon: { start: "10:00", end: "18:00", location: "Grand Slam USA", type: "shift" },
          Tue: { start: "",      end: "",      location: "",               type: "leave" },
          Wed: { start: "09:00", end: "17:00", location: "Grand Slam USA", type: "shift" },
          Thu: { start: "",      end: "",      location: "",               type: "leave" },
          Fri: { start: "09:00", end: "17:00", location: "HQ Downtown",    type: "shift" },
        },
      },
    ],
  },
  {
    id: 3, name: "Αποστόλης", role: "Operations Lead", avatar: "ΑΠ", color: "#10b981",
    weeks: [
      {
        weekLabel: "26 Ιουν – 30 Ιουν 2025",
        shifts: {
          Mon: { start: "11:00", end: "19:00", location: "Branch East",    type: "shift" },
          Tue: { start: "11:00", end: "18:00", location: "Branch East",    type: "shift" },
          Wed: { start: "09:00", end: "17:00", location: "Grand Slam USA", type: "shift" },
          Thu: { start: "09:00", end: "17:00", location: "Grand Slam USA", type: "shift" },
          Fri: { start: "09:00", end: "17:00", location: "Grand Slam USA", type: "shift" },
        },
      },
    ],
  },
];

// ─────────────────────────────────────────────
// ΑΡΧΙΚΗ ΚΑΤΑΣΤΑΣΗ ΦΟΡΜΑΣ
// ─────────────────────────────────────────────

function createDefaultFormRows(): FormRow[] {
  return DAYS.map((day) => ({
    day,
    location:    "Grand Slam USA",
    startTime:   "08:00",
    startPeriod: "AM",
    endTime:     "17:00",
    endPeriod:   "PM",
    startDate:   "",
    endDate:     "",
  }));
}

// ─────────────────────────────────────────────
// ΚΥΡΙΟ HOOK
// ─────────────────────────────────────────────

export function useSchedule() {

  const [staffList,  setStaffList]  = useState<Staff[]>(INITIAL_STAFF);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [editCell,   setEditCell]   = useState<EditCell | null>(null);
  const [editValues, setEditValues] = useState<Shift>({
    start: "", end: "", location: "", type: "shift",
  });
  const [formName, setFormName] = useState<string>("");
  const [formRows, setFormRows] = useState<FormRow[]>(createDefaultFormRows());
  const [autoAssign, setAutoAssign] = useState<AutoAssignState>({
    isRunning: false, progress: 0, message: "",
  });
  const [toast, setToast] = useState<string>("");

  function showToast(msg: string): void {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  // ── Staff Dashboard handlers ──────────────────────────────

  function selectStaff(id: number): void {
    setSelectedId(id);
    setEditCell(null);
  }

  function openEdit(weekIdx: number, day: string): void {
    const staff = staffList.find((s) => s.id === selectedId);
    if (!staff) return;
    const currentShift = staff.weeks[weekIdx]?.shifts[day];
    if (!currentShift) return;
    setEditCell({ weekIdx, day });
    setEditValues({ ...currentShift });
  }

  function updateEditValue<K extends keyof Shift>(field: K, value: Shift[K]): void {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  }

  function saveEdit(): void {
    if (!editCell) return;
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== selectedId) return s;
        const updatedWeeks = s.weeks.map((w, wi) =>
          wi !== editCell.weekIdx ? w : {
            ...w,
            shifts: { ...w.shifts, [editCell.day]: { ...editValues } },
          }
        );
        return { ...s, weeks: updatedWeeks };
      })
    );
    setEditCell(null);
    showToast("✓ Αλλαγές αποθηκεύτηκαν");
  }

  function cancelEdit(): void {
    setEditCell(null);
  }

  // ── Working Hours Form handlers ───────────────────────────

  function updateFormRow<K extends keyof FormRow>(
    rowIndex: number, field: K, value: FormRow[K]
  ): void {
    setFormRows((prev) =>
      prev.map((row, idx) => idx === rowIndex ? { ...row, [field]: value } : row)
    );
  }

  /**
   * Αποθηκεύει το ωράριο.
   * Αν ο υπάλληλος ΔΕΝ υπάρχει, τον δημιουργεί αυτόματα
   * και εμφανίζεται στο Staff Dashboard.
   */
  function saveFormSchedule(): void {
    if (!formName.trim()) {
      showToast("⚠️ Εισάγετε όνομα υπαλλήλου");
      return;
    }

    const trimmedName = formName.trim();

    const newWeek: Week = {
      weekLabel: `${formRows[0]?.startDate || "Νέα"} – ${formRows[4]?.startDate || "Εβδομάδα"}`,
      shifts: Object.fromEntries(
        formRows.map((r) => [
          r.day,
          { start: r.startTime, end: r.endTime, location: r.location, type: "shift" as const },
        ])
      ),
    };

    setStaffList((prev) => {
      const exists = prev.find((s) => s.name === trimmedName);

      if (exists) {
        // Υπάρχει ήδη — προσθέτουμε νέα εβδομάδα
        return prev.map((s) =>
          s.name === trimmedName
            ? { ...s, weeks: [...s.weeks, newWeek] }
            : s
        );
      }

      // Νέος υπάλληλος — εμφανίζεται αυτόματα στο Dashboard
      const initials = trimmedName
        .split(" ")
        .map((w) => w[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const newStaff: Staff = {
        id:     generateId(),
        name:   trimmedName,
        role:   "Staff",
        avatar: initials,
        color:  pickAvatarColor(prev.length, AVATAR_COLORS),
        weeks:  [newWeek],
      };

      // Επιλέγουμε αυτόματα τον νέο υπάλληλο
      setTimeout(() => setSelectedId(newStaff.id), 0);

      return [...prev, newStaff];
    });

    showToast(`✓ Αποθηκεύτηκε για ${trimmedName}`);
    setFormName("");
    setFormRows(createDefaultFormRows());
  }

  function resetForm(): void {
    setFormName("");
    setFormRows(createDefaultFormRows());
  }

  // ── Auto-assign handler ───────────────────────────────────

  function startAutoAssign(): void {
    if (autoAssign.isRunning) return;
    setAutoAssign({ isRunning: true, progress: 0, message: AUTO_ASSIGN_MESSAGES[0] });
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = (step / AUTO_ASSIGN_MESSAGES.length) * 100;
      if (step < AUTO_ASSIGN_MESSAGES.length) {
        setAutoAssign({ isRunning: true, progress, message: AUTO_ASSIGN_MESSAGES[step] });
      } else {
        clearInterval(interval);
        setStaffList((prev) =>
          prev.map((s) => ({
            ...s,
            weeks: s.weeks.map((w, wi) =>
              wi !== 0 ? w : {
                ...w,
                shifts: Object.fromEntries(
                  DAYS.map((d) => [
                    d,
                    w.shifts[d]?.type === "off"
                      ? { start: "09:00", end: "17:00", location: "Grand Slam USA", type: "shift" as const }
                      : w.shifts[d],
                  ])
                ),
              }
            ),
          }))
        );
        setTimeout(() => {
          setAutoAssign({ isRunning: false, progress: 100, message: "" });
          showToast("✓ Auto-assign ολοκληρώθηκε");
        }, 600);
      }
    }, AUTO_ASSIGN_INTERVAL_MS);
  }

  // ── Derived state ─────────────────────────────────────────

  const selectedStaff = staffList.find((s) => s.id === selectedId) ?? null;

  // ── Return ────────────────────────────────────────────────

  return {
    staffList, selectedStaff, selectedId,
    editCell, editValues,
    formName, formRows,
    autoAssign, toast,
    selectStaff, openEdit, updateEditValue, saveEdit, cancelEdit,
    setFormName, updateFormRow, saveFormSchedule, resetForm,
    startAutoAssign,
  };
}