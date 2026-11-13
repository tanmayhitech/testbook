import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { TopNavbar } from "../components/navbar/TopNavbar.js";
import { AppSidebar } from "../components/sidebar/AppSidebar.js";

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen h-[100dvh] bg-[#07090e] flex flex-col font-sans overflow-hidden">
      <TopNavbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#07090e] scrollbar-thin">
          <div className="max-w-7xl mx-auto animate-page-enter pb-16">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
