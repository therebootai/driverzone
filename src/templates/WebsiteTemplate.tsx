import Footer from "@/components/global/Footer";
import NavBar from "@/components/global/NavBar";

export default function WebsiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
