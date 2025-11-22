import { AuthProvider } from "@/context/AuthContext";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  if (!cookieStore.has("token")) {
    return redirect("/");
  }

  return <AuthProvider>{children}</AuthProvider>;
}
