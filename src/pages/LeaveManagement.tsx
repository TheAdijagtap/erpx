import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Check, X, CalendarDays } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface LeaveRecord {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: string;
  approved_by: string | null;
  created_at: string;
  employee_name?: string;
}

interface Employee { id: string; name: string; }

const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", leave_type: "casual", start_date: "", end_date: "", reason: "" });

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [{ data: emps }, { data: lvs }] = await Promise.all([
      supabase.from("employees").select("id, name").order("name"),
      supabase.from("leaves").select("*").order("created_at", { ascending: false }),
    ]);
    setEmployees(emps || []);
    const empMap = new Map((emps || []).map(e => [e.id, e.name]));
    setLeaves((lvs || []).map(l => ({ ...l, employee_name: empMap.get(l.employee_id) || "Unknown" })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!user || !form.employee_id || !form.start_date || !form.end_date) {
      toast.error("Fill required fields"); return;
    }
    const days = differenceInDays(new Date(form.end_date), new Date(form.start_date)) + 1;
    if (days < 1) { toast.error("End date must be after start date"); return; }

    const { error } = await supabase.from("leaves").insert({
      user_id: user.id,
      employee_id: form.employee_id,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      days,
      reason: form.reason || null,
      status: "pending",
    });
    if (error) { toast.error("Failed to apply leave"); return; }
    toast.success("Leave application submitted");
    setDialogOpen(false);
    setForm({ employee_id: "", leave_type: "casual", start_date: "", end_date: "", reason: "" });
    fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leaves").update({ status, approved_by: user?.email }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success(`Leave ${status}`);
    fetchData();
  };

  const pendingCount = leaves.filter(l => l.status === "pending").length;
  const approvedCount = leaves.filter(l => l.status === "approved").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground text-sm">{pendingCount} pending, {approvedCount} approved</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Apply Leave</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
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
              <div>
                <Label>Leave Type</Label>
                <Select value={form.leave_type} onValueChange={v => setForm(f => ({ ...f, leave_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="earned">Earned Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
                <div><Label>End Date *</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
              </div>
              <div><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : leaves.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No leave records</TableCell></TableRow>
              ) : leaves.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.employee_name}</TableCell>
                  <TableCell className="capitalize">{l.leave_type}</TableCell>
                  <TableCell>{format(new Date(l.start_date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{format(new Date(l.end_date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{l.days}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{l.reason || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "secondary"}>
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {l.status === "pending" && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => updateStatus(l.id, "approved")}><Check className="h-4 w-4 text-green-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => updateStatus(l.id, "rejected")}><X className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;
