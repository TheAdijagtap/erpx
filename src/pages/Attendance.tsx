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

type Status = "present" | "absent" | "half_day" | "on_leave" | null;

interface AttendanceMap {
  [key: string]: Status; // key: `${employee_id}_${date}`
}

const STATUS_CYCLE: Status[] = [null, "present", "absent", "half_day", "on_leave"];

const Attendance = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [saving, setSaving] = useState<string | null>(null);

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
      supabase.from("attendance").select("employee_id, date, status").gte("date", startDate).lte("date", endDate),
    ]);

    setEmployees(emps || []);

    const map: AttendanceMap = {};
    (att || []).forEach((r) => {
      map[`${r.employee_id}_${r.date}`] = r.status as Status;
    });
    setAttendance(map);
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
      // Delete the record
      await supabase.from("attendance").delete().eq("employee_id", employeeId).eq("date", dateStr);
    } else {
      await supabase.from("attendance").upsert(
        {
          user_id: user.id,
          employee_id: employeeId,
          date: dateStr,
          status: next,
          check_in: next === "present" || next === "half_day" ? new Date(`${dateStr}T09:00`).toISOString() : null,
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
      default:
        return <Minus className="h-3 w-3 text-muted-foreground/30" />;
    }
  };

  const getSummary = (employeeId: string) => {
    let p = 0, a = 0, h = 0, l = 0;
    dates.forEach((day) => {
      const key = `${employeeId}_${format(new Date(year, month, day), "yyyy-MM-dd")}`;
      const s = attendance[key];
      if (s === "present") p++;
      else if (s === "absent") a++;
      else if (s === "half_day") h++;
      else if (s === "on_leave") l++;
    });
    return { p, a, h, l };
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
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-600" /> Present</span>
        <span className="flex items-center gap-1"><X className="h-3 w-3 text-red-500" /> Absent</span>
        <span className="flex items-center gap-1"><span className="font-bold text-yellow-600">H</span> Half Day</span>
        <span className="flex items-center gap-1"><span className="font-bold text-blue-500">L</span> Leave</span>
        <span className="text-muted-foreground/60 ml-2">Click cell to cycle status</span>
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
                              "text-center py-1 cursor-pointer transition-all",
                              weekend && "bg-muted/30",
                              future && "opacity-30 cursor-not-allowed",
                              isSaving && "animate-pulse",
                              !future && "hover:bg-accent/40"
                            )}
                            onClick={() => !future && toggleStatus(emp.id, day)}
                          >
                            <div className="flex items-center justify-center h-5 w-full">
                              {getStatusCell(status)}
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center py-1.5 font-semibold text-green-600 bg-muted/20">{summary.p}</td>
                      <td className="text-center py-1.5 font-semibold text-red-500 bg-muted/20">{summary.a}</td>
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
