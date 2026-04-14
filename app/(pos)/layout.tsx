import { PosSessionProvider } from "@/lib/context/PosSessionContext";
import { PosChrome } from "./PosChrome";

export default function PosGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PosSessionProvider>
      <div className="h-[100dvh] min-h-0 overflow-hidden text-foreground pos-saas-shell flex flex-col">
        <PosChrome>{children}</PosChrome>
      </div>
    </PosSessionProvider>
  );
}
