import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AddMembership = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    member_name: "",
    email: "",
    phone: "",
    address: "",
    duration: "6 months",
    is_active: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.member_name.trim()) return "Member name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Valid email is required.";
    if (!form.phone.trim() || !/^\d{7,15}$/.test(form.phone.replace(/[\s\-()]/g, ""))) return "Valid phone number is required.";
    if (!form.address.trim()) return "Address is required.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast({ title: "Validation Error", description: error, variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error: dbError } = await supabase.from("memberships").insert({
      member_name: form.member_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      duration: form.duration,
      is_active: form.is_active,
      created_by: user?.id,
    });
    setIsLoading(false);
    if (dbError) {
      toast({ title: "Error", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Membership added successfully." });
      navigate("/maintenance");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Membership</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member_name">Member Name *</Label>
                <Input id="member_name" value={form.member_name} onChange={(e) => handleChange("member_name", e.target.value)} placeholder="Full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="email@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="1234567890" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="Full address" required />
              </div>
              <div className="space-y-2">
                <Label>Membership Duration *</Label>
                <div className="flex gap-6">
                  {["6 months", "1 year", "2 years"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="duration"
                        value={opt}
                        checked={form.duration === opt}
                        onChange={(e) => handleChange("duration", e.target.value)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => handleChange("is_active", !!checked)}
                />
                <Label htmlFor="is_active">Active Membership</Label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Add Membership"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/maintenance")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddMembership;
