"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";

export default function HomeHero() {
  const images = [
    "/home-hero/home-hero-carousel-1.png",
    "/home-hero/home-hero-carousel-2.png",
  ];

  return (
    <section className="relative h-screen w-full">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        className="size-full"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <div className="relative size-full">
              <Image
                src={src}
                alt={`Hero Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              {/* Subtle overlay to enhance text/navbar contrast */}
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Content Overlay (if needed in future) */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        {/* You can add hero text here if desired */}
      </div>
    </section>
  );
}
