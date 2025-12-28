/**
 * Admin 관련 타입 정의
 */

/**
 * 인력 정보 (Person)
 */
export interface Person {
    id?: string;             // AG-Grid용 ID
    personId: string;       // 관리번호
    name: string;           // 성명
    birthDate: string;      // 생년월일 (YYYY-MM-DD)
    gender: string;         // 성별 (GENDER)
    category: string;       // 구분 (PERSON_CATEGORY)
    phone: string;          // 연락처
    techGrade: string;      // 기술자등급 (TECH_GRADE)
    careerYears: number;    // 경력 (년)
    education: string;      // 최종학력 (EDUCATION)
    recentProject: string;  // 최근/수행 중 프로젝트
    status: string;         // 현재상태 (PERSON_STATUS)
    address?: string;       // 주소
    company?: string;       // 회사명
    certifications?: string;// 자격증
    position?: string;      // 직위 (POSITION)
    alias?: string;         // 익명 (프로필용)
}

/**
 * 프로젝트 실적 정보 (PersonProjectHistory)
 */
export interface PersonProjectHistory {
    id: string;             // 내부 ID
    personId: string;       // 인력 관리번호
    seq: number;            // 순번
    projectName: string;    // 사업명
    period: string;         // 참여기간
    role: string;           // 담당업무
    client: string;         // 발주처
    techStack: string;      // 적용기술
}

/**
 * 프로젝트 정보 (Project)
 */
export interface Project {
    id?: string;             // AG-Grid용 ID
    projectId: string;      // 프로젝트번호
    projectName: string;    // 프로젝트명
    startDate: string;      // 시작일자
    endDate: string;        // 종료일자
    client: string;         // 발주처
    industry: string;       // 업종 (INDUSTRY)
    contractor: string;     // 계약처
    type: string;           // 운영/개발 (PROJECT_TYPE)
    parentProjectId?: string;// (원)프로젝트번호
    owner: string;          // 담당자
}

/**
 * 프로젝트 투입 현황 (ProjectStaffing)
 */
export interface ProjectStaffing {
    id: string;             // 내부 ID
    projectId: string;      // 프로젝트번호
    personId: string;       // 관리번호
    name: string;           // 성명
    joinDate: string;       // 투입일
    leaveDate: string;      // 종료일
    staffingStatus: string; // 상태 (STAFFING_STATUS)
    role: string;           // 역할 (ROLE)
    skill: string;          // 기술 (SKILL)
    skillDetail?: string;   // 기타 세부기술
    rating: string;         // 평가 (RATING)
    comment?: string;       // 의견
    ratingDate?: string;    // 평가일자
}

/**
 * 공통코드 그룹 (CommonCodeGroup)
 */
export interface CommonCodeGroup {
    id?: string;             // AG-Grid용 ID
    groupId: string;        // 그룹ID
    groupName: string;      // 그룹명
    groupDesc?: string;     // 그룹설명
    useYn: 'Y' | 'N';       // 사용여부
    createdAt: string;      // 생성일시
    updatedAt: string;      // 변경일시
    updatedBy: string;      // 변경자ID
}

/**
 * 공통코드 아이템 (CommonCodeItem)
 */
export interface CommonCodeItem {
    id?: string;             // AG-Grid용 ID
    groupId: string;        // 그룹ID
    codeId: string;         // 코드ID
    codeName: string;       // 코드명
    codeValue: string;      // 코드값
    sortOrder: number;      // 정렬순서
    useYn: 'Y' | 'N';       // 사용여부
    createdAt: string;      // 생성일시
    updatedAt: string;      // 변경일시
    updatedBy: string;      // 변경자ID
}
