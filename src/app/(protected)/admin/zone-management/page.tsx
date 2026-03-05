import { GET_ALL_ZONES } from "@/actions/zoneActions";
import ZoneHeader from "@/components/admin/zones/ZoneHeader";
import ZoneManagement from "@/components/admin/zones/ZoneManagement";
import AdminTemplate from "@/templates/AdminTemplate";
import PaginationBox from "@/ui/PaginationBox";
import { authorizeAccess } from "@/utils/authorizeAccess";

export default async function ZoneManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, search, status } = await searchParams;

  await authorizeAccess("zone_management");

  const { data, paginations } = await GET_ALL_ZONES({
    page: parseInt(page ?? "1"),
    search,
    status:
      status === "active" ? true : status === "inactive" ? false : undefined,
  });

  return (
    <AdminTemplate className="py-6 flex flex-col gap-6">
      <ZoneHeader />
      <ZoneManagement zones={data} />
      <PaginationBox
        baseUrl="/admin/zone-management"
        pagination={{
          currentPage: paginations.currentPage,
          totalPages: paginations.totalPages,
        }}
      />
    </AdminTemplate>
  );
}
