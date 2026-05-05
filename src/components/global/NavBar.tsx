"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CgMenuMotion } from "react-icons/cg";
import { motion } from "motion/react";
import { IoClose } from "react-icons/io5";
import { useScroll } from "@/hooks/useScroll";

export default function NavBar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathName = usePathname();

  const scroll = useScroll();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Our Packages", href: "/our-packages" },
    { name: "Offers & Coupon", href: "/offers" },
    {
      name: "Hire Driver",
      href: "/Driver Zone Customer.apk",
      download: true,
    },
    {
      name: "Become a Driver",
      href: "/Driver Zone Driver.apk",
      download: true,
    },
  ];

  function isActivePath(path: string) {
    return pathName === path;
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scroll ? "bg-black/20 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-7xl lg:px-6 px-4 py-4 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="logo"
            width={164}
            height={87}
            className={`transition-all duration-300 object-contain ${
              scroll ? "lg:w-28 w-20" : "lg:w-36 w-24"
            }`}
          />
        </Link>

        {/* Desktop Navigation */}
        <ul className="lg:flex items-center justify-center gap-2 xlg:gap-3 hidden">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                download={link.download}
                className={`text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap backdrop-blur-md ${
                  isActivePath(link.href)
                    ? "bg-site-lime text-black shadow-sm"
                    : "bg-white/20 text-site-black hover:opacity-90"
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Button */}
        <Link
          href="/contact"
          className="rounded-full bg-site-lime text-black text-sm font-medium px-6 py-2.5 hidden lg:inline-flex shadow-sm hover:opacity-90 transition-opacity"
        >
          Contact Us
        </Link>

        {/* Mobile Button */}
        <button
          type="button"
          className="text-2xl text-site-black inline-flex lg:hidden"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          {isMobileNavOpen ? <IoClose /> : <CgMenuMotion />}
        </button>

        {/* Mobile Navigation */}
        {isMobileNavOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl lg:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  download={link.download}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`text-base font-medium px-4 py-2 rounded-lg transition-colors ${
                    isActivePath(link.href)
                      ? "bg-site-lime/20 text-black"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setIsMobileNavOpen(false)}
                className="mt-2 rounded-full bg-site-lime text-black text-center font-medium px-6 py-3 shadow-sm"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
