"use client";
import React, { useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import SidePopUpSlider from "../SidePopup";
import AddAndEditDriver from "./AddAndEditDriver";
import { IoSearch } from "react-icons/io5";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";

const DriverHeader = () => {
  const [showPopUp, setShowPopUp] = useState(false);
  const [popupKey, setPopupKey] = useState(0);

  const { getParam, updateFilters } = useQueryParamsAdvanced();

  const status = getParam("status");
  const searchTerm = getParam("search");

  function openAddPopup() {
    setPopupKey((k) => k + 1);
    setShowPopUp(true);
  }
  return (
    <div className="flex flex-row justify-between items-center">
      <div className=" flex flex-row gap-4 items-center">
        <div>
          <select
            value={
              status === "true"
                ? "Active"
                : status === "false"
                  ? "Inactive"
                  : ""
            }
            onChange={(e) =>
              updateFilters(
                "status",
                e.target.value === "Active"
                  ? "true"
                  : e.target.value === "Inactive"
                    ? "false"
                    : "",
              )
            }
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
              placeholder="Search by Driver Name / Number"
              value={searchTerm ?? ""}
              onChange={(e) => updateFilters("search", e.target.value)}
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
          <AiOutlinePlusCircle /> Add Driver
        </button>
      </div>

      <SidePopUpSlider
        showPopUp={showPopUp}
        handleClose={() => setShowPopUp(false)}
      >
        <AddAndEditDriver key={popupKey} />
      </SidePopUpSlider>
    </div>
  );
};

export default DriverHeader;
