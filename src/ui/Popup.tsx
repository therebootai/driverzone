"use client";
import { IoClose } from "react-icons/io5";
import { AnimatePresence, motion } from "motion/react";
import useClickOutside from "@/hooks/useClickOutside";

export default function Popup({
  children,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  const modalRef = useClickOutside<HTMLDivElement>(() => onClose());

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.main
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[1000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            className="relative w-[95%] md:w-[60%] lg:w-[45%] xl:w-[40%] xxl:w-[30%] rounded-md shadow-custom-light"
          >
            <div className="absolute w-full h-full bg-cover bg-center rounded-md">
              <div className="absolute w-full h-full bg-site-primary/50 rounded-md" />
            </div>
            <div className="relative overflow-hidden">
              <button
                className="absolute top-0 right-0 bg-site-litegreen text-site-yellow p-2 rounded-md rounded-tl-none hover:bg-site-darkgreen transition-all text-sm lg:text-xl z-20"
                onClick={onClose}
              >
                <IoClose />
              </button>
              {children}
            </div>
          </motion.div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
