"use client";
import { updateCustomer } from "@/actions/customerActions";
import { customerTypes } from "@/types/types";
import TableComponent from "@/ui/TableComponent";
import React from "react";
import toast from "react-hot-toast";

const ManageCustomer = ({
  allCustomer,
  pagination,
  fetchData,
}: {
  allCustomer: customerTypes[];
  pagination: any;
  fetchData: any;
}) => {
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
          <tr key={item.customer_id} className="even:bg-neutral-50">
            <td className="py-2">{item.name || ""}</td>
            <td className="py-2">{item.mobile_number || ""}</td>
            <td className="py-2">{item.reg_date || ""}</td>
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
              <button className="cursor-pointer">View</button> |
              <button className="cursor-pointer">Edit</button>|
              <button className="cursor-pointer">Delete</button>
            </td>
          </tr>
        ))}
      />
    </div>
  );
};

export default ManageCustomer;
