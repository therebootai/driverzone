"use client";

import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import SidePopup from "../../../../ui/SidePopup";
import UserForm from "./UserForm";
import { useRouter, useSearchParams } from "next/navigation";

export default function UserManagementHeader() {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Function to update searchParams
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value.trim() !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Update URL without page reload
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Function to handle search input with debounce
  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value.trim() !== "") {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

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
            <option value="Active" className=" text-site-black">
              Active
            </option>
            <option value="Inactive" className=" text-site-black">
              Inactive
            </option>
          </select>
          <select
            className="w-fit px-4 rounded-md h-[2.5rem] bg-custom-gray text-site-black font-semibold text-sm flex justify-center items-center"
            onChange={(e) => updateFilters("role", e.target.value)}
          >
            <option value="" className=" text-site-black">
              By Role
            </option>
            <option value="admin" className="text-site-black">
              Admin
            </option>
            <option value="staff" className="text-site-black">
              Staff
            </option>
          </select>
          <div className="w-full rounded-md flex gap-2 items-center px-2 bg-custom-gray">
            <IoSearch className="text-site-black size-5" />
            <input
              type="text"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name/mobile"
              className="h-[2.5rem] text-sm outline-none placeholder:text-site-black flex-1 capitalize placeholder:capitalize"
            />
          </div>
        </div>
        <button
          className=" w-fit px-4 h-[2.5rem] bg-linear-to-r from-site-saffron to-site-skin text-site-black flex items-center gap-2 justify-center cursor-pointer font-semibold rounded-md"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlusCircle /> Add New User
        </button>
      </div>
      <SidePopup
        showPopUp={showAddForm}
        handleClose={() => setShowAddForm(false)}
      >
        <div className="flex flex-col gap-4 p-4">
          <h2 className="font-semibold text-site-navyblue xl:text-4xl md:text-2xl text-lg">
            User Create
          </h2>
          <UserForm onClose={() => setShowAddForm(false)}/>
        </div>
      </SidePopup>
    </>
  );
}
