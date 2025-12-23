/**
 * ============================================================================
 * 품목코드조회 팝업 API 함수
 * ============================================================================
 *
 * 품목코드조회 팝업 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  PrdlstCodeInqirePopupSrchRequest,
  PrdlstCodeInqirePopupListResponse,
} from "@/types/comPopup/PrdlstCodeInqirePopup.types";

/**
 * 품목코드조회 팝업 목록 조회
 * @param request 조회 조건
 * @returns 품목코드조회 팝업 목록
 */
export const selectPrdlstCodeInqirePopupList = async (
  request: PrdlstCodeInqirePopupSrchRequest
): Promise<ApiResponse<PrdlstCodeInqirePopupListResponse[]>> => {
  return await post<PrdlstCodeInqirePopupListResponse[]>(
    "/com/popup/selectPrdlstCodeInqirePopupList",
    request
  );
};

