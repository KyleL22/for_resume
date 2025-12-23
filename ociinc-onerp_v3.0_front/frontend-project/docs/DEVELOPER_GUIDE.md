# Components 개발자 가이드

프로젝트에서 사용하는 Form 컴포넌트와 공통 컴포넌트의 사용법을 안내합니다.

> **최신 업데이트**: 2024년 - `filterValues` 기능 추가 (FormSelect, FormRadioGroup, FormCheckbox)

## 목차

- [Form 컴포넌트](#form-컴포넌트)
  - [FormInput](#forminput)
  - [FormSearchInput](#formsearchinput)
  - [FormTextArea](#formtextarea)
  - [FormLabel](#formlabel)
  - [FormSelect](#formselect)
  - [FormDatePicker](#formdatepicker)
  - [FormRadioGroup](#formradiogroup)
  - [FormCheckbox](#formcheckbox)
  - [FormTree](#formtree)
  - [FormButton](#formbutton)
  - [SearchForm](#searchform)
  - [FormAgGrid](#formaggrid)
- [AG-Grid 유틸리티](#ag-grid-유틸리티)
  - [컬럼 생성 함수](#컬럼-생성-함수)
  - [그리드 핸들러 함수](#그리드-핸들러-함수)

---

## Form 컴포넌트

### FormInput

일반 입력 필드 컴포넌트입니다.

#### 필수 Props

- `name`: 폼 필드 이름
- `label`: 레이블 텍스트

#### 주요 Props

| Prop              | 타입                                     | 기본값       | 설명                                     |
| ----------------- | ---------------------------------------- | ------------ | ---------------------------------------- |
| `type`            | `string`                                 | `"text"`     | 입력 필드 타입 (아래 참조)               |
| `placeholder`     | `string`                                 | -            | 안내 문구                                |
| `rules`           | `Rule[]`                                 | -            | 검증 규칙 배열 (Ant Design Form Rule)    |
| `useModalMessage` | `boolean`                                | `true`       | 모달 메시지 사용 여부                    |
| `layout`          | `"vertical" \| "horizontal" \| "inline"` | `"vertical"` | 레이블과 입력 필드의 배치 방식           |
| `addonAfter`      | `string \| ReactNode`                    | -            | 입력 필드 뒤 텍스트 또는 ReactNode       |
| `max`             | `number`                                 | -            | 최대값/최대 글자 수                      |
| `min`             | `number`                                 | -            | 최소값 (type="number"일 때)              |
| `step`            | `number`                                 | -            | 증감 단위 (type="number"일 때)           |
| `mode`            | `"view" \| "edit"`                       | `"edit"`     | 모드 설정                                |
| `emptyText`       | `string`                                 | `"-"`        | View 모드에서 값이 없을 때 표시할 텍스트 |

#### type 속성 값

- `"text"`: 일반 텍스트 (기본값)
- `"number"`: 숫자 입력 (InputNumber 컴포넌트로 자동 전환, 천 단위 구분자 자동 적용)
- `"password"`: 비밀번호 입력
- `"email"`: 이메일 입력 (자동 검증)
- `"tel"` 또는 `"phone"`: 전화번호 입력 (자동 포맷팅)
- `"search"`: 검색 입력 (Search 컴포넌트로 자동 전환)
- `"residentNumber"`: 주민번호 (자동 검증 및 포맷팅)
- `"businessNumber"`: 사업자번호 (자동 검증 및 포맷팅)
- `"corporateNumber"`: 법인번호 (자동 검증 및 포맷팅)

#### 사용 예제

```tsx
// 기본 사용
<FormInput
  name="userName"
  label="사용자명"
  placeholder="사용자명을 입력하세요"
  rules={[
    {
      required: true,
      message: "사용자명을 입력해주세요!",
    },
  ]}
/>

// 숫자 입력
<FormInput
  name="amount"
  label="금액"
  type="number"
  placeholder="금액을 입력하세요"
  addonAfter="원"
  min={0}
  max={100000000}
  step={1000}
/>

// 이메일 입력
<FormInput
  name="email"
  label="이메일"
  type="email"
  placeholder="이메일을 입력하세요"
  rules={[
    {
      required: true,
      message: "이메일을 입력해주세요!",
    },
    {
      type: "email",
      message: "올바른 이메일 형식이 아닙니다!",
    },
  ]}
/>

// View 모드
<FormInput
  name="viewMode"
  label="조회 모드"
  mode="view"
  emptyText="데이터 없음"
/>
```

---

### FormSearchInput

검색 입력 필드 컴포넌트입니다. `FormInput`의 `type="search"`와 동일하지만 검색 버튼이 포함된 형태입니다.

#### 주요 Props

| Prop          | 타입                      | 기본값 | 설명                                 |
| ------------- | ------------------------- | ------ | ------------------------------------ |
| `name`        | `string`                  | 필수   | 폼 필드 이름                         |
| `label`       | `string`                  | 필수   | 레이블 텍스트                        |
| `placeholder` | `string`                  | -      | 안내 문구                            |
| `onSearch`    | `(value: string) => void` | -      | 검색 버튼 클릭 시 호출되는 함수      |
| `enterButton` | `boolean \| ReactNode`    | `true` | 검색 버튼 표시 여부 또는 커스텀 버튼 |
| `rules`       | `Rule[]`                  | -      | 검증 규칙 배열                       |

#### 사용 예제

```tsx
<FormSearchInput
  name="search"
  label="검색"
  placeholder="검색어를 입력하세요"
  onSearch={(value) => {
    console.log("검색어:", value);
  }}
/>

// 커스텀 버튼
<FormSearchInput
  name="searchWithButton"
  label="검색 (커스텀 버튼)"
  placeholder="검색어를 입력하세요"
  enterButton={<Button>검색</Button>}
/>
```

---

### FormTextArea

텍스트 영역 입력 필드 컴포넌트입니다.

#### 주요 Props

| Prop          | 타입                                              | 기본값       | 설명                           |
| ------------- | ------------------------------------------------- | ------------ | ------------------------------ |
| `name`        | `string`                                          | 필수         | 폼 필드 이름                   |
| `label`       | `string`                                          | 필수         | 레이블 텍스트                  |
| `placeholder` | `string`                                          | -            | 안내 문구                      |
| `rows`        | `number`                                          | `4`          | 기본 행 수                     |
| `autoSize`    | `boolean \| { minRows: number, maxRows: number }` | -            | 자동 크기 조절                 |
| `max`         | `number`                                          | -            | 최대 글자 수                   |
| `rules`       | `Rule[]`                                          | -            | 검증 규칙 배열                 |
| `layout`      | `"vertical" \| "horizontal" \| "inline"`          | `"vertical"` | 레이블과 입력 필드의 배치 방식 |

#### 사용 예제

```tsx
// 기본 사용
<FormTextArea
  name="description"
  label="설명"
  placeholder="설명을 입력하세요"
  rows={4}
  rules={[
    {
      required: true,
      message: "설명을 입력해주세요!",
    },
  ]}
/>

// 최대 글자 수 제한
<FormTextArea
  name="comment"
  label="댓글"
  placeholder="댓글을 입력하세요 (최대 200자)"
  rows={4}
  max={200}
/>

// 자동 크기 조절
<FormTextArea
  name="memo"
  label="메모"
  placeholder="메모를 입력하세요"
  autoSize={{ minRows: 3, maxRows: 6 }}
  max={500}
/>
```

---

### FormLabel

다국어 지원 라벨 컴포넌트입니다. 필수 표시와 설명 툴팁 기능을 제공합니다.

#### 주요 Props

| Prop        | 타입                  | 기본값  | 설명              |
| ----------- | --------------------- | ------- | ----------------- |
| `labelKey`  | `string`              | 필수    | 다국어 키         |
| `required`  | `boolean`             | `false` | 필수 표시 여부    |
| `className` | `string`              | -       | 추가 CSS 클래스명 |
| `style`     | `React.CSSProperties` | -       | 인라인 스타일     |

#### 주요 특징

- **다국어 지원**: i18next의 useTranslation을 사용하여 다국어 텍스트를 가져옵니다
- **필수 표시**: `required={true}`일 때 별표(\*) 표시
- **설명 툴팁**: `labelKey`에 `_desc`를 붙인 키로 설명 텍스트를 제공하면 물음표 아이콘이 표시되고, 클릭 시 툴팁으로 설명이 표시됩니다
- **Form.Item과 함께 사용**: Form.Item의 label prop에 사용할 수 있습니다

#### 사용 예제

```tsx
import { FormLabel } from "@components/ui/form";

// 기본 사용
<FormLabel labelKey="label.userName" />

// 필수 표시
<FormLabel labelKey="label.userName" required={true} />

// 설명 툴팁 (label.userName_desc 키로 설명 제공)
<FormLabel labelKey="label.email" required={true} />

// Form.Item과 함께 사용
<Form.Item
  label={<FormLabel labelKey="label.userName" required={true} />}
>
  <FormInput name="userName" label="" placeholder="이름을 입력하세요" />
</Form.Item>

// 스타일 커스터마이징
<FormLabel
  labelKey="label.custom"
  required={true}
  className="custom-label"
  style={{ color: "#1890ff" }}
/>
```

#### 다국어 설정 예시

```json
// i18n 리소스 파일 예시
{
  "label": {
    "userName": "사용자명",
    "userName_desc": "사용자의 이름을 입력하세요",
    "email": "이메일",
    "email_desc": "이메일 주소를 입력하세요"
  }
}
```

---

### FormSelect

선택 박스 컴포넌트입니다. 공통코드 API 연동을 지원합니다.

#### 주요 Props

| Prop              | 타입                                     | 기본값    | 설명                                            |
| ----------------- | ---------------------------------------- | --------- | ----------------------------------------------- |
| `name`            | `string`                                 | 필수      | 폼 필드 이름                                    |
| `label`           | `string`                                 | 필수      | 레이블 텍스트                                   |
| `options`         | `SelectOption[]`                         | -         | 정적 옵션 배열                                  |
| `comCodeParams`   | `CodeDetailParams`                       | -         | 공통코드 API 파라미터                           |
| `placeholder`     | `string`                                 | -         | 플레이스홀더                                    |
| `rules`           | `Rule[]`                                 | -         | 유효성 검사 규칙                                |
| `showSearch`      | `boolean`                                | 자동      | 검색 기능 활성화 (옵션 5개 이상 시 자동 활성화) |
| `filterOption`    | `function`                               | 자동      | 커스텀 필터링 함수                              |
| `filterValues`    | `(string \| number)[]`                   | -         | 필터링하여 숨길 값들의 배열                     |
| `showCodeInLabel` | `boolean`                                | `false`   | 코드와 이름 함께 표시                           |
| `valueKey`        | `keyof CodeDetail`                       | `"code"`  | value로 사용할 필드                             |
| `labelKey`        | `keyof CodeDetail`                       | `"name1"` | label로 사용할 필드                             |
| `mode`            | `"view" \| "edit"`                       | `"edit"`  | 모드 설정                                       |
| `layout`          | `"vertical" \| "horizontal" \| "inline"` | -         | 레이아웃 설정                                   |

#### 필터 기능

- **자동 검색 활성화**: 옵션이 5개 이상일 때 자동으로 검색 기능 활성화
- **value/label 모두 검색**: value와 label 모두에서 검색 가능
- **대소문자 구분 없음**: 검색 시 대소문자 구분하지 않음
- **공백 제거**: 입력값의 앞뒤 공백 자동 제거

#### 사용 예제

```tsx
// 정적 옵션
<FormSelect
  name="category"
  label="카테고리"
  placeholder="카테고리를 선택하세요"
  options={[
    { value: "work", label: "업무" },
    { value: "personal", label: "개인" },
    { value: "study", label: "스터디" },
  ]}
/>

// 공통코드 API 연동
<FormSelect
  name="module"
  label="모듈"
  placeholder="모듈을 선택하세요"
  comCodeParams={{
    module: "GL",
    enabledFlag: "Y",
    type: "ALWACC",
  }}
/>

// 코드와 이름 함께 표시 + 필터링
<FormSelect
  name="moduleWithCode"
  label="모듈 (코드 포함)"
  placeholder="모듈을 선택하세요"
  comCodeParams={{
    module: "GL",
    enabledFlag: "Y",
    type: "ALWACC",
  }}
  showCodeInLabel={true}
  filterValues={["1130101"]} // 특정 코드 값들 제외
/>

// 특정 값 필터링
<FormSelect
  name="status"
  label="상태"
  options={[
    { value: "active", label: "활성" },
    { value: "inactive", label: "비활성" },
    { value: "deleted", label: "삭제됨" },
  ]}
  filterValues={["deleted"]} // "삭제됨" 옵션 제외
/>

// 검색 기능 (옵션 5개 이상 시 자동 활성화)
<FormSelect
  name="status"
  label="상태"
  placeholder="상태를 선택하세요"
  options={[
    { value: "active", label: "활성" },
    { value: "inactive", label: "비활성" },
  ]}
  layout="horizontal"
  allowClear
  showSearch
/>

// 커스텀 필터링
<FormSelect
  name="customFilter"
  label="커스텀 필터"
  options={[...]}
  filterOption={(input, option) => {
    return String(option?.label).includes(input);
  }}
/>
```

---

### FormDatePicker

날짜 선택 컴포넌트입니다. 단일/범위/연동 날짜 선택을 지원합니다.

#### 주요 Props

| Prop              | 타입                                                 | 기본값         | 설명                                   |
| ----------------- | ---------------------------------------------------- | -------------- | -------------------------------------- |
| `name`            | `string`                                             | 필수           | 폼 필드 이름                           |
| `label`           | `string`                                             | 필수           | 레이블 텍스트                          |
| `placeholder`     | `string \| string[]`                                 | -              | 플레이스홀더 (범위 선택 시 배열)       |
| `format`          | `string`                                             | `"YYYY-MM-DD"` | 날짜 형식                              |
| `picker`          | `"date" \| "week" \| "month" \| "quarter" \| "year"` | `"date"`       | 선택기 타입                            |
| `showTime`        | `boolean`                                            | `false`        | 시간 선택 표시 여부                    |
| `isRange`         | `boolean`                                            | `false`        | 범위 선택 모드 활성화                  |
| `linkType`        | `"start" \| "end"`                                   | -              | 연동 타입 (start: 시작일, end: 종료일) |
| `linkedTo`        | `string`                                             | -              | 연동할 다른 필드명                     |
| `disabledDate`    | `(current: Dayjs) => boolean`                        | -              | 비활성화할 날짜를 결정하는 함수        |
| `rules`           | `Rule[]`                                             | -              | 유효성 검사 규칙                       |
| `mode`            | `"view" \| "edit"`                                   | `"edit"`       | 모드 설정                              |
| `layout`          | `"vertical" \| "horizontal" \| "inline"`             | -              | 레이아웃 설정                          |
| `useModalMessage` | `boolean`                                            | `true`         | 모달 메시지 사용 여부                  |

**참고**: Ant Design의 DatePicker와 RangePicker의 모든 props를 지원합니다.

#### 사용 예제

```tsx
// 기본 사용 (단일 날짜 선택)
<FormDatePicker
  name="singleDate"
  label="날짜"
  placeholder="날짜를 선택하세요"
/>

// 범위 날짜 선택
<FormDatePicker
  name="dateRange"
  label="기간"
  isRange={true}
  placeholder={["시작일", "종료일"]}
  rules={[
    { required: true, message: "기간을 선택해주세요!" },
  ]}
/>

// 연동 날짜 선택 (시작일과 종료일 자동 연동)
<FormDatePicker
  name="startDate"
  label="시작일"
  linkType="start"
  linkedTo="endDate"
  placeholder="시작일을 선택하세요"
/>
<FormDatePicker
  name="endDate"
  label="종료일"
  linkType="end"
  linkedTo="startDate"
  placeholder="종료일을 선택하세요"
  rules={[
    { required: true, message: "종료일을 선택해주세요!" },
  ]}
/>

// 날짜 형식 지정
<FormDatePicker
  name="dateWithFormat"
  label="날짜 (형식 지정)"
  placeholder="날짜를 선택하세요"
  format="YYYY-MM-DD"
/>

// 비활성화 날짜 포함
import dayjs from "dayjs";

<FormDatePicker
  name="dateWithDisabled"
  label="날짜 (비활성화 날짜 포함)"
  placeholder="날짜를 선택하세요"
  disabledDate={(current) => {
    // 오늘 이후 날짜 비활성화
    return current && current > dayjs().endOf("day");
  }}
/>

// View 모드
<FormDatePicker
  name="viewDate"
  label="조회 날짜"
  mode="view"
/>
```

---

### FormRadioGroup

라디오 버튼 그룹 컴포넌트입니다.

#### 주요 Props

| Prop            | 타입                                     | 기본값    | 설명                        |
| --------------- | ---------------------------------------- | --------- | --------------------------- |
| `name`          | `string`                                 | 필수      | 폼 필드 이름                |
| `label`         | `string`                                 | 필수      | 레이블 텍스트               |
| `options`       | `RadioOption[]`                          | -         | 정적 옵션 배열              |
| `comCodeParams` | `CodeDetailParams`                       | -         | 공통코드 API 파라미터       |
| `rules`         | `Rule[]`                                 | -         | 유효성 검사 규칙            |
| `filterValues`  | `(string \| number)[]`                   | -         | 필터링하여 숨길 값들의 배열 |
| `valueKey`      | `keyof CodeDetail`                       | `"code"`  | value로 사용할 필드         |
| `labelKey`      | `keyof CodeDetail`                       | `"name1"` | label로 사용할 필드         |
| `mode`          | `"view" \| "edit"`                       | `"edit"`  | 모드 설정                   |
| `layout`        | `"vertical" \| "horizontal" \| "inline"` | -         | 레이아웃 설정               |

#### 사용 예제

```tsx
// 정적 옵션
<FormRadioGroup
  name="status"
  label="상태"
  options={[
    { value: "active", label: "활성" },
    { value: "inactive", label: "비활성" },
  ]}
/>

// 공통코드 API 연동
<FormRadioGroup
  name="module"
  label="모듈"
  comCodeParams={{
    module: "GL",
    code: "MODULE",
  }}
/>

// 특정 값 필터링
<FormRadioGroup
  name="status"
  label="상태"
  options={[
    { value: "active", label: "활성" },
    { value: "inactive", label: "비활성" },
    { value: "deleted", label: "삭제됨" },
  ]}
  filterValues={["deleted"]} // "삭제됨" 옵션 제외
/>

// 레이아웃 옵션
<FormRadioGroup
  name="layout"
  label="레이아웃"
  options={[...]}
  layout="vertical" // "horizontal" (기본값) 또는 "vertical"
/>
```

---

### FormCheckbox

체크박스 컴포넌트입니다. 단일 체크박스와 그룹 체크박스를 모두 지원합니다.

#### FormCheckbox (단일)

단일 체크박스 컴포넌트입니다.

##### 주요 Props

| Prop              | 타입                         | 기본값 | 설명                                    |
| ----------------- | ---------------------------- | ------ | --------------------------------------- |
| `name`            | `string`                     | -      | 폼 필드 이름 (Form.Item과 함께 사용 시) |
| `label`           | `string`                     | -      | 레이블 텍스트                           |
| `rules`           | `Rule[]`                     | -      | 유효성 검사 규칙                        |
| `useModalMessage` | `boolean`                    | `true` | 모달 메시지 사용 여부                   |
| `onChange`        | `(checked: boolean) => void` | -      | 변경 이벤트 핸들러                      |

#### FormCheckbox.Group (그룹)

체크박스 그룹 컴포넌트입니다.

##### 주요 Props

| Prop              | 타입                                     | 기본값        | 설명                                    |
| ----------------- | ---------------------------------------- | ------------- | --------------------------------------- |
| `name`            | `string`                                 | -             | 폼 필드 이름 (Form.Item과 함께 사용 시) |
| `label`           | `string`                                 | -             | 레이블 텍스트                           |
| `options`         | `FormCheckboxOption[]`                   | -             | 정적 옵션 배열                          |
| `comCodeParams`   | `CodeDetailParams`                       | -             | 공통코드 API 파라미터                   |
| `filterValues`    | `(string \| number)[]`                   | -             | 필터링하여 숨길 값들의 배열             |
| `enableSelectAll` | `boolean`                                | `false`       | 전체 선택 기능 활성화                   |
| `selectAllLabel`  | `string`                                 | `"전체 선택"` | 전체 선택 라벨                          |
| `maxSelect`       | `number`                                 | -             | 최대 선택 개수                          |
| `columns`         | `number`                                 | -             | 그리드 레이아웃 컬럼 수                 |
| `rules`           | `Rule[]`                                 | -             | 유효성 검사 규칙                        |
| `mode`            | `"view" \| "edit"`                       | `"edit"`      | 모드 설정                               |
| `layout`          | `"vertical" \| "horizontal" \| "inline"` | -             | 레이아웃 설정                           |

#### 사용 예제

```tsx
// 단일 체크박스
<FormCheckbox
  name="agree"
  label="약관에 동의합니다"
  rules={[{ required: true }]}
/>

// 체크박스 그룹
<FormCheckbox.Group
  name="categories"
  label="카테고리"
  options={[
    { value: "work", label: "업무" },
    { value: "personal", label: "개인" },
    { value: "study", label: "스터디" },
  ]}
/>

// 전체 선택 기능
<FormCheckbox.Group
  name="permissions"
  label="권한"
  options={[...]}
  enableSelectAll={true}
  selectAllLabel="전체 선택"
/>

// 최대 선택 개수 제한
<FormCheckbox.Group
  name="tags"
  label="태그"
  options={[...]}
  maxSelect={3}
/>

// 그리드 레이아웃
<FormCheckbox.Group
  name="items"
  label="항목"
  options={[...]}
  columns={3}
/>

// 특정 값 필터링
<FormCheckbox.Group
  name="categories"
  label="카테고리"
  options={[
    { value: "work", label: "업무" },
    { value: "personal", label: "개인" },
    { value: "hidden", label: "숨김" },
  ]}
  filterValues={["hidden"]} // "숨김" 옵션 제외
/>

// 공통코드 API 연동
<FormCheckbox.Group
  name="modules"
  label="모듈"
  comCodeParams={{
    module: "GL",
    code: "MODULE",
  }}
/>
```

---

### FormTree

트리 선택 컴포넌트입니다.

#### 주요 Props

| Prop        | 타입               | 기본값   | 설명               |
| ----------- | ------------------ | -------- | ------------------ |
| `name`      | `string`           | 필수     | 폼 필드 이름       |
| `label`     | `string`           | 필수     | 레이블 텍스트      |
| `treeData`  | `DataNode[]`       | 필수     | 트리 데이터        |
| `multiple`  | `boolean`          | `false`  | 다중 선택 여부     |
| `checkable` | `boolean`          | `false`  | 체크박스 표시 여부 |
| `rules`     | `Rule[]`           | -        | 유효성 검사 규칙   |
| `mode`      | `"view" \| "edit"` | `"edit"` | 모드 설정          |

#### 사용 예제

```tsx
<FormTree
  name="category"
  label="카테고리"
  treeData={treeData}
  checkable={true}
  multiple={true}
/>
```

---

### FormButton

버튼 컴포넌트입니다. Form.Item으로 감싸져 있어 Form의 submit 이벤트와 연동됩니다.

#### 주요 Props

| Prop       | 타입                                                     | 기본값      | 설명               |
| ---------- | -------------------------------------------------------- | ----------- | ------------------ |
| `type`     | `"primary" \| "default" \| "dashed" \| "link" \| "text"` | `"primary"` | 버튼 타입          |
| `htmlType` | `"button" \| "submit" \| "reset"`                        | `"button"`  | HTML 버튼 타입     |
| `children` | `ReactNode`                                              | -           | 버튼 내용          |
| `onClick`  | `() => void`                                             | -           | 클릭 이벤트 핸들러 |

#### 사용 예제

```tsx
<FormButton type="primary" htmlType="submit">
  제출
</FormButton>

<FormButton type="default" onClick={handleReset}>
  초기화
</FormButton>
```

---

### SearchForm

검색 폼 컴포넌트입니다. 확장/축소 및 초기화 기능을 제공하며, 내부적으로 Form을 관리합니다.

#### 주요 Props

| Prop                 | 타입         | 기본값          | 설명                                   |
| -------------------- | ------------ | --------------- | -------------------------------------- |
| `loading`            | `boolean`    | `false`         | 로딩 상태                              |
| `showSearch`         | `boolean`    | `true`          | 조회 버튼 표시 여부                    |
| `showReset`          | `boolean`    | `true`          | 초기화 버튼 표시 여부                  |
| `showExpand`         | `boolean`    | `true`          | 확장 버튼 표시 여부                    |
| `onSearch`           | `() => void` | -               | 조회 버튼 클릭 시 호출되는 함수        |
| `onReset`            | `() => void` | -               | 초기화 버튼 클릭 시 호출되는 함수      |
| `onToggleExpand`     | `() => void` | -               | 확장/축소 토글 시 호출되는 함수        |
| `defaultExpanded`    | `boolean`    | `false`         | 기본 확장 상태                         |
| `visibleRows`        | `number`     | `2`             | 기본적으로 보여줄 줄 수                |
| `columnsPerRow`      | `number`     | `4`             | 한 줄에 표시할 컬럼 수                 |
| `resetFields`        | `string[]`   | -               | 초기화할 특정 필드명 배열              |
| `resetExpandOnReset` | `boolean`    | `false`         | 초기화 시 확장 상태도 초기화할지 여부  |
| `formName`           | `string`     | `"search-form"` | Form name 속성                         |
| `children`           | `ReactNode`  | -               | 검색 필드들 (FormInput, FormSelect 등) |

#### 주요 특징

- **내부 Form 관리**: 별도의 Form 인스턴스가 필요 없습니다
- **확장/축소 기능**: 많은 검색 필드가 있을 때 기본적으로 일부만 보여주고 확장 가능
- **자동 초기화**: onReset을 제공하지 않으면 자동으로 form 필드를 초기화합니다
- **Controlled/Uncontrolled 모드**: 확장 상태를 외부에서 제어할 수 있습니다

#### 사용 예제

```tsx
import { SearchForm, FormInput, FormSelect, FormDatePicker } from "@components/ui/form";

// 기본 사용
<SearchForm
  onSearch={() => {
    console.log("검색 실행");
  }}
  onReset={() => {
    console.log("초기화 실행");
  }}
>
  <FormInput
    name="searchName"
    label="이름"
    placeholder="이름을 입력하세요"
  />
  <FormSelect
    name="searchStatus"
    label="상태"
    placeholder="상태를 선택하세요"
    options={[
      { value: "active", label: "활성" },
      { value: "inactive", label: "비활성" },
    ]}
  />
  <FormDatePicker
    name="searchDate"
    label="날짜"
    placeholder="날짜를 선택하세요"
  />
</SearchForm>

// 커스텀 설정
<SearchForm
  visibleRows={1}
  columnsPerRow={3}
  resetFields={["name", "status"]}
  onSearch={() => {
    // 검색 로직
  }}
>
  <FormInput name="name" label="이름" />
  <FormSelect name="status" label="상태" options={[...]} />
</SearchForm>

// 버튼 표시 제어
<SearchForm
  showSearch={true}
  showReset={true}
  showExpand={false}
  loading={isLoading}
>
  {/* 필드들 */}
</SearchForm>

// Controlled 모드
const [expanded, setExpanded] = useState(false);

<SearchForm
  searchExpanded={expanded}
  onToggleExpand={() => setExpanded(!expanded)}
  onSearch={handleSearch}
>
  {/* 필드들 */}
</SearchForm>
```

---

### FormAgGrid

AG-Grid를 Form과 연동한 컴포넌트입니다.

#### 주요 Props

| Prop           | 타입                               | 기본값 | 설명                    |
| -------------- | ---------------------------------- | ------ | ----------------------- |
| `name`         | `string`                           | -      | 폼 필드 이름            |
| `rowData`      | `T[]`                              | 필수   | 그리드 데이터           |
| `columnDefs`   | `ColDef<T>[]`                      | 필수   | 컬럼 정의               |
| `onGridReady`  | `(params: GridReadyEvent) => void` | -      | 그리드 준비 완료 이벤트 |
| `gridOptions`  | `GridOptions`                      | -      | AG-Grid 옵션            |
| `styleOptions` | `AgGridStyleOptions`               | -      | 스타일 옵션             |

#### 사용 예제

```tsx
<FormAgGrid
  name="gridData"
  rowData={gridData}
  columnDefs={columnDefs}
  onGridReady={onGridReady}
  gridOptions={{
    rowSelection: "multiple",
  }}
/>
```

---

## AG-Grid 유틸리티

### 컬럼 생성 함수

AG-Grid 컬럼을 쉽게 생성할 수 있는 유틸리티 함수들입니다.

#### 함수 목록

- `createCheckboxColumn<T>(field, headerName, width)`: 체크박스 컬럼 생성
- `createTextColumn<T>(field, headerName, width, flex)`: 텍스트 컬럼 생성
- `createSelectColumn<T>(field, headerName, options, width)`: 셀렉트 컬럼 생성
- `createDateColumn<T>(field, headerName, width, minDate, maxDate, formatter)`: 날짜 컬럼 생성
- `createNumberColumn<T>(field, headerName, width, min, max, formatter)`: 숫자 컬럼 생성
- `createTextAreaColumn<T>(field, headerName, width, maxLength)`: 텍스트 영역 컬럼 생성
- `createCheckboxColumnEditable<T>(field, headerName, width)`: 편집 가능한 체크박스 컬럼 생성

#### 사용 예제

```tsx
import {
  createCheckboxColumn,
  createTextColumn,
  createSelectColumn,
  createDateColumn,
  createNumberColumn,
  createTextAreaColumn,
  createCheckboxColumnEditable,
  formatCurrency,
  formatDateKorean,
} from "@utils/agGridUtils";

const columnDefs: ColDef<MyDataType>[] = [
  // 체크박스 컬럼
  createCheckboxColumn<MyDataType>("id", "ID", 80),

  // 텍스트 컬럼
  createTextColumn<MyDataType>("name", "이름", undefined, 1),

  // 셀렉트 컬럼
  createSelectColumn<MyDataType>(
    "category",
    "카테고리",
    ["개발", "디자인", "기획"],
    150
  ),

  // 날짜 컬럼
  createDateColumn<MyDataType>(
    "startDate",
    "시작일",
    150,
    new Date(2020, 0, 1),
    new Date(2030, 11, 31),
    formatDateKorean
  ),

  // 숫자 컬럼
  createNumberColumn<MyDataType>(
    "amount",
    "금액",
    150,
    0,
    undefined,
    formatCurrency
  ),

  // 텍스트 영역 컬럼
  createTextAreaColumn<MyDataType>("description", "설명", undefined, 200),

  // 편집 가능한 체크박스 컬럼
  createCheckboxColumnEditable<MyDataType>("isActive", "활성화", 120),
];
```

---

### 그리드 핸들러 함수

그리드 이벤트를 처리하는 유틸리티 함수들입니다.

#### 함수 목록

##### createGridReadyHandlerRef<T>(gridApiRef)

그리드 준비 완료 핸들러를 생성합니다.

**파라미터:**

- `gridApiRef`: GridApi ref 객체

**반환값:**

- `onGridReady` prop에 사용할 수 있는 핸들러 함수

##### addNewRow<T>(data, createRow, setData, gridApi, focusField)

새 행을 추가합니다.

**파라미터:**

- `data`: 현재 그리드 데이터 배열
- `createRow`: 새 행 생성 함수 `(newId) => T`
- `setData`: 데이터 업데이트 함수
- `gridApi`: GridApi 인스턴스
- `focusField`: 포커스할 필드명 (선택)

##### deleteSelectedRows<T>(gridApi, data, setData, getId, onNoSelection)

선택된 행을 삭제합니다.

**파라미터:**

- `gridApi`: GridApi 인스턴스
- `data`: 현재 그리드 데이터 배열
- `setData`: 데이터 업데이트 함수
- `getId`: 행 ID 추출 함수 `(row) => id`
- `onNoSelection`: 선택된 행이 없을 때 콜백 (선택)

#### 사용 예제

```tsx
import { useRef } from "react";
import { GridApi } from "ag-grid-community";
import {
  createGridReadyHandlerRef,
  addNewRow,
  deleteSelectedRows,
} from "@utils/agGridUtils";

const MyComponent = () => {
  const gridApiRef = useRef<GridApi | null>(null);
  const [gridData, setGridData] = useState<MyDataType[]>([]);

  // 그리드 준비 완료 핸들러
  const onGridReady = createGridReadyHandlerRef<MyDataType>(gridApiRef);

  // 새 행 추가
  const handleAddRow = () => {
    addNewRow(
      gridData,
      (newId) => ({
        id: newId as number,
        name: `새 항목 ${newId}`,
        amount: 0,
      }),
      setGridData,
      gridApiRef.current,
      "name" // 포커스할 필드
    );
  };

  // 선택된 행 삭제
  const handleDeleteRows = () => {
    deleteSelectedRows(
      gridApiRef.current,
      gridData,
      setGridData,
      (row) => row.id, // ID 추출 함수
      () => {
        showWarning("삭제할 행을 선택해주세요.");
      }
    );
  };

  return (
    <>
      <Space>
        <Button onClick={handleAddRow}>행 추가</Button>
        <Button onClick={handleDeleteRows}>선택 행 삭제</Button>
      </Space>
      <FormAgGrid
        rowData={gridData}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        gridOptions={{
          rowSelection: "multiple",
        }}
      />
    </>
  );
};
```

---

## 공통 기능

### 모달 메시지 vs 인라인 메시지

대부분의 Form 컴포넌트는 `useModalMessage` prop을 통해 검증 실패 시 메시지 표시 방식을 선택할 수 있습니다.

- `useModalMessage={true}` (기본값): 필수 입력 검증 실패 시 모달로 표시
- `useModalMessage={false}`: 인라인 메시지로 표시

### View 모드

모든 Form 컴포넌트는 `mode="view"`를 통해 읽기 전용 모드로 표시할 수 있습니다.

```tsx
<FormInput
  name="readonly"
  label="조회 모드"
  mode="view"
  emptyText="데이터 없음"
/>
```

### Layout 옵션

레이블과 입력 필드의 배치 방식을 선택할 수 있습니다.

- `layout="vertical"` (기본값): 레이블이 위에 배치
- `layout="horizontal"`: 레이블이 왼쪽에 배치
- `layout="inline"`: 인라인 배치

### 필터링 기능 (filterValues)

FormSelect, FormRadioGroup, FormCheckbox 컴포넌트는 `filterValues` prop을 통해 특정 값들을 옵션 목록에서 제외할 수 있습니다.

```tsx
// 특정 값들을 필터링하여 숨기기
<FormSelect
  name="status"
  label="상태"
  options={[
    { value: "active", label: "활성" },
    { value: "inactive", label: "비활성" },
    { value: "deleted", label: "삭제됨" },
  ]}
  filterValues={["deleted", "inactive"]} // 여러 값 필터링 가능
/>
```

**사용 사례:**

- 삭제된 항목 숨기기
- 비활성화된 옵션 제외
- 권한에 따른 옵션 필터링
- 동적 필터링 (상태에 따라 다른 옵션 표시)

---

## 참고

- 실제 사용 예제는 `src/pages/sample/sample1/Sample1.tsx` 파일을 참고하세요.
- 각 컴포넌트의 상세 구현은 `src/components/ui/form` 디렉토리를 확인하세요.
