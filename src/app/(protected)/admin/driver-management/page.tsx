import { getAllDriver } from "@/actions/driverActions";
import DriverHeader from "@/components/admin/driver/DriverHeader";
import ManageDriver from "@/components/admin/driver/ManageDriver";
import AdminTemplate from "@/templates/AdminTemplate";
import { authorizeAccess } from "@/utils/authorizeAccess";
import React, { Suspense } from "react";
import Loader from "@/ui/Loader";

const DriverManagement = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page: string;
    search?: string;
    status?: string;
    isOnline?: string;
    verified?: string;
    pendingApproval?: string;
  }>;
}) => {
  const params = await searchParams;
  await authorizeAccess("driver_management");
  const { page, search, status, isOnline, verified, pendingApproval } = params;

  return (
    <AdminTemplate>
      <div className="p-6 flex flex-col gap-6 ">
        <div>
          <DriverHeader />
        </div>
        <Suspense
          key={`${page}-${search}-${status}-${isOnline}-${verified}-${pendingApproval}`}
          fallback={
            <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Loader />
            </div>
          }
        >
          <DriverList searchParams={params} />
        </Suspense>
      </div>
    </AdminTemplate>
  );
};

async function DriverList({
  searchParams,
}: {
  searchParams: {
    page: string;
    search?: string;
    status?: string;
    isOnline?: string;
    verified?: string;
    pendingApproval?: string;
  };
}) {
  const { page, search, status, isOnline, verified, pendingApproval } =
    searchParams;

  const { data, paginations } = await getAllDriver({
    page: Number(page),
    limit: 20,
    searchTerm: search,
    status: status === "true" ? true : status === "false" ? false : undefined,
    isOnline:
      isOnline === "true" ? true : isOnline === "false" ? false : undefined,
    verified:
      verified === "true" ? true : verified === "false" ? false : undefined,
    pendingApproval:
      pendingApproval === "true"
        ? true
        : pendingApproval === "false"
          ? false
          : undefined,
  });

  return (
    <div>
      <ManageDriver allDrivers={data} pagination={paginations} />
    </div>
  );
}

export default DriverManagement;
