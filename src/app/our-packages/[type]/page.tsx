import { GET_PACKAGES_BY_TYPE } from "@/actions/ourPackageAction";
import SubBanner from "@/components/global/SubBanner";
import HomePackages from "@/components/home/HomePackages";
import WebsiteTemplate from "@/templates/WebsiteTemplate";
import { notFound } from "next/navigation";

const typeToTitle: Record<string, string> = {
  in_city: "In-City Packages",
  mini_outstation: "Mini Outstation Packages",
  outstation: "Outstation Packages",
  hills_tour: "Hills Tour Packages",
  long_tour: "Long Tour Packages",
  drop_pickup_service: "Drop & Pickup Packages",
};

export default async function PackageTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const title = typeToTitle[type];

  if (!title) {
    return notFound();
  }

  const packages = await GET_PACKAGES_BY_TYPE(type);

  return (
    <WebsiteTemplate>
      <SubBanner title={title} />
      <div className="flex flex-col lg:gap-16 gap-8 lg:my-16 my-8 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-4xl lg:px-0 px-4">
        <HomePackages 
          packages={packages} 
          showKnowMore={false} 
          titleMode="name" 
          title={title}
        />
      </div>
    </WebsiteTemplate>
  );
}
