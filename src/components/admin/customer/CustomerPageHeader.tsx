"use client";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import React from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";

const CustomerPageHeader = ({
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

      {/* <div>
        <button className=" w-fit px-4 h-[2.5rem] bg-linear-to-r from-site-saffron to-site-skin text-site-black flex items-center gap-2 justify-center cursor-pointer font-semibold rounded-md">
          <FiPlusCircle /> Create Manual Ride
        </button>
      </div> */}
    </div>
  );
};

export default CustomerPageHeader;
