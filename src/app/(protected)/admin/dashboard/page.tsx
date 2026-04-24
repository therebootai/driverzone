import { GET_ANALYTICS } from "@/actions/dashboardActions";
import DashboardCard from "@/components/admin/dashboard/DashboardCard";
import AdminTemplate from "@/templates/AdminTemplate";
import BookingTrendsChart from "@/components/admin/dashboard/BookingTrendsChart";
import RealtimeRideNotification from "@/components/admin/RealtimeRideNotification";
import React, { Suspense } from "react";
import Loader from "@/ui/Loader";

export default function AdminDashBoardPage() {
  return (
    <AdminTemplate>
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
            <Loader />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>

      {/* Booking Trends Area Chart */}
      <BookingTrendsChart />

      {/* Real-time Listeners */}
      <RealtimeRideNotification />
    </AdminTemplate>
  );
}

async function DashboardContent() {
  const { data } = await GET_ANALYTICS();
  const { drivers, customers, summary } = data;
  return (
    <div className="grid xl:grid-cols-5 lg:grid-cols-4 grid-cols-2 gap-6 mt-4">
      <DashboardCard title="Total Drivers" count={drivers.total} />
      <DashboardCard title="Active Drivers" count={drivers.active} />
      <DashboardCard title="Total Customers" count={customers.total} />
      <DashboardCard title="Active Customers" count={customers.active} />
      <DashboardCard title="Completed Rides" count={summary.completed_rides} />
    </div>
  );
}
