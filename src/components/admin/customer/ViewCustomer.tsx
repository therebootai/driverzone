"use client";

import { useEffect, useState } from "react";
import { customerTypes, BookingTypes } from "@/types/types";
import Field from "@/ui/Field";
import { getBookings } from "@/actions/bookingAction";
import Link from "next/link";

const ViewCustomer = ({ customer }: { customer: customerTypes }) => {
  const [bookings, setBookings] = useState<BookingTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchBookings = async (pageNum: number, isInitial = false) => {
    if (!customer._id) return;

    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getBookings({
        customerId: customer._id.toString(),
        page: pageNum,
        limit: 12,
      });

      if (res.success) {
        if (isInitial) {
          setBookings(res.data);
        } else {
          setBookings((prev) => [...prev, ...res.data]);
        }
        setHasNextPage(res.paginations.hasNextPage);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBookings(1, true);
  }, [customer._id]);

  useEffect(() => {
    if (page > 1) {
      fetchBookings(page);
    }
  }, [page]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (loading || !hasNextPage || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const target = document.getElementById("scroll-trigger");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [loading, hasNextPage, loadingMore]);

  const getStatusColor = (status: string) => {

    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "started":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "accepted":
      case "assigned":
      case "arrived":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-5 w-full max-h-screen overflow-y-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Customer Details</h1>

      {/* ========== CUSTOMER BASIC INFO ========== */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Customer ID" value={customer.customer_id} />
          <Field label="Customer Name" value={customer.name} />
          <Field label="Email Address" value={customer.email} />
          <Field label="Mobile Number" value={customer.mobile_number} />
          <Field label="SOS Mobile Number" value={customer.sos_mobile_number} />
          <Field label="Address" value={customer.address} />
          <Field label="Registration Date" value={customer.reg_date} />
          <Field label="Total Spent" value={customer.total_spent} />
          <Field label="Rating" value={customer.rating} />
          <Field
            label="Status"
            value={
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customer.status
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {customer.status ? "Active" : "Inactive"}
              </span>
            }
          />
        </div>
      </div>

      {/* ========== CUSTOMER BOOKINGS ========== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Bookings
        </h2>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
            <svg
              className="animate-spin -ml-1 mr-3 h-6 w-6 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-gray-500 font-medium">
              Loading bookings...
            </span>
          </div>
        ) : bookings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <Link
                  key={booking._id}
                  href={`/admin/booking-management?view=${booking._id}`}
                  className="group block bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 group-hover:text-primary transition-colors">
                        ID: {booking._id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                        {booking.tripType} - ₹{booking.fare}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Scroll Trigger */}
            <div id="scroll-trigger" className="h-10 w-full" />

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center py-6">
                <svg
                  className="animate-spin h-5 w-5 text-primary mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-gray-500 text-sm font-medium">
                  Loading more...
                </span>
              </div>
            )}

            {!hasNextPage && bookings.length > 5 && (
              <div className="text-center py-8 text-gray-400 text-xs italic">
                You've reached the end of the list
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No bookings found for this customer.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCustomer;

