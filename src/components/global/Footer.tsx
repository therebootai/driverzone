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
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Our Packages", href: "/packages" },
    { label: "Offers & Coupon", href: "/offers" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <footer className="relative bg-site-black bg-[url('/assets/footer-bg.png')] bg-cover bg-center text-white overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/85"></div>

      <div className="relative z-10 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-6xl lg:px-0 px-6 pt-16 pb-8 flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1: Logo & Info */}
          <div className="flex flex-col gap-6">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Driver Zone Logo"
                width={180}
                height={96}
                className="w-40"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed max-w-[35ch]">
              DriverZone offers trusted Driver Hire in Siliguri and Car Driver
              Hire in Siliguri with verified drivers, luxury vehicles, and
              on-time service. Enjoy safe, reliable, and convenient travel
              solutions for all your local and outstation trips.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/Driver Zone Customer.apk"
                download={true}
                className="bg-site-lime text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-site-lime/90 transition-colors"
              >
                Hire Driver
              </Link>
              <Link
                href="/Driver Zone Driver.apk"
                download={true}
                className="border border-white text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
              >
                Become a Driver
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">Quick Link</h3>
            <ul className="flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-gray-300 hover:text-site-lime transition-colors group"
                  >
                    <FaCheck className="text-site-lime text-xs group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">Quick Link</h3>
            <ul className="flex flex-col gap-5">
              <li className="flex gap-4">
                <span className="bg-site-lime/10 p-2 rounded-lg h-fit">
                  <FaPhoneVolume className="text-site-lime text-lg" />
                </span>
                <div className="flex flex-col gap-1 text-sm text-gray-300">
                  <Link
                    href="tel:03533568917"
                    className="hover:text-site-lime transition-colors"
                  >
                    &#40;0353&#41; 3568917
                  </Link>
                  <Link
                    href="tel:+918509299342"
                    className="hover:text-site-lime transition-colors"
                  >
                    +91 8509299342
                  </Link>
                  <Link
                    href="tel:+917001606510"
                    className="hover:text-site-lime transition-colors"
                  >
                    +91 7001606510
                  </Link>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-site-lime/10 p-2 rounded-lg h-fit">
                  <IoLogoWhatsapp className="text-site-lime text-xl" />
                </span>
                <Link
                  href="https://api.whatsapp.com/send?phone=918509299342"
                  target="_blank"
                  className="text-sm text-gray-300 hover:text-site-lime transition-colors self-center"
                >
                  +91 8509299342
                </Link>
              </li>
              <li className="flex gap-4">
                <span className="bg-site-lime/10 p-2 rounded-lg h-fit">
                  <IoMailSharp className="text-site-lime text-xl" />
                </span>
                <Link
                  href="mailto:info@driverzoneonline.com"
                  className="text-sm text-gray-300 hover:text-site-lime transition-colors self-center"
                >
                  info@driverzoneonline.com
                </Link>
              </li>
              <li className="flex gap-4">
                <span className="bg-site-lime/10 p-2 rounded-lg h-fit shrink-0">
                  <MdPinDrop className="text-site-lime text-xl" />
                </span>
                <Link
                  href="https://maps.app.goo.gl/GmokDRDLwauqFXNh6"
                  target="_blank"
                  className="text-sm text-gray-300 leading-relaxed"
                >
                  Kalibari, Shanti Nagar, Siliguri, West Bengal - 734004
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Map & Socials */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl overflow-hidden h-44 shadow-lg border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d17060.85166929477!2d88.454268!3d26.6996682!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e4414c86dea3a9%3A0x7608cebd230b056a!2sDRIVER%20ZONE!5e1!3m2!1sen!2sin!4v1760462671759!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.facebook.com/driverzone.siliguri/"
                target="_blank"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white text-lg hover:bg-site-lime hover:border-site-lime hover:text-black transition-all duration-300"
              >
                <FaFacebookF />
              </Link>
              <Link
                href="https://www.instagram.com/driverzoneonline/"
                target="_blank"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white text-lg hover:bg-site-lime hover:border-site-lime hover:text-black transition-all duration-300"
              >
                <FaInstagram />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-400 text-sm">
            © Copyright{" "}
            <Link href="/" className="text-site-lime font-medium">
              Driver Zone
            </Link>{" "}
            - 2026 | All Right Reserved
          </p>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm font-medium">
              Developed By
            </span>
            <Link
              href="https://rebootai.in/"
              target="_blank"
              className="hover:opacity-80 transition-opacity"
            >
              <RebootAi className="h-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
