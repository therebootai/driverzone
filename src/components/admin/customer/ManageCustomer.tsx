import { customerTypes } from "@/types/types";
import React from "react";

const ManageCustomer = ({ allCustomer, pagination, fetchData } : {allCustomer:customerTypes[], pagination:any, fetchData:any}) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className=" text-2xl font-semibold text-site-black">
        Customer Management
      </h1>
      <div className=" flex flex-col">
        <div className=" w-full flex items-center bg-site-stone p-3 py-4 text-site-black text-sm font-semibold ">
          <div className=" w-[15%]">Customer Name</div>
          <div className=" w-[15%]">Mobile Number</div>
          <div className="w-[10%]">Reg. Date</div>
          <div className="w-[10%]">Total Booking</div>
          <div className=" w-[10%]">Amount Spent</div>
          <div className=" w-[5%]">Rating</div>
          <div className=" w-[15%]">Status</div>
          <div className=" w-[20%]">Action</div>
        </div>
        {allCustomer.map((item: customerTypes) => (
          <div key={item.customer_id} className=" w-full flex items-center  p-3 py-2 text-site-black text-xs">
            <div className=" w-[15%]">{item.name || ""}</div>
            <div className=" w-[15%]">{item.mobile_number || ""}</div>
            <div className="w-[10%]">{item.reg_date || ""}</div>
            <div className="w-[10%]">""</div>
            <div className=" w-[10%]">{item.total_spent || ""}</div>
            <div className=" w-[5%]">{item.rating || ""}</div>
            <div className=" w-[15%]">
              {" "}
              <button
                className={
                  "px-3 h-[1.8rem] rounded-sm flex justify-center items-center transition-colors duration-700 cursor-pointer " +
                  (item.status
                    ? "bg-[#DCFCE7] text-[#006924] hover:bg-[#006924] hover:text-white"
                    : "bg-[#FEE2E2] text-[#910000] hover:bg-[#910000] hover:text-white")
                }
              >
                {item.status ? "Active" : "Inactive"}
              </button>
            </div>
            <div className=" w-[20%] flex flex-row gap-2 ">
              <button className="cursor-pointer ">View</button> |
              <button className=" cursor-pointer ">Edit</button> |{" "}
              <button className=" cursor-pointer ">Suspend</button> |
              <button className=" cursor-pointer ">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCustomer;
