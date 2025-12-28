import React, { useCallback, useMemo } from "react";
//import { Form, Checkbox, Typography } from "antd";
import {
  DataForm,
  FormInput,
  FormInputNumber,
  FormSelect,
  FormRadioGroup,
} from "@components/ui/form";
import type {
  TableField,
  SupportedActionButtonType
} from "@components/ui/form";

// 입력 컴포넌트들
interface InputProps {
  name: string;
  placeholder?: string;
  mode?: "view" | "edit";
}

interface SelectInputProps extends InputProps {
  options?: Array<{ value: string; label: string }>;
  comCodeParams?: {
    module: string;
    type: string;
    enabledFlag?: string;
  };
}

interface SearchInputProps extends InputProps {
  onSearch?: (value: string) => void;
  showReadOnlyBoxName?: string;
}

// 체크박스 입력 컴포넌트 (Y/N 값을 boolean으로 변환)
// const CheckboxInput: InputComponentType = (props) => {
//   const { name, mode } = props as InputComponentProps;

//   return <FormCheckbox name={name} label="" />;
// };

// const TextAreaInput = ({
//   name,
//   placeholder,
//   rows = 3,
//   mode = "edit",
// }: TextAreaInputProps) => (
//   <FormTextArea
//     name={name}
//     label=""
//     placeholder={placeholder}
//     rows={rows}
//     mode={mode}
//   />
// );

// DataForm의 inputComponent가 받는 props 타입 정의
type InputComponentProps = {
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  options?: Array<{ value: string; label: string }>;
  onSearch?: (value: string) => void;
  showReadOnlyBoxName?: string;
  [key: string]: unknown;
};

type InputComponentType = NonNullable<TableField["inputComponent"]>;

const TextInput: InputComponentType = (props) => {
  return (
    <FormInput
      {...(props as React.ComponentProps<typeof FormInput>)}
      label=""
    />
  );
};

// 검색 입력 컴포넌트
const SearchInput: InputComponentType = (props) => {
  const {
    name,
    placeholder,
    mode,
    onSearch,
    showReadOnlyBoxName,
    value,
    onChange,
    options,
    ...restProps
  } = props as SearchInputProps & InputComponentProps;

  if (mode === "view") {
    if (showReadOnlyBoxName) {
      return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <FormInput
              name={name}
              label=""
              mode={mode}
              {...(restProps as Omit<
                React.ComponentProps<typeof FormInput>,
                "name" | "mode" | "type"
              >)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormInput
              name={showReadOnlyBoxName}
              label=""
              mode={mode}
              {...(restProps as Omit<
                React.ComponentProps<typeof FormInput>,
                "name" | "mode" | "type"
              >)}
            />
          </div>
        </div>
      );
    }
    return (
      <FormInput
        name={name}
        label=""
        mode={mode}
        {...(restProps as Omit<
          React.ComponentProps<typeof FormInput>,
          "name" | "mode" | "type"
        >)}
      />
    );
  }

  return (
    <FormInput
      type="search"
      name={name}
      label=""
      placeholder={placeholder || "검색어를 입력하세요"}
      layout="horizontal"
      size="small"
      mode={mode}
      showReadOnlyBoxName={showReadOnlyBoxName}
      onSearch={onSearch}
      {...(restProps as Omit<
        React.ComponentProps<typeof FormInput>,
        | "name"
        | "placeholder"
        | "mode"
        | "onSearch"
        | "showReadOnlyBoxName"
        | "type"
      >)}
    />
  );
};

const NumberInput = ({ name, placeholder, mode }: InputProps) => (
  <FormInputNumber name={name} label="" placeholder={placeholder} mode={mode} />
);

const SelectInput = ({
  name,
  placeholder,
  options,
  mode = "edit",
  comCodeParams,
  ...restProps
}: SelectInputProps) => (
  <FormSelect
    name={name}
    label=""
    placeholder={placeholder}
    options={options}
    mode={mode}
    comCodeParams={comCodeParams}
    {...restProps}
  />
);

