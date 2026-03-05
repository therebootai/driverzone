"use client";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import React from "react";
import { IoSearch } from "react-icons/io5";

const BookingPageHeader = ({
  setSearchTerm,
  searchTerm,
  status,
  setStatus,
}: {
  searchTerm?: any;
  setSearchTerm?: any;
  status?: any;
  setStatus?: any;
}) => {
  const { updateFilters } = useQueryParamsAdvanced();
  return (
    <div className="w-full flex flex-row justify-between items-center">
      <div className=" flex flex-row gap-4">
        <div>
          <select
            onChange={(e) => updateFilters("status", e.target.value)}
            className=" w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
          >
            <option value="" className="text-site-black">
              By Status
            </option>
            <option value="pending" className="text-site-black">
              Pending
            </option>
            <option value="assigned" className="text-site-black">
              Assigned
            </option>
            <option value="accepted" className="text-site-black">
              Accepted
            </option>
            <option value="arrived" className="text-site-black">
              Arrived
            </option>
            <option value="started" className="text-site-black">
              Started
            </option>
            <option value="completed" className="text-site-black">
              Completed
            </option>
            <option value="cancelled" className="text-site-black">
              Cancelled
            </option>
          </select>
        </div>
        <div className="">
          <div className="w-full rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <IoSearch className="text-site-black size-5" />
            <input
              type="text"
              placeholder="Search by name/mobile"
              onChange={(e) => updateFilters("search", e.target.value)}
              className="h-[2.5rem] text-sm outline-none placeholder:text-site-black flex-1 capitalize placeholder:capitalize"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPageHeader;
