import React, { useState, useRef, useEffect } from "react";
import SideNavbar from "../components/common/Sidebar/sideNavBar.tsx";
import TopNavbar from "../components/common/Header/Header.tsx";
import { Outlet, useLocation } from "react-router-dom";
import { getPageTitle } from "../utils/pageMetadata.ts";
import Notifications from "../components/common/Notification/Notifications.tsx";
import ProfilePanel from "../components/common/LeftSidebar/LeftPanel.tsx";
import Footer from "../components/common/Footer/footer.tsx";
import { NotificationsProvider } from "../hooks/useNotifications.tsx";

const LayoutContent = () => {
  const location = useLocation();
  const { pageTitle, info } = getPageTitle(location.pathname);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightPanel, setRightPanel] = useState<"notifications" | "profile" | null>(null);

  const rightPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rightPanel) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (rightPanelRef.current?.contains(target)) return;
      if (target.closest("[data-panel-ignore]")) return;

      setRightPanel(null);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [rightPanel]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <SideNavbar />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-full h-full bg-white dark:bg-[#1e1e1e]">
            <SideNavbar onClose={() => setMobileSidebarOpen(false)} isMobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          title={pageTitle}
          info={info}
          onMobileMenuClick={() => setMobileSidebarOpen(true)}
          onProfileClick={() => setRightPanel((p) => (p === "profile" ? null : "profile"))}
          onNotificationClick={() =>
            setRightPanel((p) => (p === "notifications" ? null : "notifications"))
          }
        />

        <main className="p-6 flex flex-col flex-1 overflow-y-auto bg-[#FAFAFA] dark:bg-[#1e1e1e]">
          <div className="flex-1">
            <Outlet />
          </div>

          <div className="mt-6 mb-[5px]">
            <Footer />
          </div>
        </main>
      </div>

      <div
        ref={rightPanelRef}
        className={`fixed right-0 top-0 h-full z-40 transition-transform duration-300 ease-in-out ${
          rightPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {rightPanel === "notifications" && (
          <Notifications onClose={() => setRightPanel(null)} />
        )}

        {rightPanel === "profile" && (
          <ProfilePanel onClose={() => setRightPanel(null)} />
        )}
      </div>
    </div>
  );
};

const MainLayout = () => {
  return (
    <NotificationsProvider>
      <LayoutContent />
    </NotificationsProvider>
  );
};

export default MainLayout;
