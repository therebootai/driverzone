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
    min_price,
    max_price,
    package_type,
    discount_type,
  } = await searchParams;

  await authorizeAccess("package_management");

  const { data, paginations } = await GET_ALL_PACKAGES({
    page: parseInt(page ?? "1"),
    search,
    status:
      status === "active" ? true : status === "inactive" ? false : undefined,
    min_price: min_price ? undefined : Number(min_price),
    max_price: max_price ? undefined : Number(max_price),
    package_type:
      package_type &&
      (package_type === "city_tour" ||
        package_type === "outstation" ||
        package_type === "mini_outstation" ||
        package_type === "hills_tour" ||
        package_type === "long_tour" ||
        package_type === "drop_pickup_service")
        ? package_type
        : undefined,
    discount_type:
      discount_type &&
      (discount_type === "none" ||
        discount_type === "percentage" ||
        discount_type === "fixed")
        ? discount_type
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
