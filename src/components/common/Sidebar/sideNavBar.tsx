import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { useSelector } from "react-redux";
import { getImageClass,getItemClass,getSubItemClass } from "../../../utils/sideNavBarUtils.ts";
import { navItems, type NavItem } from "./sideNavItems.ts";
import PermissionWrapper from "../../../permissions/PermissionWrapper.tsx";
import { RootState } from "../../../redux";
import LuckPayLogo from "@/assets/svg/LuckPayLogo.svg";
import LogoShort from "@/assets/svg/LogoShort.svg";
import UserManagementIcon from "@/assets/svg/UserManagement.svg";
import OrganizationSelector from "../OrganizationSelector/OrganizationSelector.tsx";

const sidebarIcons = import.meta.glob("@/assets/sidebarImage/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

/** Extra fallbacks when an icon lives outside sidebarImage/ */
const ICON_FALLBACKS: Record<string, string> = {
  UserManagement: UserManagementIcon,
  Announcement: sidebarIcons[
    Object.keys(sidebarIcons).find((k) => k.endsWith("/Annoucement.svg")) ?? ""
  ],
};

function resolveSidebarIcon(iconName: string): string | undefined {
  const aliases: Record<string, string> = {
    Announcement: "Annoucement",
  };
  const fileName = aliases[iconName] ?? iconName;

  const match = Object.entries(sidebarIcons).find(([path]) =>
    path.endsWith(`/${fileName}.svg`)
  );
  if (match) return match[1];

  return ICON_FALLBACKS[iconName] ?? ICON_FALLBACKS[fileName];
}

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
  const subscribedServices = useSelector(
    (state: RootState) => state.auth.subscribedServices
  );

  const isActive = (path: string) => {
    if (!path) return false;
    const current = location.pathname;
    return current === path || current.startsWith(path + "/");
  };

  const isParentActive = (item: NavItem) =>
    !!item.children?.some((child) => isActive(child.path));

  /** Expand/collapse by unique item.id — never by section */
  const toggleSection = (id: string) => {
    setIsOpen((prev) => (prev === id ? null : id));
  };

  const filteredNavItems = useMemo(() => {
    const isServiceAllowed = (item: NavItem) => {
      if (item.alwaysVisible) return true;
      if (!item.serviceCode) return true;

      return subscribedServices?.some((s: string | { serviceCode?: string }) => {
        if (typeof s === "string") return s === item.serviceCode;
        return s?.serviceCode === item.serviceCode;
      });
    };

    return navItems.filter((item) => isServiceAllowed(item));
  }, [subscribedServices]);

  // Auto-open parent when landing on a child route
  useEffect(() => {
    const activeParent = filteredNavItems.find((item) =>
      item.children?.some((child) => isActive(child.path))
    );
    if (activeParent) {
      setIsOpen(activeParent.id);
    }
  }, [location.pathname, filteredNavItems]);

   
  const renderIcon = (
  iconName: string,
  path?: string,
  forceActive?: boolean
) => {
  const iconSrc = resolveSidebarIcon(iconName);

  if (!iconSrc) {
    if (import.meta.env.DEV) {
      console.warn(`Sidebar icon not found: ${iconName}.svg`);
    }

    return null;
  }

  return (
    <img
      src={iconSrc}
      alt=""
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 object-contain ${getImageClass(
        path,
        isActive,
        forceActive
      )}`}
    />
  );
};

  const logoSrc = collapsed ? LogoShort : LuckPayLogo;

  const renderLeafItem = (item: NavItem) => {
    const content = (
      <Link
        to={item.path!}
        onClick={() => isMobile && onClose?.()}
        className={getItemClass(item.path, isActive, collapsed)}
      >
        <div
          className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-3"}`}
        >
          {renderIcon(item.icon)}
          {!collapsed && (
            <span className="truncate text-[15px] font-medium whitespace-nowrap">
              {item.title}
            </span>
          )}
        </div>
      </Link>
    );

    return item.alwaysVisible ? (
      content
    ) : (
      <PermissionWrapper permission={item.permission!}>{content}</PermissionWrapper>
    );
  };

  const renderExpandableItem = (item: NavItem) => {
    const parentActive = isParentActive(item);
    const expanded = isOpen === item.id;

    const button = (
      <button
        type="button"
        onClick={() => toggleSection(item.id)}
        className={`${getItemClass(undefined, undefined, collapsed, parentActive)} flex w-full`}
      >
        <div
          className={`flex min-w-0 items-center ${collapsed ? "" : "flex-1 gap-3"}`}
        >
          {renderIcon(item.icon)}
          {!collapsed && (
            <span className="truncate text-[15px] font-medium whitespace-nowrap">
              {item.title}
            </span>
          )}
        </div>

        {!collapsed && (
          <span
            className="ml-2 flex shrink-0 items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              toggleSection(item.id);
            }}
          >
            <FiChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden
            />
          </span>
        )}
      </button>
    );

    const submenu =
      !collapsed && item.children?.length ? (
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="ml-5 mt-1 space-y-1 border-l border-[#E5E7EB] pl-3">
              {item.children.map(({ label, path, id }) =>
                item.alwaysVisible ? (
                  <Link
                    key={id}
                    to={path}
                    onClick={() => isMobile && onClose?.()}
                    className={getSubItemClass(path, isActive)}
                  >
                    <span className="whitespace-nowrap">{label}</span>
                  </Link>
                ) : (
                  <PermissionWrapper key={id} permission={id}>
                    <Link
                      to={path}
                      onClick={() => isMobile && onClose?.()}
                      className={getSubItemClass(path, isActive)}
                    >
                      <span className="whitespace-nowrap">{label}</span>
                    </Link>
                  </PermissionWrapper>
                )
              )}
            </div>
          </div>
        </div>
      ) : null;

    return item.alwaysVisible ? (
      <>
        {button}
        {submenu}
      </>
    ) : (
      <PermissionWrapper permission={item.permission!}>
        {button}
        {submenu}
      </PermissionWrapper>
    );
  };

  return (
    <div className="relative h-full">
      <div
        onClick={() => collapsed && setCollapsed(false)}
        className={`relative z-10 flex h-full flex-col overflow-x-hidden border-r border-[#E5E7EB] bg-white transition-all duration-300 ease-in-out ${
          isMobile ? "w-full" : collapsed ? "w-[72px]" : "w-[256px]"
        }`}
      >
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6] text-sm text-[#374151]"
          >
            ✕
          </button>
        )}

        {/* Logo */}
        <div
          className={`flex h-[72px] shrink-0 items-center ${
            collapsed ? "justify-center px-2" : "justify-start px-4"
          }`}
        >
          <img
            src={logoSrc}
            alt="Logo"
            className={`object-contain transition-all duration-300 ${
              collapsed ? "h-9 w-auto max-w-[40px]" : "h-10 w-auto max-w-[160px]"
            }`}
          />
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Host Admin only — same org select logic previously in Header */}
          {!collapsed && userType === "HOST_ADMIN" && <OrganizationSelector />}

          {filteredNavItems.map((item, index) => {
            const previousItem = filteredNavItems[index - 1];
            const showSectionHeading =
              !collapsed &&
              !!item.section &&
              (!previousItem || previousItem.section !== item.section);

            return (
              <div key={item.id} className="w-full">
                {showSectionHeading && (
                  <p
                    className={`mb-2 px-3 text-[14px] font-normal text-[#929292] ${
                      index === 0 ? "mt-1" : "mt-4"
                    }`}
                  >
                    {item.section}
                  </p>
                )}

                {item.path && !item.children?.length
                  ? renderLeafItem(item)
                  : item.path && item.children?.length
                    ? renderLeafItem(item)
                    : renderExpandableItem(item)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SideNavBar;  