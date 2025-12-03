import { cn } from "@/utils/cn";
import { InputHTMLAttributes } from "react";

interface BasicInputWithLabelProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function BasicInput({
  label,
  ...props
}: BasicInputWithLabelProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-site-black">{label}</label>
      <input
        className={cn(
          props.className,
          "px-3 py-2 border border-site-stone bg-neutral-50 rounded-md text-base placeholder:text-site-gray text-site-gray"
        )}
        {...props}
      />
    </div>
  );
}
