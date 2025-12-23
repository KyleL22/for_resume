# ONERP v3.0 - AI Agent Context Root

## Project Context

ONERP는 Enterprise Resource Planning 시스템으로, Spring Boot 기반의 백엔드 마이크로서비스와 React/Vite 기반의 프론트엔드로 구성된 모노레포 프로젝트이다.

### Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 5.9, Vite (rolldown-vite), Zustand, styled-components, AG-Grid Enterprise, Ant Design 6, i18next |
| Backend | Java 21, Spring Boot 3.3.1, Gradle Multi-module |
| Architecture | Microservices (gateway, auth, fcm, system services) |

### Operational Commands

**Frontend (./frontend-project):**
```bash
npm run dev          # 개발 서버 실행 (포트 5173)
npm run build        # 프로덕션 빌드
npm run type-check   # TypeScript 타입 검사
npm run lint         # ESLint 검사
npm run lint:fix     # ESLint 자동 수정
```

**Backend (./backend-project):**
```bash
./gradlew build           # 전체 빌드
./gradlew :fcm-service:bootRun   # FCM 서비스 실행
./gradlew :auth-service:bootRun  # Auth 서비스 실행
./gradlew test            # 전체 테스트 실행
```

---

## Golden Rules

### Immutable Constraints

1. **API 키 하드코딩 금지:** 모든 환경변수는 `.env`, `.env.local` 파일을 통해 관리. `VITE_` 접두사 필수.
2. **타입 안정성:** `any` 타입 사용 금지. 모든 컴포넌트와 함수에 명시적 타입 정의 필수.
3. **import 경로:** 절대 경로 alias 사용 필수 (`@/`, `@components/`, `@apis/` 등).
4. **공통 컴포넌트 우선:** `components/ui/form`의 공통 컴포넌트를 우선 사용. 신규 생성 전 기존 컴포넌트 확인 필수.

### Do's

- 모든 스타일은 `styled-components`로 작성. `.styles.ts` 파일로 분리.
- 컴포넌트는 barrel export 패턴 사용 (`index.ts` 필수 생성).
- API 호출은 `apis/` 폴더의 도메인별 모듈 사용.
- 상태 관리는 Zustand store 사용.
- 한글 레이블은 i18next를 통해 다국어 지원.

### Don'ts

- 직접적인 `axios.get/post` 호출 금지. 반드시 `apis/` 모듈 사용.
- 인라인 스타일 사용 금지.
- `node_modules` 패키지 직접 수정 금지.
- 테스트 없이 복잡한 비즈니스 로직 커밋 금지.

---

## Standards & References

### Coding Conventions

**Naming:**
- 컴포넌트: PascalCase (예: `SlipPost.tsx`)
- 스타일 파일: `[Component].styles.ts`
- store: camelCase (예: `slipPostStore.ts`)
- API 모듈: camelCase (예: `slipApi.ts`)

**Directory Structure (Feature-based):**
```
pages/[domain]/[module]/[ScreenName]/
├── [ScreenName].tsx       # 메인 컴포넌트
├── Header.tsx             # 헤더 섹션
├── Search.tsx             # 검색 조건
├── Grid.tsx               # 그리드 영역
└── index.ts               # barrel export
```

### Git Strategy

- **Branch:** `feature/[JIRA-ID]-brief-description`
- **Commit Format:** `[TYPE] 간결한 설명 (JIRA-ID)`
  - TYPE: feat, fix, refactor, style, docs, test, chore
- **PR:** 코드 리뷰 필수, lint 통과 확인

### Maintenance Policy

규칙과 실제 코드 사이에 괴리가 발생하면, 해당 규칙의 업데이트를 제안하라.
새로운 패턴이나 컨벤션이 확립되면 이 문서에 반영하라.

---

## Context Map (Action-Based Routing)

- **[Frontend 전체 (React/Vite)](./frontend-project/AGENTS.md)** - UI 컴포넌트, 페이지, 스타일링 작업 시.
- **[Backend 전체 (Spring Boot)](./backend-project/AGENTS.md)** - API, 서비스, 도메인 로직 수정 시.
- **[공통 UI 컴포넌트](./frontend-project/src/components/ui/AGENTS.md)** - FormInput, FormSelect, AgGrid 등 공통 컴포넌트 작업 시.
- **[API 모듈](./frontend-project/src/apis/AGENTS.md)** - API 호출 로직 추가/수정 시.
- **[상태 관리](./frontend-project/src/store/AGENTS.md)** - Zustand store 작업 시.
- **[FCM 서비스 (BE)](./backend-project/fcm-service/AGENTS.md)** - 재무회계 도메인 백엔드 로직 수정 시.
