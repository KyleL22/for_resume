# UI Components - AI Agent Context

## Module Context

프로젝트 전역에서 사용되는 공통 UI 컴포넌트 모음. 모든 페이지에서 일관된 UX를 제공하기 위해 이 컴포넌트들을 재사용해야 한다.

---

## Component Categories

### Form Components (`./form/`)

| Component | 용도 | Import |
|-----------|------|--------|
| FormInput | 텍스트 입력 | `import { FormInput } from "@form"` |
| FormInputNumber | 숫자 입력 | `import { FormInputNumber } from "@form"` |
| FormSearchInput | 검색 입력 (돋보기 아이콘) | `import { FormSearchInput } from "@form"` |
| FormTextArea | 멀티라인 텍스트 | `import { FormTextArea } from "@form"` |
| FormSelect | 드롭다운 선택 | `import { FormSelect } from "@form"` |
| FormDatePicker | 날짜 선택 | `import { FormDatePicker } from "@form"` |
| FormRadioGroup | 라디오 버튼 그룹 | `import { FormRadioGroup } from "@form"` |
| FormCheckbox | 체크박스 | `import { FormCheckbox } from "@form"` |
| FormButton | 기본 버튼 | `import { FormButton } from "@form"` |
| ActionButtonGroup | 액션 버튼 그룹 (저장, 조회 등) | `import { ActionButtonGroup } from "@form"` |
| FormLabel | 라벨 | `import { FormLabel } from "@form"` |
| FormTree | 트리 컴포넌트 | `import { FormTree } from "@form"` |
| FormAgGrid | AG-Grid 래퍼 | `import { FormAgGrid } from "@form"` |
| SearchForm | 검색 버튼 그룹 | `import { SearchForm } from "@form"` |
| DataForm | 데이터 폼 테이블 | `import { DataForm } from "@form"` |
| CardGridList | 카드 그리드 리스트 | `import { CardGridList } from "@form"` |

### Layout Components (`./layout/`)

| Component | 용도 |
|-----------|------|
| SearchGridLayout | 검색 조건 + 단일 그리드 |
| SearchTripleGridLayout | 검색 + 3개 그리드 |
| SearchGridSaveLayout | 검색 + 그리드 + 저장 영역 |
| SplitLayout | 좌우 분할 레이아웃 |
| ListDetailLayout | 리스트 + 상세 레이아웃 |
| VerticalLayout | 세로 배치 |
| VerticalSplitLayout | 상하 분할 |
| TwoGridLayout | 2개 그리드 배치 |

### Feedback Components (`./feedback/`)

토스트, 모달, 알림 등 사용자 피드백 컴포넌트.

---

## Usage Patterns

### FormAgGrid 사용

```typescript
import { FormAgGrid } from "@form";

<FormAgGrid
  rowData={data}
  columnDefs={columnDefs}
  onRowClicked={handleRowClick}
  onCellValueChanged={handleCellChange}
/>
```

### ActionButtonGroup 사용

```typescript
import { ActionButtonGroup } from "@form";

<ActionButtonGroup
  buttons={['search', 'save', 'add', 'delete', 'excel']}
  onButtonClick={(type) => {
    if (type === 'search') handleSearch();
    if (type === 'save') handleSave();
  }}
/>
```

### SearchForm 사용

```typescript
import { SearchForm } from "@form";

<SearchForm
  onSearch={handleSearch}
  onReset={handleReset}
/>
```

---

## Local Golden Rules

### Do's

- 새 컴포넌트 추가 시 `index.ts`에 export 추가.
- Props 타입은 명시적으로 정의 (`type Props = {...}`).
- styled-components로 스타일 분리 (`.styles.ts`).
- 기존 theme 토큰 활용 (`theme.colors.*`).

### Don'ts

- 같은 기능의 중복 컴포넌트 생성 금지.
- Props drilling 대신 Context 또는 Zustand 사용.
- 인라인 스타일 사용 금지.
- 외부 라이브러리 직접 사용 대신 래퍼 컴포넌트 생성.
