import type { AxiosResponse } from "axios";
import api from "./axios.ts";

export type AssignedAsset = {
  assignmentId: number;
  assetId: number;
  assetName: string;
  assetCode: string;
  assetCategory: string;
  assignmentDate: string;
  assignmentStatus: string;
};

export type ResignationRequestItem = {
  resignationRequestId: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  email: string;
  employeeSnapshot: string | null;
  orgId: number;
  resignationDate: string | null;
  preferredLastWorkingDay: string | null;
  managerActionLWD: string | null;
  reasonType: string | null;
  detailedComments: string | null;
  status: string;
  pendingWith: string | null;
  approvalLevel: number | null;
  shortfallDays: number | null;
  managerRemarks: string | null;
  hrRemarks: string | null;
  actionBy: string | null;
  actionDate: string | null;
  managerActionDate: string | null;
  warningMessage: string | null;
  documentId: number | null;
  documentUrl: string | null;
  holdReason: string | null;
  followUpDate: string | null;
  noticePeriod: number | null;
  withdrawalReason: string | null;
  expectedLastWorkingDay: string | null;
  assignedAssets: AssignedAsset[];
  employeeStatus: string | null;
  managerName: string | null;
  joiningDate: string | null;
};

export type ResignationListData = {
  data: ResignationRequestItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type GetResignationRequestsParams = {
  pageNumber: number;
  pageSize: number;
  searchText?: string;
};

export type ResignationReasonOption = {
  label: string;
  value: string;
};

export type ResignationMasterOptions = {
  rejectReasons: ResignationReasonOption[];
  holdReasons: ResignationReasonOption[];
};

/** Confirmed backend action payloads (old dashboard contract). */
export type ApproveResignationRequest = {
  resignationRequestId: number;
  action: "APPROVED";
  remarks: string;
};

export type RejectResignationRequest = {
  resignationRequestId: number;
  action: "REJECTED";
  reason: string;
  remarks: string;
};

export type PutResignationOnHoldRequest = {
  resignationRequestId: number;
  action: "ON_HOLD";
  reason: string;
  followUpDate: string;
  remarks: string;
};

export type UpdateLastWorkingDayRequest = {
  resignationRequestId: number;
  action: "REVISION_PENDING";
  suggestedDate: string;
  remarks: string;
};

type ApiEnvelope<T> = {
  code: string;
  status: string;
  message: string;
  timestamp?: string;
  data: T;
};

type MasterValueItem = {
  key?: string | number;
  value?: string;
};

function assertSuccess(envelope: ApiEnvelope<unknown> | undefined, fallback: string) {
  if (envelope?.code === "200" || envelope?.status === "Success") {
    return envelope;
  }
  throw new Error(envelope?.message || fallback);
}

function toApiDateTime(dateValue: string): string {
  if (!dateValue) return "";
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateValue);
  return isDateOnly ? `${dateValue}T10:00:00` : dateValue;
}

function mapMasterValueOptions(
  items: MasterValueItem[] | undefined
): ResignationReasonOption[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const value = String(item?.key ?? item?.value ?? "").trim();
      const label = String(item?.value ?? item?.key ?? "").trim();
      return value && label ? { label, value } : null;
    })
    .filter((option): option is ResignationReasonOption => option !== null);
}

/**
 * POST /resignation/approval/listForAdmin
 * Axios returns AxiosResponse → rows live at response.data.data.data
 */
export async function getResignationRequests(
  params: GetResignationRequestsParams
): Promise<ResignationListData> {
  const payload: {
    pageNumber: number;
    pageSize: number;
    searchText?: string;
  } = {
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };

  const trimmedSearch = params.searchText?.trim();
  if (trimmedSearch) {
    payload.searchText = trimmedSearch;
  }

  const response: AxiosResponse<ApiEnvelope<ResignationListData>> =
    await api.post("/resignation/approval/listForAdmin", payload);

  const listData = response.data?.data;

  return {
    data: Array.isArray(listData?.data) ? listData.data : [],
    totalElements: listData?.totalElements ?? 0,
    totalPages: listData?.totalPages ?? 0,
    currentPage: listData?.currentPage ?? 0,
    pageSize: listData?.pageSize ?? params.pageSize,
  };
}

/**
 * POST /resignation/approval/getResignationDetail
 */
