/**
 * ============================================================================
 * 거래처조회 팝업 API 함수
 * ============================================================================
 *
 * 거래처조회 팝업 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  BcncInqirePopupSrchRequest,
  BcncInqirePopupListResponse,
} from "@/types/comPopup/BcncInqirePopup.types";

/**
 * 거래처조회 팝업 목록 조회
 * @param request 조회 조건
 * @returns 거래처조회 팝업 목록
 */
export const selectBcncInqirePopupList = async (
  request: BcncInqirePopupSrchRequest
): Promise<ApiResponse<BcncInqirePopupListResponse[]>> => {
  return await post<BcncInqirePopupListResponse[]>(
    "/com/popup/selectBcncInqirePopupList",
    request
  );
};

