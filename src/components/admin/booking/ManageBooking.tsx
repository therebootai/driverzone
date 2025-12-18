// components/ManageBooking.tsx
import React from "react";
import { BookingTypes } from "@/types/types";
import dayjs from "dayjs";
import PaginationBox from "../PaginationBox";

const ManageBooking = ({
  allBookings,
  pagination,
  fetchData,
}: {
  allBookings: BookingTypes[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    perPage?: number;
  };
  fetchData: (page?: number, limit?: number, search?: string, status?: any) => Promise<void>;
}) => {
  const { totalPages = 1, currentPage = 1 } = pagination;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-site-black">Booking Management</h1>

      <div className="flex flex-col">
        <div className="w-full flex items-center bg-site-stone p-3 py-4 text-site-black text-sm font-semibold">
          <div className="w-[15%]">Booking ID</div>
          <div className="w-[15%]">Date</div>
          <div className="w-[10%]">Fare</div>
          <div className="w-[10%]">Customer Name</div>
          <div className="w-[10%]">Driver Name</div>
          <div className="w-[10%]">Zone</div>
          <div className="w-[15%]">Status</div>
          <div className="w-[15%]">Action</div>
        </div>

        {/* Data rows */}
        {allBookings.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No bookings found.</div>
        ) : (
          allBookings.map((b) => {
            const bookingId = (b as any).booking_id || (b as any)._id;
            const createdAt = (b as any).createdAt ? dayjs((b as any).createdAt).format("DD MMM YYYY") : "-";
            const fare = (b as any).fare ?? (b as any).estimatedFare ?? "-";
            const customerName = (b as any).customerDetails?.name ||  "-";
            const driverName = (b as any).driverDetails?.driver_name ||  "-";
            const zone = (b as any).pickupAddress || (b as any).dropAddress || "-";
            const status = (b as any).status || "-";

            return (
              <div key={bookingId} className="w-full flex items-center p-3 border-b text-sm">
                <div className="w-[15%] break-all">{bookingId}</div>
                <div className="w-[15%]">{createdAt}</div>
                <div className="w-[10%]">₹ {fare}</div>
                <div className="w-[10%]">{customerName}</div>
                <div className="w-[10%]">{driverName}</div>
                <div className="w-[10%] break-words">{zone}</div>
                <div className="w-[15%]">
                  <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-sm">
                    {status}
                  </span>
                </div>
                <div className="w-[15%] flex gap-2">
                  <button
                    onClick={() => {
                      alert(`open booking ${bookingId}`);
                    }}
                    className="px-3 py-1 rounded bg-site-darkyellow text-white text-sm"
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      // Example: refresh current page
                      fetchData(pagination.currentPage);
                    }}
                    className="px-3 py-1 rounded border text-sm"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
      <PaginationBox pagination={pagination} prefix="/admin/booking-managment"/>
      </div>
    </div>
  );
};

export default ManageBooking;
