/**
 * ============================================================================
 * 공정코드조회 팝업 API 함수
 * ============================================================================
 *
 * 공정코드조회 팝업 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  ProcsCodePopupSrchRequest,
  ProcsCodePopupListResponse,
} from "@/types/comPopup/ProcsCodePopup.types";

/**
 * 공정코드조회 팝업 목록 조회
 * @param request 조회 조건
 * @returns 공정코드조회 팝업 목록
 */
export const selectProcsCodePopupList = async (
  request: ProcsCodePopupSrchRequest
): Promise<ApiResponse<ProcsCodePopupListResponse[]>> => {
  return await post<ProcsCodePopupListResponse[]>(
    "/com/popup/selectProcsCodePopupList",
    request
  );
};

