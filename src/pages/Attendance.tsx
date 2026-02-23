import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check, X, Minus } from "lucide-react";
import { format, getDaysInMonth, startOfMonth, isWeekend, isFuture, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
}

type Status = "present" | "absent" | "half_day" | "on_leave" | "late_mark" | null;

interface AttendanceMap {
  [key: string]: Status; // key: `${employee_id}_${date}`
}

interface OvertimeMap {
  [key: string]: number; // key: `${employee_id}_${date}`
}

const STATUS_CYCLE: Status[] = [null, "present", "absent", "half_day", "on_leave", "late_mark"];

const Attendance = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [overtime, setOvertime] = useState<OvertimeMap>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [saving, setSaving] = useState<string | null>(null);
  const [editingOT, setEditingOT] = useState<string | null>(null);
  const [otValue, setOtValue] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(currentMonth);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const endDate = format(new Date(year, month + 1, 0), "yyyy-MM-dd");

    const [{ data: emps }, { data: att }] = await Promise.all([
      supabase.from("employees").select("id, name").eq("status", "active").order("name"),
      supabase.from("attendance").select("employee_id, date, status, overtime_hours").gte("date", startDate).lte("date", endDate),
    ]);

    setEmployees(emps || []);

    const map: AttendanceMap = {};
    const otMap: OvertimeMap = {};
    (att || []).forEach((r: any) => {
      const key = `${r.employee_id}_${r.date}`;
      map[key] = r.status as Status;
      otMap[key] = r.overtime_hours || 0;
    });
    setAttendance(map);
    setOvertime(otMap);
    setLoading(false);
  }, [user, currentMonth, year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatus = async (employeeId: string, day: number) => {
    if (!user) return;
    const dateStr = format(new Date(year, month, day), "yyyy-MM-dd");
    const dateObj = new Date(year, month, day);
    if (isFuture(dateObj) && !isToday(dateObj)) return;

    const key = `${employeeId}_${dateStr}`;
    const current = attendance[key] || null;
    const currentIdx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];

    setSaving(key);

    if (next === null) {
      await supabase.from("attendance").delete().eq("employee_id", employeeId).eq("date", dateStr);
    } else {
      await supabase.from("attendance").upsert(
        {
          user_id: user.id,
          employee_id: employeeId,
          date: dateStr,
          status: next,
          check_in: next === "present" || next === "half_day" || next === "late_mark" ? new Date(`${dateStr}T09:00`).toISOString() : null,
        },
        { onConflict: "employee_id,date" }
      );
    }

    setAttendance((prev) => ({ ...prev, [key]: next }));
    setSaving(null);
  };

  const markAllPresent = async (day: number) => {
    if (!user) return;
    const dateStr = format(new Date(year, month, day), "yyyy-MM-dd");
    const dateObj = new Date(year, month, day);
    if (isFuture(dateObj) && !isToday(dateObj)) return;

    const toUpsert = employees.map((e) => ({
      user_id: user.id,
      employee_id: e.id,
      date: dateStr,
      status: "present" as const,
      check_in: new Date(`${dateStr}T09:00`).toISOString(),
    }));

    const { error } = await supabase.from("attendance").upsert(toUpsert, { onConflict: "employee_id,date" });
    if (error) {
      toast.error("Failed to mark all present");
      return;
    }

    const updates: AttendanceMap = {};
    employees.forEach((e) => {
      updates[`${e.id}_${dateStr}`] = "present";
    });
    setAttendance((prev) => ({ ...prev, ...updates }));
    toast.success(`All marked present for ${day} ${format(currentMonth, "MMM")}`);
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const saveOT = async (employeeId: string, dateStr: string) => {
    if (!user) return;
    const key = `${employeeId}_${dateStr}`;
    const hours = parseFloat(otValue) || 0;

    const currentStatus = attendance[key];
    if (!currentStatus) {
      toast.error("Mark attendance first before adding OT");
      setEditingOT(null);
      return;
    }

    await supabase.from("attendance").update({ overtime_hours: hours }).eq("employee_id", employeeId).eq("date", dateStr);
    setOvertime((prev) => ({ ...prev, [key]: hours }));
    setEditingOT(null);
    toast.success("OT saved");
  };

  const getStatusCell = (status: Status) => {
    switch (status) {
      case "present":
        return <Check className="h-3.5 w-3.5 text-green-600" />;
      case "absent":
        return <X className="h-3.5 w-3.5 text-red-500" />;
      case "half_day":
        return <span className="text-[10px] font-bold text-yellow-600">H</span>;
      case "on_leave":
        return <span className="text-[10px] font-bold text-blue-500">L</span>;
      case "late_mark":
        return <span className="text-[10px] font-bold text-orange-500">LM</span>;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground/30" />;
    }
  };

  const getSummary = (employeeId: string) => {
    let p = 0, a = 0, h = 0, l = 0, lm = 0, ot = 0;
    dates.forEach((day) => {
      const key = `${employeeId}_${format(new Date(year, month, day), "yyyy-MM-dd")}`;
      const s = attendance[key];
      if (s === "present") p++;
      else if (s === "absent") a++;
      else if (s === "half_day") h++;
      else if (s === "on_leave") l++;
      else if (s === "late_mark") lm++;
      ot += overtime[key] || 0;
    });
    return { p, a, h, l, lm, ot };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-600" /> Present</span>
        <span className="flex items-center gap-1"><X className="h-3 w-3 text-red-500" /> Absent</span>
        <span className="flex items-center gap-1"><span className="font-bold text-yellow-600">H</span> Half Day</span>
        <span className="flex items-center gap-1"><span className="font-bold text-blue-500">L</span> Leave</span>
        <span className="flex items-center gap-1"><span className="font-bold text-orange-500">LM</span> Late Mark</span>
        <span className="text-muted-foreground/60 ml-2">Click cell to cycle • Double-click for OT</span>
      </div>

      {/* Grid */}
      <Card>
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No active employees found. Add employees first.</div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-semibold min-w-[140px]">Employee</th>
                  {dates.map((day) => {
                    const dateObj = new Date(year, month, day);
                    const weekend = isWeekend(dateObj);
                    const today = isToday(dateObj);
                    const dayName = format(dateObj, "EEE");
                    return (
                      <th
                        key={day}
                        className={cn(
                          "px-0.5 py-1 text-center min-w-[28px] font-medium cursor-pointer hover:bg-accent/50 transition-colors",
                          weekend && "bg-muted/50",
                          today && "bg-primary/10 ring-1 ring-primary/30 rounded"
                        )}
                        title={`Mark all present for ${day} ${format(currentMonth, "MMM")}`}
                        onClick={() => markAllPresent(day)}
                      >
                        <div className="leading-tight">{day}</div>
                        <div className="text-[9px] text-muted-foreground font-normal">{dayName.charAt(0)}</div>
                      </th>
                    );
                  })}
                  <th className="px-2 py-2 text-center font-semibold bg-muted/30 min-w-[32px]" title="Present">P</th>
                  <th className="px-2 py-2 text-center font-semibold bg-muted/30 min-w-[32px]" title="Absent">A</th>
                  <th className="px-2 py-2 text-center font-semibold bg-muted/30 min-w-[32px]" title="Late Mark">LM</th>
                  <th className="px-2 py-2 text-center font-semibold bg-muted/30 min-w-[32px]" title="Overtime Hours">OT</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const summary = getSummary(emp.id);
                  return (
                    <tr key={emp.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-card px-3 py-1.5 font-medium truncate max-w-[140px]" title={emp.name}>
                        {emp.name}
                      </td>
                      {dates.map((day) => {
                        const dateStr = format(new Date(year, month, day), "yyyy-MM-dd");
                        const key = `${emp.id}_${dateStr}`;
                        const status = attendance[key] || null;
                        const dateObj = new Date(year, month, day);
                        const weekend = isWeekend(dateObj);
                        const future = isFuture(dateObj) && !isToday(dateObj);
                        const isSaving = saving === key;

                        return (
                          <td
                            key={day}
                            className={cn(
                              "text-center py-1 cursor-pointer transition-all relative",
                              weekend && "bg-muted/30",
                              future && "opacity-30 cursor-not-allowed",
                              isSaving && "animate-pulse",
                              !future && "hover:bg-accent/40"
                            )}
                            onClick={() => !future && toggleStatus(emp.id, day)}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              if (!future) {
                                setEditingOT(key);
                                setOtValue(String(overtime[key] || ""));
                              }
                            }}
                          >
                            <div className="flex flex-col items-center justify-center min-h-[20px] w-full">
                              {getStatusCell(status)}
                              {(overtime[key] || 0) > 0 && (
                                <span className="text-[8px] text-purple-500 font-bold leading-none">{overtime[key]}h</span>
                              )}
                            </div>
                            {editingOT === key && (
                              <div className="absolute z-20 top-full left-1/2 -translate-x-1/2 bg-card border rounded shadow-lg p-2 min-w-[80px]" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="0.5"
                                  value={otValue}
                                  onChange={(e) => setOtValue(e.target.value)}
                                  className="w-full text-xs border rounded px-1 py-0.5 mb-1 bg-background text-foreground"
                                  placeholder="OT hrs"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveOT(emp.id, dateStr);
                                    if (e.key === "Escape") setEditingOT(null);
                                  }}
                                />
                                <div className="flex gap-1">
                                  <button className="text-[10px] bg-primary text-primary-foreground rounded px-1.5 py-0.5 flex-1" onClick={() => saveOT(emp.id, dateStr)}>Save</button>
                                  <button className="text-[10px] bg-muted rounded px-1.5 py-0.5" onClick={() => setEditingOT(null)}>✕</button>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center py-1.5 font-semibold text-green-600 bg-muted/20">{summary.p}</td>
                      <td className="text-center py-1.5 font-semibold text-red-500 bg-muted/20">{summary.a}</td>
                      <td className="text-center py-1.5 font-semibold text-orange-500 bg-muted/20">{summary.lm}</td>
                      <td className="text-center py-1.5 font-semibold text-purple-500 bg-muted/20">{summary.ot}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