export async function getResignationRequestById(
  resignationRequestId: number
): Promise<ResignationRequestItem> {
  const response: AxiosResponse<ApiEnvelope<ResignationRequestItem>> =
    await api.post("/resignation/approval/getResignationDetail", {
      resignationRequestId,
    });

  assertSuccess(response.data, "Failed to fetch resignation details");
  return response.data.data;
}

/**
 * POST /master/getSystemMasterData
 * Returns resignation reject / hold reason option lists.
 */
export async function getResignationMasterOptions(): Promise<ResignationMasterOptions> {
  const response: AxiosResponse<
    ApiEnvelope<{
      resignationReasons?: MasterValueItem[];
      resignationHoldReasons?: MasterValueItem[];
    }>
  > = await api.post("/master/getSystemMasterData");

  const data = response.data?.data ?? {};
  return {
    rejectReasons: mapMasterValueOptions(data.resignationReasons),
    holdReasons: mapMasterValueOptions(data.resignationHoldReasons),
  };
}

/**
 * POST /resignation/approval/resignationActionByAdmin
 * action: APPROVED
 */
export async function approveResignation(params: {
  resignationRequestId: number;
  remarks: string;
}): Promise<string> {
  const payload: ApproveResignationRequest = {
    resignationRequestId: params.resignationRequestId,
    action: "APPROVED",
    remarks: params.remarks,
  };

  const response: AxiosResponse<ApiEnvelope<unknown>> = await api.post(
    "/resignation/approval/resignationActionByAdmin",
    payload
  );

  const envelope = assertSuccess(
    response.data,
    "Failed to approve resignation"
  );
  return envelope.message || "Resignation approved successfully";
}

/**
 * POST /resignation/approval/resignationActionByAdmin
 * action: REJECTED
 */
export async function rejectResignation(params: {
  resignationRequestId: number;
  reason: string;
  remarks: string;
}): Promise<string> {
  const payload: RejectResignationRequest = {
    resignationRequestId: params.resignationRequestId,
    action: "REJECTED",
    reason: params.reason,
    remarks: params.remarks,
  };

  const response: AxiosResponse<ApiEnvelope<unknown>> = await api.post(
    "/resignation/approval/resignationActionByAdmin",
    payload
  );

  const envelope = assertSuccess(
    response.data,
    "Failed to reject resignation"
  );
  return envelope.message || "Resignation rejected successfully";
}

/**
 * POST /resignation/approval/resignationActionByAdmin
 * action: ON_HOLD
 */
export async function putResignationOnHold(params: {
  resignationRequestId: number;
  reason: string;
  followUpDate: string;
  remarks?: string;
}): Promise<string> {
  const payload: PutResignationOnHoldRequest = {
    resignationRequestId: params.resignationRequestId,
    action: "ON_HOLD",
    reason: params.reason,
    followUpDate: toApiDateTime(params.followUpDate),
    remarks: params.remarks ?? "",
  };

  const response: AxiosResponse<ApiEnvelope<unknown>> = await api.post(
    "/resignation/approval/resignationActionByAdmin",
    payload
  );

  const envelope = assertSuccess(
    response.data,
    "Failed to put resignation on hold"
  );
  return envelope.message || "Resignation put on hold successfully";
}

/**
 * POST /resignation/approval/resignationActionByAdmin
 * action: REVISION_PENDING (edit last working day)
 */
export async function updateLastWorkingDay(params: {
  resignationRequestId: number;
  newLastWorkingDate: string;
  remarks: string;
}): Promise<string> {
  const payload: UpdateLastWorkingDayRequest = {
    resignationRequestId: params.resignationRequestId,
    action: "REVISION_PENDING",
    suggestedDate: toApiDateTime(params.newLastWorkingDate),
    remarks: params.remarks,
  };

  const response: AxiosResponse<ApiEnvelope<unknown>> = await api.post(
    "/resignation/approval/resignationActionByAdmin",
    payload
  );

  const envelope = assertSuccess(
    response.data,
    "Failed to update last working day"
  );
  return envelope.message || "Last working day updated successfully";
}

const resignationApi = {
  getResignationRequests,
  getResignationRequestById,
  getResignationMasterOptions,
  approveResignation,
  rejectResignation,
  putResignationOnHold,
  updateLastWorkingDay,
};

export default resignationApi;
