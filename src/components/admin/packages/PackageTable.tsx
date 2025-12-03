"use client";

import { DELETE_PACKAGE, UPDATE_PACKAGE } from "@/actions/packageAction";
import { PackageDocument } from "@/models/Packages";
import TableComponent from "@/ui/TableComponent";
import { convertTime } from "@/utils/timeConversion";
import toast from "react-hot-toast";

export default function PackageTable({
  allPackages,
}: {
  allPackages: PackageDocument[];
}) {
  const handleDelete = async (id: string) => {
    try {
      await DELETE_PACKAGE(id);
      toast.success("Package deleted successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleStatus = async (id: string, status: boolean) => {
    try {
      await UPDATE_PACKAGE(id, { status });
      toast.success("Package status updated successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };
  return (
    <section className="flex flex-col gap-5">
      <h1 className="font-semibold lg:text-xl text-lg text-site-black">
        Manage Packages
      </h1>
      <TableComponent
        TABLE_HEAD={[
          "Name",
          "Destination",
          "Duration",
          "Package Type",
          "Company Charge",
          "Driver Charge",
          "Created",
          "Status",
          "Actions",
        ]}
        TABLE_ROWS={allPackages.map((item) => (
          <tr key={item.package_id} className="even:bg-neutral-50">
            <td className="py-2 px-2.5">{item.name || ""}</td>
            <td className="py-2 px-2.5">{item.destination || ""}</td>
            <td className="py-2 px-2.5">
              {convertTime(item.duration).value}{" "}
              {convertTime(item.duration).unit}
            </td>
            <td className="py-2 px-2.5">
              {item.package_type.replaceAll("_", " ")}
            </td>
            <td className="py-2 px-2.5">{item.company_charge || ""}</td>
            <td className="py-2 px-2.5">{item.driver_charge || ""}</td>
            <td className="py-2 px-2.5">
              {new Date(item.createdAt || "").toLocaleString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </td>
            <td className="py-2 px-2.5">
              <button
                className={
                  "px-3 rounded-sm flex justify-center items-center transition-colors duration-700 cursor-pointer " +
                  (item.status
                    ? "bg-[#DCFCE7] text-[#006924] hover:bg-[#006924] hover:text-white"
                    : "bg-[#FEE2E2] text-[#910000] hover:bg-[#910000] hover:text-white")
                }
                onClick={() => handleStatus(item._id as string, !item.status)}
              >
                {item.status ? "Active" : "Inactive"}
              </button>
            </td>
            <td className="flex flex-row gap-2 py-2 px-2.5">
              <button className="cursor-pointer">View</button> |
              <button className="cursor-pointer">Edit</button> |
              <button
                className="cursor-pointer"
                type="button"
                onClick={() => handleDelete(item._id as string)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      />
    </section>
  );
}
