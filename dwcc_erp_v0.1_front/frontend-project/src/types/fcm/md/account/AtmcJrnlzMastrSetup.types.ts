/**
 * 자동분개마스터셋업 헤더 목록 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * 자동분개마스터셋업 헤더 목록 응답 타입
 */
export interface AtmcJrnlzMastrSetupHderListResponse {
    applName?: string;          // 모듈명
    accountingType?: string;    // 회계유형
    glItem?: string;            // GL항목
    description?: string;       // 적요
    lastUpdateDate?: string;    // 최종수정일시 (yyyy-MM-dd HH:mm:ss)
    lastUpdatedBy?: string;     // 최종수정자
}
/**
 * 자동분개마스터셋업 검색 요청 타입
 */
export interface AtmcJrnlzMastrSetupSrchRequest {
    asOfficeId?: string;        // 사무소ID
    asApplName: string;         // 모듈명 (필수)
    asAccountingType: string;   // 회계유형 (필수)
    asGlItem: string;           // GL항목 (필수)
}

/**
 * 자동분개마스터셋업 상세 목록 응답 타입
 */
export interface AtmcJrnlzMastrSetupDetailListResponse {
    officeId?: string;          // 사무소ID
    applName?: string;          // 모듈명
    accountingType?: string;    // 회계유형
    glItem?: string;            // GL항목
    glClass?: string;           // GL분류
    accountCode?: string;       // 계정코드
    cusCde?: string;            // 거래처코드
    itemCode?: string;          // 품목코드
    lastUpdateDate?: string;    // 최종수정일시 (yyyy-MM-dd HH:mm:ss)
    lastUpdatedBy?: string;     // 최종수정자
}

/**
 * 자동분개마스터셋업 저장 요청 타입
 */
export interface AtmcJrnlzMastrSetupSaveRequest {
    //headerList?: AtmcJrnlzMastrSetupHderData[];   // 자동분개마스터셋업 헤더 목록
    //detailList?: AtmcJrnlzMastrSetupDetailData[]; // 자동분개마스터셋업 상세 목록
}