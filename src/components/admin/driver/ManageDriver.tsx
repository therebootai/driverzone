"use client";
import { DriverDocument } from "@/types/types";
import React, { useState, useEffect } from "react";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import PaginationBox from "@/ui/PaginationBox";
import SidePopup from "@/ui/SidePopup";
import AddAndEditDriver from "./AddAndEditDriver";
import { approveDevice, deleteDriver, updateDriverStatus } from "@/actions/driverActions";
import ViewDriver from "./ViewDriver";
import Popup from "@/ui/Popup";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [driverToVerify, setDriverToVerify] = useState<DriverDocument | null>(null);

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
    driver: DriverDocument,
    currentStatus: boolean,
    key: "status" | "verified",
  ) => {
    if (key === "verified" && !currentStatus) {
      setDriverToVerify(driver);
      return;
    }

    await updateDriverStatus({
      driver_id: driver.driver_id,
      ...(key === "status"
        ? { status: !currentStatus }
        : { verified: !currentStatus }),
    });
  };

  const handleConfirmVerification = async () => {
    if (!driverToVerify) return;
    try {
      await updateDriverStatus({
        driver_id: driverToVerify.driver_id,
        verified: true,
      });
      setDriverToVerify(null);
    } catch (error) {
      console.error(error);
    }
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
      <div className=" flex flex-col overflow-x-auto pb-4">
        <div className=" min-w-[1400px] flex items-center bg-site-stone p-3 py-4 text-site-black text-sm font-semibold ">
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
            className=" min-w-[1400px] flex items-center  p-3 py-2 text-site-black text-xs"
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
                    item,
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
                    item,
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

            <div className=" w-[15%] flex flex-row flex-wrap gap-2 ">
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
            if (selectedImage) return;
            setShowView(false);
            updateFilters("view", "");
          }}
        >
          <ViewDriver 
            driver={selectedDriver} 
            onImageClick={(url) => setSelectedImage(url)}
          />
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

      {/* ========== VERIFICATION MODAL ========== */}
      <Popup
        isOpen={!!driverToVerify}
        onClose={() => {
          if (selectedImage) return;
          setDriverToVerify(null);
        }}
        className="md:w-[95%] lg:w-[90%] xl:w-[85%] xxl:w-[80%] !z-[1500]"
      >
        <div className="bg-white rounded-lg flex flex-col h-[90vh]">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
            <h2 className="text-xl font-bold text-gray-900">Verify Driver Information</h2>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {driverToVerify && (
              <ViewDriver 
                driver={driverToVerify} 
                onImageClick={(url) => setSelectedImage(url)}
                hideBookings={true}
              />
            )}
          </div>
          <div className="p-4 border-t flex justify-end gap-4 bg-gray-50 shrink-0">
            <button
              onClick={() => setDriverToVerify(null)}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmVerification}
              className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
            >
              Confirm Verification
            </button>
          </div>
        </div>
      </Popup>

      {/* ========== IMAGE VIEWER MODAL ========== */}
      <Popup 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)}
        className="md:w-[90%] lg:w-[85%] xl:w-[80%] xxl:w-[70%] !z-[2000]"
      >
        <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg">
          {selectedImage && (
            <div className="relative w-full flex items-center justify-center bg-gray-100 rounded-md">
              <img
                src={selectedImage}
                alt="Full Preview"
                className="max-w-full h-auto max-h-[85vh] object-contain rounded-md"
              />
            </div>
          )}
          <button 
            onClick={() => window.open(selectedImage!, "_blank")}
            className="mt-4 px-6 py-2 bg-primary text-black rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Open in new tab
          </button>
        </div>
      </Popup>
    </div>
  );
};

export default ManageDriver;
