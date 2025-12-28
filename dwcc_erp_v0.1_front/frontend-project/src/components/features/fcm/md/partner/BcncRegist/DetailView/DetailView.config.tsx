/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Checkbox, Typography, Form } from "antd";
import type { FormInstance } from "antd/es/form";
import {
  FormInput,
  FormInputNumber,
  FormSelect,
  FormRadioGroup,
  FormButton,
  FormDatePicker,
  type TableField,
} from "@components/ui/form";
import {
  CUSTNO_GB_OPTIONS,
  ORG_ID_OPTIONS,
  STLM_TERM_OPTIONS,
  STLM_TERM_AR_OPTIONS,
  CREDIT_OPTIONS,
} from "../constants/selectOptions";

/* eslint-disable react-refresh/only-export-components */

/* =============================================================================
   1. 타입 정의 (Types)
   ============================================================================= */

export type InputComponentProps = {
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
  [key: string]: any;
};

export type InputComponentType = NonNullable<TableField["inputComponent"]>;

export interface FieldConfig {
  key?: string;
  label?: string | React.ReactNode;
  inputComponent?: InputComponentType;
  labelKey?: string;
  required?: boolean;
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
    value: any;
    onChange: (value: any) => void;
    mode: "view" | "edit";
  }) => React.ReactNode;
}

/* =============================================================================
   2. 내부 전용 하위 컴포넌트 및 래퍼 (Internal Components)
   ============================================================================= */

const TextInput: InputComponentType = (props) => (
  <FormInput {...(props as any)} label="" />
);

const NumberInput: InputComponentType = (props) => (
  <FormInputNumber {...(props as any)} label="" />
);

const DateInput: InputComponentType = (props) => (
  <FormDatePicker {...(props as any)} label="" />
);

const SelectInput: InputComponentType = (props) => (
  <FormSelect {...(props as any)} label="" />
);

const RadioInput: InputComponentType = (props) => (
  <FormRadioGroup {...(props as any)} label="" layout="horizontal" />
);

/**
 * 검색 기능을 포함하는 입력 필드
 */
