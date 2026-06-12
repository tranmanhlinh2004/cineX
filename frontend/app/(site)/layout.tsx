import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
