"use client";
import { updateCustomer } from "@/actions/customerActions";
import { customerTypes } from "@/types/types";
import TableComponent from "@/ui/TableComponent";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import SidePopup from "@/ui/SidePopup";
import ViewCustomer from "./ViewCustomer";

const ManageCustomer = ({
  allCustomer,
  fetchData,
}: {
  allCustomer: customerTypes[];
  fetchData: any;
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<customerTypes | null>(null);
  const [showView, setShowView] = useState(false);

  const { getParam, updateFilters } = useQueryParamsAdvanced();
  const viewId = getParam("view");

  useEffect(() => {
    if (viewId && allCustomer) {
      const customer = allCustomer.find(
        (c) => String(c._id) === viewId || c.customer_id === viewId
      );
      if (customer) {
        setSelectedCustomer(customer);
        setShowView(true);
      }
    } else {
      setShowView(false);
    }
  }, [viewId, allCustomer]);

  async function handleCustomerUpdate(id: string, status: boolean) {
    try {
      const { success } = await updateCustomer(id, { status });
      if (!success) {
        throw Error;
      }
      toast.success("Customer status updated successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error(error instanceof Error ? error.message : "Unknown error");
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className=" text-2xl font-semibold text-site-black">
        Customer Management
      </h1>
      <TableComponent
        TABLE_HEAD={[
          "Customer Name",
          "Mobile Number",
          "Reg. Date",
          "Amount Spent",
          "Rating",
          "Status",
          "Action",
        ]}
        TABLE_ROWS={allCustomer.map((item: customerTypes) => (
          <tr key={String(item._id) || item.customer_id} className="even:bg-neutral-50">
            <td className="py-2">{item.name || ""}</td>
            <td className="py-2">{item.mobile_number || ""}</td>
            <td className="py-2">
              {item.reg_date
                ? (isNaN(Number(item.reg_date))
                    ? new Date(item.reg_date)
                    : new Date(Number(item.reg_date))
                  ).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })
                : ""}
            </td>
            <td className="py-2">{item.total_spent || ""}</td>
            <td className="py-2">{item.rating || ""}</td>
            <td className="py-2">
              <button
                className={
                  "px-3 rounded-sm flex justify-center items-center transition-colors duration-700 cursor-pointer " +
                  (item.status
                    ? "bg-[#DCFCE7] text-[#006924] hover:bg-[#006924] hover:text-white"
                    : "bg-[#FEE2E2] text-[#910000] hover:bg-[#910000] hover:text-white")
                }
                onClick={() =>
                  handleCustomerUpdate(String(item._id), !item.status)
                }
              >
                {item.status ? "Active" : "Inactive"}
              </button>
            </td>
            <td className="flex flex-row gap-2 py-2">
              <button
                className="cursor-pointer"
                onClick={() => {
                  setSelectedCustomer(item);
                  setShowView(true);
                  updateFilters("view", String(item._id));
                }}
              >
                View
              </button>{" "}
              {/* <button className="cursor-pointer">Edit</button>| */}
              {/* <button className="cursor-pointer">Delete</button> */}
            </td>
          </tr>
        ))}
      />
      
      {showView && selectedCustomer && (
        <SidePopup
          showPopUp={showView}
          handleClose={() => {
            setShowView(false);
            updateFilters("view", "");
          }}
        >
          <ViewCustomer customer={selectedCustomer} />
        </SidePopup>
      )}
    </div>
  );
};

export default ManageCustomer;
