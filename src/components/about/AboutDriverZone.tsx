import CarChecked from "@/icons/CarChecked";
import Image from "next/image";

export default function AboutDriverZone() {
  return (
    <section className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
      <div className="flex flex-col gap-6 flex-1">
        <div className="space-y-2">
          <h3 className="text-sm lg:text-base text-site-gray font-medium">
            Why Join Us
          </h3>
          <h1 className="text-site-black xl:text-5xl lg:text-4xl text-3xl font-bold">
            About Driver Zone
          </h1>
        </div>

        <div className="space-y-4 text-site-gray lg:text-base text-sm leading-relaxed">
          <p>
            DriverZone is your trusted partner for professional Driver Hire in
            Siliguri and Car Driver Hire in Siliguri. We specialize in providing
            skilled, punctual, and verified drivers for local commutes,
            outstation trips, and long-distance journeys. Our mission is to make
            every ride safe, comfortable, and hassle-free, ensuring peace of
            mind for all our customers.
          </p>
          <p>
            With a commitment to excellence, we maintain a luxury fleet of
            vehicles, paired with drivers who know Siliguri and surrounding
            areas inside out. Every trip is handled with utmost professionalism,
            transparency, and care. Whether you need a driver for personal use,
            business travel, or special occasions, DriverZone guarantees
            dependable service and on-time arrival. Experience convenience,
            reliability, and safety combined, making us the preferred choice for
            driver services in Siliguri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-2">
          {[
            "Verified Drivers",
            "Affordable Pricing",
            "24/7 Service and Support",
            "Safe & Trusted",
            "On-Time Driver Reporting",
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="bg-site-lime p-2 rounded-full shrink-0">
                <CarChecked className="text-site-black text-lg" />
              </div>
              <span className="text-site-black font-semibold text-lg lg:text-xl">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full lg:w-auto">
        <Image
          src="/assets/about-cover.png"
          alt="Driver Zone Office"
          width={638}
          height={476}
          className="rounded-3xl w-full object-cover shadow-lg"
        />
      </div>
    </section>
  );
}
