"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function HowItWorks() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-semibold text-site-black lg:text-4xl text-3xl">
        How it Works for Driver App
      </h1>
      <p className="text-site-gray lg:text-base text-sm">
        DriverZone is your trusted partner for professional Driver Hire in
        Siliguri and Car Driver Hire in Siliguri. We specialize in providing
        skilled, punctual, and verified drivers for local commutes, outstation
        trips, and long-distance journeys. Our mission is to make every ride
        safe, comfortable, and hassle-free, ensuring peace of mind for all our
        customers.
      </p>
      <p className="text-site-gray lg:text-base text-sm">
        With a commitment to excellence, we maintain a luxury fleet of vehicles,
        paired with drivers who know Siliguri and surrounding areas inside out.
        Every trip is handled with utmost professionalism, transparency, and
        care. Whether you need a driver for personal use, business travel, or
        special occasions, DriverZone guarantees dependable service and on-time
        arrival. Experience convenience, reliability, and safety combined,
        making us the preferred choice for driver services in Siliguri.
      </p>
      <div className="relative mt-8 h-[520px]">
        <Swiper
          breakpoints={{
            1536: {
              slidesPerView: 5,
            },
            1280: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 2,
            },
            640: {
              slidesPerView: 1,
            },
          }}
          modules={[Autoplay]}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop
          spaceBetween={30}
          centeredSlides
          initialSlide={2}
          className="h-full"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <SwiperSlide
              key={index}
              className="!h-full !flex !items-end !justify-center pb-2"
            >
              {({ isActive }) => (
                <div
                  className={`relative transition-all duration-500 ${
                    isActive
                      ? "h-[500px] w-[250px]"
                      : "h-[400px] w-[200px] grayscale opacity-50"
                  }`}
                >
                  <Image
                    src="/assets/how-it-works-mockup.png"
                    alt={`Driver App Mockup ${index + 1}`}
                    fill
                    className="object-contain select-none"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 250px"
                    priority={index < 4}
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
