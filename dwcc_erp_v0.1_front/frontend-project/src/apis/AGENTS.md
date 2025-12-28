# API Modules - AI Agent Context

## Module Context

프론트엔드에서 백엔드 API를 호출하기 위한 모듈. Axios 인스턴스를 기반으로 도메인별로 구조화되어 있다.

---

## Directory Structure

```
apis/
├── auth/          # 인증 관련 API
├── fcm/           # 재무회계 API (가장 큰 도메인)
├── system/        # 시스템 관리 API
├── comCode/       # 공통코드 API
├── comPopup/      # 공통 팝업 API
├── common/        # 공통 유틸리티
├── menu/          # 메뉴 API
├── main/          # 메인 화면 API
├── hr/            # 인사 API
├── ma/            # 자재관리 API
├── po/            # 구매 API
├── tr/            # 거래처 API
└── index.ts       # Barrel export
```

---

## Implementation Patterns

### API 모듈 생성 패턴

```typescript
// apis/fcm/slip/slipApi.ts
import axios from "axios";

const BASE_URL = "/api/v1/fcm/slip";

export interface SlipSearchParams {
  fromDate: string;
  toDate: string;
  slipNo?: string;
}

export interface SlipData {
  slipNo: string;
  slipDate: string;
  // ...
}

export const slipApi = {
  // 목록 조회
  getList: async (params: SlipSearchParams): Promise<SlipData[]> => {
    const response = await axios.get(`${BASE_URL}/list`, { params });
    return response.data;
  },

  // 단건 조회
  getById: async (slipNo: string): Promise<SlipData> => {
    const response = await axios.get(`${BASE_URL}/${slipNo}`);
    return response.data;
  },

  // 저장
  save: async (data: SlipData): Promise<void> => {
    await axios.post(`${BASE_URL}/save`, data);
  },

  // 삭제
  delete: async (slipNo: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${slipNo}`);
  },
};
```

### 사용 예시 (컴포넌트에서)

```typescript
import { slipApi } from "@apis/fcm/slip/slipApi";

const handleSearch = async () => {
  try {
    const data = await slipApi.getList({ fromDate, toDate });
    setRowData(data);
  } catch (error) {
    console.error("조회 실패:", error);
  }
};
```

---

## URL Patterns

- 조회: `GET /api/v1/[domain]/[module]/list`
- 단건 조회: `GET /api/v1/[domain]/[module]/{id}`
- 저장: `POST /api/v1/[domain]/[module]/save`
- 삭제: `DELETE /api/v1/[domain]/[module]/{id}`

---

## Local Golden Rules

### Do's

- 모든 API 함수에 반환 타입 명시.
- 요청/응답 DTO 타입 정의.
- BASE_URL 상수 사용.
- try-catch로 에러 핸들링.

### Don'ts

- 컴포넌트에서 axios 직접 호출 금지.
- API URL 하드코딩 금지 (상수 사용).
- 응답 데이터 타입 `any` 사용 금지.