const SearchInput: InputComponentType = (props: any) => {
  const {
    name,
    placeholder,
    mode,
    onSearch,
    showReadOnlyBoxName,
    ...restProps
  } = props;

  if (mode === "view") {
    if (showReadOnlyBoxName) {
      return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <FormInput
              name={name}
              label=""
              mode={mode}
              {...(restProps as Record<string, any>)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormInput
              name={showReadOnlyBoxName}
              label=""
              mode={mode}
              {...(restProps as Record<string, any>)}
            />
          </div>
        </div>
      );
    }
    return (
      <FormInput name={name} label="" mode={mode} {...(restProps as any)} />
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
      {...(restProps as any)}
    />
  );
};

/**
 * 총여신한도 계산 및 표시 필드
 */
const TotalCreditLimitField: React.FC<{
  name: string;
  mode: "view" | "edit";
  form: FormInstance;
}> = ({ name, mode, form }) => {
  const collateral = Form.useWatch("collateralAmount", form) ?? 0;
  const surety = Form.useWatch("creditSurety", form) ?? 0;
  const limit = Form.useWatch("creditLimit", form) ?? 0;

  const total = Number(collateral) + Number(surety) + Number(limit);

  if (mode === "view") {
    return <Typography.Text>{total.toLocaleString()}</Typography.Text>;
  }

  return (
    <FormInputNumber
      name={name}
      label=""
      mode={mode}
      disabled={true}
      value={total}
    />
  );
};

/* =============================================================================
   3. 유틸리티 및 헬퍼 (Utilities & Helpers)
   ============================================================================= */

/**
 * 필드 설정 헬퍼
 */
export const createField = ({
  key = "",
  label = "",
  inputComponent,
  labelKey,
  required,
  options,
  inputProps,
  render,
  ...restOptions
}: FieldConfig = {}): TableField => {
  let wrappedComponent: InputComponentType | undefined = inputComponent;

  const finalInputProps = { ...inputProps };
  if (required) {
    const rules = Array.isArray(finalInputProps.rules)
      ? [...finalInputProps.rules]
      : [];
    finalInputProps.rules = [
      ...rules,
      {
        required: true,
        message: `${
          typeof label === "string" ? label : labelKey || "필수 항목"
        }을(를) 입력하세요.`,
      },
    ];
  }

  if ((inputProps || options || required) && inputComponent) {
    wrappedComponent = ((props: InputComponentProps) => {
      return React.createElement(inputComponent, {
        ...(options
          ? { options: options as Array<{ value: string; label: string }> }
          : {}),
        ...finalInputProps,
        ...props,
      });
    }) as InputComponentType;
  }

  return {
    key,
    label: (labelKey || label) as any,
    inputComponent: wrappedComponent,
    render,
    required,
    ...restOptions,
  } as TableField;
};

/**
 * 입력 필드와 버튼을 함께 렌더링하는 헬퍼 함수
 */
const createFieldWithButton = ({
  key,
  label,
  inputName,
  inputType = "input",
  buttonText,
  buttonOnClick,
  dataColspan,
  inputProps,
}: {
  key: string;
  label: string;
  inputName?: string;
  inputType?: "input" | "select";
  buttonText: string;
  buttonOnClick?: () => void;
  dataColspan?: number;
  inputProps?: Partial<InputComponentProps>;
}) => {
  return createField({
    key,
    label,
    render: ({ mode }) => {
      const showButton = mode === "edit";
      const button = showButton ? (
        <FormButton
          size="small"
          onClick={buttonOnClick}
          style={{ whiteSpace: "nowrap" }}
        >
          {buttonText}
        </FormButton>
      ) : null;

      if (!inputName) return button;

      return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            {inputType === "input" ? (
              <FormInput
                name={inputName}
                label=""
                mode={mode}
                {...(inputProps as any)}
              />
            ) : (
              <FormSelect
                name={inputName}
                label=""
                mode={mode}
                {...(inputProps as any)}
              />
            )}
          </div>
          {button}
        </div>
      );
    },
    dataColspan,
  });
};

/**
 * 두 개의 필드를 나란히 배치하는 헬퍼 함수
 */
const createDualField = ({
  key,
  label,
  firstField,
  secondField,
  gap = "8px",
  dataColspan = 2,
}: {
  key: string;
  label: string;
  firstField: {
    name: string;
    component?: string;
    disabled?: boolean;
    props?: any;
  };
  secondField: {
    name: string;
    component?: string;
    disabled?: boolean;
    props?: any;
  };
  gap?: string;
  dataColspan?: number;
}) => {
  const renderUnit = (cfg: any, mode: any) => {
    const Component = cfg.component === "select" ? FormSelect : FormInput;
    return (
      <Component
        name={cfg.name}
        label=""
        mode={mode}
        disabled={cfg.disabled}
        {...cfg.props}
      />
    );
  };

  return createField({
    key,
    label,
    render: ({ mode }) => (
      <div style={{ display: "flex", gap, alignItems: "center" }}>
        <div style={{ flex: 1 }}>{renderUnit(firstField, mode)}</div>
        <div style={{ flex: 1 }}>{renderUnit(secondField, mode)}</div>
      </div>
    ),
    dataColspan,
  });
};

/* =============================================================================
   4. 메인 테이블 행 설정 (Main Configuration)
   ============================================================================= */

interface ConfigOptions {
  detailData: any;
  personYn: string;
  handleSearchInputClick: (value: string, options: any) => void;
  form: FormInstance;
}

/**
 * 테이블 행 설정을 생성하는 함수 (모든 필드 복구)
 */
