import React, { Suspense } from "react";
import AdminTemplate from "@/templates/AdminTemplate";
import BookingPageHeader from "@/components/admin/booking/BookingPageHeader";
import Loader from "@/ui/Loader";
import { getBookings } from "@/actions/bookingAction";
import { GetBookingsParams } from "@/types/types";
import ManageBooking from "@/components/admin/booking/ManageBooking";
import { revalidatePath } from "next/cache";
import { authorizeAccess } from "@/utils/authorizeAccess";

const BookingManagement = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { 
    page = "1", 
    search, 
    status,
    tripType,
    startDate,
    endDate 
  } = await searchParams;
  
  await authorizeAccess("booking_management");
  
  const normalizedStatus: GetBookingsParams["status"] =
    !status || status === ""
      ? undefined
      : (status as GetBookingsParams["status"]);
      
  const normalizedTripType: GetBookingsParams["tripType"] =
    !tripType || tripType === ""
      ? undefined
      : (tripType as GetBookingsParams["tripType"]);

  const adjustedEndDate = endDate ? `${endDate}T23:59:59.999Z` : undefined;

  const { data, paginations } = await getBookings({
    page: parseInt(page),
    searchTerm: search,
    status: normalizedStatus,
    tripType: normalizedTripType,
    startDate,
    endDate: adjustedEndDate,
  });

  return (
    <AdminTemplate className="p-6 flex flex-col gap-6">
      <BookingPageHeader />
      <Suspense
        fallback={
          <div className="flex justify-center items-center flex-1">
            <Loader />
          </div>
        }
      >
        <ManageBooking
          allBookings={data}
          pagination={paginations}
          fetchData={async () => {
            "use server";
            revalidatePath("/admin/booking-management");
          }}
        />
      </Suspense>
    </AdminTemplate>
  );
};

export default BookingManagement;
