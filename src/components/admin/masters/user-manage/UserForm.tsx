"use client";

import { CREATEUSER, UPDATEUSER } from "@/actions/userActions";
import BasicInput from "@/ui/BasicInput";
import { useActionState, useState } from "react";
import AsyncSelect from "react-select/async";
import { UserTypes } from "@/types/types";

export default function UserForm({
  user,
  onClose,
}: {
  user?: UserTypes | null;
  onClose?: () => void;
}) {
  const isEdit = !!user; // true if editing

  // PRE-FILLED STATE (editable)
  const [name, setName] = useState<string>(user?.name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [mobile, setMobile] = useState<string>(user?.mobile_number || "");
  const [role, setRole] = useState<string>(user?.role || "");
  const [password, setPassword] = useState<string>(""); // blank in edit mode
  const [byAccess, setByAccess] = useState<string[]>(user?.by_access || []);

  // Save function (Add or Edit)
  async function handleSave(prevState: any, formData: FormData) {
    try {
      const payload: any = {
        name: formData.get("name"),
        role: formData.get("role"),
        mobile_number: formData.get("mobile_number"),
        email: formData.get("email"),
        by_access: byAccess,
      };

      let response;

      if (!isEdit) {
        // ADD user
        payload.password = formData.get("password");
        response = await CREATEUSER(payload);
      } else {
        // EDIT user
        const pass = formData.get("password");
        if (pass) payload.password = pass;

        response = await UPDATEUSER(String(user?._id), payload);
      }

      // ⬇️ IF success → close popup
      if (response?.success && onClose) {
        onClose();
      }

      return response;
    } catch (error: any) {
      console.log(error);
    }
  }

  const [state, formAction, isPending] = useActionState(handleSave, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit User" : "Add New User"}
      </h2>

      {/* Name + Role */}
      <div className="grid grid-cols-2 gap-2">
        <BasicInput
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="User Name"
          required
        />

        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="p-4 border border-site-stone bg-neutral-50 rounded text-base text-site-gray"
          required
        >
          <option value="">Choose Role</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {/* Email + Mobile */}
      <div className="grid grid-cols-2 gap-2">
        <BasicInput
          name="email"
          type="email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          placeholder="User Email"
          required
        />

        <BasicInput
          name="mobile_number"
          type="tel"
          value={mobile}
          onChange={(e: any) => setMobile(e.target.value)}
          placeholder="User Mobile Number"
          required
        />
      </div>

      {/* Password (Required in Create, Optional in Edit) */}
      <BasicInput
        name="password"
        type="password"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
        placeholder={isEdit ? "New Password (optional)" : "User Password"}
      />

      {/* Access Control */}
      <AsyncSelect
        isMulti
        cacheOptions
        placeholder="Search & select multiple pages"
        defaultValue={
          (user?.by_access || []).map((item) => ({
            label: item,
            value: item,
          })) || []
        }
        defaultOptions={[
          { label: "Customer Management", value: "customer_management" },
          { label: "Coupon", value: "coupon" },
          { label: "User Management", value: "user_management" },
        ]}
        className="text-sm"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "4rem",
            backgroundColor: "#fafafa",
            borderColor: "#f5f5f5",
          }),
        }}
        onChange={(selected: any) => {
          const list = selected?.map((s: any) => s.value) || [];
          setByAccess(list);
        }}
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="text-site-black bg-linear-90 from-site-saffron to-site-skin py-2 px-6 self-start rounded font-medium"
      >
        {isPending ? "Wait..." : isEdit ? "Update User" : "Create User"}
      </button>
    </form>
  );
}