export const getTableRows = (options: ConfigOptions) => {
  const { detailData, personYn, handleSearchInputClick, form } = options;

  return [
    // [기본 정보]
    {
      fields: [
        createField({
          key: "custno",
          label: "거래처",
          inputComponent: TextInput,
          inputProps: { disabled: !!detailData?.custno, placeholder: "" },
        }),
        createField({
          key: "useYno",
          label: "사용구분",
          inputComponent: RadioInput,
          options: [
            { value: "Y", label: "Yes" },
            { value: "N", label: "No" },
          ],
        }),
        createField({
          key: "custname",
          label: "거래처명",
          inputComponent: TextInput,
          dataColspan: 5,
          required: true,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "custnoGb",
          label: "거래처구분",
          inputComponent: SelectInput,
          options: CUSTNO_GB_OPTIONS,
          required: true,
        }),
        createField({
          key: "custType",
          label: "거래처타입",
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "CUSTYP", enabledFlag: "Y" },
          },
          required: true,
        }),
        createField({
          key: "custename",
          label: "거래처 대외명",
          inputComponent: TextInput,
          dataColspan: 5,
        }),
      ],
    },
    {
      fields: [
        createField({}),
        createField({
          key: "currency",
          label: "통화",
          inputComponent: SearchInput,
          inputProps: {
            onSearch: (v: string) =>
              handleSearchInputClick(v, {
                targetField1: "currency",
                field1Label: "통화 코드",
              }),
          },
          required: true,
        }),
        createField({
          key: "dscr1",
          label: "비고",
          inputComponent: TextInput,
          dataColspan: 5,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "spacer_top",
          label: "",
          render: () => (
            <span style={{ display: "block", minHeight: "32px" }}>&nbsp;</span>
          ),
          headerColspan: 1,
          dataColspan: 9,
        }),
      ],
    },
    // [개인/직원 정보]
    {
      fields: [
        createField({
          key: "personYn",
          label: "개인",
          render: ({ field, value, mode }) => {
            if (mode === "view") {
              return (
                <Typography.Text>{value === "Y" ? "Y" : "N"}</Typography.Text>
              );
            }
            return (
              <Form.Item
                name={field.key}
                valuePropName="checked"
                normalize={(v) => (v === true ? "Y" : "N")}
                getValueProps={(v) => ({ checked: v === "Y" })}
                noStyle
              >
                <Checkbox />
              </Form.Item>
            );
          },
        }),
        createField({
          key: "business",
          label: "직원",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "empyNme",
            onSearch: (v: string) =>
              handleSearchInputClick(v, {
                targetField1: "business",
                targetField2: "empyNme",
                field1Label: "직원 코드",
                field2Label: "직원명",
              }),
          },
          dataColspan: 3,
        }),
        createField({
          key: "smallBusinessFlag",
          label: "기업규모",
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "CUSSIZ", enabledFlag: "Y" },
          },
        }),
        createField({
          key: "custStatus",
          label: "상태",
          inputComponent: TextInput,
          inputProps: { disabled: true },
        }),
      ],
    },
    // [사업자 정보]
    {
      fields: [
        createFieldWithButton({
          key: "regtno",
          label: personYn === "Y" ? "주민등록번호" : "사업자등록번호",
          inputName: "regtno",
          buttonText: "Check Bus. Regist. No.",
          dataColspan: 3,
        }),
        createField({
          key: "regtnoNo",
          label: "종사업장",
          inputComponent: TextInput,
        }),
        createField({
          key: "pname",
          label: "대표자명",
          inputComponent: TextInput,
        }),
        createField({ key: "fax", label: "FAX No", inputComponent: TextInput }),
      ],
    },
    {
      fields: [
        createField({
          key: "pidno",
          label: "법인번호",
          inputComponent: TextInput,
          dataColspan: 3,
        }),
        createField({
          key: "orgId",
          label: "주거래사업장",
          inputComponent: SelectInput,
          options: ORG_ID_OPTIONS,
          dataColspan: 3,
        }),
        createField({
          key: "tel",
          label: "전화번호1",
          inputComponent: TextInput,
        }),
      ],
    },
    // [업태/업종]
    {
      fields: [
        createField({
          key: "uptae",
          label: "업태",
          inputComponent: TextInput,
          dataColspan: 3,
        }),
        createField({
          key: "charger",
          label: "업체 담당자",
          inputComponent: TextInput,
        }),
        createDualField({
          key: "pcustno",
          label: "End User",
          firstField: { name: "pcustno" },
          secondField: { name: "pcustname", disabled: true },
          dataColspan: 3,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "jong",
          label: "종목",
          inputComponent: TextInput,
          dataColspan: 3,
        }),
        createField({
          key: "zipcode",
          label: "우편번호",
          inputComponent: SearchInput,
          inputProps: {
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "zipcode",
                field1Label: "우편번호",
                field2Label: "주소",
              }),
          },
        }),
        createField({
          key: "attribute1",
          label: "존속/신설",
          inputComponent: SelectInput,
          options: [
            { value: "존속", label: "존속" },
            { value: "신설", label: "신설" },
          ],
        }),
        createField({
          key: "ntnlCde",
          label: "지역구분",
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "DMRGCD", enabledFlag: "Y" },
          },
        }),
      ],
    },
    // [지역/국가 정보]
    {
      fields: [
        createField({
          key: "custArea",
          label: "국내/해외",
          inputComponent: SelectInput,
          options: [
            { value: "국내", label: "국내" },
            { value: "해외", label: "해외" },
          ],
        }),
        createField({
          key: "rArea",
          label: "대륙코드",
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "CONTNT", enabledFlag: "Y" },
          },
        }),
        createField({
          key: "addr",
          label: "주소",
          inputComponent: TextInput,
          dataColspan: 5,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "nationalCde",
          label: "국가코드",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "nationName",
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "nationalCde",
                targetField2: "nationName",
                field1Label: "국가코드",
                field2Label: "국가명",
              }),
          },
          dataColspan: 3,
        }),
        createField({
          key: "category4",
          label: "관계사여부",
          inputComponent: SelectInput,
          options: [
            { value: "Y", label: "Y" },
            { value: "N", label: "N" },
          ],
        }),
        createField({
          key: "custSpecialRel",
          label: "특수관계자여부",
          inputComponent: SelectInput,
          options: [
            { value: "Y", label: "Y" },
            { value: "N", label: "N" },
          ],
        }),
        createField({
          key: "iconsCode",
          label: "I-CONS CD",
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "ICONCD", enabledFlag: "Y" },
          },
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "sdate",
          label: "거래개시일자",
          inputComponent: DateInput,
        }),
        createField({
          key: "odate",
          label: "창업일자",
          inputComponent: DateInput,
        }),
        createDualField({
          key: "oldVendor",
          label: "(구)Vendor/(구)Vendor Site",
          firstField: { name: "oldVendor", disabled: true },
          secondField: { name: "oldVendorSite", disabled: true },
          dataColspan: 2,
        }),
        createDualField({
          key: "oldCustno",
          label: "(구)Customer/(구)Cust Site",
          firstField: { name: "oldCustno", disabled: true },
          secondField: { name: "oldCustSite", disabled: true },
          dataColspan: 2,
        }),
      ],
    },
    // [매입 섹션]
    {
      fields: [
        createField({
          key: "purchase_label",
          label: "[매입]",
          render: () => (
            <span style={{ display: "block", minHeight: "32px" }}>&nbsp;</span>
          ),
          headerColspan: 1,
          dataColspan: 9,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "method",
          label: "지급방법",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "mthdName",
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "method",
                targetField2: "mthdName",
                field1Label: "지급방법 코드",
                field2Label: "지급방법명",
              }),
          },
          dataColspan: 3,
          required: true,
        }),
        createField({
          key: "stlmTerm",
          label: "지급조건",
          inputComponent: SelectInput,
          options: STLM_TERM_OPTIONS,
          dataColspan: 3,
          required: true,
        }),
        createFieldWithButton({
          key: "custAcct",
          label: "거래처계좌",
          buttonText: "거래처계좌 조회",
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "acctNum1",
          label: "미지급금계정",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "acctName1",
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "acctNum1",
                targetField2: "acctName1",
                field1Label: "계정코드",
                field2Label: "계정명",
              }),
          },
          dataColspan: 3,
          required: true,
        }),
        createField({
          key: "acctNum2",
          label: "선급금계정",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "acctName2",
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "acctNum2",
                targetField2: "acctName2",
                field1Label: "계정코드",
                field2Label: "계정명",
              }),
          },
          dataColspan: 3,
          required: true,
        }),
        createField({
          key: "coUpload",
          label: "전방대등록여부",
          inputComponent: TextInput,
          inputProps: { disabled: true },
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "vatType",
          label: "VAT(매입)",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "vatNmeAp",
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "vatType",
                targetField2: "vatNmeAp",
                field1Label: "VAT 코드",
                field2Label: "VAT명",
              }),
          },
          dataColspan: 3,
        }),
        createField({
          key: "payToCust",
          label: "Pay To",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "payToName",
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "payToCust",
                targetField2: "payToName",
                field1Label: "Pay To 코드",
                field2Label: "Pay To명",
              }),
          },
          dataColspan: 5,
        }),
      ],
    },
    // [매출 섹션]
    {
      fields: [
        createField({
          key: "sales_label",
          label: "[매출]",
          render: () => (
            <span style={{ display: "block", minHeight: "32px" }}>&nbsp;</span>
          ),
          headerColspan: 1,
          dataColspan: 9,
        }),
      ],
    },
    {
      fields: [
        createField({}),
        createField({
          key: "salesMan",
          label: "영업사원",
          inputComponent: SearchInput,
          inputProps: {
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "salesMan",
                field1Label: "영업사원 코드",
                field2Label: "영업사원명",
              }),
          },
        }),
        createField({
          key: "phoneMobile1",
          label: "담당자핸드폰1",
          inputComponent: TextInput,
        }),
        createField({
          key: "emailId",
          label: "전자세금계산서 수신 E-Mail",
          inputComponent: TextInput,
          dataColspan: 3,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "vatType2",
          label: "VAT(매출)",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "vatNmeAr",
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "vatType2",
                targetField2: "vatNmeAr",
                field1Label: "VAT 코드",
                field2Label: "VAT명",
              }),
          },
          dataColspan: 3,
        }),
        createField({
          key: "category1",
          label: "가상계좌(은행)",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "bankName",
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "category1",
                targetField2: "bankName",
                field1Label: "은행코드",
                field2Label: "은행명",
              }),
          },
          dataColspan: 3,
        }),
        createField({
          key: "channel",
          label: "채널",
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "AR", type: "CHANEL", enabledFlag: "Y" },
          },
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "stlmTermAr",
          label: "수금조건",
          inputComponent: SelectInput,
          options: STLM_TERM_AR_OPTIONS,
          dataColspan: 3,
        }),
        createField({
          key: "category2",
          label: "가상계좌번호",
          inputComponent: TextInput,
          dataColspan: 3,
        }),
        createField({
          key: "credit",
          label: "신용등급",
          inputComponent: SelectInput,
          options: CREDIT_OPTIONS,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "billToCust",
          label: "Bill To",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "billToName",
            onSearch: (v) =>
              handleSearchInputClick(v, {
                targetField1: "billToCust",
                targetField2: "billToName",
                field1Label: "Bill To 코드",
                field2Label: "Bill To명",
              }),
          },
          dataColspan: 7,
        }),
        createField({
          key: "cdate",
          label: "신용평가일자",
          inputComponent: DateInput,
        }),
      ],
    },
    // 마지막 총여신한도 섹션
    {
      fields: [
        createField({
          key: "collateralAmount",
          label: "담보한도금액",
          inputComponent: NumberInput,
        }),
        createField({
          key: "creditSurety",
          label: "보험한도금액",
          inputComponent: NumberInput,
        }),
        createField({
          key: "creditLimit",
          label: "신용한도금액",
          inputComponent: NumberInput,
        }),
        createField({
          key: "totalCreditLimit",
          label: "총여신한도",
          render: ({ field, mode }) => (
            <TotalCreditLimitField name={field.key} mode={mode} form={form} />
          ),
        }),
        createField({
          key: "creditLimitMonths",
          label: "신용한도월수",
          inputComponent: NumberInput,
        }),
      ],
    },
  ];
};
