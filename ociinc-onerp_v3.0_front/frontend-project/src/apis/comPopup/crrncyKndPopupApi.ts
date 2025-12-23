/**
 * ============================================================================
 * 통화종류조회 팝업 API 함수
 * ============================================================================
 *
 * 통화종류조회 팝업 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  CrrncyKndPopupSrchRequest,
  CrrncyKndPopupListResponse,
} from "@/types/comPopup/CrrncyKndPopup.types";

/**
 * 통화종류조회 팝업 목록 조회
 * @param request 조회 조건
 * @returns 통화종류조회 팝업 목록
 */
export const selectCrrncyKndPopupList = async (
  request: CrrncyKndPopupSrchRequest
): Promise<ApiResponse<CrrncyKndPopupListResponse[]>> => {
  return await post<CrrncyKndPopupListResponse[]>(
    "/com/popup/selectCrrncyKndPopupList",
    request
  );
};

