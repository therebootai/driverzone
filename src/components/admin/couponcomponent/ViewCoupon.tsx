import { CouponFormState } from "@/types/types";
import React from "react";

interface UserNameEntry {
  user_name: any;
  _id?: any;
}

interface ViewCouponProps {
  coupon: CouponFormState | null;
  onClose: () => void;
}

const ViewCoupon: React.FC<ViewCouponProps> = ({ coupon, onClose }) => {
  if (!coupon) return null;




    const formatDateToDDMMYYYY = (input: string | Date) => {
    const date = typeof input === "string" ? new Date(input) : input;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="w-full h-full">
  

      {/* Side panel */}
      <div className="w-full  bg-white h-full  flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-semibold text-site-black">
            Coupon Details
          </h2>
        
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm text-site-black">
          {/* Basic info */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Coupon ID</p>
            <p className="font-medium">{coupon.coupon_id || "-"}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Title</p>
              <p className="font-medium break-words">
                {coupon.coupon_title || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Coupon Code</p>
              <p className="font-medium uppercase">
                {coupon.coupon_code || "-"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Discount Type</p>
              <p className="font-medium capitalize">
                {coupon.coupon_type || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Discount Value</p>
              <p className="font-medium">{coupon.coupon_value || "-"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Minimum Booking Value</p>
              <p className="font-medium">
                {coupon.minimum_booking_value || "-"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Usage Limit</p>
              <p className="font-medium">{coupon.coupon_uses_limit || "-"}</p>
            </div>
          </div>

          {/* Validity */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Validity</p>
            <p className="font-medium">
             {coupon.coupon_startDate && coupon.coupon_ExpiryDate
  ? `${formatDateToDDMMYYYY(coupon.coupon_startDate)} → ${formatDateToDDMMYYYY(coupon.coupon_ExpiryDate)}`
  : "-"}

            </p>
          </div>

          {/* Users type & list */}
          <div className="space-y-2">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500">Users Type</p>
                <p className="font-medium capitalize">
                  {coupon.users_type === "all"
                    ? "All Users"
                    : "Individual Users"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 ">
                  Selected Users
                </p>
                <p className="font-medium ">
                  {coupon.user_name?.length || 0}
                </p>
              </div>
            </div>

            {coupon.user_name && coupon.user_name.length > 0 && (
              <div className="border rounded-md p-4 max-h-[20rem] overflow-y-auto bg-gray-50">
                <div className="grid grid-cols-4 text-sm font-semibold text-gray-600 border-b pb-1 mb-1">
                  <span>Name</span>
                  <span>Mobile</span>
                  <span>Email</span>
                  <span>Customer ID</span>
                </div>

                {coupon.user_name.map((entry: UserNameEntry, idx: number) => {
                  const u = entry.user_name as any;

                  // যদি fully populated customer object হয়
                  const name = u?.name || "-";
                  const mobile = u?.mobile_number || "-";
                  const email = u?.email || "-";
                  const customerId = u?.customer_id || "-";

                  // fallback: যদি শুধু ObjectId থাকে
                  const fallbackId =
                    typeof u === "string"
                      ? u
                      : u?.$oid
                      ? u.$oid
                      : u?._id
                      ? u._id.toString()
                      : "";

                  return (
                    <div
                      key={entry._id?.toString?.() || idx}
                      className="grid grid-cols-4 text-[11px] text-gray-800 py-2"
                    >
                      <span className="truncate" title={name || fallbackId}>
                        {name !== "-" ? name : fallbackId || "-"}
                      </span>
                      <span className="truncate" title={mobile}>
                        {mobile}
                      </span>
                      <span className="truncate" title={email}>
                        {email}
                      </span>
                      <span className="truncate" title={customerId}>
                        {customerId}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status & timestamps */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Status</p>
              <span
                className={
                  "inline-flex items-center px-2 py-[2px] rounded-full text-xs font-medium " +
                  (coupon.status
                    ? "bg-[#DCFCE7] text-[#006924]"
                    : "bg-[#FEE2E2] text-[#910000]")
                }
              >
                {coupon.status ? "Active" : "Inactive"}
              </span>
            </div>

            {/* <div className="space-y-1">
              <p className="text-xs text-gray-500">Created At</p>
              <p className="text-xs">{formatDate(coupon.createdAt as any)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-xs">{formatDate(coupon.updatedAt as any)}</p>
            </div> */}
          </div>
        </div>


     
      </div>
    </div>
  );
};

export default ViewCoupon;