// 라디오 버튼 입력 컴포넌트
const RadioInput: InputComponentType = (props) => {
  const { name, mode, options, ...restProps } = props as SelectInputProps &
    InputComponentProps;

  return (
    <FormRadioGroup
      name={name}
      label=""
      mode={mode}
      options={options}
      layout="horizontal"
      {...(restProps as Omit<
        React.ComponentProps<typeof FormRadioGroup>,
        "name" | "label" | "mode" | "options" | "layout"
      >)}
    />
  );
};

// 필드 설정 인터페이스
interface FieldConfig {
  key?: string;
  label?: string;
  inputComponent?: InputComponentType;
  labelKey?: string;
  options?:
  | Array<{ value: string; label: string }>
  | ReadonlyArray<{ value: string; label: string }>;
  inputProps?: Partial<InputComponentProps>;
  headerRowspan?: number;
  dataRowspan?: number;
  headerColspan?: number;
  dataColspan?: number;
  render?: (props: {
    field: TableField;
    value: string;
    onChange: (value: string) => void;
    mode: "view" | "edit";
  }) => React.ReactNode;
}

// 필드 설정 헬퍼
const createField = ({
  key = "",
  label = "",
  inputComponent,
  labelKey,
  options,
  inputProps,
  render,
  ...restOptions
}: FieldConfig = {}) => {
  let wrappedComponent: InputComponentType | undefined = inputComponent;

  if ((inputProps || options) && inputComponent) {
    wrappedComponent = ((props: InputComponentProps) => {
      return React.createElement(inputComponent, {
        ...(options
          ? { options: options as Array<{ value: string; label: string }> }
          : {}),
        ...inputProps,
        ...props,
      });
    }) as InputComponentType;
  }

  return {
    key,
    label: labelKey || label,
    inputComponent: wrappedComponent,
    render,
    ...restOptions,
  };
};

// 체크박스 필드 생성 헬퍼
// const createCheckboxField = ({
//   key,
//   label,
// }: {
//   key: string;
//   label: string;
// }) => {
//   return createField({
//     key,
//     label,
//     render: ({ field, value, onChange: _onChange, mode }) => {
//       const checked = value === "Y";

//       if (mode === "view") {
//         return <Typography.Text>{checked ? "Y" : "N"}</Typography.Text>;
//       }

//       return (
//         <Form.Item
//           name={field.key}
//           valuePropName="checked"
//           normalize={(value: boolean | string) => {
//             if (typeof value === "boolean") {
//               return value ? "Y" : "N";
//             }
//             return value || "N";
//           }}
//           getValueProps={(value: string | undefined) => {
//             return { checked: value === "Y" };
//           }}
//           noStyle
//         >
//           <Checkbox>{label}</Checkbox>
//         </Form.Item>
//       );
//     },
//   });
// };

type DetailViewProps = {
  className?: string;
  mode?: "view" | "edit";
};

// createDualField 헬퍼 함수 타입 정의
type DualFieldComponent =
  | "input"
  | "select"
  | "radio"
  | React.ComponentType<Record<string, unknown>>;

interface DualFieldConfig {
  name?: string;
  component?: DualFieldComponent;
  disabled?: boolean;
  props?: Record<string, unknown>;
  render?: (mode: "view" | "edit") => React.ReactNode;
}

