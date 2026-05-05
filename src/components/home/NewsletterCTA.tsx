import Image from "next/image";
import { FiPhone } from "react-icons/fi";

export default function NewsletterCTA() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Container */}
      <div className="relative w-full aspect-[21/9] lg:aspect-[3.5/1] min-h-[350px] lg:min-h-[500px]">
        <Image
          src="/assets/newsletter-bg.png"
          alt="Newsletter Background"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-[5]"
          style={{
            background:
              "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.456) 52.4%, rgba(0, 0, 0, 0.76) 100%)",
          }}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-end px-6 lg:px-32">
          <div className="max-w-3xl text-right flex flex-col items-end gap-3 lg:gap-5">
            <h2 className="text-white font-bold text-2xl md:text-4xl lg:text-5xl xxl:text-6xl leading-[1.1] drop-shadow-xl">
              Your Ride, Your Time — <br className="hidden md:block" />
              Book Trusted Cabs Instantly
            </h2>
            <p className="text-white text-sm md:text-base lg:text-lg xxl:text-xl opacity-95 drop-shadow-lg max-w-xl">
              Affordable city rides, outstation trips & professional cab service
              across North Bengal with Driver Zone.
            </p>

            <div className="mt-4 flex items-center bg-site-lime p-1.5 lg:p-2 rounded-full w-full max-w-lg shadow-2xl transition-transform hover:scale-[1.02] duration-300">
              <div className="flex items-center gap-2 lg:gap-4 px-4 flex-grow text-site-black min-w-0">
                <div className="bg-white/20 p-2 rounded-full hidden sm:flex items-center justify-center">
                  <FiPhone className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your mobile number"
                  className="bg-transparent border-none outline-none placeholder:text-site-black/60 w-full text-site-black font-semibold text-xs md:text-sm lg:text-base min-w-0"
                />
              </div>
              <button className="bg-white text-site-black px-5 md:px-8 lg:px-10 py-3 lg:py-4 rounded-full font-bold hover:bg-zinc-100 transition-all text-xs md:text-sm lg:text-base whitespace-nowrap shadow-md active:scale-95">
                Book a Cab Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
