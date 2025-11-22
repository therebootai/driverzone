import { GETALLUSERS } from "@/actions/userActions";
import UserManagementHeader from "@/components/admin/masters/user-manage/UserManagementHeader";
import UserTable from "@/components/admin/masters/user-manage/UserTable";
import AdminTemplate from "@/templates/AdminTemplate";
import PaginationBox from "@/ui/PaginationBox";

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page } = await searchParams;
  const { data, paginations } = await GETALLUSERS({
    page: parseInt(page ?? "1"),
  });
  return (
    <AdminTemplate className="py-6 flex flex-col gap-6">
      <UserManagementHeader />
      <UserTable users={data} />
      <PaginationBox
        baseUrl="/admin/masters/user-management"
        pagination={{
          currentPage: paginations.currentPage,
          totalPages: paginations.totalPages,
        }}
      />
    </AdminTemplate>
  );
}
