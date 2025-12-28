// ============================================================================
// 메인 화면 관련 API
// ============================================================================
import type { ApiResponse } from "@/types/axios.types";
import type { MainInitResponse } from "@/types/api.types";

/**
 * 초기 데이터 조회 API
 * @returns 메뉴 리스트와 사용자 기본 정보
 */
export const getMainInitDataApi = async (): Promise<
  ApiResponse<MainInitResponse>
> => {
  // MOCK: admin 계정일 경우 목 데이터 반환
  // 실제로는 AuthStore나 Token을 확인해야 하지만, 여기서는 간단히 처리
  // (실제 로그인 시 저장된 정보를 확인할 방법이 마땅치 않다면,
  //  localStorage의 토큰을 보거나, 단순히 50% 확률로 모킹할 수도 있음.
  //  하지만 가장 확실한 건, axios interceptor가 아닌 여기서 로컬 스토리지 키나
  //  특정 조건을 체크하는 것임.
  //  여기서는 단순화를 위해 항상 성공하는 Mock을 리턴하거나,
  //  authApi처럼 특정 조건을 걸어야 함.
  //  하지만 GET 요청엔 인자가 없으므로, 그냥 항상 Mock을 리턴하도록 임시 수정하거나,
  //  에러 발생 시 Mock을 리턴하도록 try-catch를 감쌀 수 있음.)

  // 간단히 항상 Mock 데이터를 반환하도록 수정 (테스트용)
  // 원래라면 토큰의 empCode를 디코딩해서 admin인지 확인해야 함.
  const mockMenus = [
    {
      lvl: 1,
      systemId: "SYS",
      pgmNo: "DASHBOARD",
      parentPgmNo: "ROOT",
      pgmName: "대시보드",
      sort: 1,
      useYn: "Y",
      path: "/pages/dashboard/Dashboard.tsx",
      lKey: "menu.dashboard",
    },
    {
      lvl: 1,
      systemId: "SYS",
      pgmNo: "ADMIN",
      parentPgmNo: "ROOT",
      pgmName: "관리자 기능",
      sort: 3,
      useYn: "Y",
    },
    {
      lvl: 2,
      systemId: "SYS",
      pgmNo: "PEOPLE_MNG",
      parentPgmNo: "ADMIN",
      pgmName: "인력관리",
      sort: 1,
      useYn: "Y",
    },
    {
      lvl: 3,
      systemId: "SYS",
      pgmNo: "PEOPLE_LIST",
      parentPgmNo: "PEOPLE_MNG",
      pgmName: "인력관리목록",
      sort: 1,
      useYn: "Y",
      path: "/pages/admin/people/PeopleListPage.tsx",
    },
    {
      lvl: 3,
      systemId: "SYS",
      pgmNo: "PEOPLE_REG",
      parentPgmNo: "PEOPLE_MNG",
      pgmName: "인력등록",
      sort: 2,
      useYn: "Y",
      path: "/pages/admin/people/new/PersonCreatePage.tsx",
    },
    {
      lvl: 2,
      systemId: "SYS",
      pgmNo: "PROJECT_MNG",
      parentPgmNo: "ADMIN",
      pgmName: "프로젝트관리",
      sort: 2,
      useYn: "Y",
      path: "/pages/admin/projects/ProjectsListPage.tsx",
    },
    {
      lvl: 2,
      systemId: "SYS",
      pgmNo: "CODE_MNG",
      parentPgmNo: "ADMIN",
      pgmName: "공통코드관리",
      sort: 3,
      useYn: "Y",
      path: "/pages/admin/codes/CommonCodePage.tsx",
    },
  ];

  const mockUserInfo = {
    empCode: "admin",
    empName: "System Admin",
    isAdmin: "Y",
  };

  // 1. Mock 리턴 (개발 편의를 위해 우선 적용)
  return {
    success: true,
    data: {
      menus: mockMenus,
      userInfo: mockUserInfo,
    },
  };

  // 2. 실제 API 호출 (필요 시 주석 해제)
  // return get<MainInitResponse>("/system/main/init");
};
