import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LeaveRequestPublic = () => {
  const { userId } = useParams<{ userId: string }>();
  const [form, setForm] = useState({
    employee_name: "",
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.employee_name.trim() || !form.start_date || !form.end_date) {
      setError("Please fill all required fields");
      return;
    }

    if (new Date(form.end_date) < new Date(form.start_date)) {
      setError("End date must be after start date");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("submit-leave-request", {
        body: {
          user_id: userId,
          employee_name: form.employee_name.trim(),
          leave_type: form.leave_type,
          start_date: form.start_date,
          end_date: form.end_date,
          reason: form.reason,
        },
      });

      if (fnError) {
        setError("Failed to submit. Please try again.");
      } else if (data?.error) {
        setError(data.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">Invalid link</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Leave Request Submitted!</h2>
            <p className="text-muted-foreground">Your leave request has been sent for approval.</p>
            <Button className="mt-6" onClick={() => { setSubmitted(false); setForm({ employee_name: "", leave_type: "casual", start_date: "", end_date: "", reason: "" }); }}>
              Submit Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Leave Request</CardTitle>
          <p className="text-muted-foreground text-sm">Fill in the details to apply for leave</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <Label>Your Name (as registered) *</Label>
              <Input
                value={form.employee_name}
                onChange={e => setForm(f => ({ ...f, employee_name: e.target.value }))}
                placeholder="Enter your full name"
                maxLength={100}
              />
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
              <div>
                <Label>Start Date *</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Optional reason for leave"
                maxLength={500}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Leave Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequestPublic;
