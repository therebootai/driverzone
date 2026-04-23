import { GETALLUSERS } from "@/actions/userActions";
import UserManagementHeader from "@/components/admin/masters/user-manage/UserManagementHeader";
import UserTable from "@/components/admin/masters/user-manage/UserTable";
import AdminTemplate from "@/templates/AdminTemplate";
import PaginationBox from "@/ui/PaginationBox";
import { authorizeAccess } from "@/utils/authorizeAccess";
import React, { Suspense } from "react";
import Loader from "@/ui/Loader";

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  await authorizeAccess("user_management");
  const { page, search, role, status } = params;

  return (
    <AdminTemplate className="py-6 flex flex-col gap-6">
      <UserManagementHeader />
      <Suspense
        key={`${page}-${search}-${role}-${status}`}
        fallback={
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Loader />
          </div>
        }
      >
        <UserList searchParams={params} />
      </Suspense>
    </AdminTemplate>
  );
}


async function UserList({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { page, search, role, status } = searchParams;

  const { data, paginations } = await GETALLUSERS({
    page: parseInt(page ?? "1"),
    search,
    role: role === "admin" || role === "staff" ? role : undefined,
    status:
      status === "active" ? true : status === "inactive" ? false : undefined,
  });

  return (
    <>
      <UserTable users={data} />
      <PaginationBox
        baseUrl="/admin/masters/user-management"
        pagination={{
          currentPage: paginations.currentPage,
          totalPages: paginations.totalPages,
        }}
      />
    </>
  );
}
