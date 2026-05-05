import AboutDriverZone from "@/components/about/AboutDriverZone";
import MissionVision from "@/components/about/MissionVision";
import SubBanner from "@/components/global/SubBanner";
import WebsiteTemplate from "@/templates/WebsiteTemplate";

export default function AboutPage() {
  return (
    <WebsiteTemplate>
      <SubBanner title="About Us" />
      <div className="flex flex-col lg:gap-16 gap-8 lg:my-16 my-8 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4">
        <AboutDriverZone />
        <MissionVision />
      </div>
    </WebsiteTemplate>
  );
}
