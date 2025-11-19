import UserManagementHeader from "@/components/admin/masters/user-manage/UserManagementHeader";
import AdminTemplate from "@/templates/AdminTemplate";

export default function UserManagementPage() {
  return (
    <AdminTemplate className="py-6 flex flex-col gap-6">
      <UserManagementHeader />
    </AdminTemplate>
  );
}
