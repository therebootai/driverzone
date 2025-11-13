import Image from "next/image";

export default function JoinDriverZone() {
  return (
    <div className="rounded-t-[100px] bg-linear-0 from-white/0 to-site-neongreen">
      <div className="relative xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4 py-5 flex items-center justify-between flex-col lg:flex-row">
        <div className="flex flex-col gap-7">
          <h2 className="text-site-black font-semibold lg:text-4xl text-3xl">
            Join Driver Zone
          </h2>
          <h1 className="text-site-black lg:text-6xl text-4xl">Get the App</h1>
          <p className="text-site-black lg">
            Download the DriverZone app from the Play Store or App Store and
            experience seamless Driver Hire in Siliguri at your fingertips. Book
            professional, verified drivers anytime, anywhere, for local
            commutes, outstation trips, or special occasions. Enjoy real-time
            tracking, transparent pricing, and instant confirmations. With
            DriverZone, hiring a car driver in Siliguri is now easier, faster,
            and more reliable than ever before.
          </p>
          <Image
            src="/assets/google-play-badge.png"
            alt="playstore"
            width={293}
            height={86}
          />
        </div>
        <div className="shrink-0">
          <Image
            src="/assets/app-mockup.png"
            alt="mockup"
            width={376}
            height={642}
          />
        </div>
      </div>
    </div>
  );
}
