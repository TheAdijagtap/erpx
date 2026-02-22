import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/store/SupabaseDataContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, IndianRupee, Download, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/format";
import { downloadPayslip } from "@/components/payroll/PayslipDownload";

interface Payslip {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  days_worked: number;
  total_days: number;
  leaves_taken: number;
  gross_salary: number;
  net_salary: number;
  status: string;
  paid_date: string | null;
  notes: string | null;
  employee_name?: string;
  employee_designation?: string;
  employee_department?: string;
  employee_bank_name?: string;
  employee_bank_account?: string;
  employee_bank_ifsc?: string;
}

interface Employee {
  id: string;
  name: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  designation: string | null;
  department: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc_code: string | null;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const Payroll = () => {
  const { user } = useAuth();
  const { businessInfo } = useData();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({
    employee_id: "", days_worked: 30, total_days: 30, leaves_taken: 0,
    basic_salary: 0, allowances: 0, deductions: 0, notes: "",
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [{ data: emps }, { data: slips }] = await Promise.all([
      supabase.from("employees").select("id, name, basic_salary, allowances, deductions, designation, department, bank_name, bank_account_number, bank_ifsc_code").eq("status", "active").order("name"),
      supabase.from("payslips").select("*").order("year", { ascending: false }).order("month", { ascending: false }),
    ]);
    setEmployees(emps || []);
    const empMap = new Map((emps || []).map(e => [e.id, e]));
    setPayslips((slips || []).map(s => {
      const emp = empMap.get(s.employee_id);
      return {
        ...s,
        employee_name: emp?.name || "Unknown",
        employee_designation: emp?.designation || undefined,
        employee_department: emp?.department || undefined,
        employee_bank_name: emp?.bank_name || undefined,
        employee_bank_account: emp?.bank_account_number || undefined,
        employee_bank_ifsc: emp?.bank_ifsc_code || undefined,
      };
    }));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onEmployeeSelect = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setForm(f => ({
        ...f, employee_id: empId,
        basic_salary: emp.basic_salary, allowances: emp.allowances, deductions: emp.deductions,
      }));
    }
  };

  const grossSalary = (form.basic_salary + form.allowances) * (form.days_worked / form.total_days);
  const netSalary = grossSalary - form.deductions;

  const handleSubmit = async () => {
    if (!user || !form.employee_id) { toast.error("Select an employee"); return; }
    const { error } = await supabase.from("payslips").insert({
      user_id: user.id,
      employee_id: form.employee_id,
      month: selectedMonth,
      year: selectedYear,
      basic_salary: form.basic_salary,
      allowances: form.allowances,
      deductions: form.deductions,
      days_worked: form.days_worked,
      total_days: form.total_days,
      leaves_taken: form.leaves_taken,
      gross_salary: Math.round(grossSalary * 100) / 100,
      net_salary: Math.round(netSalary * 100) / 100,
      status: "draft",
    });
    if (error) {
      if (error.code === "23505") { toast.error("Payslip already exists for this employee and month"); return; }
      toast.error("Failed to generate payslip"); return;
    }
    toast.success("Payslip generated");
    setDialogOpen(false);
    setForm({ employee_id: "", days_worked: 30, total_days: 30, leaves_taken: 0, basic_salary: 0, allowances: 0, deductions: 0, notes: "" });
    fetchData();
  };

  const generateAll = async () => {
    if (!user) return;
    const existing = payslips.filter(p => p.month === selectedMonth && p.year === selectedYear).map(p => p.employee_id);
    const toGenerate = employees.filter(e => !existing.includes(e.id));
    if (toGenerate.length === 0) { toast.info("All payslips already generated for this month"); return; }

    const inserts = toGenerate.map(emp => {
      const gross = emp.basic_salary + emp.allowances;
      return {
        user_id: user.id, employee_id: emp.id, month: selectedMonth, year: selectedYear,
        basic_salary: emp.basic_salary, allowances: emp.allowances, deductions: emp.deductions,
        days_worked: 30, total_days: 30, leaves_taken: 0,
        gross_salary: gross, net_salary: gross - emp.deductions, status: "draft",
      };
    });
    const { error } = await supabase.from("payslips").insert(inserts);
    if (error) { toast.error("Failed to generate payslips"); return; }
    toast.success(`Generated ${toGenerate.length} payslips`);
    fetchData();
  };

  const updatePayslipStatus = async (id: string, status: string) => {
    const update: any = { status };
    if (status === "paid") update.paid_date = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("payslips").update(update).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success(`Payslip marked as ${status}`);
    fetchData();
  };

  const deletePayslip = async (id: string) => {
    const { error } = await supabase.from("payslips").delete().eq("id", id);
    if (error) { toast.error("Failed to delete payslip"); return; }
    toast.success("Payslip deleted");
    fetchData();
  };

  const handleDownloadPayslip = (p: Payslip) => {
    downloadPayslip(
      {
        employee_name: p.employee_name || "Unknown",
        employee_designation: p.employee_designation,
        employee_department: p.employee_department,
        employee_bank_name: p.employee_bank_name,
        employee_bank_account: p.employee_bank_account,
        employee_bank_ifsc: p.employee_bank_ifsc,
        month: p.month,
        year: p.year,
        basic_salary: p.basic_salary,
        allowances: p.allowances,
        deductions: p.deductions,
        days_worked: p.days_worked,
        total_days: p.total_days,
        leaves_taken: p.leaves_taken,
        gross_salary: p.gross_salary,
        net_salary: p.net_salary,
        status: p.status,
        paid_date: p.paid_date,
      },
      {
        name: businessInfo.name,
        address: businessInfo.address,
        logo: businessInfo.logo,
        phone: businessInfo.phone,
        email: businessInfo.email,
      }
    );
  };

  const filteredSlips = payslips.filter(p => p.month === selectedMonth && p.year === selectedYear);
  const totalNet = filteredSlips.reduce((s, p) => s + p.net_salary, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground text-sm">{MONTHS[selectedMonth - 1]} {selectedYear} — {filteredSlips.length} payslips</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" className="w-[100px]" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} />
          <Button variant="outline" onClick={generateAll}><FileText className="mr-2 h-4 w-4" />Generate All</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Create Payslip</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate Payslip — {MONTHS[selectedMonth - 1]} {selectedYear}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Employee *</Label>
                  <Select value={form.employee_id} onValueChange={onEmployeeSelect}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Days Worked</Label><Input type="number" value={form.days_worked} onChange={e => setForm(f => ({ ...f, days_worked: Number(e.target.value) }))} /></div>
                  <div><Label>Total Days</Label><Input type="number" value={form.total_days} onChange={e => setForm(f => ({ ...f, total_days: Number(e.target.value) }))} /></div>
                  <div><Label>Leaves</Label><Input type="number" value={form.leaves_taken} onChange={e => setForm(f => ({ ...f, leaves_taken: Number(e.target.value) }))} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Basic Salary</Label><Input type="number" value={form.basic_salary} onChange={e => setForm(f => ({ ...f, basic_salary: Number(e.target.value) }))} /></div>
                  <div><Label>Allowances</Label><Input type="number" value={form.allowances} onChange={e => setForm(f => ({ ...f, allowances: Number(e.target.value) }))} /></div>
                  <div><Label>Deductions</Label><Input type="number" value={form.deductions} onChange={e => setForm(f => ({ ...f, deductions: Number(e.target.value) }))} /></div>
                </div>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <div className="flex justify-between text-sm"><span>Gross Salary:</span><span className="font-medium">{formatINR(grossSalary)}</span></div>
                  <div className="flex justify-between text-sm font-bold"><span>Net Salary:</span><span>{formatINR(netSalary)}</span></div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Generate</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Payroll:</span>
            <span className="text-xl font-bold">{formatINR(totalNet)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filteredSlips.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No payslips for this period</TableCell></TableRow>
              ) : filteredSlips.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.employee_name}</TableCell>
                  <TableCell>{formatINR(p.basic_salary)}</TableCell>
                  <TableCell>{formatINR(p.allowances)}</TableCell>
                  <TableCell>{formatINR(p.deductions)}</TableCell>
                  <TableCell>{p.days_worked}/{p.total_days}</TableCell>
                  <TableCell className="font-medium">{formatINR(p.net_salary)}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "paid" ? "default" : p.status === "approved" ? "secondary" : "outline"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {p.status === "draft" && <Button size="sm" variant="outline" onClick={() => updatePayslipStatus(p.id, "approved")}>Approve</Button>}
                      {p.status === "approved" && <Button size="sm" variant="outline" onClick={() => updatePayslipStatus(p.id, "paid")}>Mark Paid</Button>}
                      <Button size="sm" variant="ghost" onClick={() => handleDownloadPayslip(p)} title="Download Payslip">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deletePayslip(p.id)} title="Delete Payslip">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default Payroll;
