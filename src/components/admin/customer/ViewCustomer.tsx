"use client";

import { customerTypes } from "@/types/types";

const Field = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex flex-col mb-3">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || "-"}</span>
  </div>
);

const ViewCustomer = ({ customer }: { customer: customerTypes }) => {
  return (
    <div className="p-5 w-full max-h-screen overflow-y-auto">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">
        Customer Details
      </h1>

      {/* ========== CUSTOMER BASIC INFO ========== */}
      <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <Field label="Customer ID" value={customer.customer_id} />
        <Field label="Customer Name" value={customer.name} />
        <Field label="Email Address" value={customer.email} />
        <Field label="Mobile Number" value={customer.mobile_number} />
        <Field label="SOS Mobile Number" value={customer.sos_mobile_number} />
        <Field label="Address" value={customer.address} />
        <Field label="Registration Date" value={customer.reg_date} />
        <Field label="Total Spent" value={customer.total_spent} />
        <Field label="Rating" value={customer.rating} />
        <Field label="Status" value={customer.status ? "Active" : "Inactive"} />
      </div>
    </div>
  );
};

export default ViewCustomer;
