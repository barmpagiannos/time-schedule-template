/**
 * components/features/StaffDashboard.tsx
 *
 * Κεντρικό dashboard επιλογής υπαλλήλου και προβολής
 * εβδομαδιαίου ωραρίου σε Excel-style grid με inline editing.
 *
 * Χρησιμοποιεί useScheduleContext() αντί useSchedule()
 * ώστε να μοιράζεται το κοινό state με τις άλλες σελίδες.
 */

"use client";

import { Fragment } from "react";
import { Pencil }   from "lucide-react";

import { useScheduleContext }          from "@/context/ScheduleContext";
import { DAYS, DAY_FULL, LOCATIONS }   from "@/constants";
import { calcHours, weekTotal, shiftColor, totalBadgeStyle } from "@/lib/helpers";
import type { Shift }                  from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }          from "@/components/ui/badge";
import { Button }         from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";

export function StaffDashboard() {
  const {
    staffList,
    selectedStaff,
    selectedId,
    editCell,
    editValues,
    toast,
    selectStaff,
    openEdit,
    updateEditValue,
    saveEdit,
    cancelEdit,
  } = useScheduleContext();

  return (
    <div className="space-y-6">

      {/* ── Τίτλος ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Επιλέξτε υπάλληλο για προβολή και επεξεργασία εβδομαδιαίου ωραρίου
        </p>
      </div>

      {/* ── Κάρτες επιλογής υπαλλήλου ── */}
      <div className="flex flex-wrap gap-3">
        {staffList.map((s) => {
          const ts         = totalBadgeStyle(s.color);
          const isSelected = selectedId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => selectStaff(s.id)}
              className={`
                flex items-center gap-3 px-4 py-2 rounded-full border-2
                transition-all duration-150 cursor-pointer
                ${isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-muted-foreground/40"
                }
              `}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: s.color }}
              >
                {s.avatar}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold leading-tight">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.role}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Excel-style grid ── */}
      {selectedStaff && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ background: selectedStaff.color }}
              >
                {selectedStaff.avatar}
              </div>
              <div>
                <CardTitle className="text-lg" style={{ color: selectedStaff.color }}>
                  {selectedStaff.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                💡 Κλικ σε κελί για επεξεργασία
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="bg-muted/50 border border-border px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">
                      📅 Εβδομάδα
                    </th>
                    {DAYS.map((d) => (
                      <th key={d} className="bg-muted/50 border border-border px-3 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">
                        {DAY_FULL[d]}
                      </th>
                    ))}
                    <th className="bg-muted/50 border border-border px-3 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Σύνολο
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedStaff.weeks.map((week, wi) => {
                    const tot = weekTotal(week.shifts);
                    const ts  = totalBadgeStyle(selectedStaff.color);
                    return (
                      <Fragment key={wi}>

                        {/* Κύρια γραμμή βαρδιών */}
                        <tr>
                          <td className="border border-border px-3 py-2 bg-muted/20 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                            {week.weekLabel}
                          </td>
                          {DAYS.map((d) => {
                            const sh  = week.shifts[d];
                            const col = shiftColor(sh?.type ?? "off");
                            const hrs = sh?.type === "shift"
                              ? calcHours(sh.start, sh.end)
                              : null;
                            return (
                              <td
                                key={d}
                                className="border border-border p-1.5 text-center cursor-pointer hover:brightness-95 transition-all"
                                style={{ background: col.bg + "22" }}
                                onClick={() => openEdit(wi, d)}
                                title={`Επεξεργασία — ${DAY_FULL[d]}`}
                              >
                                <div
                                  className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg border min-w-[110px] hover:scale-105 transition-transform"
                                  style={{ background: col.bg, color: col.text, borderColor: col.border }}
                                >
                                  {sh?.type === "shift" ? (
                                    <>
                                      <span className="text-xs font-bold">{sh.start} – {sh.end}</span>
                                      <span className="text-[10px] opacity-75 mt-0.5">{sh.location} · {hrs}h</span>
                                    </>
                                  ) : sh?.type === "leave" ? (
                                    <span className="text-xs font-bold">🏖 Leave</span>
                                  ) : (
                                    <span className="text-xs opacity-40">— Off —</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="border border-border px-3 py-2 text-center">
                            <span
                              className="inline-block px-3 py-1 rounded-md text-sm font-bold border"
                              style={{ background: ts.bg, color: ts.text, borderColor: ts.border }}
                            >
                              {tot}h
                            </span>
                          </td>
                        </tr>

                        {/* Γραμμή ωρών ανά ημέρα */}
                        <tr className="bg-muted/10">
                          <td className="border border-border px-3 py-1 text-[11px] text-muted-foreground">
                            ώρες / ημέρα
                          </td>
                          {DAYS.map((d) => {
                            const sh = week.shifts[d];
                            const h  = sh?.type === "shift" ? calcHours(sh.start, sh.end) : 0;
                            return (
                              <td key={d} className="border border-border px-3 py-1 text-center">
                                {h > 0 ? (
                                  <span className="inline-block bg-blue-50 text-blue-600 border border-blue-200 rounded px-2 py-0.5 text-[11px] font-bold">
                                    {h}h
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/40 text-xs">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="border border-border" />
                        </tr>

                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Inline Editor Modal ── */}
      <Dialog open={!!editCell} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4" />
              Επεξεργασία βάρδιας
              {editCell && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold border"
                  style={{
                    background:  shiftColor(editValues.type).bg,
                    color:       shiftColor(editValues.type).text,
                    borderColor: shiftColor(editValues.type).border,
                  }}
                >
                  {DAY_FULL[editCell.day]}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Τύπος βάρδιας */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Τύπος
              </Label>
              <div className="flex gap-2">
                {(["shift", "leave", "off"] as Shift["type"][]).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateEditValue("type", t)}
                    className={`
                      flex-1 py-2 px-3 rounded-lg border-2 text-sm font-semibold transition-all
                      ${editValues.type === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-muted-foreground/40"
                      }
                    `}
                  >
                    {t === "shift" ? "🟢 Βάρδια" : t === "leave" ? "🏖 Άδεια" : "⚫ Off"}
                  </button>
                ))}
              </div>
            </div>

            {/* Ώρες + τοποθεσία — μόνο για shift */}
            {editValues.type === "shift" && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ώρα έναρξης → λήξης
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={editValues.start}
                      onChange={(e) => updateEditValue("start", e.target.value)}
                      className="text-center"
                    />
                    <span className="text-muted-foreground font-bold">→</span>
                    <Input
                      type="time"
                      value={editValues.end}
                      onChange={(e) => updateEditValue("end", e.target.value)}
                      className="text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Τοποθεσία
                  </Label>
                  <Select
                    value={editValues.location}
                    onValueChange={(v) => updateEditValue("location", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Επιλέξτε τοποθεσία" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>Ακύρωση</Button>
            <Button onClick={saveEdit}>💾 Αποθήκευση</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
}