/**
 * ============================================================================
 * 계정조회 팝업 API 함수
 * ============================================================================
 *
 * 계정조회 팝업 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  AcntInqirePopupSrchRequest,
  AcntInqirePopupListResponse,
} from "@/types/comPopup/AcntInqirePopup.types";

/**
 * 계정조회 팝업 목록 조회
 * @param request 조회 조건
 * @returns 계정조회 팝업 목록
 */
export const selectAcntInqirePopupList = async (
  request: AcntInqirePopupSrchRequest
): Promise<ApiResponse<AcntInqirePopupListResponse[]>> => {
  return await post<AcntInqirePopupListResponse[]>(
    "/com/popup/selectAcntInqirePopupList",
    request
  );
};

