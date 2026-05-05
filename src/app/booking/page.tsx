import BookingPageClient from "@/components/booking/BookingPageClient";
import { connectToDatabase, ensureModelsRegistered } from "@/db/connection";
import Package from "@/models/Packages";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  await connectToDatabase();
  await ensureModelsRegistered();

  const { package: packageId } = await searchParams;
  let initialPackage = null;

  if (packageId) {
    try {
      const pkg = await Package.findById(packageId)
        .populate("main_zone")
        .populate("service_zone")
        .populate("drop_zone")
        .lean();
      if (pkg) {
        initialPackage = JSON.parse(JSON.stringify(pkg));
      }
    } catch (error) {
      console.error("Error fetching initial package:", error);
    }
  }

  const allPackages = await Package.find({ status: true })
    .populate("main_zone")
    .populate("service_zone")
    .populate("drop_zone")
    .lean();

  return (
    <main className="min-h-screen bg-white">
      <BookingPageClient
        initialPackage={initialPackage}
        allPackages={JSON.parse(JSON.stringify(allPackages))}
      />
    </main>
  );
}
