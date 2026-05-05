import Image from "next/image";
import { FaCheck } from "react-icons/fa6";
import Link from "next/link";

interface PackageData {
  _id: string;
  name: string;
  package_type: string;
  duration: number;
  total_price: number;
  over_time_customer_charge: number;
  fooding_charge?: number;
}

const typeToImage: Record<string, string> = {
  in_city: "/packages/city-tour-package.png",
  mini_outstation: "/packages/out-of-city-tour-package.png",
  outstation: "/packages/out-of-city-tour-package.png",
  hills_tour: "/packages/speacial-tour-package.png",
  long_tour: "/packages/speacial-tour-package.png",
  drop_pickup_service: "/packages/city-tour-package.png",
};

const typeToTitle: Record<string, string> = {
  in_city: "In-City",
  mini_outstation: "Mini Outstation",
  outstation: "Outstation",
  hills_tour: "Hills Tour",
  long_tour: "Long Tour",
  drop_pickup_service: "Drop & Pickup",
};

export default function HomePackages({ 
  packages, 
  showKnowMore = true,
  titleMode = "category",
  title = "Packages & Pricing"
}: { 
  packages: any[], 
  showKnowMore?: boolean,
  titleMode?: "category" | "name",
  title?: string
}) {
  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-center text-site-black lg:text-4xl text-3xl">
          {title}
        </h1>
        <p className="text-site-gray lg:text-base text-sm text-center max-w-3xl mx-auto">
          Choose from flexible, transparent packages designed for every need. From
          hourly city trips to full-day outstation journeys, <b>DriverZone</b>{" "}
          offers competitive rates for reliable Driver Hire in Siliguri services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => {
          const categoryTitle = typeToTitle[pkg.package_type] || pkg.name;
          const title = titleMode === "name" ? pkg.name : categoryTitle;
          const cover = typeToImage[pkg.package_type] || "/packages/city-tour-package.png";
          
          return (
            <div key={pkg._id.toString()} className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 w-full">
                <Image
                  src={cover}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col p-8 gap-6">
                <div className="flex flex-col gap-2">
                  <h2 className="text-site-black font-bold text-2xl">
                    {title}
                  </h2>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-site-green font-bold text-3xl">
                      ₹{pkg.total_price}/-
                    </h3>
                    <p className="text-site-gray text-sm font-medium">
                      For {pkg.duration} hours
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 text-site-black text-sm">
                    <FaCheck className="text-site-green mt-1 shrink-0" />
                    <p>Overtime after {pkg.duration} hrs: ₹{pkg.over_time_customer_charge}/hours</p>
                  </div>
                  <div className="flex items-start gap-3 text-site-black text-sm">
                    <FaCheck className="text-site-green mt-1 shrink-0" />
                    <p>
                      Driver food: {pkg.fooding_charge ? `₹${pkg.fooding_charge} extra` : "Not included"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mt-2">
                  <Link 
                    href={`/booking?package=${pkg._id}`}
                    className="flex-1 bg-site-lime text-site-black font-bold py-3 px-4 rounded-full text-center hover:bg-opacity-90 transition-all text-sm shadow-sm"
                  >
                    Book Now!
                  </Link>
                  {showKnowMore && (
                    <Link 
                      href={`/our-packages/${pkg.package_type}`}
                      className="flex-1 border border-gray-300 text-site-black font-medium py-3 px-4 rounded-full text-center hover:bg-gray-50 transition-all text-sm"
                    >
                      Know More
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
