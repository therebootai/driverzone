import AuthForm from "@/components/auth/AuthForm";
import Image from "next/image";

export default function AuthPage() {
  return (
    <main className="relative bg-[url('/custom-bg/login-bg.png')] bg-center bg-cover min-h-svh w-full flex items-center justify-center font-spline-sans">
      <div className="absolute inset-0 size-full bg-black/50" />
      <div className="rounded-4xl backdrop-blur-xs xl:py-14 md:py-7 py-5 xl:px-28 md:px-14 px-10 flex flex-col gap-6 relative border border-white/50">
        <div className="flex flex-col items-center justify-center gap-5">
          <Image
            src="/logo-white.png"
            alt="logo"
            width={184}
            height={87}
            className="lg:w-44 w-24"
          />
          <h2 className="text-white font-semibold text-center xl:text-4xl md:text-3xl text-2xl">
            Welcome Back to Admin Panel
          </h2>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
