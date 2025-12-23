/**
 * ============================================================================
 * 프로젝트조회 팝업 API 함수
 * ============================================================================
 *
 * 프로젝트조회 팝업 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  PrjctInqirePopupSrchRequest,
  PrjctInqirePopupListResponse,
} from "@/types/comPopup/PrjctInqirePopup.types";

/**
 * 프로젝트조회 팝업 목록 조회
 * @param request 조회 조건
 * @returns 프로젝트조회 팝업 목록
 */
export const selectPrjctInqirePopupList = async (
  request: PrjctInqirePopupSrchRequest
): Promise<ApiResponse<PrjctInqirePopupListResponse[]>> => {
  return await post<PrjctInqirePopupListResponse[]>(
    "/com/popup/selectPrjctInqirePopupList",
    request
  );
};

