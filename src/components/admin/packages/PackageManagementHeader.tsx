"use client";

import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import SidePopup from "@/ui/SidePopup";
import { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { PiMoneyWavy } from "react-icons/pi";
import PackageForm from "./PackageForm";

export default function PackageManagementHeader() {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const { updateFilters, getParam } = useQueryParamsAdvanced();
  const [localSearch, setLocalSearch] = useState(getParam("search") || "");
  const [localMinPrice, setLocalMinPrice] = useState(getParam("min_price") || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(getParam("max_price") || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilters("search", localSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch, updateFilters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilters("min_price", localMinPrice);
    }, 500);
    return () => clearTimeout(handler);
  }, [localMinPrice, updateFilters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilters("max_price", localMaxPrice);
    }, 500);
    return () => clearTimeout(handler);
  }, [localMaxPrice, updateFilters]);

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
          <select
            className="w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
            onChange={(e) => updateFilters("package_type", e.target.value)}
          >
            <option value="" className="text-site-black">
              By Package Type
            </option>
            <option value="in_city" className="text-site-black">
              In City
            </option>
            <option value="mini_outstation" className="text-site-black">
              Mini Outstation
            </option>
            <option value="outstation" className="text-site-black">
              Outstation
            </option>
            <option value="hills_tour" className="text-site-black">
              Hills Tour
            </option>
            <option value="long_tour" className="text-site-black">
              Long Tour
            </option>
            <option value="drop_pickup_service" className="text-site-black">
              Drop & Pickup Service
            </option>
          </select>
          <select
            className="w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
            onChange={(e) => updateFilters("discount_type", e.target.value)}
          >
            <option value="" className="text-site-black">
              By Discount Type
            </option>
            <option value="none" className="text-site-black">
              None
            </option>
            <option value="fixed" className="text-site-black">
              Fixed
            </option>
            <option value="percentage" className="text-site-black">
              Percentage
            </option>
          </select>
          <div className="w-full rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <IoSearch className="text-site-black size-5" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by name"
              className="h-[2.5rem] text-sm outline-none placeholder:text-site-black flex-1 capitalize placeholder:capitalize"
            />
          </div>
          <div className="w-full rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <PiMoneyWavy className="text-site-black size-5" />
            <input
              type="number"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              placeholder="Filter by minimum price"
              className="h-[2.5rem] text-sm outline-none placeholder:text-site-black flex-1 capitalize placeholder:capitalize"
            />
          </div>
          <div className="w-full rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <PiMoneyWavy className="text-site-black size-5" />
            <input
              type="number"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
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
        {showAddForm && (
          <div className="flex flex-col gap-4 p-4">
            <h2 className="font-semibold text-site-navyblue xl:text-4xl md:text-2xl text-lg">
              Create Package
            </h2>
            <PackageForm onClose={() => setShowAddForm(false)} />
          </div>
        )}
      </SidePopup>
    </>
  );
}
