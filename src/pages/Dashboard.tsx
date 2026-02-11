import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Settings, FileText, CreditCard, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState({ memberships: 0, payments: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: mCount }, { count: pCount }] = await Promise.all([
        supabase.from("memberships").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("*", { count: "exact", head: true }),
      ]);
      setStats({ memberships: mCount ?? 0, payments: pCount ?? 0 });
    };
    fetchStats();
  }, []);

  const cards = [
    ...(isAdmin ? [{ title: "Maintenance", desc: "Manage memberships", icon: Settings, to: "/maintenance", color: "bg-primary" }] : []),
    { title: "Total Memberships", desc: `${stats.memberships} active`, icon: Users, to: "/reports", color: "bg-accent" },
    { title: "Reports", desc: "View membership reports", icon: FileText, to: "/reports", color: "bg-success" },
    { title: "Transactions", desc: `${stats.payments} payments`, icon: CreditCard, to: "/transactions", color: "bg-warning" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Welcome back!</h2>
        <p className="text-muted-foreground">Here's an overview of your event management system.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title} to={card.to}>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon className="h-6 w-6 text-card" />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
