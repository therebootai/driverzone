"use client";

import { DELETEUSER, UPDATEUSER } from "@/actions/userActions";
import TableComponent from "../../../../ui/TableComponent";
import { UserTypes } from "@/types/types";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import { useState, useEffect } from "react";
import SidePopup from "@/ui/SidePopup";
import ViewUser from "./ViewUser";
import UserForm from "./UserForm";

export default function UserTable({
  users,
}: {
  users: { [keys: string]: string }[];
}) {
  const [selectedUser, setSelectedUser] = useState<UserTypes | null>(null);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { getParam, updateFilters } = useQueryParamsAdvanced();
  const viewId = getParam("view");

  useEffect(() => {
    if (viewId && users) {
      const user = users.find(
        (u) => String(u._id) === viewId || String(u.user_id) === viewId
      );
      if (user) {
        setSelectedUser(user as unknown as UserTypes);
        setShowView(true);
      }
    } else {
      setShowView(false);
    }
  }, [viewId, users]);

  async function handleStatus(id: string, status: boolean) {
    try {
      await UPDATEUSER(id, { status });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDelete(id: string) {
    try {
      const confirmation = confirm("Do you want to delete this user?");
      if (!confirmation) return;

      await DELETEUSER(id);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <section className="flex flex-col gap-5">
      <h1 className="font-semibold lg:text-xl text-lg text-site-black">
        Manage Users
      </h1>
      <TableComponent
        TABLE_HEAD={["Name", "Email", "Phone", "Role", "Status", "Actions"]}
        TABLE_ROWS={users.map((item) => (
          <tr key={item.user_id} className="even:bg-neutral-50">
            <td className="py-2 px-2.5">{item.name || ""}</td>
            <td className="py-2 px-2.5">{item.email || ""}</td>
            <td className="py-2 px-2.5">{item.mobile_number || ""}</td>
            <td className="py-2 px-2.5">{item.role || ""}</td>
            <td className="py-2 px-2.5">
              <button
                className={
                  "px-3 rounded-sm flex justify-center items-center transition-colors duration-700 cursor-pointer " +
                  (item.status
                    ? "bg-[#DCFCE7] text-[#006924] hover:bg-[#006924] hover:text-white"
                    : "bg-[#FEE2E2] text-[#910000] hover:bg-[#910000] hover:text-white")
                }
                onClick={() => handleStatus(item._id, !item.status)}
              >
                {item.status ? "Active" : "Inactive"}
              </button>
            </td>
            <td className="flex flex-row gap-2 py-2 px-2.5">
              <button
                className="cursor-pointer"
                onClick={() => {
                  setSelectedUser(item as unknown as UserTypes);
                  setShowView(true);
                  updateFilters("view", String(item._id));
                }}
              >
                View
              </button>{" "}
              |
              <button
                className="cursor-pointer"
                onClick={() => {
                  setSelectedUser(item as unknown as UserTypes);
                  setShowEdit(true);
                }}
              >
                Edit
              </button>{" "}
              |
              <button
                className="cursor-pointer"
                type="button"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      />

      {showView && (
        <SidePopup
          showPopUp={showView}
          handleClose={() => {
            setShowView(false);
            updateFilters("view", "");
          }}
        >
          <ViewUser
            user={selectedUser}
            onClose={() => {
              setShowView(false);
              setSelectedUser(null);
            }}
          />
        </SidePopup>
      )}

      {showEdit && (
        <SidePopup
          showPopUp={showEdit}
          handleClose={() => setShowEdit(false)}
        >
          <div className=" p-4">
            <UserForm
              user={selectedUser}
              onClose={() => {
                setShowEdit(false);
                setSelectedUser(null);
              }}
            />
          </div>
        </SidePopup>
      )}
    </section>
  );
}
