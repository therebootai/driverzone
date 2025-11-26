import AdminHeader from "@/components/admin/AdminHeader";
import { cn } from "@/utils/cn";
import { JSX } from "react";

export default function AdminTemplate({
  children,
  className,
}: {
  children:
    | React.ReactElement
    | React.ReactElement[]
    | JSX.Element
    | JSX.Element[];
  className?: string;
}) {
  return (
    <>
      <AdminHeader />
      <main className={cn("px-8", className)}>{children}</main>
    </>
  );
}
