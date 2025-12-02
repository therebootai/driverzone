"use client";

import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import SidePopup from "@/ui/SidePopup";
import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { PiMoneyWavy } from "react-icons/pi";

export default function PackageManagementHeader() {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const { updateFilters } = useQueryParamsAdvanced();

  return (
    <>
      <div className="w-full flex flex-row justify-between items-center">
        <div className="flex flex-row gap-4">
          <select
            className="w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
            onChange={(e) => updateFilters("status", e.target.value)}
          >
            <option value="" className=" text-site-black">
              By Status
            </option>
            <option value="active" className=" text-site-black">
              Active
            </option>
            <option value="inactive" className=" text-site-black">
              Inactive
            </option>
          </select>
          <div className="w-full rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <IoSearch className="text-site-black size-5" />
            <input
              type="text"
              onChange={(e) => updateFilters("search", e.target.value)}
              placeholder="Search by name"
              className="h-[2.5rem] text-sm outline-none placeholder:text-site-black flex-1 capitalize placeholder:capitalize"
            />
          </div>
          <div className="w-full rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <PiMoneyWavy className="text-site-black size-5" />
            <input
              type="number"
              onChange={(e) => updateFilters("min_price", e.target.value)}
              placeholder="Filter by minimum price"
              className="h-[2.5rem] text-sm outline-none placeholder:text-site-black flex-1 capitalize placeholder:capitalize"
            />
          </div>
          <div className="w-full rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <PiMoneyWavy className="text-site-black size-5" />
            <input
              type="number"
              onChange={(e) => updateFilters("max_price", e.target.value)}
              placeholder="Filter by maximum price"
              className="h-[2.5rem] text-sm outline-none placeholder:text-site-black flex-1 capitalize placeholder:capitalize"
            />
          </div>
        </div>
        <button
          className="w-fit px-4 h-[2.5rem] bg-linear-to-r from-site-saffron to-site-skin text-site-black flex items-center gap-2 justify-center cursor-pointer font-semibold rounded-md"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlusCircle /> Add New Package
        </button>
      </div>
      <SidePopup
        showPopUp={showAddForm}
        handleClose={() => setShowAddForm(false)}
        clsprops="bg-site-stone"
      >
        <div className="flex flex-col gap-4 p-4">
          <h2 className="font-semibold text-site-navyblue xl:text-4xl md:text-2xl text-lg">
            Create Package
          </h2>
          {/* <AddNewZone /> */}
        </div>
      </SidePopup>
    </>
  );
}
