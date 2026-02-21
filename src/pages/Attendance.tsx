import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Clock, UserCheck, UserX, CalendarDays, Users } from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
  employee_name?: string;
}

interface Employee { id: string; name: string; status: string; }

const Attendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [form, setForm] = useState({ employee_id: "", check_in: "", check_out: "", status: "present", notes: "" });

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [{ data: emps }, { data: att }] = await Promise.all([
      supabase.from("employees").select("id, name, status").eq("status", "active").order("name"),
      supabase.from("attendance").select("*").eq("date", selectedDate).order("created_at", { ascending: false }),
    ]);
    setEmployees(emps || []);
    const empMap = new Map((emps || []).map(e => [e.id, e.name]));
    setRecords((att || []).map(r => ({ ...r, employee_name: empMap.get(r.employee_id) || "Unknown" })));
    setLoading(false);
  }, [user, selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!user || !form.employee_id) { toast.error("Select an employee"); return; }
    const payload = {
      user_id: user.id,
      employee_id: form.employee_id,
      date: selectedDate,
      check_in: form.check_in ? new Date(`${selectedDate}T${form.check_in}`).toISOString() : null,
      check_out: form.check_out ? new Date(`${selectedDate}T${form.check_out}`).toISOString() : null,
      status: form.status,
      notes: form.notes || null,
    };
    const { error } = await supabase.from("attendance").upsert(payload, { onConflict: "employee_id,date" });
    if (error) { toast.error("Failed to save attendance"); return; }
    toast.success("Attendance saved");
    setDialogOpen(false);
    setForm({ employee_id: "", check_in: "", check_out: "", status: "present", notes: "" });
    fetchData();
  };

  const markAllPresent = async () => {
    if (!user) return;
    const existing = new Set(records.map(r => r.employee_id));
    const toInsert = employees.filter(e => !existing.has(e.id)).map(e => ({
      user_id: user.id, employee_id: e.id, date: selectedDate,
      check_in: new Date(`${selectedDate}T09:00`).toISOString(),
      status: "present",
    }));
    if (toInsert.length === 0) { toast.info("All employees already marked"); return; }
    const { error } = await supabase.from("attendance").insert(toInsert);
    if (error) { toast.error("Failed to mark attendance"); return; }
    toast.success(`Marked ${toInsert.length} employees present`);
    fetchData();
  };

  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const leaveCount = records.filter(r => r.status === "on_leave").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground text-sm">{format(new Date(selectedDate), "dd MMM yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto" />
          <Button variant="outline" onClick={markAllPresent}><UserCheck className="mr-2 h-4 w-4" />Mark All Present</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Entry</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Attendance</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Employee *</Label>
                  <Select value={form.employee_id} onValueChange={v => setForm(f => ({ ...f, employee_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Check In</Label><Input type="time" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} /></div>
                  <div><Label>Check Out</Label><Input type="time" value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} /></div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{employees.length}</p></div><Users className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Present</p><p className="text-2xl font-bold text-green-600">{presentCount}</p></div><UserCheck className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Absent</p><p className="text-2xl font-bold text-red-600">{absentCount}</p></div><UserX className="h-8 w-8 text-red-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">On Leave</p><p className="text-2xl font-bold text-yellow-600">{leaveCount}</p></div><CalendarDays className="h-8 w-8 text-yellow-600" /></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : records.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No attendance records for this date</TableCell></TableRow>
              ) : records.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.employee_name}</TableCell>
                  <TableCell>{r.check_in ? format(new Date(r.check_in), "hh:mm a") : "—"}</TableCell>
                  <TableCell>{r.check_out ? format(new Date(r.check_out), "hh:mm a") : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "present" ? "default" : r.status === "absent" ? "destructive" : "secondary"}>
                      {r.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
