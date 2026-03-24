"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function HowItWorks() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-semibold text-center text-site-black lg:text-4xl text-3xl">
        How it Works
      </h1>
      <h3 className="text-site-gray lg:text-base text-sm text-center">
        Booking a driver is simple and hassle-free. Select your trip, choose a
        verified driver, confirm instantly, and enjoy safe, punctual, and
        professional Car Driver Hire in Siliguri every time.
      </h3>
      <div className="relative">
        <Swiper
          breakpoints={{
            1280: {
              slidesPerView: 5,
            },
            1024: {
              slidesPerView: 4,
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
          // dir="rtl"
          initialSlide={2}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <SwiperSlide key={index} className="!h-auto !self-end">
              {({ isActive }) => (
                <Image
                  src={`/assets/how-it-works-mockup.png`}
                  alt={`how-it-works-${index + 1}`}
                  width={200}
                  height={isActive ? 414 : 374}
                  className={`${
                    !isActive ? "grayscale-100 h-96" : "h-[26rem] grayscale-0"
                  } select-none`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 200px"
                  priority={index < 2} // Preload the first two images in the swiper
                />

              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
