import Image from "next/image";

export default function SubBanner({ title }: { title: string }) {
  return (
    <section className="relative w-full h-[250px] lg:h-[400px] flex items-center justify-center overflow-hidden rounded-b-[50px] lg:rounded-b-[150px] shadow-2xl">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/home-hero/home-hero-carousel-2.png"
          alt="Banner Background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 pt-14 lg:pt-20">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
          {title}
        </h1>
      </div>
    </section>
  );
}
