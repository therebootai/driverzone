"use client";

import { LOGOUT } from "@/actions/userActions";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoIosArrowDown, IoIosLogOut } from "react-icons/io";
import { PiUserCircleFill } from "react-icons/pi";

export default function AdminHeader() {
  const pathname = usePathname();

  const router = useRouter();

  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname === path || pathname.startsWith(path + "/");
  };

  const allNavLinks: {
    label: string;
    path: string;
    dropdown?: { label: string; path: string }[];
  }[] = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      label: "Zone Management",
      path: "/admin/zone-management",
    },
    {
      label: "Package Management",
      path: "/admin/package-management",
    },
    {
      label: "Driver Management",
      path: "/admin/driver-management",
    },
    {
      label: "Customer Management",
      path: "/admin/customer-management",
    },
    {
      label: "Booking Management",
      path: "/admin/booking-management",
    },
    {
      label: "Coupon",
      path: "/admin/coupon",
    },
    {
      label: "Masters",
      path: "",
      dropdown: [
        {
          label: "User Management",
          path: "/admin/masters/user-management",
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await LOGOUT();
      logout();
      router.push("/");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error(error.message || "Unknown error");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-400 flex flex-row justify-between items-center px-4 xl:px-8 gap-8 py-2 lg:py-4">
      <Link href={"/admin/dashboard"}>
        <Image
          src={"/logo-black.png"}
          alt="logo"
          width={225}
          height={60}
          priority
          className="md:h-10 lg:h-12 xl:h-14 h-8 w-fit"
        />
      </Link>
      <div className="items-center flex justify-center  px-4 xlg:px-6 xl:px-8 gap-6 flex-wrap xl:flex-nowrap flex-1">
        {allNavLinks.map((link, index) => (
          <div className="group" key={index}>
            {!link.dropdown ? (
              <Link
                href={link.path + "?page=1"}
                className={`inline-flex gap-2 items-center group text-site-black font-medium text-xs lg:text-sm xlg:text-sm xl:text-base hover:bg-linear-90 from-site-saffron to-site-skin px-2 rounded-md h-[2rem] ${
                  isActive(link.path) ? "bg-linear-90" : ""
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <div className="relative" key={index}>
                <h3
                  className={`inline-flex gap-2 items-center hover:text-custom-violet font-medium text-xs lg:text-sm xlg:text-sm xl:text-base ${
                    isActive(link.path)
                      ? "text-site-darkgreen"
                      : "text-site-black"
                  }`}
                >
                  {link.label}
                  <IoIosArrowDown />
                </h3>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-[12rem] bg-linear-90 from-site-saffron to-site-skin hidden group-hover:flex p-2 rounded-md flex-col gap-2 z-10 backdrop-blur">
                  {link.dropdown.map((item, index) => (
                    <Link
                      key={index}
                      href={item.path + "?page=1"}
                      className="flex gap-4 items-center font-medium text-sm text-site-black border-b border-transparent hover:border-site-darkgreen"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-5">
        <div className="relative flex items-center group">
          <button type="button" className="text-custom-black text-2xl">
            <PiUserCircleFill />
          </button>
          <div className="absolute top-full right-0 w-[10vmax] bg-site-saffron hidden group-hover:flex p-2 rounded-md flex-col gap-4 z-50">
            {user && (
              <div className="flex flex-col gap-2">
                <h1 className="text-site-black text-base font-bold lg:text-xl">
                  {user.name}
                </h1>
              </div>
            )}
            <div className="h-0.5 w-full bg-custom-gray" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex gap-2 items-center font-medium text-sm lg:text-lg text-site-black whitespace-nowrap"
            >
              <IoIosLogOut />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
