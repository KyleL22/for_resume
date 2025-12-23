/**
 * 전표 마스터 뷰 (Slip Master View)
 * 
 * @description 전표 헤더 정보(작성자, 유형, 적요 등)를 표시하고 CRUD 명령을 처리하는 폼 컴포넌트
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  DataForm,
  FormButton,
  FormInput,
} from "@components/ui/form";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";

// 입력 컴포넌트들
interface InputProps {
  name: string;
  placeholder?: string;
  mode?: "view" | "edit";
  disabled?: boolean;
}

const TextInput = ({ name, placeholder, mode, disabled }: InputProps) => (
  <FormInput
    name={name}
    label=""
    placeholder={placeholder}
    mode={mode}
    disabled={disabled}
  />
);

// 필드 설정 인터페이스
interface FieldConfig {
  key: string;
  label?: string; // ← 옵셔널로 변경
  inputComponent: React.ComponentType<{
    name: string;
    placeholder?: string;
    mode?: "view" | "edit";
    options?: Array<{ value: string; label: string }>;
    rows?: number;
  }>;
  labelKey?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  colspan?: number;
  rowspan?: number;
  headerRowspan?: number;
  dataRowspan?: number;
  headerColspan?: number;
  dataColspan?: number;
}

// 필드 설정 헬퍼
const createField = ({
  key,
  label,
  inputComponent,
  labelKey,
  required,
  ...options
}: FieldConfig) => ({
  key,
  label: labelKey || label || key,
  labelKey,
  inputComponent: (props: any) =>
    React.createElement(inputComponent, { ...props, disabled: options.disabled }),
  required,
  ...options,
});

/**
 * DetailView 컴포넌트
 * 전표 상세 정보 표시 및 CRUD 액션 제공
 */
interface DetailViewProps {
  className?: string;
  mode?: "view" | "edit"; // 표시 모드 (기본값: "view")
}

const DetailView: React.FC<DetailViewProps> = ({
  className,
  mode: initialMode = "view",
}) => {
  const {
    slipHeader: headerData,
    selectedSlipId,
    editingSlipId,
    isNewSlip,
    handleSave,
    handleDelete,
    handleCopy,
    handleCreate,
    handleEdit,
    setSlipHeader,
  } = useSlipRegist();
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [expanded, setExpanded] = useState(false);

  const handleExpandChange = useCallback((newExpanded: boolean) => {
    setExpanded(newExpanded);
  }, []);

  // 스토어 상태에 따라 모드 동기화
  React.useEffect(() => {
    if (isNewSlip || (editingSlipId && editingSlipId === selectedSlipId)) {
      setMode("edit");
    } else {
      setMode("view");
    }
  }, [isNewSlip, editingSlipId, selectedSlipId]);

  /** 테이블 데이터 */

  /** 테이블 행 설정 */
  const tableRows = useMemo(
    () => [
      {
        fields: [
          createField({
            key: "makerDeptName",
            label: "작성부서",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "makerName",
            label: "작성자",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "slipName",
            label: "전표유형",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "srcTblNme",
            label: "원천",
            inputComponent: TextInput,
            disabled: true,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "glSlipNo",
            label: "전표번호",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "exptnTgt",
            label: "전기",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "edimStatusName",
            label: "전자결재",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "creationDate",
            label: "작성일시",
            inputComponent: TextInput,
            disabled: true,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "reference1",
            label: "Reverse No.",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "description",
            label: "대표적요",
            inputComponent: TextInput,
            required: true,
          }),
          createField({
            key: "magamTag",
            label: "Closed",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "lastUpdateDate",
            label: "최종수정일시",
            inputComponent: TextInput,
            disabled: true,
          }),
        ],
      },
    ],
    [mode]
  );

  /** 왼쪽 액션 버튼 */
  const leftActions = useMemo(
    () => [{ type: "search" as const }, { type: "attachment" as const }],
    []
  );

  /** CRUD 액션 이벤트 핸들러 */
  // Store 함수 직접 사용

  /** 왼쪽 액션 버튼 이벤트 핸들러 */
  const handleLeftAction = useCallback((actionType: string) => {
    // TODO: 실제 구현 필요 (검색, 첨부파일 관리 등)
    console.log("Left action:", actionType);
  }, []);

  // 폼 값 변경 시 스토어 상태 업데이트
  const handleValuesChange = useCallback(
    (_changedValues: any, allValues: any) => {
      // headerData가 null일 수 있으므로 병합 시 주의
      const newHeader = { ...headerData, ...allValues } as any;
      setSlipHeader(newHeader);
    },
    [headerData, setSlipHeader]
  );
  const handleFinish = useCallback(() => { }, []);
  const handleFinishFailed = useCallback(() => { }, []);

  /** 커스텀 액션 핸들러 */
  const handleCustomAction = useCallback((action: string) => {
    // TODO: 실제 구현 필요 (결제상신, 승인취소, 더보기 등)
    console.log("Custom action:", action);
  }, []);

  /** ActionButtonGroup 커스텀 버튼들 */
  const customButtons = useMemo(
    () => [
      <FormButton
        key="approve"
        size="small"
        onClick={() => handleCustomAction("approve")}
      >
        결제상신
      </FormButton>,
      <FormButton
        key="cancel-approve"
        size="small"
        onClick={() => handleCustomAction("cancel-approve")}
      >
        승인취소
      </FormButton>,
      <FormButton
        key="more"
        size="small"
        className="data-form__button data-form__button--more"
        onClick={() => handleCustomAction("more")}
      >
        더보기
      </FormButton>,
    ],
    [handleCustomAction]
  );

  /** ActionButtonGroup 설정 */
  const actionButtonGroup = useMemo(
    () => ({
      // 기본 액션 버튼들의 이벤트 핸들러
      onButtonClick: {
        create: handleCreate, // 입력 버튼
        edit: handleEdit, // 수정 버튼
        copy: handleCopy, // 복사 버튼
        delete: handleDelete, // 삭제 버튼
        save: handleSave, // 저장 버튼
      },
      // 숨길 버튼들 (빈 배열 = 모두 표시)
      hideButtons: [],
      // 커스텀 버튼들 (결제 관련 버튼들)
      customButtons,
      // 확장 기능 활성화 (테이블 접기/펼치기)
      enableExpand: true,
      // 동적 확장 상태 (상태 연동)
      expanded,
      // 확장 상태 변경 핸들러
      onExpandChange: handleExpandChange,
      // 최대 표시 행 수
      maxVisibleRows: 3,
    }),
    [
      customButtons,
      handleCreate,
      handleEdit,
      handleCopy,
      handleDelete,
      handleSave,
      expanded, // 확장 상태 추가
      handleExpandChange, // 핸들러 추가
    ]
  );

  return (
    <DataForm
      className={className}
      leftActions={leftActions}
      actionButtonGroup={actionButtonGroup}
      tableRows={tableRows}
      tableData={(headerData as any) || {}}
      department="경영관리본부"
      user="관리자"
      status="완료"
      statusClass="done"
      mode={mode}
      onLeftAction={handleLeftAction}
      onValuesChange={handleValuesChange}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
    />
  );
};

export default DetailView;
