"use client";

import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { FiUserCheck } from "react-icons/fi";
import { LuAlarmClockCheck } from "react-icons/lu";
import { MdOutlineCarRental } from "react-icons/md";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function WhyChoose() {
  const cardDetails = [
    {
      icon: <MdOutlineCarRental />,
      title: "Luxury Fleet",
      description:
        "Experience premium comfort with our luxury fleet, featuring well-maintained cars that provide a smooth, stylish, and stress-free travel experience in Siliguri.",
    },
    {
      icon: <LuAlarmClockCheck />,
      title: "On-Time Service",
      description:
        "Our drivers value your time, ensuring punctual pickups and drop-offs for every trip, making your Driver Hire in Siliguri experience reliable.",
    },
    {
      icon: <AiOutlineSafetyCertificate />,
      title: "Safety First",
      description:
        "We prioritize passenger safety with trained drivers, strict adherence to traffic rules, and fully insured vehicles for secure and worry-free journeys.",
    },
    {
      icon: <FiUserCheck />,
      title: "Verified Drivers",
      description:
        "All our drivers undergo thorough background verification, ensuring professional, trustworthy service for every Car Driver Hire in Siliguri trip.",
    },
  ];
  return (
    <section className="flex flex-col gap-6">
      <h3 className="text-sm lg:text-base text-site-green">
        Why Choose Driver Zone?
      </h3>
      <h1 className="text-site-black xl:text-4xl md:text-3xl text-2xl font-semibold">
        Trusted Drivers Ensuring Safe Journeys Every Time
      </h1>
      <p className="lg:text-base text-sm text-site-gray">
        At <b>DriverZone</b>, we take pride in offering reliable and
        professional Driver Hire in Siliguri services designed for your comfort
        and safety. Our trained, background-verified drivers ensure a smooth and
        stress-free driving experience for local and outstation trips. Whether
        it&apos;s a daily commute, business travel, or long-distance journey, we
        provide punctual, polite, and responsible drivers who know every route
        across Siliguri. With transparent pricing, flexible booking options, and
        dedicated customer support, we make Car Driver Hire in Siliguri
        convenient and dependable.
      </p>
      <div>
        <Swiper
          breakpoints={{
            1280: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 2,
            },
            0: {
              slidesPerView: 0,
            },
          }}
          modules={[Autoplay]}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          grabCursor
          loop
          spaceBetween={24}
        >
          {cardDetails.map((card, index) => (
            <SwiperSlide key={index} className="!h-auto">
              <SlideCard {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function SlideCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="lg:p-6 p-4 rounded bg-site-stone flex flex-col items-center justify-center gap-5 flex-1">
      <span className="bg-site-green p-3.5 rounded-full text-white text-3xl">
        {icon}
      </span>
      <div className="flex flex-col gap-3.5 items-center justify-center text-center">
        <h2 className="text-site-black font-semibold lg:text-xl text-lg">
          {title}
        </h2>
        <p className="lg:text-base text-sm text-site-gray">{description}</p>
      </div>
    </div>
  );
}
