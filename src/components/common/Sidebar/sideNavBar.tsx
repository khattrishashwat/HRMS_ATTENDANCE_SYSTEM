import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getImageClass, getSubItemClass, getItemClass } from "../../../utils/sideNavBarUtils.ts";
import { navItems } from "./sideNavItems.ts";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PermissionWrapper from "../../../permissions/PermissionWrapper.tsx";
import { RootState } from "../../../redux";
import { useSelector } from "react-redux";
import LuckPayLogo from "@/assets/svg/LuckPayLogo.svg";
import orgImage from "@/assets/svg/LuckPayLogo.svg";


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
            className="absolute top-4 right-4 z-50 bg-gray-300 dark:bg-gray-700 p-2 rounded-md"
          >
            ✕
          </button>
        )}

        {userType === "HOST_ADMIN" ? (
          <div className="flex h-[72px] shrink-0 items-center justify-center px-3">
            <img
              src={LuckPayLogo}
              alt="Logo"
              className={`object-contain transition-all duration-300 ${
                collapsed ? "h-10 w-10" : "h-12 w-auto"
              }`}
            />
          </div>
        ) : (
          <div className="flex h-[72px] shrink-0 items-center justify-center px-3">
            <img
              src={orgImage || LuckPayLogo}
              alt="Logo"
              className={`object-contain transition-all duration-300 ${
                collapsed ? "h-10 w-10" : "h-14 w-auto max-w-[140px]"
              }`}
            />
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
          {filteredNavItems.map((item) => (
            <div key={item.id || item.section} className="w-full">
              {item.path ? (
                item.alwaysVisible ? (
                  <div
                    onClick={() => item.children?.length && toggleSection(item.section)}
                    className={getItemClass(item.path, isActive)}
                  >
                    <Link 
                      to={item.path}
                      className="flex items-center gap-2 w-full min-w-0"
                    >
                      <img
                        src={`/assets/SideNavBar/${item.icon}.svg`}
                        alt={item.title}
                        className={`${getImageClass(item.path, isActive)} filter brightness-75 flex-shrink-0 w-4 h-4`}
                      />
                      {!collapsed && (
                        <span className="text-sm whitespace-nowrap">
                          {item.title}
                        </span>
                      )}
                    </Link>
                    {!collapsed && item.children?.length && (
                      <button
                        onClick={() => toggleSection(item.section)}
                        className="flex-shrink-0 ml-auto"
                      >
                        <img
                          src="/assets/SideNavBar/Arrow.svg"
                          className={`transition-transform w-3 h-3 ${
                            isOpen === item.section ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                ) : (
                  <PermissionWrapper permission={item.permission!}>
                    <div
                      onClick={() => item.children?.length && toggleSection(item.section)}
                      className={getItemClass(item.path, isActive)}
                    >
                      <Link 
                        to={item.path}
                        className="flex items-center gap-2 w-full min-w-0"
                      >
                        <img
                          src={`/assets/SideNavBar/${item.icon}.svg`}
                          alt={item.title}
                          className={`${getImageClass(item.path, isActive)} filter brightness-75 flex-shrink-0 w-4 h-4`}
                        />
                        {!collapsed && (
                          <span className="text-sm whitespace-nowrap">
                            {item.title}
                          </span>
                        )}
                      </Link>
                      {!collapsed && item.children?.length && (
                        <button
                          onClick={() => toggleSection(item.section)}
                          className="flex-shrink-0 ml-auto"
                        >
                          <img
                            src="/assets/SideNavBar/Arrow.svg"
                            className={`transition-transform w-3 h-3 ${
                              isOpen === item.section ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </PermissionWrapper>
                )
              ) : item.alwaysVisible ? (
                <>
                  <button
                    onClick={() => toggleSection(item.section)}
                    className={`${getItemClass()} flex w-full items-center justify-between group`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <img
                        src={`/assets/SideNavBar/${item.icon}.svg`}
                        alt={item.title}
                        className="h-4 w-4 max-h-4 max-w-4 shrink-0 filter brightness-75"
                      />
                      {!collapsed && (
                        <span className="truncate text-sm whitespace-nowrap">{item.title}</span>
                      )}
                    </div>

                    {!collapsed && (
                      <img
                        src="/assets/SideNavBar/Arrow.svg"
                        className={`ml-2 h-3 w-3 shrink-0 transition-transform duration-300 ${
                          isOpen === item.section ? "rotate-90" : ""
                        }`}
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
                        <div className="ml-4 mt-1 space-y-1 border-l border-[#E5E7EB] pl-2">
                          {item.children?.map(({ label, path, id }) => (
                            <Link
                              key={id}
                              to={path}
                              className={getSubItemClass(path, isActive)}
                            >
                              <span className="text-sm whitespace-nowrap">{label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <PermissionWrapper key={item.id} permission={item.permission!}>
                  <button
                    onClick={() => toggleSection(item.section)}
                    className={`${getItemClass()} flex w-full items-center justify-between group`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <img
                        src={`/assets/SideNavBar/${item.icon}.svg`}
                        alt={item.title}
                        className="h-4 w-4 max-h-4 max-w-4 shrink-0 filter brightness-75"
                      />
                      {!collapsed && (
                        <span className="truncate text-sm whitespace-nowrap">{item.title}</span>
                      )}
                    </div>

                    {!collapsed && (
                      <img
                        src="/assets/SideNavBar/Arrow.svg"
                        className={`ml-2 h-3 w-3 shrink-0 transition-transform duration-300 ${
                          isOpen === item.section ? "rotate-90" : ""
                        }`}
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
                        <div className="ml-4 mt-1 space-y-1 border-l border-[#E5E7EB] pl-2">
                          {item.children?.map(({ label, path, id }) => (
                            <PermissionWrapper key={id} permission={id}>
                              <Link to={path} className={getSubItemClass(path, isActive)}>
                                <span className="text-sm whitespace-nowrap">{label}</span>
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
          ))}
        </div>

        {!isMobile && (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
            className="absolute right-[-12px] top-[72px] z-30 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-primary text-white shadow-md transition hover:opacity-90"
          >
            {collapsed ? <FiChevronRight className="h-3.5 w-3.5" /> : <FiChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default SideNavBar;
