import { cn } from "@/utils/cn";

interface BasicLabelFileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  children: React.ReactNode;
}

export default function BasicLabelFileInput({
  children,
  ...props
}: BasicLabelFileInputProps) {
  return (
    <div
      className={cn(
        props.className,
        "flex relative border border-site-stone bg-neutral-50 rounded"
      )}
    >
      <label
        htmlFor={props.id}
        className="p-4 cursor-pointer flex-1 text-base text-site-gray"
      >
        {children}
      </label>
      <input className="sr-only absolute" {...props} />
    </div>
  );
}
