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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      <div className="hidden h-full md:block">
        <SideNavbar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-[min(100%,280px)] bg-white shadow-xl">
            <SideNavbar onClose={() => setMobileSidebarOpen(false)} isMobile />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar
          title={pageTitle}
          info={info}
          onMobileMenuClick={() => setMobileSidebarOpen(true)}
          onDesktopCollapseClick={() => setSidebarCollapsed((c) => !c)}
          onProfileClick={() => setRightPanel((p) => (p === "profile" ? null : "profile"))}
          onNotificationClick={() =>
            setRightPanel((p) => (p === "notifications" ? null : "notifications"))
          }
        />

        <main className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto bg-[#FAFAFA] p-4 sm:p-5 md:p-6">
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
          <div className="mt-6 shrink-0">
            <Footer />
          </div>
        </main>
      </div>

      <div
        ref={rightPanelRef}
        className={`fixed right-0 top-0 z-40 h-full transition-transform duration-300 ease-in-out ${
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
