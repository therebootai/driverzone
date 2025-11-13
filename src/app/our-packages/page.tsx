import SubBanner from "@/components/global/SubBanner";
import { All_Packages } from "@/helpers/Packages";
import WebsiteTemplate from "@/templates/WebsiteTemplate";
import PackageCard from "@/ui/PackageCard";

export default function OurPackagesPage() {
  return (
    <WebsiteTemplate>
      <SubBanner title="Our Packages & Pricing" />
      <div className="flex flex-col lg:gap-16 gap-8 lg:my-16 my-8 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4">
        <p className="lg:text-base text-sm text-site-gray">
          Choose from flexible, transparent packages designed for every need.
          From hourly city trips to full-day outstation journeys, DriverZone
          offers competitive rates for reliable Driver Hire in Siliguri
          services.
        </p>
        <div className="flex flex-col gap-6 mt-2">
          {All_Packages.map((item, index) => (
            <PackageCard key={index} {...item} />
          ))}
        </div>
      </div>
    </WebsiteTemplate>
  );
}
