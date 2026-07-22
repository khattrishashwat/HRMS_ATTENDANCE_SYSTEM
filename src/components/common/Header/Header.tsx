import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaBars } from "react-icons/fa";
import { FiInfo, FiChevronDown, FiX, FiSearch, FiUser, FiBell } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { setXContextOrgCode, setXContextOrgId } from "../../../redux/store.ts";
import api from "../../../utils/axiosinstance.ts";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../redux/index.ts";
import { toast } from "react-toastify";
import { getOrgMasterData } from "../../../Service/gerOrgData.ts";
import { useNotificationsContext } from "../../../hooks/useNotifications.tsx";
import { store } from "../../../redux/index.ts";
import {
  handleSwitchToAdmin,
  handleSwitchToEmployee,
} from "../../../servicesAPI/roleSwitchService.ts";
import { performSessionLogout } from "../../../utils/sessionLogout.ts";
import Build from "@/assets/svg/buildings.svg";
import Profile from "@/assets/svg/Profile.svg";

interface Organization {
  organizationId: number;
  merchantId: string;
  companyName: string;
}

interface NavbarProps {
  title: string;
  info?: string;
  onMobileMenuClick?: () => void;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  onDesktopCollapseClick?: () => void;
}

const STORAGE_KEY = "selected_org";
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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [switchRoleOpen, setSwitchRoleOpen] = useState(false);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const switchRoleRef = useRef<HTMLDivElement>(null);

  const { userName, userType, description, isOrgAdmin, activeRoleMode } = useSelector(
    (state: RootState) => state.auth
  );
  const profileImageURL = useSelector((state: RootState) => state.auth.profileImage);
  const { unreadCount } = useNotificationsContext();
  const usertype = useSelector((state: RootState) => state.auth.userType);

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
    const fetchOrganizations = async () => {
      try {
        const res = await api.post("/users/getAllOrganizations", {
          page: 0,
          size: 1000,
        });

        const orgList = res.data?.data?.paginatedList || [];
        setOrganizations(orgList);

        if (orgList.length === 0) return;

        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
          const parsedOrg = JSON.parse(stored);
          setSelectedOrg(parsedOrg);
          if (userType === "HOST_ADMIN") {
            dispatch(setXContextOrgId(parsedOrg.organizationId));
            dispatch(setXContextOrgCode(parsedOrg.merchantId));
          }
        } else {
          const firstOrg = orgList[0];
          setSelectedOrg(firstOrg);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(firstOrg));
          if (userType === "HOST_ADMIN") {
            dispatch(setXContextOrgId(firstOrg.organizationId));
            dispatch(setXContextOrgCode(firstOrg.merchantId));
          }
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message, {
          icon: false,
          autoClose: 6000,
          closeOnClick: true,
          hideProgressBar: true,
          className: "custom-toast-width",
        });
      }
    };
    if (usertype == "HOST_ADMIN") fetchOrganizations();
  }, [dispatch, userType, usertype]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setOrgDropdownOpen(false);
      }
      if (switchRoleRef.current && !switchRoleRef.current.contains(event.target as Node)) {
        setSwitchRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) =>
      (org.companyName || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [organizations, search]);

  const handleOrgSelect = (org: Organization) => {
    const isDifferentOrg = selectedOrg?.organizationId !== org.organizationId;

    setSelectedOrg(org);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(org));
    if (userType === "HOST_ADMIN") {
      dispatch(setXContextOrgId(org.organizationId));
      dispatch(setXContextOrgCode(org.merchantId));
    }
    setOrgDropdownOpen(false);
    setSearch("");

    if (isDifferentOrg) {
      window.location.reload();
    }
  };

  const xContextOrgId = useSelector((state: RootState) => state.auth.xContextOrgId);
  const handleClearOrg = () => {
    setSelectedOrg(null);
    localStorage.removeItem(STORAGE_KEY);
    dispatch(setXContextOrgId(null as any));
    dispatch(setXContextOrgCode(null as any));
  };

  const handleLogout = async () => {
    await performSessionLogout({ callServer: true, hardRedirect: true });
  };

  useEffect(() => {
    if (!xContextOrgId) return;

    const fetchData = async () => {
      try {
        await getOrgMasterData(xContextOrgId);
      } catch (err) {
        console.error("Org master data fetch failed", err);
      }
    };

    fetchData();
  }, [xContextOrgId]);

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
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:h-[72px] sm:px-6">
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
        {userType === "HOST_ADMIN" && (
          <div className="hidden items-center gap-2 lg:flex">
            {selectedOrg && (
              <div className="flex h-10 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#111827]">
                <img src={Build} className="h-4 w-4" alt="" />
                <span className="max-w-[140px] truncate">
                  Viewing: <span className="font-semibold">{selectedOrg.companyName || selectedOrg.merchantId}</span>
                </span>
                <button type="button" onClick={handleClearOrg} className="ml-0.5" aria-label="Clear organization">
                  <FiX className="h-4 w-4 text-primary" />
                </button>
              </div>
            )}
            <div className="relative" ref={orgRef}>
              <button
                type="button"
                onClick={() => setOrgDropdownOpen((p) => !p)}
                className="flex h-10 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                <img src={Build} className="h-4 w-4" alt="" />
                <span className="whitespace-nowrap">
                  {selectedOrg === null ? "Select Company" : "Select Another Company"}
                </span>
                <FiChevronDown className="h-4 w-4 text-[#6B7280]" />
              </button>

              {orgDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xl">
                  <div className="p-3">
                    <div className="flex items-center gap-2 rounded-full bg-tertiary px-3 py-2">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Company..."
                        className="flex-1 bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#6B7280]"
                      />
                      <FiSearch className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredOrganizations.map((org) => (
                      <button
                        key={org.organizationId}
                        type="button"
                        onClick={() => handleOrgSelect(org)}
                        className="w-full px-5 py-3 text-left text-sm text-[#111827] transition hover:bg-[#F3F4F6]"
                      >
                        {org.companyName || org.merchantId}
                      </button>
                    ))}
                    {filteredOrganizations.length === 0 && (
                      <div className="px-5 py-3 text-sm text-[#9CA3AF]">No Company Found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
