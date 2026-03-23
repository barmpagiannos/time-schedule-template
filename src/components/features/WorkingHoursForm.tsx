/**
 * components/features/WorkingHoursForm.tsx
 *
 * Φόρμα καταχώρησης εβδομαδιαίου ωραρίου.
 * Νέος υπάλληλος που προστίθεται εδώ εμφανίζεται αυτόματα
 * στο Staff Dashboard χάρη στο κοινό ScheduleContext.
 */

"use client";

import { useScheduleContext }  from "@/context/ScheduleContext";
import { DAYS, LOCATIONS, PERIODS } from "@/constants";

import {
  Card, CardContent, CardHeader, CardDescription,
} from "@/components/ui/card";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function WorkingHoursForm() {
  const {
    formName,
    formRows,
    toast,
    setFormName,
    updateFormRow,
    saveFormSchedule,
    resetForm,
  } = useScheduleContext();

  return (
    <div className="space-y-6">

      {/* ── Τίτλος ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Working Hours</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Καταχώρηση εβδομαδιαίου ωραρίου εργαζομένου
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label>Name of Staff</Label>
              <CardDescription className="text-xs">
                Νέο όνομα → δημιουργείται αυτόματα στο Staff Dashboard
              </CardDescription>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="π.χ. Νίκος Παπαδόπουλος"
                className="w-64 font-semibold mt-1"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">

              {/* Επικεφαλίδες */}
              <thead>
                <tr>
                  {["Day","Location","Start Time","End Time","Start Date","End Date"].map((h) => (
                    <th
                      key={h}
                      className="bg-muted/50 border border-border px-3 py-2.5 text-left text-xs font-semibold text-primary uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {formRows.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">

                    {/* Ημέρα */}
                    <td className="border border-border px-2 py-1.5">
                      <Select
                        value={row.day}
                        onValueChange={(v) => updateFormRow(i, "day", v)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Τοποθεσία */}
                    <td className="border border-border px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-destructive font-bold text-sm">*</span>
                        <Select
                          value={row.location}
                          onValueChange={(v) => updateFormRow(i, "location", v)}
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LOCATIONS.map((l) => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>

                    {/* Ώρα έναρξης */}
                    <td className="border border-border px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="time"
                          value={row.startTime}
                          onChange={(e) => updateFormRow(i, "startTime", e.target.value)}
                          className="w-28 text-center"
                        />
                        <Select
                          value={row.startPeriod}
                          onValueChange={(v) => updateFormRow(i, "startPeriod", v)}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PERIODS.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>

                    {/* Ώρα λήξης */}
                    <td className="border border-border px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="time"
                          value={row.endTime}
                          onChange={(e) => updateFormRow(i, "endTime", e.target.value)}
                          className="w-28 text-center"
                        />
                        <Select
                          value={row.endPeriod}
                          onValueChange={(v) => updateFormRow(i, "endPeriod", v)}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PERIODS.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>

                    {/* Ημερομηνία έναρξης */}
                    <td className="border border-border px-2 py-1.5">
                      <Input
                        value={row.startDate}
                        onChange={(e) => updateFormRow(i, "startDate", e.target.value)}
                        placeholder="dd Mon yyyy"
                        className="w-28"
                      />
                    </td>

                    {/* Ημερομηνία λήξης */}
                    <td className="border border-border px-2 py-1.5">
                      <Input
                        value={row.endDate}
                        onChange={(e) => updateFormRow(i, "endDate", e.target.value)}
                        placeholder="—"
                        className="w-28"
                      />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Κουμπιά */}
          <div className="flex gap-3 mt-6">
            <Button variant="outline">← Previous</Button>
            <Button onClick={saveFormSchedule}>💾 Save</Button>
            <Button variant="outline" onClick={resetForm}>✕ Cancel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
}