import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaMoon, FaSun, FaBars } from "react-icons/fa";
import { FiInfo, FiChevronDown, FiX, FiSearch, FiUser } from "react-icons/fi";
import { useTheme } from "../../../context/ThemeContext.tsx";
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
}

const STORAGE_KEY = "selected_org";
const ADMIN_ROLE_KEY = "admin_role_name";

const TopNavbar: React.FC<NavbarProps> = ({
  title,
  info,
  onMobileMenuClick,
  onProfileClick,
  onNotificationClick,
}) => {
  const { darkMode, toggleTheme } = useTheme();
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

  const { userName, userType, description, isOrgAdmin, activeRoleMode } = useSelector((state: RootState) => state.auth);
  const profileImageURL = useSelector((state: RootState) => state.auth.profileImage);
  const { unreadCount } = useNotificationsContext();
  const usertype = useSelector((state: RootState) => state.auth.userType);

  const getSavedAdminRole = () => {
    return localStorage.getItem(ADMIN_ROLE_KEY) || description || "Admin";
  };

  const saveAdminRole = (role: string) => {
    if (role && role.trim() !== "" && role !== "Employee") {
      localStorage.setItem(ADMIN_ROLE_KEY, role);
    }
  };

  // Keep admin role label in LS when in admin mode (for display after switching to employee)
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
  }, [dispatch, userType]);

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

  return (
    <div className="w-full z-10 flex justify-between items-center px-4 py-3 bg-[#FDFDFD] dark:bg-[#1e1e1e] border-b shadow-sm">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-700"
          onClick={onMobileMenuClick}
        >
          <FaBars />
        </button>

        <h1 className="text-[24px] font-medium text-black dark:text-white truncate max-w-[150px] md:max-w-none">
          {title}
        </h1>

        {info && (
          <div className="relative group">
            <FiInfo className="text-gray-400 cursor-pointer" />
            <div className="absolute top-6 left-0 opacity-0 group-hover:opacity-100 bg-white dark:bg-[#1e1e1e] border p-2 rounded shadow text-xs w-56">
              {info}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {userType === "HOST_ADMIN" && (
          <div className="flex  items-center gap-3">
            {selectedOrg && (
              <div className="hidden md:flex h-[50px] items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary text-black text-sm font-medium">
                <img src="/assets/TopNavBar/buildings.svg" className="w-4 h-4" alt="" />
                Viewing:{" "}
                <span className="font-bold">
                  {" "}
                  {selectedOrg.companyName || selectedOrg.merchantId}
                </span>
                <button onClick={handleClearOrg} className="ml-1">
                  <FiX className="text-primary" />
                </button>
              </div>
            )}
            <div className="relative" ref={orgRef}>
              {selectedOrg === null ? (
                <button
                  onClick={() => setOrgDropdownOpen((p) => !p)}
                  className="flex items-center gap-2 px-4 py-1.5 h-[50px] rounded-full bg-tertiary text-black text-sm font-medium"
                >
                  <img src="/assets/TopNavBar/buildings.svg" className="w-4 h-4" alt="" />
                  Select Company
                  <FiChevronDown />
                </button>
              ) : (
                <button
                  onClick={() => setOrgDropdownOpen((p) => !p)}
                  className="flex items-center gap-2 px-4 py-1.5 h-[50px] rounded-full bg-tertiary text-black text-sm font-medium"
                >
                  <img src="/assets/TopNavBar/buildings.svg" className="w-4 h-4" alt="" />
                  Select Another Company
                  <FiChevronDown />
                </button>
              )}

              {orgDropdownOpen && (
                <div className="absolute left-0 top-full mt-3 w-80 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl border z-50">
                  <div className="p-3">
                    <div className="flex  items-center bg-[linear-gradient(to_right,theme(colors.tertiary)_85%,#4B1B91_85%)] bg-tertiary rounded-full px-3 py-2">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Company..."
                        className="flex-1 bg-[linear-gradient(to_right,theme(colors.tertiary)_93.8%,#4B1B91_93.8%)] outline-none text-sm placeholder-black text-black dark:text-white"
                      />
                      <FiSearch className="text-white" />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {filteredOrganizations.map((org) => (
                      <button
                        key={org.organizationId}
                        onClick={() => handleOrgSelect(org)}
                        className="w-full text-left px-5 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {org.companyName || org.merchantId}
                      </button>
                    ))}
                    {filteredOrganizations.length === 0 && (
                      <div className="px-5 py-3 text-sm text-gray-400">No Company Found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Switch Role Dropdown */}
        {isOrgAdmin && (
          <div className="relative" ref={switchRoleRef}>
            <button
              onClick={() => setSwitchRoleOpen((p) => !p)}
              className="flex items-center gap-2 px-4 py-1.5 h-[40px] rounded-full border border-gray-200 bg-white text-black text-sm font-medium hover:bg-gray-50 transition-colors"
              disabled={roleSwitchLoading}
            >
              <FiUser className="text-[#4B1B91]" />
              {roleSwitchLoading ? "Switching..." : currentRoleDisplay}
              <FiChevronDown className="text-gray-500" />
            </button>

            {switchRoleOpen && (
              <div className="absolute right-0 top-full mt-3 w-[260px] bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
                <div className="px-5 py-3 text-[11px] font-bold text-gray-500 tracking-wider">
                  SWITCH ROLE
                </div>
                <div className="flex flex-col">
                  {/* Current Role Display */}
                  <div className="flex items-start gap-3 px-5 py-3 bg-[#F3E8FF]">
                    <div className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-full shrink-0 bg-[#4B1B91] text-white">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#4B1B91]">
                        {currentRoleDisplay}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activeRoleMode === "ADMIN"
                          ? "Organization Admin"
                          : "Employee View"}
                      </div>
                    </div>
                  </div>

                  {/* Switch Option */}
                  <button
                    onClick={handleRoleSwitch}
                    disabled={roleSwitchLoading}
                    className={`flex items-start gap-3 px-5 py-3 text-left transition-colors ${
                      roleSwitchLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-full shrink-0 bg-gray-100 text-gray-500">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {roleSwitchLoading ? "Switching..." : switchRoleLabel}
                      </div>
                      <div className="text-xs text-gray-500">
                        {switchDescription}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className="relative cursor-pointer mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={onNotificationClick}
        >
          <img
            src="/assets/Notification/Button.png"
            alt="Bell"
            className="w-10 h-10 object-contain"
          />
          {unreadCount > 0 && (
            <span className="absolute top-[8px] right-[8px] w-2.5 h-2.5 bg-[#F04438] rounded-full border-[1.5px] border-white dark:border-[#1e1e1e]"></span>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <img
            src={profileImageURL || "/assets/Profile/Profile.svg"}
            onError={(e: any) => {
              e.target.src = "/assets/Profile/Profile.svg";
            }}
            alt=""
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={onProfileClick}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#1e1e1e] border rounded shadow">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <span className="hidden md:block text-sm font-medium dark:text-white">{userName}</span>
      </div>
    </div>
  );
};

export default TopNavbar;