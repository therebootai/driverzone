"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  IoHeadset,
  IoPersonOutline,
  IoLogoWhatsapp,
  IoDocumentTextOutline,
  IoLocationOutline,
  IoPencilOutline,
  IoChevronDown,
  IoPaperPlane,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    complaintType: "",
    subject: "",
    location: "",
    message: "",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { name, mobile, complaintType, subject, location, message } =
      formData;

    const whatsappMessage = `*New Complaint/Service Issue Request*\n\n*Name:* ${name}\n*Mobile:* ${mobile}\n*Type:* ${complaintType}\n*Subject:* ${subject}\n*Location:* ${location}\n*Description:* ${message || "N/A"}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);

    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches;
    const whatsappUrl = isDesktop
      ? `https://web.whatsapp.com/send?phone=918509299342&text=${encodedMessage}`
      : `https://api.whatsapp.com/send?phone=918509299342&text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    // Reset form after sending
    setFormData({
      name: "",
      mobile: "",
      complaintType: "",
      subject: "",
      location: "",
      message: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 md:p-10">
      {/* Header */}
      <div className="flex items-start gap-5 mb-10">
        <div className="flex-shrink-0 w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center">
          <IoHeadset className="text-[#2E7D32] text-3xl" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#1A2338] mb-2 leading-tight">
            Report a Complaint or Service Issue
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl">
            Facing any issue with your booking, driver behavior, payment, route,
            or overall experience? Please share the details below and our
            support team will review it promptly.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Full Name & Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A2338] ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2E7D32] transition-colors">
                <IoPersonOutline className="text-xl" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-sm focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#4CAF50] transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A2338] ml-1">
              Phone Number (WhatsApp)
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2E7D32] transition-colors">
                <IoLogoWhatsapp className="text-xl" />
              </div>
              <input
                type="text"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-sm focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#4CAF50] transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Complaint Type & Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A2338] ml-1">
              Complaint Type
            </label>
            <div className="relative">
              <select
                name="complaintType"
                required
                value={formData.complaintType}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#4CAF50] transition-all outline-none appearance-none"
              >
                <option value="">Select an option</option>
                <option value="Booking Issue">Booking Issue</option>
                <option value="Driver Behavior">Driver Behavior</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Route Issue">Route Issue</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <IoChevronDown />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A2338] ml-1">
              Subject
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2E7D32] transition-colors">
                <IoDocumentTextOutline className="text-xl" />
              </div>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter subject of your complaint"
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-sm focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#4CAF50] transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Incident Location */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#1A2338] ml-1">
            Incident Location
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2E7D32] transition-colors">
              <IoLocationOutline className="text-xl" />
            </div>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter the location where the issue occurred"
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-sm focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#4CAF50] transition-all outline-none"
            />
          </div>
        </div>

        {/* Row 4: Detailed Message */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#1A2338] ml-1">
            Detailed Message / Complaint Description
          </label>
          <div className="relative group">
            <div className="absolute top-4 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2E7D32] transition-colors">
              <IoPencilOutline className="text-xl" />
            </div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Please describe the issue in detail..."
              rows={4}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-sm focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#4CAF50] transition-all outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {/* Footer: Button & Disclaimer */}
        <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
          <button
            type="submit"
            className="w-full md:w-auto bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <IoPaperPlane className="text-lg" />
            Submit Complaint
          </button>
          <div className="flex items-center gap-3 text-gray-500 max-w-sm">
            <IoCheckmarkCircleOutline className="text-2xl text-[#4CAF50] flex-shrink-0" />
            <p className="text-xs leading-relaxed">
              Our grievance support team reviews all complaints and typically
              responds within 12-24 hours.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
