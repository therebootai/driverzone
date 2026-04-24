import { GET_ALL_PACKAGES } from "@/actions/packageAction";
import PackageManagementHeader from "@/components/admin/packages/PackageManagementHeader";
import PackageTable from "@/components/admin/packages/PackageTable";
import AdminTemplate from "@/templates/AdminTemplate";
import PaginationBox from "@/ui/PaginationBox";
import { authorizeAccess } from "@/utils/authorizeAccess";
import React, { Suspense } from "react";
import Loader from "@/ui/Loader";

export default async function PackageManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  await authorizeAccess("package_management");

  return (
    <AdminTemplate className="py-6 flex flex-col gap-6">
      <PackageManagementHeader />
      <Suspense
        key={JSON.stringify(params)}
        fallback={
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Loader />
          </div>
        }
      >
        <PackageList searchParams={params} />
      </Suspense>
    </AdminTemplate>
  );
}

async function PackageList({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { page, search, status, package_type } = searchParams;

  const { data, paginations } = await GET_ALL_PACKAGES({
    page: parseInt(page ?? "1"),
    search,
    status:
      status === "active" ? true : status === "inactive" ? false : undefined,
    package_type:
      package_type &&
      (package_type === "in_city" ||
        package_type === "outstation" ||
        package_type === "mini_outstation" ||
        package_type === "hills_tour" ||
        package_type === "long_tour" ||
        package_type === "drop_pickup_service")
        ? package_type
        : undefined,
  });

  return (
    <>
      <PackageTable allPackages={data} />
      <PaginationBox
        baseUrl="/admin/package-management"
        pagination={{
          currentPage: paginations.currentPage,
          totalPages: paginations.totalPages,
        }}
      />
    </>
  );
}
