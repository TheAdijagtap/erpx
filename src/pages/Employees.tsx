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
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Pencil, Trash2, Users, X, Mail, Phone, Building, Briefcase, Calendar, CreditCard, MapPin, AlertTriangle } from "lucide-react";
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
  uan: string | null;
  created_at: string;
}

const emptyForm = {
  name: "", email: "", phone: "", department: "", designation: "",
  joining_date: "", status: "active", basic_salary: 0, allowances: 0,
  deductions: 0, bank_name: "", bank_account_number: "", bank_ifsc_code: "",
  address: "", emergency_contact: "", notes: "", uan: "",
};

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

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
      uan: form.uan || null,
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
      uan: emp.uan || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Employee deleted");
    if (selectedEmployee?.id === id) setSelectedEmployee(null);
    fetchEmployees();
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.department || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.designation || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = employees.filter(e => e.status === "active").length;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-sm font-medium">{value}</div>
        </div>
      </div>
    );
  };

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
              <div><Label>UAN</Label><Input value={form.uan} onChange={e => setForm(f => ({ ...f, uan: e.target.value }))} placeholder="Universal Account Number" /></div>
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

      <div className="flex gap-6">
        <Card className="flex-1">
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
                  <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedEmployee(emp)}>
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
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
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

        {/* Employee Detail Card */}
        {selectedEmployee && (
          <Card className="w-[340px] shrink-0 self-start sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{selectedEmployee.name}</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedEmployee(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedEmployee.status === "active" ? "default" : "secondary"}>{selectedEmployee.status}</Badge>
                {selectedEmployee.designation && <span className="text-xs text-muted-foreground">{selectedEmployee.designation}</span>}
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              <InfoRow icon={Mail} label="Email" value={selectedEmployee.email} />
              <InfoRow icon={Phone} label="Phone" value={selectedEmployee.phone} />
              <InfoRow icon={Building} label="Department" value={selectedEmployee.department} />
              <InfoRow icon={Briefcase} label="Designation" value={selectedEmployee.designation} />
              <InfoRow icon={Calendar} label="Joining Date" value={selectedEmployee.joining_date} />
              <InfoRow icon={MapPin} label="Address" value={selectedEmployee.address} />
              <InfoRow icon={AlertTriangle} label="Emergency Contact" value={selectedEmployee.emergency_contact} />

              <Separator className="my-3" />
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Salary Details</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Basic:</span> {formatINR(selectedEmployee.basic_salary)}</div>
                <div><span className="text-muted-foreground">Allowances:</span> {formatINR(selectedEmployee.allowances)}</div>
                <div><span className="text-muted-foreground">Deductions:</span> {formatINR(selectedEmployee.deductions)}</div>
                <div className="font-semibold"><span className="text-muted-foreground">Net:</span> {formatINR(selectedEmployee.basic_salary + selectedEmployee.allowances - selectedEmployee.deductions)}</div>
              </div>

              <Separator className="my-3" />
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Bank & UAN</div>
              <InfoRow icon={CreditCard} label="Bank" value={selectedEmployee.bank_name} />
              <InfoRow icon={CreditCard} label="Account No." value={selectedEmployee.bank_account_number} />
              <InfoRow icon={CreditCard} label="IFSC" value={selectedEmployee.bank_ifsc_code} />
              <InfoRow icon={CreditCard} label="UAN" value={selectedEmployee.uan} />

              {selectedEmployee.notes && (
                <>
                  <Separator className="my-3" />
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</div>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.notes}</p>
                </>
              )}

              <div className="pt-3">
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(selectedEmployee)}>
                  <Pencil className="mr-2 h-3 w-3" /> Edit Employee
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Employees;
