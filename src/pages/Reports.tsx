import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface Membership {
  id: string;
  membership_number: string;
  member_name: string;
  email: string;
  phone: string;
  address: string;
  duration: string;
  is_active: boolean;
  created_at: string;
}

const Reports = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [search, setSearch] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase.from("memberships").select("*").order("created_at", { ascending: false });
      if (durationFilter !== "all") {
        query = query.eq("duration", durationFilter);
      }
      const { data } = await query;
      setMemberships((data as Membership[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [durationFilter]);

  const filtered = memberships.filter(
    (m) =>
      m.membership_number.toLowerCase().includes(search.toLowerCase()) ||
      m.member_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-muted-foreground">View and filter membership records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membership Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by number, name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>Duration:</Label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No memberships found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membership #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-sm">{m.membership_number}</TableCell>
                      <TableCell>{m.member_name}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>{m.phone}</TableCell>
                      <TableCell>{m.duration}</TableCell>
                      <TableCell>
                        <Badge variant={m.is_active ? "default" : "secondary"}>
                          {m.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(m.created_at).toLocaleDateString()}</TableCell>
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

export default Reports;
