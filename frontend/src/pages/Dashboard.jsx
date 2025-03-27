import { useUserRole } from "@/components/UserProvider";
import { ShopOwnerDashboard } from "@/components/ShopOwnerDashboard";
import { CustomerDashboard } from "@/components/CustomerDashboard";

export function Dashboard() {
  const { role, isRoleLoading } = useUserRole();
  
  if (isRoleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {role === "owner" ? <ShopOwnerDashboard /> : <CustomerDashboard />}
    </div>
  );
}