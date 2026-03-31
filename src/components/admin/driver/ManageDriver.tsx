"use client";
import { DriverDocument } from "@/types/types";
import React, { useState, useEffect } from "react";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import PaginationBox from "@/ui/PaginationBox";
import SidePopup from "@/ui/SidePopup";
import AddAndEditDriver from "./AddAndEditDriver";
import { approveDevice, deleteDriver, updateDriverStatus } from "@/actions/driverActions";
import ViewDriver from "./ViewDriver";

const ManageDriver = ({
  allDrivers,
  pagination,
}: {
  allDrivers: DriverDocument[];
  pagination: any;
}) => {
  const [selectedDriver, setSelectedDriver] = useState<DriverDocument | null>(
    null,
  );
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { getParam, updateFilters } = useQueryParamsAdvanced();
  const viewId = getParam("view");

  useEffect(() => {
    if (viewId && allDrivers) {
      const driver = allDrivers.find(
        (d: any) => String(d._id) === viewId || d.driver_id === viewId,
      );
      if (driver) {
        setSelectedDriver(driver);
        setShowView(true);
      }
    } else {
      setShowView(false);
    }
  }, [viewId, allDrivers]);

  const formatDateToDDMMYYYY = (input: string | Date) => {
    const date = typeof input === "string" ? new Date(input) : input;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  };

  const handleToggleStatus = async (
    driver_id: string,
    currentStatus: boolean,
    key: "status" | "verified",
  ) => {
    await updateDriverStatus({
      driver_id,
      ...(key === "status"
        ? { status: !currentStatus }
        : { verified: !currentStatus }),
    });
  };

  // Handler for delete with confirmation
  const handleDeleteDriver = async (driver_id: string) => {
    if (window.confirm("Do you want to delete this Driver?")) {
      await deleteDriver(driver_id);
    }
  };
  return (
    <div className=" flex flex-col gap-4">
      <h1 className=" text-xl font-semibold text-site-black">Manage Driver</h1>
      <div className=" flex flex-col ">
        <div className=" w-full flex items-center bg-site-stone p-3 py-4 text-site-black text-sm font-semibold ">
          <div className=" w-[15%]">Driver Name</div>
          <div className=" w-[15%]">Mobile Number</div>
          <div className="w-[10%]">Joining Date</div>
          <div className="w-[10%]">Zone Area</div>
          <div className=" w-[10%]">Type</div>
          <div className=" w-[10%]">Licence</div>
          <div className=" w-[15%]">Verification</div>
          <div className=" w-[15%]">Status</div>
          <div className=" w-[15%] text-center">Device</div>
          <div className=" w-[15%]">Action</div>
        </div>
        {allDrivers.map((item: DriverDocument) => (
          <div
            key={item.driver_id}
            className=" w-full flex items-center  p-3 py-2 text-site-black text-xs"
          >
            <div className=" w-[15%]">{item.driver_name || ""}</div>
            <div className=" w-[15%]">{item.mobile_number || ""}</div>
            <div className="w-[10%]">
              {item.createdAt ? formatDateToDDMMYYYY(item.createdAt) : ""}
            </div>
            <div className="w-[10%]">{item.city_area || ""}</div>
            <div className=" w-[10%]">{item.employment_type || ""}</div>
            <div className=" w-[10%]">{item.licence_no}</div>
            <div className=" w-[15%]">
              <button
                className={
                  "px-3 h-[1.8rem] rounded-full flex justify-center items-center transition-colors duration-700 cursor-pointer " +
                  (item.verified
                    ? "bg-[#DCFCE7] text-[#006924] hover:bg-[#006924] hover:text-white"
                    : "bg-[#FEE2E2] text-[#910000] hover:bg-[#910000] hover:text-white")
                }
                onClick={() => {
                  if (!item.driver_id) return;
                  handleToggleStatus(
                    item.driver_id,
                    item.verified ?? false,
                    "verified",
                  );
                }}
              >
                {item.verified ? "Active" : "Inactive"}
              </button>
            </div>
            <div className=" w-[15%]">
              <button
                className={
                  "px-3 h-[1.8rem] rounded-full flex justify-center items-center transition-colors duration-700 cursor-pointer " +
                  (item.status
                    ? "bg-[#DCFCE7] text-[#006924] hover:bg-[#006924] hover:text-white"
                    : "bg-[#FEE2E2] text-[#910000] hover:bg-[#910000] hover:text-white")
                }
                onClick={() => {
                  if (!item.driver_id) return;
                  handleToggleStatus(
                    item.driver_id,
                    item.status ?? false,
                    "status",
                  );
                }}
              >
                {item.status ? "Active" : "Inactive"}
              </button>
            </div>
            <div className=" w-[15%] flex justify-center">
              {item.pendingDeviceId ? (
                <button
                  className="px-3 h-[1.8rem] rounded-full flex justify-center items-center bg-[#FEF9C3] text-[#713F12] border border-[#CA8A04] hover:bg-[#CA8A04] hover:text-white transition-colors duration-300 cursor-pointer text-[10px]"
                  onClick={async () => {
                    if (
                      window.confirm("Approve this new device for this driver?")
                    ) {
                      const res = await approveDevice(item.driver_id);
                      if (res.success) {
                        alert(res.message);
                      } else {
                        alert(res.message);
                      }
                    }
                  }}
                >
                  Approve New
                </button>
              ) : item.approvedDeviceId ? (
                <span className="text-[10px] text-gray-500 truncate max-w-[80px]">
                  {item.approvedDeviceId}
                </span>
              ) : (
                <span className="text-[10px] text-gray-400">No device</span>
              )}
            </div>
            <div className=" w-[15%] flex flex-row gap-2 ">
              <button
                className="cursor-pointer "
                onClick={() => {
                  setSelectedDriver(item);
                  setShowView(true);
                  updateFilters("view", String(item?._id as string));
                }}
              >
                View
              </button>{" "}
              |
              <button
                className=" cursor-pointer "
                onClick={() => {
                  setSelectedDriver(item);
                  setShowEdit(true);
                }}
              >
                Edit
              </button>{" "}
              |{" "}
              <button
                onClick={() => handleDeleteDriver(item.driver_id ?? "")}
                className=" cursor-pointer "
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <PaginationBox pagination={pagination} baseUrl="/driver-management" />
      {showView && selectedDriver && (
        <SidePopup
          showPopUp={showView}
          handleClose={() => {
            setShowView(false);
            updateFilters("view", "");
          }}
        >
          <ViewDriver driver={selectedDriver} />
        </SidePopup>
      )}
      {showEdit && selectedDriver && (
        <SidePopup
          showPopUp={showEdit}
          handleClose={() => {
            setShowEdit(false);
            setSelectedDriver(null);
          }}
        >
          <AddAndEditDriver
            selectedDriver={selectedDriver}
            onSuccess={() => {
              setShowEdit(false);
              setSelectedDriver(null);
            }}
          />
        </SidePopup>
      )}
    </div>
  );
};

export default ManageDriver;
