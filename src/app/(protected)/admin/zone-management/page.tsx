import { GET_ALL_ZONES } from "@/actions/zoneActions";
import ZoneHeader from "@/components/admin/zones/ZoneHeader";
import ZoneManagement from "@/components/admin/zones/ZoneManagement";
import AdminTemplate from "@/templates/AdminTemplate";
import PaginationBox from "@/ui/PaginationBox";
import { authorizeAccess } from "@/utils/authorizeAccess";
import React, { Suspense } from "react";
import Loader from "@/ui/Loader";

export default async function ZoneManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  await authorizeAccess("zone_management");

  return (
    <AdminTemplate className="py-6 flex flex-col gap-6">
      <ZoneHeader />
      <Suspense
        key={JSON.stringify(params)}
        fallback={
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Loader />
          </div>
        }
      >
        <ZoneList searchParams={params} />
      </Suspense>
    </AdminTemplate>
  );
}

async function ZoneList({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { page, search, status } = searchParams;

  const { data, paginations } = await GET_ALL_ZONES({
    page: parseInt(page ?? "1"),
    search,
    status:
      status === "active" ? true : status === "inactive" ? false : undefined,
  });

  return (
    <>
      <ZoneManagement zones={data} />
      <PaginationBox
        baseUrl="/admin/zone-management"
        pagination={{
          currentPage: paginations.currentPage,
          totalPages: paginations.totalPages,
        }}
      />
    </>
  );
}
