import Image from "next/image";

export default function SubBanner({ title }: { title: string }) {
  return (
    <header className="bg-linear-180 from-white to-site-neongreen">
      <div className="xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4 py-5 flex justify-end pb-0">
        <div className="p-2.5 lg:p-5 !pb-0 bg-gradient-to-b from-site-green/50 to-site-neongreen/50 rounded-t-4xl mt-32 relative">
          <Image
            src="/assets/hero-img.png"
            alt="hero"
            width={1400}
            height={666}
            className="rounded-t-4xl max-h-[40vmin] object-cover"
          />
          <div className="absolute top-0 left-0 size-full flex items-center justify-center bg-gradient-to-b from-white/50 to-white">
            <div className="font-bold xl:text-5xl md:text-4xl text-3xl text-center text-site-black max-w-[30ch]">
              {title}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
