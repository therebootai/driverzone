import SubBanner from "@/components/global/SubBanner";
import WebsiteTemplate from "@/templates/WebsiteTemplate";
import Link from "next/link";
import { PiPhoneFill, PiEnvelopeFill, PiMapPinFill } from "react-icons/pi";
import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <WebsiteTemplate>
      <SubBanner title="Contact Us" />

      {/* Get In Touch Header Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-site-black mb-4">
            Get In Touch
          </h1>
          <p className="text-site-gray text-base leading-relaxed">
            Have questions or need a reliable driver? Fill out our contact form,
            and our team will respond promptly. Whether it&apos;s for local
            travel, outstation trips, or special occasions, DriverZone ensures
            professional, verified drivers and seamless booking.
          </p>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className="pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Call Card */}
          <div className="bg-[#F8F8F8] rounded-3xl p-10 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
            <div className="w-20 h-20 bg-site-lime rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <PiPhoneFill className="text-site-black text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-site-black mb-3">Call Us</h3>
            <div className="flex flex-col gap-1">
              <Link
                href="tel:+918509299342"
                className="text-site-gray hover:text-site-black transition-colors"
              >
                +91 8509299342
              </Link>
              <Link
                href="tel:+917001606510"
                className="text-site-gray hover:text-site-black transition-colors"
              >
                +91 7001606510
              </Link>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-[#F8F8F8] rounded-3xl p-10 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
            <div className="w-20 h-20 bg-site-lime rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <PiEnvelopeFill className="text-site-black text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-site-black mb-3">Email Us</h3>
            <Link
              href="mailto:info@driverzoneonline.com"
              className="text-site-gray hover:text-site-black transition-colors"
            >
              info@driverzoneonline.com
            </Link>
          </div>

          {/* Location Card */}
          <div className="bg-[#F8F8F8] rounded-3xl p-10 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
            <div className="w-20 h-20 bg-site-lime rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <PiMapPinFill className="text-site-black text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-site-black mb-3">
              Visit Our Location
            </h3>
            <p className="text-site-gray">
              Kalibari, Shanti Nagar, Siliguri,
              <br />
              West Bengal - 734004
            </p>
          </div>
        </div>
      </section>

      {/* Form and Map Section */}
      <section className="pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Form Container */}
          <ContactForm />

          {/* Map Container */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg h-[400px] lg:h-auto min-h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d17060.85166929477!2d88.454268!3d26.6996682!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e4414c86dea3a9%3A0x7608cebd230b056a!2sDRIVER%20ZONE!5e1!3m2!1sen!2sin!4v1760462671759!5m2!1sen!2sin"
              className="absolute inset-0 w-full h-full border-none grayscale-[20%] contrast-[1.1]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </WebsiteTemplate>
  );
}
