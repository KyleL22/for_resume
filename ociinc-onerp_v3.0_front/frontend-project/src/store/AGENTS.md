# Store (Zustand) - AI Agent Context

## Module Context

Zustand를 사용한 클라이언트 상태 관리. 각 도메인/화면별로 독립적인 store를 생성하여 관리한다.

---

## Directory Structure

```
store/
├── authStore.ts              # 인증 상태
├── uiStore.ts                # UI 상태 (사이드바, 테마 등)
├── slipPostStore.ts          # 전표 등록 화면 상태
├── AccnutMngCodeRegistStore.ts  # 관리항목 등록 상태
├── bcncRegistStore.ts        # 거래처 등록 상태
├── fcm/                      # FCM 도메인 stores
│   └── ...
└── system/                   # System 도메인 stores
    └── ...
```

---

## Implementation Patterns

### 기본 Store 패턴

```typescript
// store/slipPostStore.ts
import { create } from "zustand";

interface SlipPostState {
  // 상태
  searchParams: SearchParams;
  rowData: SlipData[];
  selectedRow: SlipData | null;
  isLoading: boolean;
  isModified: boolean;

  // 액션
  setSearchParams: (params: Partial<SearchParams>) => void;
  setRowData: (data: SlipData[]) => void;
  setSelectedRow: (row: SlipData | null) => void;
  setLoading: (loading: boolean) => void;
  setModified: (modified: boolean) => void;
  reset: () => void;
}

const initialState = {
  searchParams: { fromDate: "", toDate: "" },
  rowData: [],
  selectedRow: null,
  isLoading: false,
  isModified: false,
};

export const useSlipPostStore = create<SlipPostState>((set) => ({
  ...initialState,

  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  setRowData: (data) => set({ rowData: data }),
  setSelectedRow: (row) => set({ selectedRow: row }),
  setLoading: (loading) => set({ isLoading: loading }),
  setModified: (modified) => set({ isModified: modified }),
  reset: () => set(initialState),
}));
```

### 컴포넌트에서 사용

```typescript
import { useSlipPostStore } from "@store/slipPostStore";

const Component = () => {
  const { rowData, setRowData, isLoading } = useSlipPostStore();
  // ...
};
```

### Selector 패턴 (성능 최적화)

```typescript
// 특정 상태만 구독하여 불필요한 리렌더링 방지
const rowData = useSlipPostStore((state) => state.rowData);
const setRowData = useSlipPostStore((state) => state.setRowData);
```

---

## Naming Conventions

- Store 파일: `[screenName]Store.ts`
- Hook 이름: `use[ScreenName]Store`
- State 인터페이스: `[ScreenName]State`

---

## Local Golden Rules

### Do's

- 초기 상태(initialState) 별도 정의.
- reset 함수로 상태 초기화 기능 제공.
- Selector 패턴으로 필요한 상태만 구독.
- 비동기 로직은 컴포넌트나 커스텀 훅에서 처리.

### Don'ts

- Store 내 API 호출 금지 (액션만 정의).
- 전역 상태로 모든 것을 관리하지 않음 (로컬 상태 우선).
- 중첩된 객체 직접 변경 금지 (spread 사용).
