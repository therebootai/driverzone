import ManageCoupon from "@/components/admin/couponcomponent/ManageCoupon";
import CouponPageHeader from "@/components/admin/couponcomponent/CouponPageHeader";
import AdminTemplate from "@/templates/AdminTemplate";
import { authorizeAccess } from "@/utils/authorizeAccess";
import { getAllCoupon } from "@/actions/couponActions";
import PaginationBox from "@/ui/PaginationBox";
import { revalidatePath } from "next/cache";
import React, { Suspense } from "react";
import Loader from "@/ui/Loader";

const CouponPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  await authorizeAccess("coupon");
  const { search, status, coupon_type, startDate, endDate, page = "1" } = await searchParams;

  const result = await getAllCoupon({
    page: parseInt(page),
    limit: 20,
    searchTerm: search,
    status:
      status === "Active" ? true : status === "Inactive" ? false : undefined,
    coupon_type: coupon_type,
    startDate: startDate,
    endDate: endDate,
  });

  const data = result?.data || [];
  const paginations = result?.paginations || { currentPage: 1, totalPages: 1 };

  return (
    <AdminTemplate className="p-4 flex flex-col gap-4">
      <CouponPageHeader
        fetchData={async () => {
          "use server";
          revalidatePath("/admin/coupon");
        }}
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center flex-1">
            <Loader />
          </div>
        }
      >
        <ManageCoupon
          allCoupon={data}
          fetchData={async () => {
            "use server";
            revalidatePath("/admin/coupon");
          }}
        />
      </Suspense>
      <PaginationBox
        baseUrl="/admin/coupon"
        pagination={{
          currentPage: paginations.currentPage,
          totalPages: paginations.totalPages,
        }}
      />
    </AdminTemplate>
  );
};

export default CouponPage;
