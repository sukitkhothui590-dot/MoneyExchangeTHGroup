"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto admin-dashboard-bg">
        {/* Pass onMenuClick to children via a wrapper that clones the callback */}
        <div
          className="flex-1 flex flex-col min-w-0"
          data-sidebar-toggle=""
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest("[data-menu-toggle]")) {
              setSidebarOpen(true);
            }
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
