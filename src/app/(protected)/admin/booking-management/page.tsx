import React, { Suspense } from "react";
import AdminTemplate from "@/templates/AdminTemplate";
import BookingPageHeader from "@/components/admin/booking/BookingPageHeader";
import Loader from "@/ui/Loader";
import { getBookings } from "@/actions/bookingAction";
import { GetBookingsParams } from "@/types/types";
import ManageBooking from "@/components/admin/booking/ManageBooking";
import { revalidatePath } from "next/cache";
import { authorizeAccess } from "@/utils/authorizeAccess";
import RealtimeRideNotification from "@/components/admin/RealtimeRideNotification";

export const dynamic = "force-dynamic";

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
      <RealtimeRideNotification />
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <BookingPageHeader />
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          Live Sync Active
        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
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
