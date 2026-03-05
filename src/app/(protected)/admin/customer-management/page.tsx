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
  await authorizeAccess("customer_management");
  const { search, status, page = "1" } = await searchParams;
  const { data, paginations } = await getAllCustomers({
    page: parseInt(page),
    searchTerm: search,
    status:
      status === "active" ? true : status === "inactive" ? false : undefined,
  });
  return (
    <AdminTemplate className="p-6 flex flex-col gap-6">
      <CustomerPageHeader />
      <Suspense
        fallback={
          <div className="flex justify-center items-center flex-1">
            <Loader />
          </div>
        }
      >
        <ManageCustomer
          allCustomer={data}
          pagination={paginations}
          fetchData={async () => {
            "use server";
            revalidatePath("/admin/customer-managment");
          }}
        />
      </Suspense>
      <PaginationBox
        baseUrl="/admin/customer-management"
        pagination={{
          currentPage: paginations.currentPage,
          totalPages: paginations.totalPages,
        }}
      />
    </AdminTemplate>
  );
};

export default CustomerManagement;
