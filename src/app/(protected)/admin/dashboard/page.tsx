import { GET_ANALYTICS } from "@/actions/dashboardActions";
import DashboardCard from "@/components/admin/dashboard/DashboardCard";
import AdminTemplate from "@/templates/AdminTemplate";

export default async function AdminDashBoardPage() {
  const { data } = await GET_ANALYTICS();
  const { drivers, customers } = data;
  return (
    <AdminTemplate>
      <div className="grid xl:grid-cols-5 lg:grid-cols-4 grid-cols-2 gap-6 mt-4">
        <DashboardCard title="Total Drivers" count={drivers.total} />
        <DashboardCard title="Active Drivers" count={drivers.active} />
        <DashboardCard title="Total Customers" count={customers.total} />
        <DashboardCard title="Active Customers" count={customers.active} />
      </div>
    </AdminTemplate>
  );
}
