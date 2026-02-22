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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useNavigate } from "react-router-dom";

interface PayrollRule {
  id: string;
  name: string;
  type: string;
  calculation_type: string;
  value: number;
  gender_condition: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  name: "",
  type: "allowance",
  calculation_type: "fixed",
  value: 0,
  gender_condition: "all",
  is_active: true,
};

const PayrollSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState<PayrollRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchRules = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("payroll_rules")
      .select("*")
      .order("type")
      .order("name");
    if (error) { toast.error("Failed to load payroll rules"); return; }
    setRules(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const handleSubmit = async () => {
    if (!user || !form.name.trim()) { toast.error("Name is required"); return; }
    if (form.value <= 0) { toast.error("Value must be greater than 0"); return; }

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      type: form.type,
      calculation_type: form.calculation_type,
      value: Number(form.value),
      gender_condition: form.gender_condition === "all" ? null : form.gender_condition,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("payroll_rules").update(payload).eq("id", editingId);
      if (error) { toast.error("Failed to update rule"); return; }
      toast.success("Rule updated");
    } else {
      const { error } = await supabase.from("payroll_rules").insert(payload);
      if (error) { toast.error("Failed to add rule"); return; }
      toast.success("Rule added");
    }
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchRules();
  };

  const handleEdit = (rule: PayrollRule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      type: rule.type,
      calculation_type: rule.calculation_type,
      value: rule.value,
      gender_condition: rule.gender_condition || "all",
      is_active: rule.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    const { error } = await supabase.from("payroll_rules").delete().eq("id", id);
    if (error) { toast.error("Failed to delete rule"); return; }
    toast.success("Rule deleted");
    fetchRules();
  };

  const toggleActive = async (rule: PayrollRule) => {
    const { error } = await supabase.from("payroll_rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    if (error) { toast.error("Failed to update"); return; }
    fetchRules();
  };

  const allowances = rules.filter(r => r.type === "allowance");
  const deductions = rules.filter(r => r.type === "deduction");

  const genderLabel = (g: string | null) => {
    if (!g) return "All";
    return g === "M" ? "Male Only" : "Female Only";
  };

  const RulesTable = ({ items, title }: { items: PayrollRule[]; title: string }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title} ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No {title.toLowerCase()} configured</TableCell></TableRow>
            ) : items.map(rule => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{rule.calculation_type === "fixed" ? "Fixed" : "% of Basic"}</Badge>
                </TableCell>
                <TableCell>{rule.calculation_type === "fixed" ? formatINR(rule.value) : `${rule.value}%`}</TableCell>
                <TableCell>
                  <Badge variant={rule.gender_condition ? "secondary" : "outline"}>{genderLabel(rule.gender_condition)}</Badge>
                </TableCell>
                <TableCell>
                  <Switch checked={rule.is_active} onCheckedChange={() => toggleActive(rule)} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payroll Settings</h1>
            <p className="text-muted-foreground text-sm">Configure allowance & deduction rules with gender-based conditions</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Rule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Rule" : "Add Rule"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. HRA, PF, ESI" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allowance">Allowance</SelectItem>
                      <SelectItem value="deduction">Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Calculation</Label>
                  <Select value={form.calculation_type} onValueChange={v => setForm(f => ({ ...f, calculation_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percentage">% of Basic Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{form.calculation_type === "fixed" ? "Amount (₹)" : "Percentage (%)"}</Label>
                  <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Gender Condition</Label>
                  <Select value={form.gender_condition} onValueChange={v => setForm(f => ({ ...f, gender_condition: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="M">Male Only</SelectItem>
                      <SelectItem value="F">Female Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Active</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <RulesTable items={allowances} title="Allowances" />
      <RulesTable items={deductions} title="Deductions" />
    </div>
  );
};

export default PayrollSettings;
