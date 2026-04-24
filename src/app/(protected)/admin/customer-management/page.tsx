import { getAllCustomers } from "@/actions/customerActions";
import CustomerPageHeader from "@/components/admin/customer/CustomerPageHeader";
import ManageCustomer from "@/components/admin/customer/ManageCustomer";
import AdminTemplate from "@/templates/AdminTemplate";
import Loader from "@/ui/Loader";
import PaginationBox from "@/ui/PaginationBox";
import { authorizeAccess } from "@/utils/authorizeAccess";
import { revalidatePath } from "next/cache";
import React, { Suspense } from "react";

const CustomerManagement = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { search, status, page = "1" } = params;
  await authorizeAccess("customer_management");

  return (
    <AdminTemplate className="p-6 flex flex-col gap-6">
      <CustomerPageHeader />
      <Suspense
        key={`${page}-${search}-${status}`}
        fallback={
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Loader />
          </div>
        }
      >
        <CustomerList searchParams={params} />
      </Suspense>
    </AdminTemplate>
  );
};

async function CustomerList({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { search, status, page = "1" } = searchParams;
  const { data, paginations } = await getAllCustomers({
    page: parseInt(page),
    searchTerm: search,
    status:
      status === "active" ? true : status === "inactive" ? false : undefined,
  });

  return (
    <>
      <ManageCustomer
        allCustomer={data}
        fetchData={async () => {
          "use server";
          revalidatePath("/admin/customer-managment");
        }}
      />
      <PaginationBox
        baseUrl="/admin/customer-management"
        pagination={{
          currentPage: paginations.currentPage,
          totalPages: paginations.totalPages,
        }}
      />
    </>
  );
}

export default CustomerManagement;
