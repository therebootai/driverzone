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
    { name: "Contact", href: "/contact" },
  ];

  function isActivePath(path: string) {
    return pathName === path;
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 ${
        scroll ? "bg-site-neongreen" : ""
      }`}
    >
      <div className="relative xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4 py-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="logo"
            width={164}
            height={87}
            className="lg:w-40 w-24"
          />
        </Link>

        {/* Desktop Navigation */}
        <ul className="lg:flex items-center justify-center gap-5 hidden">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={` hover:text-white hover:bg-site-black text-base lg:px-3 xlg:px-5 lg:py-2.5 xlg:py-4  rounded-full ${
                  isActivePath(link.href)
                    ? "text-white bg-site-black"
                    : "bg-white text-black"
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Button */}
        <button
          type="button"
          className="rounded-full bg-linear-90 from-site-black to-site-darkyellow text-white text-base lg:px-3 xlg:px-5 lg:py-2.5 xlg:py-4 hidden lg:inline-flex"
        >
          Download App
        </button>

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
            initial={{ height: 0, y: 0, opacity: 0 }}
            animate={{
              height: isMobileNavOpen ? "auto" : 0,
              y: isMobileNavOpen ? "100%" : 0,
              opacity: isMobileNavOpen ? 1 : 0,
            }}
            exit={{ height: 0, y: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 w-full bg-gradient-to-b from-site-neongreen via-white to-site-neongreen p-4"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-base ${
                    isActivePath(link.href)
                      ? "text-site-black"
                      : "text-site-black"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                type="button"
                className="rounded-full bg-linear-90 from-site-black to-site-darkyellow text-white text-base px-2 py-1 self-start"
              >
                Download App
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
