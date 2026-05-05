"use client";

import React, { useState } from "react";
import {
  LuCopy,
  LuChevronDown,
  LuClock,
  LuTicket,
  LuTag,
} from "react-icons/lu";
import { CouponFormState } from "@/types/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

dayjs.extend(relativeTime);

interface OffersContentProps {
  initialCoupons: CouponFormState[];
}

const OffersContent: React.FC<OffersContentProps> = ({ initialCoupons }) => {
  return (
    <div className="w-full py-6">
      {/* Grid */}
      {initialCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {initialCoupons.map((coupon) => (
            <CouponCard key={coupon.coupon_id} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-8 border border-zinc-100">
            <LuTicket className="w-12 h-12 text-zinc-200" />
          </div>
          <h3 className="text-2xl font-bold text-site-black mb-3">
            No active offers
          </h3>
          <p className="text-site-gray max-w-sm mx-auto">
            We couldn&apos;t find any offers matching your criteria. Try
            adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
};

const CouponCard = ({ coupon }: { coupon: CouponFormState }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const now = dayjs();
  const expiryDate = dayjs(coupon.coupon_ExpiryDate);
  const isExpiringSoon =
    expiryDate.diff(now, "day") <= 3 && expiryDate.isAfter(now);
  const isExpired = expiryDate.isBefore(now);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coupon.coupon_code);
    toast.success("Coupon code copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-[24px] border border-zinc-100 overflow-hidden hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-300 flex flex-col h-full shadow-sm mx-8 my-12"
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Header: Badge & Status */}
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-2 bg-site-lime text-site-black text-xs font-bold px-3 py-1.5 rounded-full">
            <LuTag className="w-4 h-4" />
            {coupon.coupon_type === "percentage"
              ? `${coupon.coupon_value}% OFF`
              : `₹${coupon.coupon_value} OFF`}
          </div>

          <div className="flex items-center gap-2">
            {isExpiringSoon && !isExpired && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold">
                <LuClock className="w-4 h-4" />
                Expiring in {expiryDate.diff(now, "day")}d
              </div>
            )}
            {!isExpiringSoon && !isExpired && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 bg-site-green rounded-full" />
                Active
              </div>
            )}
            {isExpired && (
              <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-bold uppercase tracking-wider line-through">
                Expired
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="">
          <h3 className="text-2xl font-bold text-site-black mb-2 leading-tight">
            {coupon.coupon_title}
          </h3>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            {coupon.coupon_type === "percentage"
              ? `Applicable on all bookings above ₹${coupon.minimum_booking_value || 0}.`
              : `Applicable on flat savings for your next premium ride booked for the weekend.`}
          </p>
        </div>

        {/* Code Section */}
        <div
          className="relative group cursor-pointer mt-auto"
          onClick={copyToClipboard}
        >
          <div className="w-full py-3.5 px-5 bg-[#f8f9fb] border border-dashed border-zinc-300 rounded-xl flex items-center justify-between group-hover:border-site-black transition-all duration-300">
            <span className="font-mono font-bold text-site-black tracking-wider text-base uppercase">
              {coupon.coupon_code}
            </span>
            <LuCopy className="w-5 h-5 text-zinc-400 group-hover:text-site-black transition-colors" />
          </div>
        </div>
      </div>

      {/* Accordion Footer */}
      <div className="bg-[#f0f2f5] border-t border-zinc-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-xs font-bold text-zinc-600 hover:text-site-black transition-all"
        >
          Terms & Conditions
          <LuChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180 text-site-black" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-white"
            >
              <div className="px-6 pb-6 pt-2 text-[11px] font-medium text-zinc-500 leading-relaxed space-y-2.5">
                <div className="flex gap-2">
                  <span className="text-zinc-300">•</span>
                  <span>
                    Valid until{" "}
                    {dayjs(coupon.coupon_ExpiryDate).format("DD MMM YYYY")}.
                  </span>
                </div>
                {coupon.minimum_booking_value && (
                  <div className="flex gap-2">
                    <span className="text-zinc-300">•</span>
                    <span>
                      Minimum booking value of ₹{coupon.minimum_booking_value}{" "}
                      required.
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-zinc-300">•</span>
                  <span>
                    Coupon code must be applied at the time of booking.
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OffersContent;
