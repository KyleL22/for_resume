/**
 * ============================================================================
 * 부서조회 팝업 API 함수
 * ============================================================================
 *
 * 부서조회 팝업 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  DeptInqirePopupSrchRequest,
  DeptInqirePopupListResponse,
} from "@/types/comPopup/DeptInqirePopup.types";

/**
 * 부서조회 팝업 목록 조회
 * @param request 조회 조건
 * @returns 부서조회 팝업 목록
 */
export const selectDeptInqirePopupList = async (
  request: DeptInqirePopupSrchRequest
): Promise<ApiResponse<DeptInqirePopupListResponse[]>> => {
  return await post<DeptInqirePopupListResponse[]>(
    "/com/popup/selectDeptInqirePopupList",
    request
  );
};

