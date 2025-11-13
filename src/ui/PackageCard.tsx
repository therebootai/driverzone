import Image from "next/image";
import { FaCheck } from "react-icons/fa6";

export default function PackageCard({
  title,
  cover,
  tour_packages,
}: {
  title: string;
  cover: string;
  tour_packages: {
    title: string;
    price: string;
    length: string;
    key_features: string[];
  }[];
}) {
  return (
    <div className="flex flex-col gap-5 lg:p-8 p-4 bg-neutral-50 border border-slate-400 rounded-xl">
      <h2 className="text-site-black font-semibold lg:text-2xl text-xl">
        {title}
      </h2>
      <div className="flex flex-col-reverse lg:flex-row xl:gap-7 gap-5">
        <div className="flex flex-wrap gap-8 basis-full lg:basis-1/2">
          {tour_packages.map(
            ({ title, price, length, key_features }, index) => (
              <div
                key={index}
                className="bg-white lg:p-6 p-4 border border-gray-200 rounded flex flex-col gap-6"
              >
                <h2 className="text-site-black lg:text-2xl text-xl font-semibold">
                  {title}
                </h2>
                <div className="flex flex-col gap-3">
                  <h1 className="text-site-green font-semibold lg:text-3xl text-2xl">
                    ₹{price}/-
                  </h1>
                  <h3 className="text-site-black lg:text-base text-sm">
                    For {length}
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {key_features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-site-black lg:text-base text-sm"
                    >
                      <FaCheck className="text-site-green" />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-white lg:text-base text-sm py-3 bg-linear-90 from-site-green to-site-black rounded"
                >
                  Book Now!
                </button>
              </div>
            )
          )}
        </div>
        <Image
          src={cover}
          alt={title}
          width={658}
          height={258}
          className="rounded lg:basis-1/2 basis-full"
        />
      </div>
    </div>
  );
}
