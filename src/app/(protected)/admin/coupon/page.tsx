import CouponFullPage from "@/components/admin/couponcomponent/CouponFullPage";
import AdminTemplate from "@/templates/AdminTemplate";
import { authorizeAccess } from "@/utils/authorizeAccess";
import React, { Suspense } from "react";

const CouponPage = async () => {
  await authorizeAccess("coupon");
  return (
    <AdminTemplate>
      <Suspense fallback={<div>Loading...</div>}>
        <CouponFullPage />
      </Suspense>
    </AdminTemplate>
  );
};

export default CouponPage;
