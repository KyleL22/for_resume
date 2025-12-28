/**
 * 거래처등록 화면에서 사용하는 Select 옵션 상수
 * TODO: 추후 DB 조회로 변경 예정
 */

/**
 * Select 옵션 타입 정의
 */
export type SelectOption = {
  value: string;
  label: string;
};

// 거래처구분 옵션 (dlt_resCustomerCode)
export const CUSTNO_GB_OPTIONS: SelectOption[] = [
  { value: "C", label: "매출+매입" },
  { value: "B", label: "매입" },
  { value: "A", label: "매출" },
] as SelectOption[];

// 주거래사업장 옵션 (dlt_resAllOrgId)
export const ORG_ID_OPTIONS: SelectOption[] = [
  { value: "HO", label: "본사" },
  { value: "%", label: "전체" },
] as SelectOption[];

// 지급조건 옵션 (dlt_resStlmTermAp)
export const STLM_TERM_OPTIONS: SelectOption[] = [
  { value: "30 Days After Invoice date", label: "30 Days After Transfer" },
  { value: "7 Days After Invoice date", label: "7 Days After Transfer" },
  { value: "At sight", label: "At sight" },
  { value: "계약일/요청일", label: "계약일/요청일" },
  { value: "계약일/요청일 ", label: "계약일/요청일 " },
  { value: "급여_익월25일", label: "급여_익월25일" },
  { value: "당사조건_10일(용역비 등)", label: "당사조건_10일(용역비 등)" },
  { value: "당사조건_익월20일", label: "당사조건_익월20일" },
  { value: "월마감. 당월20일", label: "월마감. 당월20일" },
  { value: "월마감. 당월말일", label: "월마감. 당월말일" },
  { value: "월마감.익월말일", label: "월마감.익월말일" },
  { value: "전액상계", label: "전액상계" },
  { value: "카드결제_법인계좌", label: "카드결제_법인계좌" },
] as SelectOption[];

// 수금조건 옵션 (dlt_resStlmTermAr)
export const STLM_TERM_AR_OPTIONS: SelectOption[] = [
  { value: "LC at sight", label: "LC at sight" },
  { value: "월마감.익월15일", label: "월마감.익월15일" },
  { value: "월마감.익월25일", label: "월마감.익월25일" },
  { value: "월마감.익익월10일", label: "월마감.익익월10일" },
] as SelectOption[];

// 타입 정의 (옵션 값 타입 추출)
export type CustnoGbValue = "A" | "B" | "C" | "";
export type OrgIdValue = "HO" | "%" | "";
export type StlmTermValue =
  | "30 Days After Invoice date"
  | "7 Days After Invoice date"
  | "At sight"
  | "계약일/요청일"
  | "계약일/요청일 "
  | "급여_익월25일"
  | "당사조건_10일(용역비 등)"
  | "당사조건_익월20일"
  | "월마감. 당월20일"
  | "월마감. 당월말일"
  | "월마감.익월말일"
  | "전액상계"
  | "카드결제_법인계좌"
  | "";
export type StlmTermArValue =
  | "LC at sight"
  | "월마감.익월15일"
  | "월마감.익월25일"
  | "월마감.익익월10일"
  | "";
export const CREDIT_OPTIONS: SelectOption[] = [
  { value: "1", label: "High" },
  { value: "2", label: "Middle" },
  { value: "3", label: "Low" },
] as SelectOption[];
