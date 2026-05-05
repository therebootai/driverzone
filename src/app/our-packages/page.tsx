import { GET_PACKAGE_TYPES } from "@/actions/ourPackageAction";
import SubBanner from "@/components/global/SubBanner";
import HomePackages from "@/components/home/HomePackages";
import WebsiteTemplate from "@/templates/WebsiteTemplate";

export default async function OurPackagesPage() {
  const packages = await GET_PACKAGE_TYPES();

  return (
    <WebsiteTemplate>
      <SubBanner title="Our Packages & Pricing" />
      <div className="flex flex-col lg:gap-16 gap-8 lg:my-16 my-8 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4">
        <HomePackages 
          packages={packages} 
          showKnowMore={true} 
          titleMode="category" 
        />
      </div>
    </WebsiteTemplate>
  );
}
