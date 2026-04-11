import { Suspense } from "react";
import KycSessionClient from "./KycSessionClient";

export default function PosKycSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-muted">กำลังโหลด...</div>
      }
    >
      <KycSessionClient />
    </Suspense>
  );
}
