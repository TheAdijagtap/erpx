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
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import { formatINR } from "@/lib/format";

interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  designation: string | null;
  joining_date: string | null;
  status: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc_code: string | null;
  address: string | null;
  emergency_contact: string | null;
  notes: string | null;
  created_at: string;
}

const emptyForm = {
  name: "", email: "", phone: "", department: "", designation: "",
  joining_date: "", status: "active", basic_salary: 0, allowances: 0,
  deductions: 0, bank_name: "", bank_account_number: "", bank_ifsc_code: "",
  address: "", emergency_contact: "", notes: "",
};

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchEmployees = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load employees"); return; }
    setEmployees(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSubmit = async () => {
    if (!user || !form.name.trim()) { toast.error("Name is required"); return; }
    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      department: form.department || null,
      designation: form.designation || null,
      joining_date: form.joining_date || null,
      status: form.status,
      basic_salary: Number(form.basic_salary) || 0,
      allowances: Number(form.allowances) || 0,
      deductions: Number(form.deductions) || 0,
      bank_name: form.bank_name || null,
      bank_account_number: form.bank_account_number || null,
      bank_ifsc_code: form.bank_ifsc_code || null,
      address: form.address || null,
      emergency_contact: form.emergency_contact || null,
      notes: form.notes || null,
    };

    if (editingId) {
      const { error } = await supabase.from("employees").update(payload).eq("id", editingId);
      if (error) { toast.error("Failed to update employee"); return; }
      toast.success("Employee updated");
    } else {
      const { error } = await supabase.from("employees").insert(payload);
      if (error) { toast.error("Failed to add employee"); return; }
      toast.success("Employee added");
    }
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchEmployees();
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name, email: emp.email || "", phone: emp.phone || "",
      department: emp.department || "", designation: emp.designation || "",
      joining_date: emp.joining_date || "", status: emp.status,
      basic_salary: emp.basic_salary, allowances: emp.allowances,
      deductions: emp.deductions, bank_name: emp.bank_name || "",
      bank_account_number: emp.bank_account_number || "",
      bank_ifsc_code: emp.bank_ifsc_code || "", address: emp.address || "",
      emergency_contact: emp.emergency_contact || "", notes: emp.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Employee deleted");
    fetchEmployees();
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.department || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.designation || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = employees.filter(e => e.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground text-sm">{activeCount} active of {employees.length} total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Employee</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Employee" : "Add Employee"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
              <div><Label>Designation</Label><Input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} /></div>
              <div><Label>Joining Date</Label><Input type="date" value={form.joining_date} onChange={e => setForm(f => ({ ...f, joining_date: e.target.value }))} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Basic Salary</Label><Input type="number" value={form.basic_salary} onChange={e => setForm(f => ({ ...f, basic_salary: Number(e.target.value) }))} /></div>
              <div><Label>Allowances</Label><Input type="number" value={form.allowances} onChange={e => setForm(f => ({ ...f, allowances: Number(e.target.value) }))} /></div>
              <div><Label>Deductions</Label><Input type="number" value={form.deductions} onChange={e => setForm(f => ({ ...f, deductions: Number(e.target.value) }))} /></div>
              <div><Label>Bank Name</Label><Input value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} /></div>
              <div><Label>Account Number</Label><Input value={form.bank_account_number} onChange={e => setForm(f => ({ ...f, bank_account_number: e.target.value }))} /></div>
              <div><Label>IFSC Code</Label><Input value={form.bank_ifsc_code} onChange={e => setForm(f => ({ ...f, bank_ifsc_code: e.target.value }))} /></div>
              <div><Label>Emergency Contact</Label><Input value={form.emergency_contact} onChange={e => setForm(f => ({ ...f, emergency_contact: e.target.value }))} /></div>
              <div className="col-span-2"><Label>Address</Label><Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No employees found</TableCell></TableRow>
              ) : filtered.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.department || "—"}</TableCell>
                  <TableCell>{emp.designation || "—"}</TableCell>
                  <TableCell>{emp.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatINR(emp.basic_salary + emp.allowances - emp.deductions)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
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

export default Employees;
