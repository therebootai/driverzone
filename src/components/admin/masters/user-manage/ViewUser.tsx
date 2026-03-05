import { UserTypes } from "@/types/types";
import React from "react";

interface ViewUserProps {
  user: UserTypes | null;
  onClose: () => void;
}

const ViewUser: React.FC<ViewUserProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="p-5 flex flex-col gap-4 text-sm">
      <h2 className="text-lg font-semibold border-b pb-2">User Details</h2>

      <div className="flex flex-col gap-3">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone:</strong> {user.mobile_number}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Status:</strong> {user.status ? "Active" : "Inactive"}
        </p>
        <p>
          <strong>User ID:</strong> {user.user_id}
        </p>
        {user.role !== "admin" && (
          <p className="capitalize">
            <strong>Page Accesses:</strong>{" "}
            {user.by_access.map((item) => item.replaceAll("_", " ")).join(", ")}
          </p>
        )}

        {/* Optional Fields */}
        {user.createdAt && (
          <p>
            <strong>Created:</strong>{" "}
            {new Date(user.createdAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ViewUser;
