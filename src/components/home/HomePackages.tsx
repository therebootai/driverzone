import { All_Packages } from "@/helpers/Packages";
import PackageCard from "@/ui/PackageCard";

export default function HomePackages() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-semibold text-center text-site-black lg:text-4xl text-3xl">
        Packages & Pricing
      </h1>
      <h3 className="text-site-gray lg:text-base text-sm text-center">
        Choose from flexible, transparent packages designed for every need. From
        hourly city trips to full-day outstation journeys, <b>DriverZone</b>{" "}
        offers competitive rates for reliable Driver Hire in Siliguri services.
      </h3>
      <div className="flex flex-col gap-6 mt-2">
        {All_Packages.map((item, index) => (
          <PackageCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}
