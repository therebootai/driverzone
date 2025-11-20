"use client";

import BasicInput from "@/ui/BasicInput";
import { useState } from "react";

export default function UserForm() {
  const [byAccess, setByAccess] = useState<string[]>([]);

  function handleByAccess(mode: "add" | "remove", value: string) {
    if (mode === "add") {
      setByAccess((prev) => [...prev, value]);
    } else {
      setByAccess((prev) => prev.filter((item) => item !== value));
    }
  }

  return (
    <form action="" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <BasicInput name="name" type="text" placeholder="User Name" />
        <select
          name="role"
          className="p-4 border border-site-stone bg-neutral-50 rounded text-base text-site-gray"
        >
          <option value="">Choose Role</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <BasicInput name="email" type="email" placeholder="User Email" />
        <BasicInput
          name="mobile_number"
          type="tel"
          placeholder="User Mobile Number"
        />
      </div>
      <div className="relative border border-site-stone bg-neutral-50 rounded p-4 cursor-pointer text-base text-site-gray">
        {byAccess.map((item) => (
          <div key={item} className="flex gap-1 items-center">
            <span className="text-base text-site-black">{item}</span>
            <button type="button" className="text-red-600 text-xl">
              X
            </button>
          </div>
        ))}
        <div className="flex gap-1">
          <select className="flex-1">
            <option value="">Choose Page</option>
            <option value="customer_management">Customer Management</option>
            <option value="coupon">Coupon</option>
            <option value="user_management">User Management</option>
          </select>
          <button
            type="button"
            className="text-xl text-site-green border border-site-green rounded-full p-0.5 self-center"
          >
            +
          </button>
        </div>
      </div>
    </form>
  );
}
