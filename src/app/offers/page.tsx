import SubBanner from "@/components/global/SubBanner";
import WebsiteTemplate from "@/templates/WebsiteTemplate";
import OffersContent from "@/components/offers/OffersContent";
import { getAllCoupon } from "@/actions/couponActions";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const couponResponse = await getAllCoupon({ page: 1, limit: 100 });
  const coupons = couponResponse.success ? couponResponse.data : [];

  return (
    <WebsiteTemplate>
      <SubBanner title="Offers & Coupons" />
      <div className="lg:pt-20 pt-12 pb-16 xxl:max-w-8xl mx-auto xlg:max-w-7xl lg:max-w-7xl lg:px-6 px-4">
        {/* Header Section */}
        <div className="text-center mb-6 pb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-site-black mb-4 tracking-tight">
            Exclusive Driver Zone Offers & Coupon Codes
          </h1>
          <p className="text-zinc-500 text-xs lg:text-sm font-medium leading-relaxed max-w-4xl mx-auto">
            Experience premium chauffeur services at exceptional value. Unlock
            exclusive savings on your next luxury ride, corporate booking, or
            outstation journey.
          </p>
        </div>

        {/* Dynamic Content */}
        <OffersContent initialCoupons={coupons} />
      </div>
    </WebsiteTemplate>
  );
}
