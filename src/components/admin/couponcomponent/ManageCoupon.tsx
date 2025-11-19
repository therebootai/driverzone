import React from "react";

const ManageCoupon = () => {
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
          <div className=" w-[5%]">Min Value</div>
          <div className=" w-[15%]">Status</div>
          <div className=" w-[20%]">Action</div>
        </div>
      </div>
    </div>
  );
};

export default ManageCoupon;
