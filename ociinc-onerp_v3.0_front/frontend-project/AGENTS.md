# Frontend Project - AI Agent Context

## Module Context

React 19 + Vite 기반 SPA. Ant Design 6을 기본 디자인 시스템으로 사용하며, AG-Grid Enterprise로 고급 그리드 기능을 제공한다.

### Dependencies

- **UI Framework:** React 19, styled-components
- **State Management:** Zustand 5
- **Data Grid:** AG-Grid Enterprise 34.3
- **Design System:** Ant Design 6
- **HTTP Client:** Axios
- **Internationalization:** i18next
- **Build Tool:** Vite (rolldown-vite)

---

## Tech Stack & Constraints

### Path Aliases (vite.config.ts)

```typescript
"@"           -> "./src"
"@components" -> "./src/components"
"@pages"      -> "./src/pages"
"@store"      -> "./src/store"
"@apis"       -> "./src/apis"
"@utils"      -> "./src/utils"
"@config"     -> "./src/config"
"@constants"  -> "./src/constants"
"@form"       -> "./src/components/ui/form"
"@hooks"      -> "./src/hooks"
```

### ESLint Rules

- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn
- `react-refresh/only-export-components`: warn

---

## Implementation Patterns

### 페이지 생성 패턴

```
pages/[domain]/[module]/[ScreenName]/
├── [ScreenName].tsx
├── Header.tsx
├── Search.tsx
├── Grid.tsx (또는 MainGrid.tsx, DetailGrid.tsx)
└── index.ts
```

### 레이아웃 컴포넌트 선택 가이드

| Layout | 용도 |
|--------|------|
| SearchGridLayout | 검색 + 단일 그리드 |
| SearchTripleGridLayout | 검색 + 3개 그리드 |
| SplitLayout | 좌우 분할 (트리 + 상세) |
| ListDetailLayout | 좌측 리스트 + 우측 상세 |
| VerticalSplitLayout | 상하 분할 |

### 폼 컴포넌트 사용

```typescript
import { 
  FormInput, 
  FormSelect, 
  FormDatePicker,
  FormButton,
  ActionButtonGroup 
} from "@form";
```

### 스타일 파일 패턴 (.styles.ts)

```typescript
import styled from "styled-components";

export const Container = styled.div`
  // styles
`;

export const Header = styled.div`
  // styles
`;
```

---

## Testing Strategy

```bash
npm run type-check   # TypeScript 오류 검사
npm run lint         # ESLint 검사
npm run build        # 빌드 테스트
```

현재 별도 테스트 프레임워크 미설정. 빌드 및 타입 체크로 기본 검증.

---

## Local Golden Rules

### Do's

- 모든 컴포넌트에 `index.ts` barrel export 생성.
- 스타일은 `.styles.ts` 파일로 분리.
- 검색 조건 컴포넌트는 `Search.tsx`로 명명.
- 그리드 컴포넌트는 `FormAgGrid` 사용.
- 공통 버튼은 `ActionButtonGroup` 사용.

### Don'ts

- 인라인 스타일 및 CSS 클래스 사용 금지.
- 컴포넌트 파일 내 스타일 정의 금지.
- 동일 기능의 중복 컴포넌트 생성 금지.
- `useEffect` 내 무한 루프 주의.

---

## Context Map (Feature Routing)

- **[공통 UI 컴포넌트](./src/components/ui/AGENTS.md)** - Form, Layout, Feedback 컴포넌트.
- **[FCM 페이지](./src/pages/fcm/AGENTS.md)** - 재무회계 모듈 화면.
- **[System 페이지](./src/pages/system/AGENTS.md)** - 시스템 관리 화면.
- **[API 모듈](./src/apis/AGENTS.md)** - API 호출 로직.
- **[Store](./src/store/AGENTS.md)** - Zustand 상태 관리.
