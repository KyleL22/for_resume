/**
 * ============================================================================
 * 품목군조회 팝업 API 함수
 * ============================================================================
 *
 * 품목군조회 팝업 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  PrdlstSeInqirePopupSrchRequest,
  PrdlstSeInqirePopupListResponse,
} from "@/types/comPopup/PrdlstSeInqirePopup.types";

/**
 * 품목군조회 팝업 목록 조회
 * @param request 조회 조건
 * @returns 품목군조회 팝업 목록
 */
export const selectPrdlstSeInqirePopupList = async (
  request: PrdlstSeInqirePopupSrchRequest
): Promise<ApiResponse<PrdlstSeInqirePopupListResponse[]>> => {
  return await post<PrdlstSeInqirePopupListResponse[]>(
    "/com/popup/selectPrdlstSeInqirePopupList",
    request
  );
};

