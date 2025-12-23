/**
 * ============================================================================
 * 작성자조회 팝업 API 함수
 * ============================================================================
 *
 * 작성자조회 팝업 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  WrterInqirePopupSrchRequest,
  WrterInqirePopupListResponse,
} from "@/types/comPopup/WrterInqirePopup.types";

/**
 * 작성자조회 팝업 목록 조회
 * @param request 조회 조건
 * @returns 작성자조회 팝업 목록
 */
export const selectWrterInqirePopupList = async (
  request: WrterInqirePopupSrchRequest
): Promise<ApiResponse<WrterInqirePopupListResponse[]>> => {
  return await post<WrterInqirePopupListResponse[]>(
    "/com/popup/selectWrterInqirePopupList",
    request
  );
};

