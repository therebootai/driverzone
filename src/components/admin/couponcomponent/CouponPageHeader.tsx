"use client";
import React, { useState, useRef, useEffect } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { IoSearch, IoCalendarOutline, IoCloseOutline } from "react-icons/io5";
import AddCoupon from "./AddCoupon";
import SidePopup from "@/ui/SidePopup";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import useClickOutside from "@/hooks/useClickOutside";

const CouponPageHeader = ({ fetchData }: { fetchData: any }) => {
  const [showPopUp, setShowPopUp] = useState(false);
  const [popupKey, setPopupKey] = useState(0);
  const { updateFilters, getParam } = useQueryParamsAdvanced();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useClickOutside<HTMLDivElement>(() => {
    setShowDatePicker(false);
  });

  const currentStatus = getParam("status") || "";
  const currentCouponType = getParam("coupon_type") || "";
  const currentStartDate = getParam("startDate") || "";
  const currentEndDate = getParam("endDate") || "";
  const [localSearch, setLocalSearch] = useState(getParam("search") || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilters("search", localSearch);
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch, updateFilters]);

  const formatDateForDisplay = () => {
    if (currentStartDate && currentEndDate) {
      return `${currentStartDate} to ${currentEndDate}`;
    }
    if (currentStartDate) return `From ${currentStartDate}`;
    if (currentEndDate) return `Until ${currentEndDate}`;
    return "Filter by Expiry Date";
  };

  function openAddPopup() {
    setPopupKey((k) => k + 1);
    setShowPopUp(true);
  }
  return (
    <div className="flex flex-row justify-between items-center">
      <div className=" flex flex-wrap gap-4 items-center">
        <div>
          <select
            value={currentStatus}
            onChange={(e) => updateFilters("status", e.target.value)}
            className=" w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
          >
            <option value="" className=" text-site-black">
              All Statuses
            </option>
            <option value="Active" className=" text-site-black">
              Active
            </option>
            <option value="Inactive" className=" text-site-black">
              Inactive
            </option>
          </select>
        </div>

        <div>
          <select
            value={currentCouponType}
            onChange={(e) => updateFilters("coupon_type", e.target.value)}
            className=" w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
          >
            <option value="" className=" text-site-black">
              All Types
            </option>
            <option value="discount" className=" text-site-black">
              Discount
            </option>
            <option value="fixed" className=" text-site-black">
              Fixed
            </option>
          </select>
        </div>

        {/* Date Filters Popover */}
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`flex items-center gap-2 px-4 rounded-md h-[2.5rem] font-medium text-sm transition-colors ${
              currentStartDate || currentEndDate
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100 pr-2"
                : "bg-custom-gray text-site-black"
            }`}
          >
            {currentStartDate || currentEndDate ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateFilters("startDate", "");
                  updateFilters("endDate", "");
                }}
                className="p-1 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                title="Clear Date Filter"
              >
                <IoCloseOutline className="size-4" />
              </button>
            ) : (
              <IoCalendarOutline className="size-4" />
            )}
            <span>{formatDateForDisplay()}</span>
          </button>

          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-[300px]">
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">
                  Select Expiry Date Range
                </h3>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={currentStartDate}
                    onChange={(e) => updateFilters("startDate", e.target.value)}
                    className="w-full px-3 border border-gray-200 rounded-lg h-[2.5rem] bg-white text-site-black font-medium text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={currentEndDate}
                    onChange={(e) => updateFilters("endDate", e.target.value)}
                    className="w-full px-3 border border-gray-200 rounded-lg h-[2.5rem] bg-white text-site-black font-medium text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-auto">
          <div className="w-full md:w-[20rem] rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <IoSearch className="text-site-black size-5" />
            <input
              type="text"
              placeholder="Search by Coupon Title/code"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
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

      <SidePopup showPopUp={showPopUp} handleClose={() => setShowPopUp(false)}>
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
