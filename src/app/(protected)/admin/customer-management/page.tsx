import CustomerFullPage from "@/components/admin/customer/CustomerFullPage";
import AdminTemplate from "@/templates/AdminTemplate";
import React, { Suspense } from "react";

const CustomerManagement = () => {
  return (
    <AdminTemplate>
      <Suspense fallback={<div>Loading....</div>}>
        <CustomerFullPage />
      </Suspense>
    </AdminTemplate>
  );
};

export default CustomerManagement;
