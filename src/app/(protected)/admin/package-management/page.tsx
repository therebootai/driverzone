import PackageManagementHeader from "@/components/admin/packages/PackageManagementHeader";
import AdminTemplate from "@/templates/AdminTemplate";

export default async function PackageManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, search, status, min_price, max_price } = await searchParams;

  return (
    <AdminTemplate className="py-6 flex flex-col gap-6">
      <PackageManagementHeader />
    </AdminTemplate>
  );
}
