"use client";

import { LOGIN } from "@/actions/userActions";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import toast from "react-hot-toast";
import { FaFacebook } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io";
import { IoLogoLinkedin } from "react-icons/io5";

export default function AuthForm() {
  const { login } = useAuth();

  const router = useRouter();

  async function handleLogin(prevState: any, formData: FormData) {
    const emailOrPhone = formData.get("emailOrPhone") as string;
    const password = formData.get("password") as string;
    try {
      const { success, message, data } = await LOGIN({
        emailOrPhone,
        password,
      });
      if (!success) {
        alert(message);
        return;
      }
      login(data);
      router.push("/admin/dashboard");
      return prevState;
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast.error(error.message || "Unknown error");
      return { ...prevState, emailOrPhone: emailOrPhone };
    }
  }

  const [state, formAction, isPending] = useActionState(handleLogin, {});

  return (
    <>
      <form action={formAction} className="flex flex-col gap-5">
        <AuthFormInput
          placeholder="Enter your mobile or email address"
          name="emailOrPhone"
        />
        <AuthFormInput
          placeholder="Enter your password"
          type="password"
          name="password"
        />
        <AuthFormButton
          type="submit"
          className="bg-linear-90 from-site-saffron to-site-skin text-site-black mt-5"
        >
          Login
        </AuthFormButton>
      </form>

      <span className="text-center text-white text-base">OR</span>

      <div className="flex flex-col gap-5">
        <AuthFormButton
          type="button"
          className="text-white border border-white"
        >
          Login via WhatsApp
        </AuthFormButton>
        <AuthFormButton
          type="button"
          className="text-white border border-white"
        >
          Login via Mobile
        </AuthFormButton>
      </div>

      <div className="flex flex-col">
        <span className="text-white text-base text-center">
          Support Helpline{" "}
          <Link className="inline" href="tel:+919088576170">
            +91 9088576170
          </Link>
        </span>
        <span className="text-white text-base text-center">
          Monday to Saturday 11:00 am - 6:00 pm
        </span>
      </div>

      <div className="flex gap-5 items-center justify-center">
        <span className="text-white text-base">Follow Us</span>
        <div className="flex text-2xl gap-3">
          {[
            {
              icon: <FaFacebook />,
              href: "#",
            },
            {
              icon: <IoLogoInstagram />,
              href: "#",
            },
            {
              icon: <IoLogoLinkedin />,
              href: "#",
            },
          ].map((item, index) => (
            <Link href={item.href} key={index} className="text-site-skin">
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function AuthFormInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "bg-white/5 backdrop-blur-xs px-4 py-5 text-base text-white placeholder:text-white rounded-lg",
        className,
      )}
      {...props}
    />
  );
}

function AuthFormButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-lg px-5 py-4 font-semibold text-center text-base",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
