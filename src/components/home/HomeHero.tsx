import Image from "next/image";

export default function HomeHero() {
  return (
    <header className="rounded-b-[100px] bg-site-neongreen">
      <div className="xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4 py-5 flex justify-end pb-0">
        <div className="p-2.5 lg:p-5 !pb-0 bg-gradient-to-b from-site-green/50 to-site-neongreen/50 rounded-t-4xl mt-32 relative">
          <Image
            src="/assets/hero-img.png"
            alt="hero"
            width={1400}
            height={666}
            className="rounded-t-4xl"
            priority // Critical for LCP
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 1400px"
          />
          <div className="absolute top-0 left-0 size-full flex items-end justify-center bg-gradient-to-b from-white/0 to-white/80">
            <div className="font-bold xl:text-5xl md:text-4xl text-3xl text-center xl:my-14 md:my-7 my-3.5 text-site-black max-w-[30ch]">
              Your Journey, Elevated. Drive with&nbsp;
              <span className="text-site-green inline">Driver Zone.</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

