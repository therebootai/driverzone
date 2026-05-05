"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  IoCheckmarkCircleSharp,
  IoPricetagOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { RiCustomerService2Line } from "react-icons/ri";
import { MdOutlineAccessTime, MdOutlineHealthAndSafety } from "react-icons/md";
import { HiOutlineSquaresPlus } from "react-icons/hi2";

const tabs = [
  {
    id: "verified",
    label: "Verified Drivers",
    icon: <IoCheckmarkCircleSharp />,
    heading: "Verified Drivers",
    description:
      "All our drivers undergo thorough background verification and rigorous training. We ensure that every driver behind the wheel is professional, trustworthy, and experienced, giving you peace of mind during your journey. We prioritize your security by vetting every individual through multiple checks, including criminal records and past employment history, so you can travel with confidence every single time.",
  },
  {
    id: "pricing",
    label: "Affordable Pricing",
    icon: <IoPricetagOutline />,
    heading: "Affordable Pricing",
    description:
      "Enjoy premium driver services at rates that fit your budget. We believe in fair and transparent pricing, offering various packages tailored to your specific needs, whether it's for a few hours or a full day. No hidden costs, no surprise surges—just honest, upfront pricing that makes hiring a professional driver accessible for everyone, every day.",
  },
  {
    id: "support",
    label: "24/7 Service and Support",
    icon: <RiCustomerService2Line />,
    heading: "24/7 Service and Support",
    description:
      "Our dedicated support team is available around the clock to assist you with bookings, queries, or any assistance you might need during your ride. We're always just a call away to ensure your experience is seamless. Whether it's a late-night emergency or a simple scheduling change, our professional support staff is equipped to handle your needs efficiently and promptly.",
  },
  {
    id: "on-time",
    label: "On Time Driver Reporting",
    icon: <MdOutlineAccessTime />,
    heading: "On Time Driver Reporting",
    description:
      "Punctuality is our hallmark. Our drivers are committed to arriving at your location on time, every time. With real-time tracking and efficient dispatching, we minimize wait times and keep your schedule on track. We understand the value of your time, which is why we've implemented advanced reporting systems to ensure every driver reports exactly when they're supposed to.",
  },
  {
    id: "safe",
    label: "Safe & Trusted",
    icon: <IoShieldCheckmarkOutline />,
    heading: "Safe & Trusted",
    description:
      "Your safety is our top priority. From well-maintained vehicles to safe driving practices, we take every precaution to ensure a secure environment. Our reputation is built on the trust of thousands of satisfied customers who rely on us for their daily transportation. We maintain high standards of safety protocols, ensuring that both drivers and passengers adhere to the best road safety practices.",
  },
  {
    id: "customize",
    label: "Customize",
    icon: <HiOutlineSquaresPlus />,
    heading: "Tailored Experience",
    description:
      "Every journey is unique, and we offer the flexibility to customize your driver service. Whether you have specific route preferences, need multiple stops, or have special requirements for long-distance travel, we adapt to your needs. Our goal is to provide a truly personalized experience that feels like having your own private chauffeur who understands your specific routines and preferences.",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: <MdOutlineHealthAndSafety />,
    heading: "Comprehensive Coverage",
    description:
      "We provide insurance coverage for added protection during your trips. Our commitment to your well-being extends beyond just the drive, ensuring that you're protected against unforeseen circumstances for a worry-free ride. We work with leading insurance partners to provide comprehensive protection plans that cover various aspects of your journey, giving you an extra layer of security and reliability.",
  },
];

export default function WhyChoose() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <section className="py-16 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm lg:text-base text-site-black font-medium uppercase tracking-wider">
          Why Choose Driver Zone
        </h3>
        <h1 className="text-site-black xl:text-4xl md:text-3xl text-2xl font-bold max-w-4xl leading-tight">
          Verified professionals with safety, support and convenience.
        </h1>
      </div>

      {/* Tabs Container */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 whitespace-nowrap text-sm font-medium ${
              activeTab.id === tab.id
                ? "bg-site-lime border-site-lime text-black shadow-md"
                : "bg-white border-site-gray text-gray-600 hover:border-site-lime hover:bg-gray-50"
            }`}
          >
            <span
              className={
                activeTab.id === tab.id ? "text-black" : "text-gray-400"
              }
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-[#F8F9FA] rounded-[40px] border border-gray-100 p-8 lg:p-12 min-h-[450px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 h-full"
          >
            {/* Vector Image */}
            <div className="w-full lg:w-[45%] flex justify-start">
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src="/assets/why-us-vector.png"
                  alt="Why Choose Us Illustration"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="w-full lg:w-[55%] flex flex-col gap-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-site-black">
                {activeTab.heading}
              </h2>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                {activeTab.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
