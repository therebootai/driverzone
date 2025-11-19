import useClickOutside from "@/hooks/useClickOutside";
import { AiOutlineCloseCircle } from "react-icons/ai";

const SidePopup = ({
  children,
  handleClose,
  showPopUp,
  clsprops,
}: {
  children: React.ReactNode;
  handleClose: () => void;
  showPopUp: boolean;
  clsprops?: string;
}) => {
  const popUpRef = useClickOutside<HTMLDivElement>(handleClose);

  return (
    <div
      className={`fixed top-0 right-0 h-screen ${clsprops} w-[60%] z-[1000] overflow-hidden overflow-y-scroll no-scrollbar bg-[#EDF4F7] shadow-lg transform transition-transform duration-300 ease-in-out ${
        showPopUp ? "translate-x-0" : "translate-x-full"
      }`}
      ref={popUpRef}
    >
      <div className="flex justify-end p-4 text-site-black">
        <button onClick={handleClose}>
          <AiOutlineCloseCircle size={24} className="text-xl font-bold" />
        </button>
      </div>
      <div className="max-h-[90vh]">{children}</div>
    </div>
  );
};

export default SidePopup;
