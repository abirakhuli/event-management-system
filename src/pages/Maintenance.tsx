import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { UserPlus, Edit } from "lucide-react";

const Maintenance = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Maintenance</h2>
        <p className="text-muted-foreground">Manage memberships - Admin access only</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
        <Link to="/maintenance/add">
          <Card className="transition-shadow hover:shadow-lg cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <UserPlus className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Add Membership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Create a new membership record</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/maintenance/update">
          <Card className="transition-shadow hover:shadow-lg cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <Edit className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">Update Membership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Modify an existing membership</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;
