import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setXContextOrgCode, setXContextOrgId } from "../../../redux/store.ts";
import { RootState } from "../../../redux/index.ts";
import api from "../../../utils/axiosinstance.ts";
import { getOrgMasterData } from "../../../Service/gerOrgData.ts";
import Build from "@/assets/svg/buildings.svg";

export interface Organization {
  organizationId: number;
  merchantId: string;
  companyName: string;
}

const STORAGE_KEY = "selected_org";

/**
 * Host Admin organization selector — single source of truth for fetch/select/clear.
 * Rendered in the Sidebar for HOST_ADMIN (not in Header).
 */
const OrganizationSelector: React.FC = () => {
  const dispatch = useDispatch();
  const userType = useSelector((state: RootState) => state.auth.userType);
  const xContextOrgId = useSelector((state: RootState) => state.auth.xContextOrgId);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const orgRef = useRef<HTMLDivElement>(null);

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

    if (userType === "HOST_ADMIN") fetchOrganizations();
  }, [dispatch, userType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setOrgDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleClearOrg = () => {
    setSelectedOrg(null);
    localStorage.removeItem(STORAGE_KEY);
    dispatch(setXContextOrgId(null as any));
    dispatch(setXContextOrgCode(null as any));
  };

  const orgLabel =
    selectedOrg?.companyName || selectedOrg?.merchantId || "All Organizations";
  const viewingLabel = selectedOrg
    ? `Viewing ${selectedOrg.companyName || selectedOrg.merchantId}`
    : "Viewing All Organizations";

  return (
    <div className="mb-3" ref={orgRef}>
      <p className="mb-2 px-1 text-[14px] font-normal text-[#929292]">Organization</p>

      <button
        type="button"
        onClick={() => setOrgDropdownOpen((p) => !p)}
        className="flex h-[50px] w-full items-center gap-3 rounded-[14px] border border-[#C07BFC] bg-white px-3 text-left transition hover:bg-[#F9FAFB]"
      >
        <img src={Build} alt="" className="h-5 w-5 shrink-0 object-contain" />
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-[#1F2937]">
          {orgLabel}
        </span>
        <FiChevronDown
          className={`h-4 w-4 shrink-0 text-[#6B7280] transition-transform duration-200 ${
            orgDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {orgDropdownOpen && (
        <div className="relative z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xl">
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

      <div className="mt-2 flex items-center gap-2 px-1">
        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#22C55E]" />
        <span className="min-w-0 flex-1 truncate text-[12px] text-[#6B7280]">
          {viewingLabel}
        </span>
        {selectedOrg && (
          <button
            type="button"
            onClick={handleClearOrg}
            className="shrink-0"
            aria-label="Clear organization"
          >
            <FiX className="h-3.5 w-3.5 text-primary" />
          </button>
        )}
      </div>

      <div className="mt-3 border-b border-[#E5E7EB]" />
    </div>
  );
};

export default OrganizationSelector;
