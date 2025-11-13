"use client";

import RebootAi from "@/icons/RebootAi";
import Image from "next/image";
import Link from "next/link";
import {
  FaCheck,
  FaFacebookF,
  FaInstagram,
  FaPhoneVolume,
} from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import { IoMailSharp } from "react-icons/io5";
import { MdPinDrop } from "react-icons/md";

export default function Footer() {
  const contactLinks = [
    {
      icon: <FaPhoneVolume />,
      links: [
        { label: "(0353) 3568917", href: "tel:03533568917" },
        { label: "+91 8509299342", href: "tel:+918509299342" },
        { label: "+91 7001606510", href: "tel:+917001606510" },
      ],
    },
    {
      icon: <IoLogoWhatsapp />,
      links: [
        {
          label: "+91 8509299342",
          href: "https://api.whatsapp.com/send?phone=918509299342",
        },
      ],
    },
    {
      icon: <IoMailSharp />,
      links: [
        {
          label: "info@driverzoneonline.com",
          href: "mailTo:info@driverzoneonline.com",
        },
      ],
    },
    {
      icon: <MdPinDrop />,
      links: [
        {
          label: "Kalibari, Shanti Nagar, Siliguri, West Bengal - 734004",
          href: "mailTo:info@driverzoneonline.com",
        },
      ],
    },
  ];

  const navLinks = [
    {
      icon: <FaCheck />,
      links: [{ label: "Home", href: "/" }],
    },
    {
      icon: <FaCheck />,
      links: [{ label: "About Us", href: "/about" }],
    },
    {
      icon: <FaCheck />,
      links: [{ label: "Car Service", href: "/car-service" }],
    },
    {
      icon: <FaCheck />,
      links: [{ label: "Driver Service", href: "/driver-service" }],
    },
    {
      icon: <FaCheck />,
      links: [{ label: "Contact Us", href: "/contact" }],
    },
  ];

  return (
    <footer className="relative bg-site-black">
      <div className="xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4 py-5 flex gap-8 lg:gap-12 flex-col">
        <div className="flex flex-col lg:flex-row lg:py-6 py-4 bg-white/10 justify-between items-center rounded-xl xl:px-24 lg:px-16 px-8">
          <p className="text-site-neongreen font-semibold lg:text-xl text-lg lg:max-w-[35ch]">
            Get a call back within 15 minutes from our Health Advisor for Test
            Booking Assistance.
          </p>
          <div className="bg-white/20 border border-site-neongreen rounded-full flex gap-3.5 ps-2 lg:ps-4">
            <span className="p-2 inline-flex items-center justify-center border border-site-neongreen rounded-full bg-radial from-site-neongreen/0 to-site-neongreen/60 text-site-neongreen self-center">
              <FaPhoneVolume className="size-3" />
            </span>
            <input
              type="text"
              className="lg:text-base text-sm text-site-neongreen placeholder:text-site-neongreen flex-1 p-2 lg:p-4"
              placeholder="Enter your mobile number"
            />
            <button
              type="button"
              className="bg-site-neongreen rounded-r-full lg:p-4 p-2 text-site-black font-medium"
            >
              Submit
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row xxl:gap-24 xl:gap-20 md:gap-14 gap-10">
          <div className="flex flex-col gap-6">
            <Image
              src="/logo-white.png"
              alt="logo"
              width={164}
              height={87}
              className="lg:w-40 w-24"
            />
            <p className="md:text-base text-sm -tracking-[0.03em] text-site-stone lg:max-w-[53ch]">
              Lorem ipsum dolor sit amet consectetur. Vitae leo sit pretium
              praesent nulla aliquet. Etiam laoreet sollicitudin ut nunc in
              condimentum. Lacus libero egestas cursus purus dictum donec sed
              semper. Pharetra quis bibendum phasellus neque quis urna
            </p>
          </div>
          <div className="flex flex-col gap-6 whitespace-nowrap">
            <h3 className="lg:text-xl text-lg font-semibold text-white">
              Quick Link
            </h3>
            <ul className="flex flex-col justify-between gap-6">
              {navLinks.map((item, index) => (
                <li key={index} className="flex gap-2 items-center">
                  <span className="text-site-neongreen shrink-0 text-xl">
                    {item.icon}
                  </span>
                  <ul className="flex flex-wrap gap-2">
                    {item.links.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-site-stone hover:text-site-neongreen text-base"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <h3 className="lg:text-xl text-lg font-semibold text-white">
              Quick Link
            </h3>
            <ul className="flex flex-col justify-between gap-6">
              {contactLinks.map((item, index) => (
                <li key={index} className="flex gap-2 items-center">
                  <span className="text-site-neongreen shrink-0 text-xl">
                    {item.icon}
                  </span>
                  <ul className="flex flex-wrap gap-2">
                    {item.links.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          target="_blank"
                          className="text-site-stone hover:text-site-neongreen text-base"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d17060.85166929477!2d88.454268!3d26.6996682!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e4414c86dea3a9%3A0x7608cebd230b056a!2sDRIVER%20ZONE!5e1!3m2!1sen!2sin!4v1760462671759!5m2!1sen!2sin"
              className="flex-1 rounded-lg"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.facebook.com/driverzone.siliguri/"
                target="_blank"
                className="text-white text-2xl hover:scale-105 transition-transform duration-150"
              >
                <FaFacebookF />
              </Link>
              <Link
                href="https://www.instagram.com/driverzoneonline/"
                target="_blank"
                className="text-white text-2xl hover:scale-105 transition-transform duration-150"
              >
                <FaInstagram />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[#696574] flex flex-col lg:flex-row items-center justify-between lg:py-11 py-7">
          <h3 className="text-white capitalize">
            &copy;{" "}
            <Link href="/" className="inline text-site-neongreen">
              Driver Zone
            </Link>{" "}
            - 2025 | All rights reserved
          </h3>
          <h1 className="inline-flex items-center gap-2 flex-wrap font-semibold text-white">
            Design & Developed By:{" "}
            <span className="">
              <Link
                href={"https://rebootai.in/"}
                target="_blank"
                className="inline"
              >
                <RebootAi />
              </Link>
            </span>
          </h1>
        </div>
      </div>
    </footer>
  );
}
