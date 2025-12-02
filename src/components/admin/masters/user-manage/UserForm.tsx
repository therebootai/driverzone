"use client";

import { CREATEUSER } from "@/actions/userActions";
import BasicInput from "@/ui/BasicInput";
import { useActionState, useState } from "react";
import toast from "react-hot-toast";
import AsyncSelect from "react-select/async";

export default function UserForm() {
  const [byAccess, setByAccess] = useState<string[]>([])

  async function handleSave(prevState: any, formData: FormData) {
    try {
      const name = formData.get("name");
      const role = formData.get("role");
      const mobile_number = formData.get("mobile_number");
      const email = formData.get("email");
      const password = formData.get("password");
      await CREATEUSER({
        name,
        role,
        mobile_number,
        email,
        password,
        by_access: byAccess,
      });
      toast.success("User created successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Unknown error");
    }
  }

  const [state, formAction, isPending] = useActionState(handleSave, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
      <BasicInput name="password" type="password" placeholder="User Password" />
      {/* <div className="relative border border-site-stone bg-neutral-50 rounded p-4 cursor-pointer text-base text-site-gray flex gap-1.5">
        {byAccess.map((item) => (
          <div
            key={item}
            className="flex gap-1 items-center bg-site-stone p-1 rounded-full"
          >
            <span className="text-base text-site-black capitalize">
              {item.replaceAll("_", " ")}
            </span>
            <button
              type="button"
              className="text-red-600 text-lg"
              onClick={() => handleByAccess("remove", item)}
            >
              X
            </button>
          </div>
        ))}
        <div className="flex gap-1 flex-1">
          <select
            className="flex-1"
            value={currentPageValue}
            onChange={(e) => setCurrentPageValue(e.target.value)}
          >
            <option value="">Choose Page</option>
            <option value="customer_management">Customer Management</option>
            <option value="coupon">Coupon</option>
            <option value="user_management">User Management</option>
          </select>
          <button
            type="button"
            className="text-xl text-site-green border border-site-green rounded-full px-2 self-center"
            onClick={() => handleByAccess("add", currentPageValue)}
          >
            +
          </button>
        </div>
      </div> */}
      <AsyncSelect
        isMulti
        cacheOptions
        placeholder="Search & select multiple page"
        defaultOptions={[
          {
            label: "Customer Management",
            value: "customer_management",
          },
          {
            label: "Coupon",
            value: "coupon",
          },
          {
            label: "User Management",
            value: "user_management",
          },
        ]}
        className="text-sm"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "4rem",
            backgroundColor: "#fafafa",
            borderColor: "#f5f5f5",
          }),
          option: (base) => ({
            ...base,
            fontSize: "14px",
          }),
        }}
        onChange={(selected: any) => {
          const safeSelected = selected || [];
          safeSelected.map((item: { value: string; label: string }) =>
            setByAccess((prev) => [...prev, item.value])
          );
        }}
      />
      <button
        type="submit"
        className="text-site-black bg-linear-90 from-site-saffron to-site-skin py-2 px-6 self-start rounded font-medium"
      >
        {isPending ? "Wait" : "Submit"}
      </button>
    </form>
  );
}
