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

type ApiEnvelope<T> = {
  code: string;
  status: string;
  message: string;
  timestamp?: string;
  data: T;
};

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

const resignationApi = {
  getResignationRequests,
};

export default resignationApi;
