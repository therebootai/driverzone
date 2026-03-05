"use client";
import React, { useEffect, useState } from "react";
import ManageBooking from "./ManageBooking";
import { useSearchParams } from "next/navigation";
import { BookingTypes, GetBookingsParams } from "@/types/types";
import { getBookings } from "@/actions/bookingAction";

const BookingFullPage = () => {
  const [allBookings, setAllBookings] = useState<BookingTypes[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalItems: 0,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [status, setStatus] = useState<string | undefined>("");
  const searchParams = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const fetchData = async (
    page = 1,
    limit = 20,
    search = searchTerm,
    statusFilter = status
  ) => {
    try {
      const normalizedStatus: GetBookingsParams["status"] =
        !statusFilter || statusFilter === ""
          ? undefined
          : (statusFilter as GetBookingsParams["status"]);
      const result = await getBookings({
        page,
        limit,
        searchTerm: search,
        status: normalizedStatus,
      });

      if (result?.success) {
        setAllBookings(result.data || []);
        setPagination(result.paginations);
      } else {
        console.error(result?.error || "Failed to fetch customers");
        setAllBookings([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllBookings([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    }
  };

  useEffect(() => {
    fetchData(pageFromUrl, 20, searchTerm, status);
  }, [pageFromUrl, searchTerm, status]);
  return (
    <div className=" p-6 flex flex-col gap-6">
      <div>
        <ManageBooking
          allBookings={allBookings}
          pagination={pagination}
          fetchData={fetchData}
        />
      </div>
    </div>
  );
};

export default BookingFullPage;
