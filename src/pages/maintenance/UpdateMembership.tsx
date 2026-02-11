import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const UpdateMembership = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchNumber, setSearchNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [found, setFound] = useState(false);
  const [membershipId, setMembershipId] = useState("");
  const [form, setForm] = useState({
    member_name: "",
    email: "",
    phone: "",
    address: "",
    duration: "6 months",
    is_active: true,
  });

  const handleSearch = async () => {
    if (!searchNumber.trim()) {
      toast({ title: "Error", description: "Membership number is required.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("membership_number", searchNumber.trim())
      .single();
    setIsLoading(false);
    if (error || !data) {
      toast({ title: "Not Found", description: "No membership found with that number.", variant: "destructive" });
      setFound(false);
    } else {
      setMembershipId(data.id);
      setForm({
        member_name: data.member_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        duration: data.duration,
        is_active: data.is_active,
      });
      setFound(true);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.member_name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase
      .from("memberships")
      .update({
        member_name: form.member_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        duration: form.duration,
        is_active: form.is_active,
      })
      .eq("id", membershipId);
    setIsLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Membership updated successfully." });
      navigate("/maintenance");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Update Membership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="search">Membership Number *</Label>
                <Input
                  id="search"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  placeholder="e.g. MEM-00001"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                />
              </div>
              <Button type="button" className="mt-6" onClick={handleSearch} disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            {found && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="member_name">Member Name *</Label>
                  <Input id="member_name" value={form.member_name} onChange={(e) => handleChange("member_name", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} required />
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
                  <Checkbox id="is_active" checked={form.is_active} onCheckedChange={(c) => handleChange("is_active", !!c)} />
                  <Label htmlFor="is_active">Active Membership</Label>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Update Membership"}</Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/maintenance")}>Cancel</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UpdateMembership;
