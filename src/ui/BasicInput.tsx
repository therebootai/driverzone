import { cn } from "@/utils/cn";

export default function BasicInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      className={cn(
        props.className,
        "p-4 border border-site-stone bg-neutral-50 rounded text-base placeholder:text-site-gray text-site-gray"
      )}
      {...props}
    />
  );
}
