import { FaCarRear } from "react-icons/fa6";
import { MdOutlineSecurity } from "react-icons/md";

const MissionVision = () => {
  const data = [
    {
      title: "Our Mission",
      icon: <FaCarRear className="text-3xl" />,
      description:
        "DriverZone is your trusted partner for professional Driver Hire in Siliguri and Car Driver Hire in Siliguri. We specialize in providing skilled, punctual, and verified drivers for local commutes, outstation trips, and long-distance journeys. Our mission is to make every ride safe, comfortable, and hassle-free, ensuring peace of mind for all our customers. With a commitment to excellence, we maintain a luxury Fleet of vehicles, paired with drivers who know Siliguri and surrounding areas inside out. Every trip is handled with utmost professionalism, transparency, and care. Whether you need a driver for personal use, business travel, or special occasions, DriverZone guarantees dependable service and on-time arrival. Experience convenience, reliability, and safety combined, making us the preferred choice for driver services in Siliguri.",
    },
    {
      title: "Our Vision",
      icon: <MdOutlineSecurity className="text-3xl" />,
      description:
        "DriverZone is your trusted partner for professional Driver Hire in Siliguri and Car Driver Hire in Siliguri. We specialize in providing skilled, punctual, and verified drivers for local commutes, outstation trips, and long-distance journeys. Our mission is to make every ride safe, comfortable, and hassle-free, ensuring peace of mind for all our customers. With a commitment to excellence, we maintain a luxury Fleet of vehicles, paired with drivers who know Siliguri and surrounding areas inside out. Every trip is handled with utmost professionalism, transparency, and care. Whether you need a driver for personal use, business travel, or special occasions, DriverZone guarantees dependable service and on-time arrival. Experience convenience, reliability, and safety combined, making us the preferred choice for driver services in Siliguri.",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pb-16">
      {data.map((item, index) => (
        <div
          key={index}
          className="relative bg-[#F4FFE9] rounded-[50px] p-8 lg:p-14 flex flex-col items-center text-center group transition-all duration-500 overflow-hidden border-t-[10px] border-site-green shadow-sm hover:shadow-xl hover:-translate-y-1"
        >
          {/* Icon Container */}
          <div className="w-16 h-16 bg-site-lime rounded-full flex items-center justify-center mb-8 text-site-black shadow-inner">
            {item.icon}
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-site-black mb-6">
            {item.title}
          </h2>

          <p className="text-site-gray leading-relaxed text-sm lg:text-[15px] max-w-2xl">
            {item.description}
          </p>
        </div>
      ))}
    </section>
  );
};

export default MissionVision;