// createDualField 헬퍼 함수
const createDualField = ({
  key,
  label,
  firstField,
  secondField,
  gap = "8px",
  dataColspan = 2,
  ...restOptions
}: {
  key: string;
  label: string;
  firstField: DualFieldConfig;
  secondField: DualFieldConfig;
  gap?: string;
  dataColspan?: number;
  [key: string]: unknown;
}) => {
  const renderFieldComponent = (
    fieldConfig: DualFieldConfig,
    mode: "view" | "edit"
  ): React.ReactNode => {
    if (fieldConfig.render) {
      return fieldConfig.render(mode);
    }

    const componentType = fieldConfig.component || "input";

    switch (componentType) {
      case "input":
        if (!fieldConfig.name) return null;
        return (
          <FormInput
            name={fieldConfig.name}
            label=""
            mode={mode}
            disabled={fieldConfig.disabled}
            {...(fieldConfig.props as Record<string, unknown>)}
          />
        );
      case "select":
        if (!fieldConfig.name) return null;
        return (
          <FormSelect
            name={fieldConfig.name}
            label=""
            mode={mode}
            disabled={fieldConfig.disabled}
            {...(fieldConfig.props as Record<string, unknown>)}
          />
        );
      case "radio":
        if (!fieldConfig.name) return null;
        return (
          <FormRadioGroup
            name={fieldConfig.name}
            label=""
            mode={mode}
            layout="horizontal"
            {...(fieldConfig.props as Record<string, unknown>)}
          />
        );
      default:
        return null;
    }
  };

  return createField({
    key,
    label,
    render: ({ mode }) => {
      return (
        <div style={{ display: "flex", gap, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            {renderFieldComponent(firstField, mode)}
          </div>
          <div style={{ flex: 1 }}>
            {renderFieldComponent(secondField, mode)}
          </div>
        </div>
      );
    },
    dataColspan,
    ...restOptions,
  });
};

const DetailView: React.FC<DetailViewProps> = ({
  className,
  mode = "view",
}) => {

  // 계정 레벨 옵션
  const accountLevelOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ];

  // 계정유형 옵션
  const accountTypeOptions = [
    { value: "ASSET", label: "자산" },
    { value: "LIABILITY", label: "부채" },
    { value: "EQUITY", label: "자본" },
    { value: "REVENUE", label: "수익" },
    { value: "EXPENSE", label: "비용" },
  ];

  // 변동비/고정비 옵션
  const costTypeOptions = [
    { value: "VARIABLE", label: "변동비" },
    { value: "FIXED", label: "고정비" },
  ];

  // 계정관리수준 옵션
  const accountMgmtLevelOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ];

  // 테이블 행 설정
  const tableRows = useMemo(
    () => [
      // 첫 번째 섹션: 계정 정보
      {
        fields: [
          createField({
            key: "acntCd",
            label: "계정코드",
            inputComponent: TextInput,
            dataColspan:5
          }),
          createField({
            key: "acntNm",
            label: "계정과목명",
            inputComponent: TextInput,
            dataColspan:7
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "acntNmEn",
            label: "계정과목영문명",
            inputComponent: TextInput,
            dataColspan:5
          }),
          createField({
            key: "acntCdAbbr",
            label: "계정코드 약어",
            inputComponent: TextInput,
            dataColspan:7
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "acntLvl",
            label: "계정 LVL",
            inputComponent: TextInput,
            options: accountLevelOptions,
            inputProps: {
              placeholder: "-선택-",
            },
            dataColspan:2
          }),
          createField({
            key: "realAcntYn",
            label: "실계정여부",
            inputComponent: SelectInput,
            dataColspan:2
          }),
          createField({
            key: "ifrsSeq",
            label: "IFRS 순번",
            inputComponent: NumberInput,
            dataColspan:2
          }),
          createField({
            key: "acntType",
            label: "계정유형",
            inputComponent: SelectInput,
            options: accountTypeOptions,
            inputProps: {
              placeholder: "-선택-",
            },
            dataColspan:4
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "parentAcntCd1",
            label: "상위계정코드 1",
            inputComponent: SearchInput,
            dataColspan:5
          }),
          createField({
            key: "parentAcntCd2",
            label: "상위계정코드 2",
            inputComponent: SearchInput,
            dataColspan:7
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "parentAcntCd3",
            label: "상위계정코드 3",
            inputComponent: SearchInput,
            dataColspan:5
          }),
          createField({
            key: "parentAcntCd4",
            label: "상위계정코드 4",
            inputComponent: SearchInput,
            dataColspan:7
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "parentAcntCd5",
            label: "상위계정코드 5",
            inputComponent: TextInput,
            dataColspan:5
          }),
          createField({dataColspan:7}),
        ],
      },
      // 두 번째 섹션: 출력명
      {
        fields: [
          createField({
            key: "outputNm1",
            label: "출력명 1",
            inputComponent: TextInput,
            dataColspan:5
          }),
          createField({
            key: "outputNm2",
            label: "출력명 2",
            inputComponent: TextInput,
            dataColspan:7
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "outputNm3",
            label: "출력명 3",
            inputComponent: TextInput,
            dataColspan:5
          }),
          createField({
            key: "outputNm4",
            label: "출력명 4",
            inputComponent: TextInput,
            dataColspan:7
          }),
        ],
      },
      // 세 번째 섹션: 표시 옵션
      {
        fields: [
          createField({
            key: "displayOptions",
            label: "지출결의직접입력",
          }),
          createField({
            key: "displayOptions",
            label: "지출결의 표시",
          }),
          createField({
            key: "displayOptions",
            label: "시산표 표시",
          }),
          createField({
            key: "displayOptions",
            label: "재무상태표 표시",
          }),
          createField({
            key: "displayOptions",
            label: "손익계산서 표시",
          }),
        ],
      },
      // 네 번째 섹션: 기능 옵션
      {
        fields: [
          createField({
            key: "prepaidExpenseYn",
            label: "선급비용 여부",
            inputComponent: RadioInput,
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
            ],
            dataColspan:5
          }),
          createField({
            key: "advancePaymentYn",
            label: "선급금 여부",
            inputComponent: RadioInput,
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
            ],
            dataColspan:7
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "tbOutputGb",
            label: "T/B 출력구분",
            inputComponent: RadioInput,
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
              { value: "O", label: "Opt." },
            ],
            dataColspan:3
          }),
          createField({
            key: "featureOptions",
            label: "증빙관리 사용",
          }),
          createField({
            key: "featureOptions",
            label: "고정자산구분",
          }),
          createField({
            key: "featureOptions",
            label: "접대비구분",
          }),
          createField({
            key: "featureOptions",
            label: "사용",
          }),
          createField({
            key: "featureOptions",
            label: "신규",
          }),
        ],
      },
      {
        fields: [
          createDualField({
            key: "mgmtItem1",
            label: "관리항목(1)선택",
            firstField: {
              name: "mgmtItem1Opt",
              component: "radio",
              props: {
                options: [
                  { value: "Y", label: "Yes" },
                  { value: "N", label: "No" },
                  { value: "O", label: "Opt." },
                ],
              },
            },
            secondField: {
              name: "mgmtItem1Type",
              component: "select",
              props: {
                placeholder: "-선택-",
              },
            },
            dataColspan: 5,
          }),
          createDualField({
            key: "mgmtItem2",
            label: "관리항목(2)선택",
            firstField: {
              name: "mgmtItem2Opt",
              component: "radio",
              props: {
                options: [
                  { value: "Y", label: "Yes" },
                  { value: "N", label: "No" },
                  { value: "O", label: "Opt." },
                ],
              },
            },
            secondField: {
              name: "mgmtItem2Type",
              component: "select",
              props: {
                placeholder: "-선택-",
              },
            },
            dataColspan: 7,
          }),
        ],
      },
      {
        fields: [
          createDualField({
            key: "refSelect",
            label: "REF 선택",
            firstField: {
              name: "refOpt",
              component: "radio",
              props: {
                options: [
                  { value: "Y", label: "Yes" },
                  { value: "N", label: "No" },
                  { value: "O", label: "Opt." },
                ],
              },
            },
            secondField: {
              name: "refType",
              component: "select",
              props: {
                placeholder: "-선택-",
              },
            },
            dataColspan: 5,
          }),
          createDualField({
            key: "amountSelect",
            label: "금액선택",
            firstField: {
              name: "amountOpt",
              component: "radio",
              props: {
                options: [
                  { value: "Y", label: "Yes" },
                  { value: "N", label: "No" },
                  { value: "O", label: "Opt." },
                ],
              },
            },
            secondField: {
              name: "amountType",
              component: "select",
              props: {
                placeholder: "-선택-",
              },
            },
            dataColspan: 7,
          }),
        ],
      },
      {
        fields: [
          createDualField({
            key: "unitSelect",
            label: "단위선택",
            firstField: {
              name: "unitOpt",
              component: "radio",
              props: {
                options: [
                  { value: "Y", label: "Yes" },
                  { value: "N", label: "No" },
                  { value: "O", label: "Opt." },
                ],
              },
            },
            secondField: {
              name: "unitType",
              component: "select",
              props: {
                placeholder: "-선택-",
              },
            },
            dataColspan: 5,
          }),
          createDualField({
            key: "etcSelect",
            label: "기타선택",
            firstField: {
              name: "etcOpt",
              component: "radio",
              props: {
                options: [
                  { value: "Y", label: "Yes" },
                  { value: "N", label: "No" },
                  { value: "O", label: "Opt." },
                ],
              },
            },
            secondField: {
              name: "etcType",
              component: "select",
              props: {
                placeholder: "-선택-",
              },
            },
            dataColspan: 7,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "occurDateOpt",
            label: "발생일자선택",
            inputComponent: RadioInput,
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
              { value: "O", label: "Opt." },
            ],
            dataColspan: 5,
          }),
          createField({
            key: "maturDateOpt",
            label: "만기일자선택",
            inputComponent: RadioInput,
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
              { value: "O", label: "Opt." },
            ],
            dataColspan: 7,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "processCdOpt",
            label: "공정코드선택",
            inputComponent: RadioInput,
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
              { value: "O", label: "Opt." },
            ],
            dataColspan: 5,
          }),
          createField({
            key: "productCdSelect",
            label: "제품코드선택",
            inputComponent: RadioInput,
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
              { value: "O", label: "Opt." },
            ],
            dataColspan: 3,
          }),
          createField({
            key: "pastCd",
            label: "과거코드",
            inputComponent: TextInput,
            dataColspan: 3,
          }),
        ],
      },
      // 다섯 번째 섹션: 원가/손익 분류
      {
        fields: [
          createField({
            key: "costElementGb",
            label: "원가요소구분",
            inputComponent: SearchInput,
            dataColspan: 5,
          }),
          createField({
            key: "variableFixedCost",
            label: "변동비/고정비",
            inputComponent: SelectInput,
            options: costTypeOptions,
            inputProps: {
              placeholder: "-선택-",
            },
            dataColspan: 7,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "profitLossElementGb",
            label: "손익요소 구분",
            inputComponent: SearchInput,
            dataColspan: 5,
          }),
          createField({
            key: "acntMgmtLevel",
            label: "계정관리수준",
            inputComponent: SelectInput,
            options: accountMgmtLevelOptions,
            inputProps: {
              placeholder: "-선택-",
            },
            dataColspan: 7,
          }),
        ],
      },
    ],
    []
  );

  /** CRUD 액션 이벤트 핸들러 */
  const handleEdit = useCallback(() => {
    console.log("edit");
  }, []);
  const handleSave = useCallback(() => {
    console.log("save");
  }, []);

  const handleFinish = useCallback((values: Record<string, unknown>) => {
    console.log("Form values:", values);
  }, []);

  const handleValuesChange = useCallback(
    (changedValues: Record<string, unknown>) => {
      console.log("Values changed:", changedValues);
    },
    []
  );

  /** ActionButtonGroup 설정 */
  const actionButtonGroup = useMemo(
    () => ({
      // 기본 액션 버튼들의 이벤트 핸들러
      onButtonClick: {
        edit: handleEdit, // 수정 버튼
        save: handleSave, // 저장 버튼
      },
      // 숨길 버튼들 (빈 배열 = 모두 표시)
      hideButtons: ["create", "copy", "delete", "expand"] as SupportedActionButtonType[],
    }),
    [
      handleEdit,
      handleSave,
    ]
  );

  return (
      <DataForm
        className={className}
        actionButtonGroup={actionButtonGroup}
        tableRows={tableRows}
        mode={mode}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
      />
  );
};

export default DetailView;