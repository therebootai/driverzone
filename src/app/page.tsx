import AboutDriverZone from "@/components/about/AboutDriverZone";
import WhyChoose from "@/components/about/WhyChoose";
import JoinDriverZone from "@/components/global/JoinDriverZone";
import HomeHero from "@/components/home/HomeHero";
import HomePackages from "@/components/home/HomePackages";
import HowItWorksCustomer from "@/components/home/HowItWorksCustomer";
import HowItWorks from "@/components/home/HowItWorks";
import NewsletterCTA from "@/components/home/NewsletterCTA";
import Testimonials from "@/components/home/Testimonials";
import WebsiteTemplate from "@/templates/WebsiteTemplate";
import { GET_HOME_PACKAGES } from "@/actions/ourPackageAction";

export default async function Home() {
  const packages = await GET_HOME_PACKAGES();

  return (
    <WebsiteTemplate>
      <HomeHero />
      <div className="flex flex-col lg:gap-16 gap-8 lg:my-16 my-8 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4">
        <WhyChoose />
        <HomePackages packages={packages} />
        <HowItWorksCustomer />
      </div>
      <JoinDriverZone />
      <div className="flex flex-col lg:gap-16 gap-8 lg:my-16 my-8 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4">
        <AboutDriverZone />
        <HowItWorks />
      </div>
      <NewsletterCTA />
      <Testimonials />
    </WebsiteTemplate>
  );
}
