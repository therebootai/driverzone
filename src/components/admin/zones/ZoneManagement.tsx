"use client";

import { ZoneDocument } from "@/models/Zones";
import TableComponent from "@/ui/TableComponent";

export default function ZoneManagement({ zones }: { zones: ZoneDocument[] }) {
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
            <td className="py-2 px-2.5">{Math.ceil(item.area / 1000000)} sq.km</td>
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
                // onClick={() => handleStatus(item._id, !item.status)}
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
                // onClick={() => handleDelete(item._id)}
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
