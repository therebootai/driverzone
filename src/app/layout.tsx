import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Spline_Sans } from "next/font/google";

const pp_neue = localFont({
  src: [
    {
      path: "../assets/PP Neue Montreal Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/PP Neue Montreal Book.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../assets/PP Neue Montreal Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/PP Neue Montreal Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/PP Neue Montreal Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/PP Neue Montreal Semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/PP Neue Montreal Thin.ttf",
      weight: "200",
      style: "normal",
    },
  ],
  variable: "--font-ppneue",
});

const spline_sans = Spline_Sans({
  display: "swap",
  variable: "--font-spline-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your Journey, Elevated. Drive with Driver Zone.",
  description:
    "DriverZone is your trusted partner for professional Driver Hire in Siliguri and Car Driver Hire in Siliguri. We specialize in providing skilled, punctual, and verified drivers for local commutes, outstation trips, and long-distance journeys. Our mission is to make every ride safe, comfortable, and hassle-free, ensuring peace of mind for all our customers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pp_neue.variable} ${spline_sans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
