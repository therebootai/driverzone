import EnquiryForm from "@/components/global/EnquiryForm";
import SubBanner from "@/components/global/SubBanner";
import WebsiteTemplate from "@/templates/WebsiteTemplate";
import Link from "next/link";
import { FaPhoneVolume } from "react-icons/fa6";
import { IoMailSharp } from "react-icons/io5";
import { MdPinDrop } from "react-icons/md";

export default function ContactPage() {
  return (
    <WebsiteTemplate>
      <SubBanner title="Contact Us" />
      <div className="flex flex-col lg:gap-16 gap-8 lg:my-16 my-8 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4">
        <h2 className="text-center text-site-black xl:text-4xl md:text-3xl text-2xl font-semibold">
          Get In Touch With <span className="text-site-green">DriverZone</span>{" "}
          Today
        </h2>
        <p className="lg:text-base text-sm text-site-gray text-center">
          Have questions or need a reliable driver? Fill out our contact form,
          and our team will respond promptly. Whether it&apos;s for local
          travel, outstation trips, or special occasions, <b>DriverZone</b>{" "}
          ensures professional, verified drivers and seamless booking. Share
          your details, requirements, and preferred schedule, and we&apos;ll
          handle the rest. Experience hassle-free Driver Hire in Siliguri and
          Car Driver Hire in Siliguri with prompt support and dedicated customer
          service.
        </p>
      </div>
      <div className="relative xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4 -bottom-[4rem] z-10">
        <div className="bg-neutral-100 xl:px-20 md:px-10 px-5 xl:py-14 md:py-7 py-4 flex flex-col gap-8 rounded-3xl">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="flex gap-3.5">
              <span className="bg-site-neongreen text-site-black text-lg p-3.5 rounded">
                <FaPhoneVolume />
              </span>
              <div className="flex flex-col justify-between text-site-black lg:text-base text-sm">
                <h3>Need any help?</h3>
                <Link href="tel:+918509299342" className="font-semibold">
                  +91 8509299342
                </Link>
              </div>
            </div>
            <div className="flex gap-3.5">
              <span className="bg-site-neongreen text-site-black text-lg p-3.5 rounded">
                <IoMailSharp />
              </span>
              <div className="flex flex-col justify-between text-site-black lg:text-base text-sm">
                <h3>Email Us</h3>
                <Link
                  href="mailto:info@driverzoneonline.com"
                  className="font-semibold"
                >
                  info@driverzoneonline.com
                </Link>
              </div>
            </div>
            <div className="flex gap-3.5">
              <span className="bg-site-neongreen text-site-black text-lg p-3.5 rounded">
                <MdPinDrop />
              </span>
              <div className="flex flex-col justify-between text-site-black lg:text-base text-sm">
                <h3>Location</h3>
                <Link
                  href="https://maps.app.goo.gl/JwLyxzWAbMGfZ8tJ8"
                  target="_blank"
                  className="font-semibold"
                >
                  125 Street, Cooch Behar, West Bengal, India
                </Link>
              </div>
            </div>
          </div>
          <EnquiryForm />
        </div>
      </div>
      <div className="relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d17060.85166929477!2d88.454268!3d26.6996682!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e4414c86dea3a9%3A0x7608cebd230b056a!2sDRIVER%20ZONE!5e1!3m2!1sen!2sin!4v1760462671759!5m2!1sen!2sin"
          className="w-full lg:h-[47rem] h-96"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </WebsiteTemplate>
  );
}
