import { getAllDriver } from "@/actions/driverActions";
import DriverHeader from "@/components/admin/driver/DriverHeader";
import ManageDriver from "@/components/admin/driver/ManageDriver";
import AdminTemplate from "@/templates/AdminTemplate";
import { authorizeAccess } from "@/utils/authorizeAccess";
import React, { Suspense } from "react";

const DriverManagement = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page: string;
    search?: string;
    status?: string;
    isOnline?: string;
    verified?: string;
  }>;
}) => {
  await authorizeAccess("driver_management");
  const { page, search, status, isOnline, verified } = await searchParams;

  const { data, paginations } = await getAllDriver({
    page: Number(page),
    limit: 20,
    searchTerm: search,
    status: status === "true" ? true : status === "false" ? false : undefined,
    isOnline:
      isOnline === "true" ? true : isOnline === "false" ? false : undefined,
    verified:
      verified === "true" ? true : verified === "false" ? false : undefined,
  });

  return (
    <AdminTemplate>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="p-6 flex flex-col gap-6 ">
          <div>
            <DriverHeader />
          </div>
          <div>
            <ManageDriver allDrivers={data} pagination={paginations} />
          </div>
        </div>
      </Suspense>
    </AdminTemplate>
  );
};

export default DriverManagement;
