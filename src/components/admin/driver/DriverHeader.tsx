"use client";
import React, { useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import SidePopup from "@/ui/SidePopup";
import AddAndEditDriver from "./AddAndEditDriver";
import { IoSearch } from "react-icons/io5";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";

const DriverHeader = () => {
  const [showPopUp, setShowPopUp] = useState(false);
  const [popupKey, setPopupKey] = useState(0);

  const { getParam, updateFilters } = useQueryParamsAdvanced();

  const status = getParam("status");
  const searchTerm = getParam("search");
  const isOnline = getParam("isOnline");
  const verified = getParam("verified");

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
        <div>
          <select
            value={
              isOnline === "true"
                ? "Online"
                : isOnline === "false"
                  ? "Offline"
                  : ""
            }
            onChange={(e) =>
              updateFilters(
                "isOnline",
                e.target.value === "Online"
                  ? "true"
                  : e.target.value === "Offline"
                    ? "false"
                    : "",
              )
            }
            className=" w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
          >
            <option value="" className=" text-site-black">
              By Online Status
            </option>
            <option value="Online" className=" text-site-black">
              Online
            </option>
            <option value="Offline" className=" text-site-black">
              Offline
            </option>
          </select>
        </div>
        <div>
          <select
            value={
              verified === "true"
                ? "Verified"
                : verified === "false"
                  ? "Not Verified"
                  : ""
            }
            onChange={(e) =>
              updateFilters(
                "verified",
                e.target.value === "Verified"
                  ? "true"
                  : e.target.value === "Not Verified"
                    ? "false"
                    : "",
              )
            }
            className=" w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
          >
            <option value="" className=" text-site-black">
              By Verified Status
            </option>
            <option value="Verified" className=" text-site-black">
              Verified
            </option>
            <option value="Not Verified" className=" text-site-black">
              Not Verified
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

      <SidePopup showPopUp={showPopUp} handleClose={() => setShowPopUp(false)}>
        <AddAndEditDriver key={popupKey} />
      </SidePopup>
    </div>
  );
};

export default DriverHeader;
