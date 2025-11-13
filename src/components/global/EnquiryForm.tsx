"use client";

import { useActionState, useState } from "react";
import DatePicker from "react-datepicker";

export default function EnquiryForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSubmit = (prevState: object, formData: FormData) => {
    const name = formData.get("name");
    const mobile = formData.get("mobile");
    const packages = formData.get("package");
    const pickup_location = formData.get("pickup_location");
    const drop_location = formData.get("drop_location");
    const message = formData.get("message");

    const whatsappMessage = `Name: ${name}\nMobile: ${mobile}}\nPackage: ${packages}\nPickup Location: ${pickup_location}\nDrop Location: ${drop_location}\nDate: ${selectedDate}\nMessage: ${message}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const whatsappUrl = isDesktop
      ? `https://web.whatsapp.com/send?phone=918509299342&text=${encodedMessage}`
      : `https://api.whatsapp.com/send?phone=918509299342&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    return { ...prevState };
  };

  const [, formAction, isPending] = useActionState(handleSubmit, {});

  return (
    <form
      action={formAction}
      className="grid lg:grid-cols-2 grid-cols-1 gap-8 place-items-stretch justify-items-stretch"
    >
      <input
        type="text"
        name="name"
        required
        placeholder="Enter your name"
        className="lg:text-base text-sm text-site-black placeholder:text-site-black px-3 lg:px-5 lg:py-6 py-4 bg-white rounded-full"
      />
      <input
        type="text"
        name="mobile"
        required
        placeholder="Enter your Mobile Number"
        maxLength={10}
        pattern="[0-9]{10}"
        className="lg:text-base text-sm text-site-black placeholder:text-site-black px-3 lg:px-5 lg:py-6 py-4 bg-white rounded-full"
      />
      <div className="lg:text-base text-sm text-site-black placeholder:text-site-black px-3 lg:px-5 lg:py-6 py-4 bg-white rounded-full">
        <select className="flex-1 w-full" name="package">
          <option value="">Select Packge</option>
          <option value="city tours">City Tours</option>
          <option value="out of city tours">Out of City Tours</option>
          <option value="special tours">Special Tours</option>
        </select>
      </div>
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        className="flex-1 w-full"
        placeholderText="Enter Pickup Date"
        dateFormat="dd/MM/yyyy"
        customInput={
          <input
            type="text"
            placeholder="Enter Pickup Date"
            className="lg:text-base text-sm text-site-black placeholder:text-site-black px-3 lg:px-5 lg:py-6 py-4 bg-white rounded-full"
          />
        }
      />

      <input
        type="text"
        name="pickup_location"
        placeholder="Enter Pickup Location"
        className="lg:text-base text-sm text-site-black placeholder:text-site-black px-3 lg:px-5 lg:py-6 py-4 bg-white rounded-full"
      />
      <input
        type="text"
        name="drop_location"
        placeholder="Enter Drop Location"
        className="lg:text-base text-sm text-site-black placeholder:text-site-black px-3 lg:px-5 lg:py-6 py-4 bg-white rounded-full"
      />
      <input
        type="text"
        name="message"
        placeholder="Enter Message"
        className="lg:text-base text-sm text-site-black placeholder:text-site-black px-3 lg:px-5 lg:py-6 py-4 bg-white rounded-full"
      />
      <button
        type="submit"
        className="text-white lg:text-base text-sm py-3 bg-linear-90 from-site-black to-site-darkyellow rounded-full"
      >
        {isPending ? "Submitting..." : "Get Estimate"}
      </button>
    </form>
  );
}
