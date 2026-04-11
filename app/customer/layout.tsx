/**
 * Customer area: auth pages + portal (profile, book). No site Header/Footer.
 */
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-surface-800">
      {children}
    </div>
  );
}
