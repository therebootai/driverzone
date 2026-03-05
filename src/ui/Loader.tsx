import { cn } from "@/utils/cn";

export default function Loader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin",
        className
      )}
    ></div>
  );
}
