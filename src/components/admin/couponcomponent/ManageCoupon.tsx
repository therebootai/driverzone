"use client";
import { CouponFormState } from "@/types/types";
import React, { useState, useEffect } from "react";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import SidePopup from "@/ui/SidePopup";
import ViewCoupon from "./ViewCoupon";
import { deleteCoupon, updateCouponStatus } from "@/actions/couponActions";
import AddCoupon from "./AddCoupon";

const ManageCoupon = ({
  allCoupon,
  fetchData,
}: {
  allCoupon: CouponFormState[];
  fetchData: any;
}) => {
  const [selectedCoupon, setSelectedCoupon] = useState<CouponFormState | null>(
    null
  );
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { getParam, updateFilters } = useQueryParamsAdvanced();
  const viewId = getParam("view");

  useEffect(() => {
    if (viewId && allCoupon) {
      const coupon = allCoupon.find(
        (c: any) => String(c._id) === viewId || c.coupon_id === viewId
      );
      if (coupon) {
        setSelectedCoupon(coupon);
        setShowView(true);
      }
    } else {
      setShowView(false);
    }
  }, [viewId, allCoupon]);

  const formatDateToDDMMYYYY = (input: string | Date) => {
    const date = typeof input === "string" ? new Date(input) : input;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  };

  const handleToggleStatus = async (
    coupon_id: string,
    currentStatus: boolean
  ) => {
    await updateCouponStatus({ coupon_id, status: !currentStatus });
    if (fetchData) fetchData();
  };

  // Handler for delete with confirmation
  const handleDeleteCoupon = async (coupon_id: string) => {
    if (window.confirm("Do you want to delete this Coupon?")) {
      await deleteCoupon(coupon_id);
      if (fetchData) fetchData();
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <h1 className=" text-xl font-semibold text-site-black">
        Coupon Management
      </h1>
      <div className="flex flex-col">
        <div className=" w-full flex items-center bg-site-stone p-3 py-4 text-site-black text-sm font-semibold ">
          <div className=" w-[15%]">Coupon Code</div>
          <div className=" w-[15%]">Discount</div>
          <div className="w-[10%]">Discount Type</div>
          <div className="w-[10%]">Validity</div>
          <div className=" w-[10%]">Usages</div>
          <div className=" w-[10%]">Min Value</div>
          <div className=" w-[15%]">Status</div>
          <div className=" w-[15%]">Action</div>
        </div>
        {allCoupon.map((item: CouponFormState) => (
          <div
            key={item.coupon_id}
            className=" w-full flex items-center  p-3 py-2 text-site-black text-xs"
          >
            <div className=" w-[15%]">{item.coupon_code || ""}</div>
            <div className=" w-[15%]">{item.coupon_value || ""}</div>
            <div className="w-[10%]">{item.coupon_type || ""}</div>
            <div className="w-[10%]">
              {item.coupon_ExpiryDate
                ? formatDateToDDMMYYYY(item.coupon_ExpiryDate)
                : ""}
            </div>
            <div className=" w-[10%]">{item.coupon_uses_limit || ""}</div>
            <div className=" w-[10%]">{item.minimum_booking_value || ""}</div>
            <div className=" w-[15%]">
              {" "}
              <button
                className={
                  "px-3 h-[1.8rem] rounded-full flex justify-center items-center transition-colors duration-700 cursor-pointer " +
                  (item.status
                    ? "bg-[#DCFCE7] text-[#006924] hover:bg-[#006924] hover:text-white"
                    : "bg-[#FEE2E2] text-[#910000] hover:bg-[#910000] hover:text-white")
                }
                onClick={() => {
                  if (!item.coupon_id) return;
                  handleToggleStatus(item.coupon_id, item.status ?? false);
                }}
              >
                {item.status ? "Active" : "Inactive"}
              </button>
            </div>
            <div className=" w-[15%] flex flex-row gap-2 ">
              <button
                className="cursor-pointer "
                onClick={() => {
                  setSelectedCoupon(item);
                  setShowView(true);
                  updateFilters("view", String((item as any)._id || item.coupon_id));
                }}
              >
                View
              </button>{" "}
              |
              <button
                onClick={() => {
                  setSelectedCoupon(item);
                  setShowEdit(true);
                }}
                className=" cursor-pointer "
              >
                Edit
              </button>{" "}
              |{" "}
              <button
                onClick={() => handleDeleteCoupon(item.coupon_id ?? "")}
                className=" cursor-pointer "
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {showView && (
        <SidePopup
          showPopUp={showView}
          handleClose={() => {
            setShowView(false);
            updateFilters("view", "");
          }}
        >
          <ViewCoupon
            coupon={selectedCoupon}
            onClose={() => {
              setShowView(false);
              setSelectedCoupon(null);
              updateFilters("view", "");
            }}
          />
        </SidePopup>
      )}

      {showEdit && selectedCoupon && (
        <SidePopup
          showPopUp={showEdit}
          handleClose={() => {
            setShowEdit(false);
            setSelectedCoupon(null);
          }}
        >
          <AddCoupon
            mode="edit"
            initialData={selectedCoupon}
            fetchData={fetchData}
            onSuccess={() => {
              setShowEdit(false);
              setSelectedCoupon(null);
            }}
            onCancel={() => {
              setShowEdit(false);
              setSelectedCoupon(null);
            }}
          />
        </SidePopup>
      )}
    </div>
  );
};

export default ManageCoupon;
