import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getSubItemClass, getItemClass } from "../../../utils/sideNavBarUtils.ts";
import { navItems } from "./sideNavItems.ts";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PermissionWrapper from "../../../permissions/PermissionWrapper.tsx";
import { RootState } from "../../../redux";
import { useSelector } from "react-redux";
import LuckPayLogo from "@/assets/svg/LuckPayLogo.svg";
import orgImage from "@/assets/svg/LuckPayLogo.svg";

// Import sidebar arrow icon
import ArrowSvg from "@/assets/svg/Arrow.svg";

// Auto-load all SVG icons from the sidebarImage directory
const sidebarIcons = import.meta.glob(
  "@/assets/sidebarImage/*.svg",
  {
    eager: true,
    import: "default",
  }
) as Record<string, string>;

/** Active fill matching screenshot lavender */
const ACTIVE_BG = "bg-[#E9C7FF]";
const ACTIVE_TEXT = "text-[#5B21B6]";
const IDLE_TEXT = "text-[#1F2937]";
const HOVER_BG = "hover:bg-[#F5F3FF]";

const SideNavBar = ({
  onClose,
  isMobile,
  collapsed: collapsedProp,
  onCollapsedChange,
}: {
  onClose?: () => void;
  isMobile?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp ?? internalCollapsed;
  const setCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(collapsed) : value;
    if (onCollapsedChange) onCollapsedChange(next);
    else setInternalCollapsed(next);
  };
  const location = useLocation();

  const userType = useSelector((state: RootState) => state.auth.userType);
  const subscribedServices = useSelector((state: RootState) => state.auth.subscribedServices);

  const isActive = (path: string) => {
    const current = location.pathname;
    return current === path || current.startsWith(path + "/");
  };

  const toggleSection = (section: string) => {
    setIsOpen(isOpen === section ? null : section);
  };

  const filteredNavItems = useMemo(() => {
    const isServiceAllowed = (item: any) => {
      if (item.alwaysVisible) return true;
      if (!item.serviceCode) return true;

      return subscribedServices?.some((s: any) => {
        if (typeof s === "string") return s === item.serviceCode;
        return s?.serviceCode === item.serviceCode;
      });
    };

    return navItems.filter((item) => isServiceAllowed(item));
  }, [subscribedServices]);

  // Helper function to render icon from SVG
  const renderIcon = (iconName: string, path: string) => {
    const iconPath = `/src/assets/sidebarImage/${iconName}.svg`;
    const iconSrc = sidebarIcons[iconPath];

    if (!iconSrc) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Sidebar icon not found: ${iconName}.svg`);
      }
      return null;
    }

    const active = isActive(path);
    
    return (
      <img
        src={iconSrc}
        alt={iconName}
        className={`h-5 w-5 shrink-0 object-contain ${
          active ? ACTIVE_TEXT : IDLE_TEXT
        }`}
      />
    );
  };

  // Helper to check if any child is active
  const isParentActive = (item: any) => {
    if (!item.children) return false;
    return item.children.some((child: any) => isActive(child.path));
  };

  return (
    <div className="relative h-full">
      <div
        onClick={() => collapsed && setCollapsed(false)}
        className={`relative z-10 flex h-full flex-col overflow-x-visible border-r border-[#E5E7EB] bg-white transition-all duration-300 ease-in-out ${
          isMobile ? "w-full" : collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6] text-sm text-[#374151]"
          >
            ✕
          </button>
        )}

        {userType === "HOST_ADMIN" ? (
          <div className="flex h-[72px] shrink-0 items-center justify-center px-4">
            <img
              src={LuckPayLogo}
              alt="Logo"
              className={`object-contain transition-all duration-300 ${
                collapsed ? "h-8 w-8" : "h-10 w-auto max-w-[160px]"
              }`}
            />
          </div>
        ) : (
          <div className="flex h-[72px] shrink-0 items-center justify-center px-4">
            <img
              src={orgImage || LuckPayLogo}
              alt="Logo"
              className={`object-contain transition-all duration-300 ${
                collapsed ? "h-8 w-8" : "h-10 w-auto max-w-[160px]"
              }`}
            />
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filteredNavItems.map((item) => {
            const isItemActive = isParentActive(item) || (item.path && isActive(item.path));
            
            return (
              <div key={item.id || item.section} className="w-full">
                {item.path ? (
                  item.alwaysVisible ? (
                    <div
                      onClick={() => item.children?.length && toggleSection(item.section)}
                      className={getItemClass(item.path, isActive, collapsed)}
                    >
                      <Link
                        to={item.path}
                        className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "w-full gap-3"}`}
                      >
                        {renderIcon(item.icon, item.path)}
                        {!collapsed && (
                          <span className="truncate text-[15px] font-medium whitespace-nowrap">
                            {item.title}
                          </span>
                        )}
                      </Link>
                      {!collapsed && item.children?.length && (
                        <button
                          onClick={() => toggleSection(item.section)}
                          className="ml-auto flex shrink-0 items-center justify-center"
                        >
                          <img
                            src={ArrowSvg}
                            className={`h-3 w-3 transition-transform duration-300 ${
                              isOpen === item.section ? "rotate-180" : ""
                            }`}
                            alt="Arrow"
                          />
                        </button>
                      )}
                    </div>
                  ) : (
                    <PermissionWrapper permission={item.permission!}>
                      <div
                        onClick={() => item.children?.length && toggleSection(item.section)}
                        className={getItemClass(item.path, isActive, collapsed)}
                      >
                        <Link
                          to={item.path}
                          className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "w-full gap-3"}`}
                        >
                          {renderIcon(item.icon, item.path)}
                          {!collapsed && (
                            <span className="truncate text-[15px] font-medium whitespace-nowrap">
                              {item.title}
                            </span>
                          )}
                        </Link>
                        {!collapsed && item.children?.length && (
                          <button
                            onClick={() => toggleSection(item.section)}
                            className="ml-auto flex shrink-0 items-center justify-center"
                          >
                            <img
                              src={ArrowSvg}
                              className={`h-3 w-3 transition-transform duration-300 ${
                                isOpen === item.section ? "rotate-180" : ""
                              }`}
                              alt="Arrow"
                            />
                          </button>
                        )}
                      </div>
                    </PermissionWrapper>
                  )
                ) : item.alwaysVisible ? (
                  <>
                    {!collapsed && (
                      <p className="mb-2 mt-4 px-3 text-sm font-medium text-[#9CA3AF] first:mt-1">
                        {item.section}
                      </p>
                    )}
                    <button
                      onClick={() => toggleSection(item.section)}
                      className={`${getItemClass(undefined, undefined, collapsed)} flex w-full`}
                    >
                      <div className={`flex min-w-0 items-center ${collapsed ? "" : "flex-1 gap-3"}`}>
                        {renderIcon(item.icon, item.path || "")}
                        {!collapsed && (
                          <span className="truncate text-[15px] font-medium whitespace-nowrap">
                            {item.title}
                          </span>
                        )}
                      </div>

                      {!collapsed && (
                        <img
                          src={ArrowSvg}
                          className={`ml-2 h-3 w-3 shrink-0 transition-transform duration-300 ${
                            isOpen === item.section ? "rotate-180" : ""
                          }`}
                          alt="Arrow"
                        />
                      )}
                    </button>

                    {!collapsed && (
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen === item.section
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-5 mt-1 space-y-1 border-l border-[#E5E7EB] pl-3">
                            {item.children?.map(({ label, path, id }) => (
                              <Link
                                key={id}
                                to={path}
                                className={getSubItemClass(path, isActive)}
                              >
                                <span className="whitespace-nowrap">{label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <PermissionWrapper key={item.id} permission={item.permission!}>
                    {!collapsed && (
                      <p className="mb-2 mt-4 px-3 text-sm font-medium text-[#9CA3AF] first:mt-1">
                        {item.section}
                      </p>
                    )}
                    <button
                      onClick={() => toggleSection(item.section)}
                      className={`${getItemClass(undefined, undefined, collapsed)} flex w-full`}
                    >
                      <div className={`flex min-w-0 items-center ${collapsed ? "" : "flex-1 gap-3"}`}>
                        {renderIcon(item.icon, item.path || "")}
                        {!collapsed && (
                          <span className="truncate text-[15px] font-medium whitespace-nowrap">
                            {item.title}
                          </span>
                        )}
                      </div>

                      {!collapsed && (
                        <img
                          src={ArrowSvg}
                          className={`ml-2 h-3 w-3 shrink-0 transition-transform duration-300 ${
                            isOpen === item.section ? "rotate-180" : ""
                          }`}
                          alt="Arrow"
                        />
                      )}
                    </button>

                    {!collapsed && (
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen === item.section
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-5 mt-1 space-y-1 border-l border-[#E5E7EB] pl-3">
                            {item.children?.map(({ label, path, id }) => (
                              <PermissionWrapper key={id} permission={id}>
                                <Link to={path} className={getSubItemClass(path, isActive)}>
                                  <span className="whitespace-nowrap">{label}</span>
                                </Link>
                              </PermissionWrapper>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </PermissionWrapper>
                )}
              </div>
            );
          })}
        </div>

        {!isMobile && (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
            className="absolute right-[-12px] top-[72px] z-[9999] flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-primary text-white shadow-sm transition hover:opacity-90"
          >
            {collapsed ? (
              <FiChevronRight className="h-3.5 w-3.5" />
            ) : (
              <FiChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SideNavBar;