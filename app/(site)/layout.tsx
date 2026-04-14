import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/pdpa/CookieConsent";
import { SiteScrollbarHidden } from "./SiteScrollbarHidden";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteScrollbarHidden />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 min-w-0 overflow-x-clip">{children}</main>
        <Footer />
        <CookieConsent />
      </div>
    </>
  );
}
