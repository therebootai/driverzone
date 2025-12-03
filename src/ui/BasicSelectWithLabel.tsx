"use client";

import { cn } from "@/utils/cn";
import { SelectHTMLAttributes } from "react";

interface BasicSelectWithLabelProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  opts: { value: string; label: string }[];
}

export default function BasicSelectWithLabel({
  label,
  className,
  opts,
  ...props
}: BasicSelectWithLabelProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-site-black">{label}</label>
      <select
        className={cn(
          className,
          "px-3 py-2 rounded-md bg-custom-gray text-site-gray font-semibold text-sm flex justify-center items-center"
        )}
        {...props}
      >
        {opts.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
