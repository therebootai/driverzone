"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { FaUser, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import IdentityForm from "./IdentityForm";
import LocationForm from "./LocationForm";
import SchedulingForm from "./SchedulingForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createBooking } from "@/actions/bookingAction";

// Dynamically import map to avoid SSR issues
const BookingMap = dynamic(() => import("./BookingMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

interface BookingPageClientProps {
  initialPackage: any;
  allPackages: any[];
}

export default function BookingPageClient({ initialPackage, allPackages }: BookingPageClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Core State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    otpVerified: false,
    selectedPackage: initialPackage,
    pickup: null as { address: string; lat: number; lng: number } | null,
    drop: null as { address: string; lat: number; lng: number } | null,
    stop: null as { address: string; lat: number; lng: number } | null,
    date: new Date(),
    time: (() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      return now.toTimeString().slice(0, 5);
    })(),
    vehicleType: "Sedan",
    tripType: initialPackage?.package_type === "outstation" ? "round-trip" : "one-way",
    insurance: true,
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleBookingSubmit = async () => {
    if (!formData.pickup || !formData.drop) {
      toast.error("Please select pickup and drop locations");
      return;
    }

    setLoading(true);
    try {
      // Create a temporary customer or link to existing if we had auth
      // For this flow, we'll use the customerActions if needed, but bookingAction handles it with customerDetails ID
      // Wait, the bookingAction requires a customerDetails ID. I might need to create/get customer first.
      
      // Let's check customerActions to see how to handle "Quick Booking" users
      const { GET_OR_CREATE_CUSTOMER_BY_PHONE } = await import("@/actions/customerActions");
      const customerRes = await GET_OR_CREATE_CUSTOMER_BY_PHONE({
        name: formData.name,
        mobile_number: formData.phone
      });

      if (!customerRes.success || !customerRes.data) {
        throw new Error(customerRes.message || "Failed to identify customer");
      }

      const pkg = formData.selectedPackage;
      const duration = pkg?.duration || 0;
      const insuranceCharge = formData.insurance ? 20 : 0;

      let discountAmount = 0;
      if (pkg?.discount_type === "percentage" && pkg?.discount) {
        const basePrice = (pkg.company_charge || 0) + (pkg.driver_charge || 0) + (pkg.fooding_charge || 0);
        discountAmount = (basePrice * pkg.discount) / 100;
      } else if (pkg?.discount_type === "fixed" && pkg?.discount) {
        discountAmount = pkg.discount;
      }

      const foodingCharge = duration > 3 ? (pkg?.fooding_charge || 0) : 0;

      const bookingPayload = {
        customerDetails: customerRes.data._id,
        pickupAddress: formData.pickup.address,
        pickupLat: formData.pickup.lat,
        pickupLng: formData.pickup.lng,
        dropAddress: formData.drop.address,
        dropLat: formData.drop.lat,
        dropLng: formData.drop.lng,
        stopAddress: formData.stop?.address,
        stopLat: formData.stop?.lat,
        stopLng: formData.stop?.lng,
        tripType: formData.tripType,
        package_type: pkg?._id,
        schedule_date: formData.date,
        schedule_time: formData.time,
        vehicleType: formData.vehicleType,
        status: "pending",
        paymentMethod: "cash",
        paymentStatus: "pending",
        company_charge: pkg?.company_charge || 0,
        driver_charge: pkg?.driver_charge || 0,
        fooding_charge: foodingCharge,
        insurance: formData.insurance,
        insurance_charge: insuranceCharge,
        discount: discountAmount,
        duration: String(duration),
      };

      const result = await createBooking(bookingPayload);
      
      toast.success("Booking placed successfully!");
      router.push(`/booking/status/${result._id}`);
    } catch (error: any) {
      console.error("Booking failed:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Identity", icon: <FaUser /> },
    { id: 2, name: "Journey", icon: <FaMapMarkerAlt /> },
    { id: 3, name: "Finalize", icon: <FaCalendarAlt /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-[450px] xl:w-[500px] h-full overflow-y-auto bg-white border-r border-gray-100 flex flex-col z-10 shadow-xl">
        <div className="p-6 md:p-8 flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-site-black tracking-tight">Book Your Ride</h1>
            <p className="text-site-gray text-sm">Fill in the details to hire your professional driver.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            {steps.map((s) => (
              <div 
                key={s.id} 
                className={`relative z-10 flex flex-col items-center gap-2 ${step >= s.id ? 'text-site-black' : 'text-gray-300'}`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    step === s.id ? 'bg-site-black text-white border-site-black scale-110 shadow-lg' : 
                    step > s.id ? 'bg-site-green text-white border-site-green' : 'bg-white border-gray-200'
                  }`}
                >
                  {step > s.id ? <FaCheckCircle /> : s.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{s.name}</span>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <IdentityForm 
                    data={formData} 
                    onNext={() => setStep(2)} 
                    updateData={updateFormData} 
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <LocationForm 
                    data={formData} 
                    onNext={() => setStep(3)} 
                    onBack={() => setStep(1)}
                    updateData={updateFormData} 
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <SchedulingForm 
                    data={formData} 
                    allPackages={allPackages}
                    onSubmit={handleBookingSubmit}
                    onBack={() => setStep(2)}
                    updateData={updateFormData}
                    loading={loading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-auto p-8 border-t border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-4 text-xs text-site-gray">
            <span className="flex items-center gap-1"><FaCheckCircle className="text-site-green" /> Verified Drivers</span>
            <span className="flex items-center gap-1"><FaCheckCircle className="text-site-green" /> 24/7 Support</span>
            <span className="flex items-center gap-1"><FaCheckCircle className="text-site-green" /> Safe Journey</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Map */}
      <div className="hidden lg:block flex-1 h-full bg-gray-50">
        <BookingMap 
          pickup={formData.pickup ? { lat: formData.pickup.lat, lng: formData.pickup.lng } : undefined}
          drop={formData.drop ? { lat: formData.drop.lat, lng: formData.drop.lng } : undefined}
          stop={formData.stop ? { lat: formData.stop.lat, lng: formData.stop.lng } : undefined}
          tripType={formData.tripType as "one-way" | "round-trip"}
        />
      </div>

      {/* Mobile Map Peek */}
      <div className="lg:hidden absolute top-0 left-0 w-full h-40 z-0">
        <BookingMap 
          pickup={formData.pickup ? { lat: formData.pickup.lat, lng: formData.pickup.lng } : undefined}
          drop={formData.drop ? { lat: formData.drop.lat, lng: formData.drop.lng } : undefined}
          stop={formData.stop ? { lat: formData.stop.lat, lng: formData.stop.lng } : undefined}
          tripType={formData.tripType as "one-way" | "round-trip"}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </div>
    </div>
  );
}
