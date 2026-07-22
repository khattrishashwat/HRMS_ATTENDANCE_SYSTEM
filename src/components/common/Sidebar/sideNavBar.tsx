import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getImageClass, getSubItemClass, getItemClass } from "../../../utils/sideNavBarUtils.ts";
import { navItems } from "./sideNavItems.ts";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PermissionWrapper from "../../../permissions/PermissionWrapper.tsx";
import { RootState } from "../../../redux";
import { useSelector } from "react-redux";

const SideNavBar = ({ onClose, isMobile }: { onClose?: () => void; isMobile?: boolean }) => {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const orgImage = useSelector((state: RootState) => state.auth.orgImage);
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
        className={`relative z-10 h-full transition-all duration-300 ${
          isMobile ? "w-full" : collapsed ? "w-[70px]" : "w-[260px]"
        } bg-[#FDFDFD] border-r overflow-x-visible flex flex-col`}
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
          <div className="h-[90px] flex-shrink-0 flex items-center justify-center">
            <img
              src="/assets/SideNavBar/LuckPayLogo.svg"
              alt="Logo"
              className={collapsed ? "w-[60px] h-[60px]" : "w-[80px] h-[80px]"}
            />
          </div>
        ) : (
          <div className="h-[90px] flex-shrink-0 flex items-center justify-center">
            <img
              src={orgImage!}
              alt="Logo"
              className={`transition-all duration-200 ${
                collapsed ? "w-[60px] h-[60px]" : "w-[100px] h-[100px]"
              } object-contain`}
            />
          </div>
        )}

        {/* Scrollable navigation container */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <div key={item.id || item.section} className="px-2">
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
                    className={`${getItemClass()} flex items-center justify-between pr-[5px] w-full group`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img
                        src={`/assets/SideNavBar/${item.icon}.svg`}
                        alt={item.title}
                        className="filter max-w-4 max-h-4 brightness-75 flex-shrink-0 w-4 h-4"
                      />
                      {!collapsed && (
                        <span className="text-sm whitespace-nowrap">
                          {item.title}
                        </span>
                      )}
                    </div>

                    {!collapsed && (
                      <img
                        src="/assets/SideNavBar/Arrow.svg"
                        className={`transition-transform flex-shrink-0 ml-2 w-3 h-3 ${
                          isOpen === item.section ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>

                  {!collapsed && (
                    <div
                      className={`transition-all duration-300 ${
                        isOpen === item.section ? "max-h-[600px]" : "max-h-0 overflow-hidden"
                      }`}
                    >
                      <div className="ml-6 mt-1 space-y-1">
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
                  )}
                </>
              ) : (
                <PermissionWrapper key={item.id} permission={item.permission!}>
                  <button
                    onClick={() => toggleSection(item.section)}
                    className={`${getItemClass()} flex items-center justify-between pr-[5px] w-full group`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img
                        src={`/assets/SideNavBar/${item.icon}.svg`}
                        alt={item.title}
                        className="filter max-w-4 max-h-4 brightness-75 flex-shrink-0 w-4 h-4"
                      />
                      {!collapsed && (
                        <span className="text-sm whitespace-nowrap">
                          {item.title}
                        </span>
                      )}
                    </div>

                    {!collapsed && (
                      <img
                        src="/assets/SideNavBar/Arrow.svg"
                        className={`transition-transform flex-shrink-0 ml-2 w-3 h-3 ${
                          isOpen === item.section ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>

                  {!collapsed && (
                    <div
                      className={`transition-all duration-300 ${
                        isOpen === item.section ? "max-h-[600px]" : "max-h-0 overflow-hidden"
                      }`}
                    >
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children?.map(({ label, path, id }) => (
                          // <PermissionWrapper key={id} permission={item.permission!}>
                         <PermissionWrapper key={id} permission={id}> 
                            <Link
                              to={path}
                              className={getSubItemClass(path, isActive)}
                            >
                              <span className="text-sm whitespace-nowrap">{label}</span>
                            </Link>
                          </PermissionWrapper>
                        ))}
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
            onClick={() => setCollapsed(!collapsed)}
            className="absolute z-30 top-[100px] -translate-y-1/2 right-[-12px] bg-primary text-white w-6 h-6 flex items-center justify-center rounded-md shadow-md"
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        )}
      </div>
    </div>
  );
};

export default SideNavBar;
