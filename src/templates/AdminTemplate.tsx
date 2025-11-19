import AdminHeader from "@/components/admin/AdminHeader";
import { cn } from "@/utils/cn";

export default function AdminTemplate({
  children,
  className,
}: {
  children: React.ReactElement;
  className?: string;
}) {
  return (
    <>
      <AdminHeader />
      <main className={cn(" px-8", className)}>{children}</main>
    </>
  );
}
