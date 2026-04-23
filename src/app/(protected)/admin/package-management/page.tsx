import { GET_ALL_PACKAGES } from "@/actions/packageAction";
import PackageManagementHeader from "@/components/admin/packages/PackageManagementHeader";
import PackageTable from "@/components/admin/packages/PackageTable";
import AdminTemplate from "@/templates/AdminTemplate";
import PaginationBox from "@/ui/PaginationBox";
import { authorizeAccess } from "@/utils/authorizeAccess";

export default async function PackageManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const {
    page,
    search,
    status,
    package_type,
  } = await searchParams;

  await authorizeAccess("package_management");

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
    <AdminTemplate className="py-6 flex flex-col gap-6">
      <PackageManagementHeader />
      <PackageTable allPackages={data} />
      <PaginationBox
        baseUrl="/admin/package-management"
        pagination={{
          currentPage: paginations.currentPage,
          totalPages: paginations.totalPages,
        }}
      />
    </AdminTemplate>
  );
}
