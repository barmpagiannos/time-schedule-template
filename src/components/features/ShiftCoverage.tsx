/**
 * components/features/ShiftCoverage.tsx
 *
 * Εβδομαδιαία επισκόπηση βαρδιών ολόκληρης της ομάδας.
 * Εμφανίζει πίνακα staff × ημέρα με auto-assign λειτουργία.
 */

"use client";

import { useScheduleContext } from "@/context/ScheduleContext";
import { DAYS }               from "@/constants";
import { shiftLabel, shiftCellClass } from "@/lib/helpers";

import { Card, CardContent }  from "@/components/ui/card";
import { Button }             from "@/components/ui/button";
import { Badge }              from "@/components/ui/badge";

export function ShiftCoverage() {
  const {
    staffList,
    autoAssign,
    toast,
    startAutoAssign,
  } = useScheduleContext();

  return (
    <div className="space-y-6">

      {/* ── Τίτλος + controls ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shift Coverage</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Εβδομαδιαία επισκόπηση βαρδιών ομάδας
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>From</span>
            <Badge variant="outline">📅 2021/06/26</Badge>
            <span>To</span>
            <Badge variant="outline">📅 2021/06/26</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={startAutoAssign}
            disabled={autoAssign.isRunning}
          >
            {autoAssign.isRunning ? "⏳ Assigning..." : "⟳ Auto-assign"}
          </Button>

          {/* Month / Week / Day toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            {["Month", "Week", "Day"].map((v) => (
              <button
                key={v}
                className={`
                  px-3 py-1.5 text-sm font-semibold transition-colors
                  ${v === "Week"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                  }
                `}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Πίνακας βαρδιών ── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="bg-muted/50 border border-border px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[130px]">
                    Staff
                  </th>
                  {DAYS.map((d) => (
                    <th key={d} className="bg-muted/50 border border-border px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {staffList.map((s) => {
                  const week = s.weeks[0];
                  return (
                    <tr key={s.id} className="hover:bg-muted/10 transition-colors">

                      {/* Όνομα υπαλλήλου */}
                      <td className="border border-border px-4 py-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ background: s.color }}
                          >
                            {s.avatar}
                          </div>
                          {s.name}
                        </div>
                      </td>

                      {/* Κελί ανά ημέρα */}
                      {DAYS.map((d) => {
                        const sh  = week?.shifts[d];
                        const cls = shiftCellClass(sh);
                        const lbl = shiftLabel(sh);
                        return (
                          <td key={d} className="border border-border px-3 py-2 text-center">
                            <span className={`
                              inline-block px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap
                              ${cls === "ci ci-s"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : cls === "ci ci-l"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-muted text-muted-foreground border-border"
                              }
                            `}>
                              {lbl}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Auto-assign progress popup ── */}
      {autoAssign.isRunning && (
        <div className="fixed bottom-20 right-6 bg-card border border-border rounded-2xl shadow-xl p-5 w-80 z-50 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-bold text-sm mb-3">Auto-assign empty shifts</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <div className="w-3.5 h-3.5 border-2 border-border border-t-primary rounded-full animate-spin shrink-0" />
            <span>{autoAssign.message}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${autoAssign.progress}%`,
                background: "repeating-linear-gradient(45deg,#3b82f6,#3b82f6 8px,#60a5fa 8px,#60a5fa 16px)",
              }}
            />
          </div>
          <div className="text-right text-[10px] text-muted-foreground mt-1">
            {Math.round(autoAssign.progress)}%
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
}