"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { FaStar } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi2";

// Import Swiper styles
import "swiper/css";

const testimonials = [
  {
    name: "Rahul Roy",
    text: "Experience premium comfort with our luxury fleet, featuring well-maintained cars that provide a smooth, stylish, and stress-free travel experience in Siliguri. Experience premium comfort with our luxury fleet, featuring",
    rating: 5,
  },
  {
    name: "Piyali Ghosh",
    text: "Experience premium comfort with our luxury fleet, featuring well-maintained cars that provide a smooth, stylish, and stress-free travel experience in Siliguri. Experience premium comfort with our luxury fleet, featuring",
    rating: 5,
  },
  {
    name: "Priya Mukherjee",
    text: "Experience premium comfort with our luxury fleet, featuring well-maintained cars that provide a smooth, stylish, and stress-free travel experience in Siliguri. Experience premium comfort with our luxury fleet, featuring",
    rating: 5,
  },
  {
    name: "Arijit Agarwal",
    text: "Experience premium comfort with our luxury fleet, featuring well-maintained cars that provide a smooth, stylish, and stress-free travel experience in Siliguri. Experience premium comfort with our luxury fleet, featuring",
    rating: 5,
  },
  {
    name: "Sandeep Sharma",
    text: "Experience premium comfort with our luxury fleet, featuring well-maintained cars that provide a smooth, stylish, and stress-free travel experience in Siliguri. Experience premium comfort with our luxury fleet, featuring",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 xxl:max-w-8xl xlg:max-w-7xl lg:max-w-4xl">
        <div className="text-center mb-16">
          <p className="text-site-gray font-medium mb-3 tracking-wide">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-site-black leading-tight">
            Reliable Driver Hire Services Siliguri
          </h2>
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={40}
          slidesPerView={1}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 4,
            },
          }}
          className="testimonial-swiper pb-16"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index} className="h-auto">
              <div className="flex flex-col h-full bg-white transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-14 rounded-full bg-site-lime flex items-center justify-center text-site-black shrink-0">
                    <HiUserCircle className="size-10" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-xl text-site-black leading-none">
                      {testimonial.name}
                    </h3>
                    <div className="flex gap-1 text-site-saffron">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="size-3.5" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-site-gray leading-[1.6] text-base font-normal">
                  {testimonial.text}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .testimonial-swiper .swiper-pagination-bullet-active {
          background: var(--color-site-lime) !important;
        }
        .testimonial-swiper .swiper-pagination {
          bottom: 0 !important;
        }
      `}</style>
    </section>
  );
}
