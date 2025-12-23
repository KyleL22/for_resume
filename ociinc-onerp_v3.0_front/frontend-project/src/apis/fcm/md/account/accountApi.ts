import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  AccnutMngCodeSrchRequest,
  AccnutMngCodeMgmtDivCodeListResponse,
  AccnutMngCodeListResponse,
} from "@/types/fcm/md/account/AccnutMngCodeRegist.types";
import type {
  AtmcJrnlzMastrSetupHderListResponse,
  AtmcJrnlzMastrSetupSrchRequest,
  AtmcJrnlzMastrSetupDetailListResponse,
  AtmcJrnlzMastrSetupSaveRequest,
} from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";
/**
 * ============================================================================
 * 계정코드관리 API 함수
 * ============================================================================
 */

// import { axiosInstance } from "@apis/common";

// /**
//  * 계정코드 목록 조회
//  */
// export const getAccountList = async (params: unknown) => {
//   const response = await axiosInstance.get("/fcm/md/account", { params });
//   return response.data;
// };

// /**
//  * 계정코드 등록
//  */
// export const createAccount = async (data: unknown) => {
//   const response = await axiosInstance.post("/fcm/md/account", data);
//   return response.data;
// };

/**
 * ============================================================================
 * 회계관리코드 등록 API 함수
 * ============================================================================
 */
/**
 * 회계관리코드 등록 관리구분코드 조회
 */
export const selectAccnutMngCodeMgmtDivCodeList = async (
  params: AccnutMngCodeSrchRequest
): Promise<ApiResponse<AccnutMngCodeMgmtDivCodeListResponse[]>> => {
  return post<AccnutMngCodeMgmtDivCodeListResponse[]>(
    "/fcm/md/account/selectMgmtDivCodeList",
    params
  );
};
// /**
//  * 회계관리코드 등록 목록 조회
//  */
export const selectAccnutMngCodeList = async (
  params: AccnutMngCodeSrchRequest
): Promise<ApiResponse<AccnutMngCodeListResponse[]>> => {
  return post<AccnutMngCodeListResponse[]>(
    "/fcm/md/account/selectAccnutMngCodeList",
    params
  );
};
/**
 * ============================================================================
 * 자동분개마스터셋업 API 함수
 * ============================================================================
 *
 * 자동분개마스터셋업 관련 API 호출 함수 정의
 */

/**
 * 자동분개마스터셋업 헤더 목록 조회
 * @returns 헤더 목록
 */
export const selectAtmcJrnlzMastrSetupHderList = async (): Promise<
  ApiResponse<AtmcJrnlzMastrSetupHderListResponse[]>
> => {
  return await post<AtmcJrnlzMastrSetupHderListResponse[]>(
    "/fcm/md/account/selectAtmcJrnlzMastrSetupHderList"
  );
};

/**
 * 자동분개마스터셋업 상세 목록 조회
 * @param request 조회 조건
 * @returns 상세 목록
 */
export const selectAtmcJrnlzMastrSetupDetailList = async (
  request: AtmcJrnlzMastrSetupSrchRequest
): Promise<ApiResponse<AtmcJrnlzMastrSetupDetailListResponse[]>> => {
  return await post<AtmcJrnlzMastrSetupDetailListResponse[]>(
    "/fcm/md/account/selectAtmcJrnlzMastrSetupDetailList",
    request
  );
};

/**
 * 자동분개마스터셋업 저장
 * @param request 저장 데이터 (헤더/상세)
 * @returns 저장 결과
 */
export const saveAtmcJrnlzMastrSetup = async (
  request: AtmcJrnlzMastrSetupSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/md/account/saveAtmcJrnlzMastrSetup", request);
};