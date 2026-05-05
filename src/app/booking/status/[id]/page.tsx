import BookingStatusClient from "@/components/booking/BookingStatusClient";

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-gray-50">
      <BookingStatusClient bookingId={id as string} />
    </main>
  );
}
