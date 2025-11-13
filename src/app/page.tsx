import AboutDriverZone from "@/components/about/AboutDriverZone";
import WhyChoose from "@/components/about/WhyChoose";
import JoinDriverZone from "@/components/global/JoinDriverZone";
import HomeHero from "@/components/home/HomeHero";
import HomePackages from "@/components/home/HomePackages";
import HowItWorks from "@/components/home/HowItWorks";
import WebsiteTemplate from "@/templates/WebsiteTemplate";

export default function Home() {
  return (
    <WebsiteTemplate>
      <HomeHero />
      <div className="flex flex-col lg:gap-16 gap-8 lg:my-16 my-8 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4">
        <WhyChoose />
        <AboutDriverZone />
        <HomePackages />
      </div>
      <JoinDriverZone />
      <div className="flex flex-col lg:gap-16 gap-8 lg:my-16 my-8 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4">
        <HowItWorks />
      </div>
    </WebsiteTemplate>
  );
}
