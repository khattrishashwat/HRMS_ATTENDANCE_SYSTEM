import React, { useState, useEffect, useRef } from "react";
import { FaBars } from "react-icons/fa";
import { FiInfo, FiChevronDown, FiUser, FiBell } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../redux/index.ts";
import { toast } from "react-toastify";
import { useNotificationsContext } from "../../../hooks/useNotifications.tsx";
import { store } from "../../../redux/index.ts";
import {
  handleSwitchToAdmin,
  handleSwitchToEmployee,
} from "../../../servicesAPI/roleSwitchService.ts";
import { performSessionLogout } from "../../../utils/sessionLogout.ts";
import Profile from "@/assets/svg/Profile.svg";

interface NavbarProps {
  title: string;
  info?: string;
  onMobileMenuClick?: () => void;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  onDesktopCollapseClick?: () => void;
}

const ADMIN_ROLE_KEY = "admin_role_name";

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "HT";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const TopNavbar: React.FC<NavbarProps> = ({
  title,
  info,
  onMobileMenuClick,
  onProfileClick,
  onNotificationClick,
  onDesktopCollapseClick,
}) => {
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switchRoleOpen, setSwitchRoleOpen] = useState(false);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const switchRoleRef = useRef<HTMLDivElement>(null);

  const { userName, description, isOrgAdmin, activeRoleMode } = useSelector(
    (state: RootState) => state.auth
  );
  const profileImageURL = useSelector((state: RootState) => state.auth.profileImage);
  const { unreadCount } = useNotificationsContext();

  const getSavedAdminRole = () => localStorage.getItem(ADMIN_ROLE_KEY) || description || "Admin";

  const saveAdminRole = (role: string) => {
    if (role && role.trim() !== "" && role !== "Employee") {
      localStorage.setItem(ADMIN_ROLE_KEY, role);
    }
  };

  useEffect(() => {
    if (activeRoleMode === "ADMIN" && description && description !== "Employee") {
      saveAdminRole(description);
    }
  }, [activeRoleMode, description]);

  const currentRoleDisplay =
    activeRoleMode === "EMPLOYEE" ? "Employee" : getSavedAdminRole();
  const switchRoleLabel =
    activeRoleMode === "ADMIN" ? "Employee" : getSavedAdminRole();
  const switchDescription =
    activeRoleMode === "ADMIN"
      ? "Switch to Employee View"
      : `Switch to ${getSavedAdminRole()} View`;

  const handleRoleSwitch = async () => {
    setRoleSwitchLoading(true);
    try {
      if (activeRoleMode === "ADMIN") {
        await handleSwitchToEmployee(store.dispatch, store.getState);
      } else {
        await handleSwitchToAdmin(store.dispatch);
      }
      setSwitchRoleOpen(false);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to switch role");
    } finally {
      setRoleSwitchLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (switchRoleRef.current && !switchRoleRef.current.contains(event.target as Node)) {
        setSwitchRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await performSessionLogout({ callServer: true, hardRedirect: true });
  };

  const displayName = userName?.trim() || "User";
  const initials = getInitials(userName);
  const roleLabel = currentRoleDisplay || "Admin";

  const handleMenuClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onMobileMenuClick?.();
    } else {
      onDesktopCollapseClick?.();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:px-6">
      {/* Left: menu + page title */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label="Toggle navigation"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#374151] transition hover:bg-[#F3F4F6]"
          onClick={handleMenuClick}
        >
          <FaBars className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-base font-semibold text-[#111827] sm:text-lg md:text-xl">
            {title}
          </h1>
          {info ? (
            <div className="relative group hidden sm:block">
              <FiInfo className="h-4 w-4 cursor-pointer text-[#9CA3AF]" />
              <div className="pointer-events-none absolute left-0 top-6 z-50 w-56 rounded-lg border border-[#E5E7EB] bg-white p-2 text-xs text-[#374151] opacity-0 shadow-md transition group-hover:opacity-100">
                {info}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Host Admin org selector removed from Header — lives in Sidebar */}

        {isOrgAdmin && (
          <div className="relative" ref={switchRoleRef}>
            <button
              type="button"
              onClick={() => setSwitchRoleOpen((p) => !p)}
              disabled={roleSwitchLoading}
              className="flex h-10 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB] sm:px-4"
            >
              <FiUser className="h-4 w-4 shrink-0 text-primary" />
              <span className="hidden max-w-[120px] truncate sm:inline">
                {roleSwitchLoading ? "Switching..." : currentRoleDisplay}
              </span>
              <FiChevronDown className="h-4 w-4 shrink-0 text-[#6B7280]" />
            </button>

            {switchRoleOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[260px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xl">
                <div className="px-5 py-3 text-[11px] font-bold tracking-wider text-[#6B7280]">
                  SWITCH ROLE
                </div>
                <div className="flex flex-col">
                  <div className="flex items-start gap-3 bg-tertiary px-5 py-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-primary">{currentRoleDisplay}</div>
                      <div className="text-xs text-[#6B7280]">
                        {activeRoleMode === "ADMIN" ? "Organization Admin" : "Employee View"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRoleSwitch}
                    disabled={roleSwitchLoading}
                    className={`flex items-start gap-3 px-5 py-3 text-left transition ${
                      roleSwitchLoading ? "cursor-not-allowed opacity-60" : "hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#111827]">
                        {roleSwitchLoading ? "Switching..." : switchRoleLabel}
                      </div>
                      <div className="text-xs text-[#6B7280]">{switchDescription}</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          aria-label="Notifications"
          data-panel-ignore
          onClick={onNotificationClick}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F9FAFB]"
        >
          <FiBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#F04438]" />
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            data-panel-ignore
            onClick={onProfileClick}
            className="flex h-10 max-w-[200px] items-center gap-2 rounded-full border border-[#E5E7EB] bg-white py-1 pl-1 pr-3 transition hover:bg-[#F9FAFB] sm:max-w-none"
          >
            {profileImageURL ? (
              <img
                src={profileImageURL}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = Profile;
                }}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {initials}
              </span>
            )}
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block truncate text-sm font-semibold leading-tight text-[#111827]">
                {displayName}
              </span>
              <span className="block truncate text-xs leading-tight text-[#6B7280]">{roleLabel}</span>
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 w-32 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-[#111827] transition hover:bg-[#F3F4F6]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
