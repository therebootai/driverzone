import CarChecked from "@/icons/CarChecked";
import Image from "next/image";

export default function AboutDriverZone() {
  return (
    <section className="flex flex-col lg:flex-row gap-6 lg:gap-9">
      <div className="flex flex-col gap-6">
        <h3 className="text-sm lg:text-base text-site-green">
          About Driver Zone
        </h3>
        <h1 className="text-site-black xl:text-4xl md:text-3xl text-2xl font-semibold">
          Reliable Driver Hire Services Siliguri
        </h1>
        <p className="lg:text-base text-sm text-site-gray">
          DriverZone is your trusted partner for professional Driver Hire in
          Siliguri and Car Driver Hire in Siliguri. We specialize in providing
          skilled, punctual, and verified drivers for local commutes, outstation
          trips, and long-distance journeys. Our mission is to make every ride
          safe, comfortable, and hassle-free, ensuring peace of mind for all our
          customers. <br /> <br />
          With a commitment to excellence, we maintain a luxury fleet of
          vehicles, paired with drivers who know Siliguri and surrounding areas
          inside out. Every trip is handled with utmost professionalism,
          transparency, and care. Whether you need a driver for personal use,
          business travel, or special occasions, DriverZone guarantees
          dependable service and on-time arrival. Experience convenience,
          reliability, and safety combined, making us the preferred choice for
          driver services in Siliguri.
        </p>
        <div className="flex flex-col gap-5">
          {[
            {
              title: "Your safety and comfort are our priority.",
              bg: "bg-site-neongreen",
              color: "text-site-black",
            },
            {
              title:
                "Professional drivers ensuring timely arrivals every trip.",
              bg: "bg-site-black",
              color: "text-site-neongreen",
            },
            {
              title: "Experience stress-free journeys with verified drivers.",
              bg: "bg-site-green",
              color: "text-white",
            },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3.5">
              <span className={`${item.bg} p-2.5 rounded-full`}>
                <CarChecked className={item.color} />
              </span>
              <h3 className="text-site-black lg:text-2xl text-xl">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
      <div className="shrink-0">
        <Image
          src="/assets/about-cover.png"
          alt="mockup"
          width={638}
          height={476}
          className="rounded-xl"
        />
      </div>
    </section>
  );
}
