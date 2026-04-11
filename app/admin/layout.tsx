import { AdminLanguageProvider } from "@/lib/admin/AdminLanguageProvider";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLanguageProvider>{children}</AdminLanguageProvider>;
}
