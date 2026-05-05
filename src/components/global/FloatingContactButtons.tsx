"use client";

import React from "react";
import { motion } from "motion/react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

const FloatingContactButtons = () => {
  const contactOptions = [
    {
      id: "whatsapp",
      icon: <FaWhatsapp className="text-2xl" />,
      href: "https://api.whatsapp.com/send?phone=918509299342",
      color: "bg-[#25D366]",
      label: "WhatsApp Us",
      shadow: "shadow-[0_0_20px_rgba(37,211,102,0.4)]",
    },
    {
      id: "call",
      icon: <FaPhoneAlt className="text-xl" />,
      href: "tel:+917001606510",
      color: "bg-[#007AFF]",
      label: "Call Now",
      shadow: "shadow-[0_0_20px_rgba(0,122,255,0.4)]",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4">
      {contactOptions.map((option, index) => (
        <motion.a
          key={option.id}
          href={option.href}
          target={option.id === "whatsapp" ? "_blank" : undefined}
          rel={option.id === "whatsapp" ? "noopener noreferrer" : undefined}
          initial={{ opacity: 0, x: 20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            delay: index * 0.1,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          whileHover={{ 
            scale: 1.1,
            y: -5,
          }}
          whileTap={{ scale: 0.9 }}
          className={`group relative flex h-14 w-14 items-center justify-center rounded-2xl text-white ${option.color} ${option.shadow} transition-all duration-300`}
        >
          {/* Ripple/Glow Effect */}
          <div className="absolute inset-0 -z-10 animate-ping rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100" />
          
          {option.icon}

          {/* Label Tooltip */}
          <span className="absolute right-full mr-4 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2">
            {option.label}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-zinc-900" />
          </span>
        </motion.a>
      ))}
    </div>
  );
};

export default FloatingContactButtons;
