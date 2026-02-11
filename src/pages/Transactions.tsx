import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Payment {
  id: string;
  membership_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  memberships: { membership_number: string; member_name: string } | null;
}

interface MembershipOption {
  id: string;
  membership_number: string;
  member_name: string;
}

const Transactions = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [memberships, setMemberships] = useState<MembershipOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    membership_id: "",
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    notes: "",
  });

  const fetchPayments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("*, memberships(membership_number, member_name)")
      .order("created_at", { ascending: false });
    setPayments((data as Payment[]) ?? []);
    setLoading(false);
  };

  const fetchMemberships = async () => {
    const { data } = await supabase.from("memberships").select("id, membership_number, member_name");
    setMemberships((data as MembershipOption[]) ?? []);
  };

  useEffect(() => {
    fetchPayments();
    fetchMemberships();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.membership_id || !form.amount || !form.payment_date) {
      toast({ title: "Validation Error", description: "Membership, amount, and date are required.", variant: "destructive" });
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Validation Error", description: "Amount must be a positive number.", variant: "destructive" });
      return;
    }
    setFormLoading(true);
    const { error } = await supabase.from("payments").insert({
      membership_id: form.membership_id,
      amount,
      payment_date: form.payment_date,
      payment_method: form.payment_method,
      notes: form.notes.trim() || null,
      created_by: user?.id,
    });
    setFormLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Payment recorded successfully." });
      setDialogOpen(false);
      setForm({ membership_id: "", amount: "", payment_date: new Date().toISOString().split("T")[0], payment_method: "cash", notes: "" });
      fetchPayments();
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-muted-foreground">Payment records and history</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Membership *</Label>
                  <select
                    value={form.membership_id}
                    onChange={(e) => setForm({ ...form, membership_id: e.target.value })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select membership...</option>
                    {memberships.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.membership_number} - {m.member_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input id="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input id="payment_date" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex gap-4">
                    {["cash", "card", "bank transfer"].map((method) => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          value={method}
                          checked={form.payment_method === method}
                          onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="text-sm capitalize">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={formLoading}>{formLoading ? "Saving..." : "Add Payment"}</Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : payments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membership #</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.memberships?.membership_number ?? "-"}</TableCell>
                      <TableCell>{p.memberships?.member_name ?? "-"}</TableCell>
                      <TableCell>${Number(p.amount).toFixed(2)}</TableCell>
                      <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{p.payment_method}</TableCell>
                      <TableCell>{p.notes ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Transactions;
