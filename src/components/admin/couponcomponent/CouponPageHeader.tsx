"use client";
import React, { useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { IoSearch } from "react-icons/io5";
import AddCoupon from "./AddCoupon";
import SidePopup from "@/ui/SidePopup";

const CouponPageHeader = ({
  setSearchTerm,
  searchTerm,
  status,
  setStatus,
  fetchData,
}: {
  searchTerm?: any;
  setSearchTerm?: any;
  status?: any;
  setStatus?: any;
  fetchData: any;
}) => {
  const [showPopUp, setShowPopUp] = useState(false);
  const [popupKey, setPopupKey] = useState(0);

  function openAddPopup() {
    setPopupKey((k) => k + 1);
    setShowPopUp(true);
  }
  return (
    <div className="flex flex-row justify-between items-center">
      <div className=" flex flex-row gap-4 items-center">
        <div>
          <select
            value={status === undefined ? "" : status ? "Active" : "Inactive"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "Active") setStatus(true);
              else if (val === "Inactive") setStatus(false);
              else setStatus(undefined);
            }}
            className=" w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
          >
            <option value="" className=" text-site-black">
              By Status
            </option>
            <option value="Active" className=" text-site-black">
              Active
            </option>
            <option value="Inactive" className=" text-site-black">
              Inactive
            </option>
          </select>
        </div>
        <div className="w-full">
          <div className="w-[20rem] rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <IoSearch className="text-site-black size-5" />
            <input
              type="text"
              placeholder="Search by Coupon Title/code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[2.5rem] text-sm outline-none placeholder:text-site-black flex-1 capitalize placeholder:capitalize"
            />
          </div>
        </div>
      </div>
      <div>
        <button
          type="button"
          onClick={openAddPopup}
          className=" h-[2.5rem] px-4 flex gap-2 justify-center items-center bg-gradient-to-r from-site-saffron to-site-skin rounded-md text-site-black font-medium "
        >
          <AiOutlinePlusCircle /> Add Coupon
        </button>
      </div>

      <SidePopup
        showPopUp={showPopUp}
        handleClose={() => setShowPopUp(false)}
      >
        <AddCoupon
          key={popupKey}
          onCancel={() => setShowPopUp(false)}
          onSuccess={() => setShowPopUp(false)}
          fetchData={fetchData}
        />
      </SidePopup>
    </div>
  );
};

export default CouponPageHeader;
