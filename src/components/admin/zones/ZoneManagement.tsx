"use client";

import { UPDATE_ZONE } from "@/actions/zoneActions";
import { ZoneDocument } from "@/models/Zones";
import SidePopup from "@/ui/SidePopup";
import TableComponent from "@/ui/TableComponent";
import ZoneMap from "@/ui/Zonemap";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ZoneManagement({ zones }: { zones: ZoneDocument[] }) {
  const [selectedZone, setSelectedZone] = useState<ZoneDocument | null>(null);
  const handleStatus = async (id: string, status: boolean) => {
    try {
      await UPDATE_ZONE(id, { status });
      toast.success("Zone status updated successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <h1 className="font-semibold lg:text-xl text-lg text-site-black">
        Manage Zones
      </h1>
      <TableComponent
        TABLE_HEAD={[
          "Name",
          "Description",
          "Area",
          "Created",
          "Status",
          "Actions",
        ]}
        TABLE_ROWS={zones.map((item) => (
          <tr key={item.zone_id} className="even:bg-neutral-50">
            <td className="py-2 px-2.5">{item.name || ""}</td>
            <td className="py-2 px-2.5">{item.description || ""}</td>
            <td className="py-2 px-2.5">
              {Math.ceil(item.area / 1000000)} sq.km
            </td>
            <td className="py-2 px-2.5">
              {new Date(item.created_at || "").toLocaleString("en-IN", {
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
            <td className="flex flex-row flex-wrap gap-2 py-2 px-2.5">
              <button
                className="cursor-pointer"
                onClick={() => setSelectedZone(item)}
              >
                View
              </button>{" "}
              {/* |<button className="cursor-pointer">Edit</button> |
              <button
                className="cursor-pointer"
                type="button"
                // onClick={() => handleDelete(item._id)}
              >
                Delete
              </button> */}
            </td>
          </tr>
        ))}
      />
      <SidePopup
        showPopUp={!!selectedZone}
        handleClose={() => setSelectedZone(null)}
        clsprops="px-6"
      >
        <h1 className="text-2xl font-semibold text-site-black">Zone Details</h1>
        <div className="flex flex-col gap-2.5 mt-4">
          <Field label="Name" value={selectedZone?.name} />
          <Field label="Description" value={selectedZone?.description} />
          <Field label="Area" value={selectedZone?.area} />
          <Field
            label="Created At"
            value={
              selectedZone?.created_at
                ? new Date(selectedZone?.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"
            }
          />
          <ZoneMap existingZones={selectedZone?.coordinates} editable={false} />
        </div>
      </SidePopup>
    </section>
  );
}

const Field = ({ label, value }: { label: string; value?: any }) => (
<div className="flex flex-col mb-3">
  <span className="text-xs text-gray-500">{label}</span>
  <span className="text-sm font-medium text-gray-900">{value || "-"}</span>
</div>
);
