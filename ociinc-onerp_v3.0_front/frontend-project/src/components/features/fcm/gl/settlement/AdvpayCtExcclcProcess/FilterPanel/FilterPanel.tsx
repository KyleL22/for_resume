import React, { useCallback, useRef, useEffect } from "react";
import { Form, message, type FormInstance } from "antd";
import {
  FormDatePicker,
  FormSelect,
  SearchForm,
  FormSearchInput,
  FormRadioGroup,
} from "@components/ui/form";
import { useAuthStore } from "@/store/authStore";
import { useAdvpayCtExcclcProcessStore } from "@/store/fcm/gl/settlement/AdvpayCtExcclcProcesStore";
import type { AdvpayCtExcclcProcessSearchRequest } from "@/types/fcm/gl/settlement/AdvpayCtExcclcProcess";
import dayjs from "dayjs";

type FilterPanelProps = {
  className?: string;
  onRefReady?: (ref: { handleSearch: () => Promise<void> }) => void;
};

// Internal component to capture Form instance from SearchForm
const FormWatcher: React.FC<{
  onFormInstanceReady: (instance: FormInstance) => void;
}> = ({ onFormInstanceReady }) => {
  const form = Form.useFormInstance();
  useEffect(() => {
    if (form) {
      onFormInstanceReady(form);
    }
  }, [form, onFormInstanceReady]);
  return null;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  onRefReady,
}) => {
  // Form 인스턴스: useRef로 관리 (리렌더링 방지)
  const formRef = useRef<FormInstance | null>(null);
  const { user } = useAuthStore();
  const { search, loading } = useAdvpayCtExcclcProcessStore();

  // 초기값 생성 함수 (중복 제거)
  const getInitialValues = useCallback(() => {
    const today = dayjs();
    const firstDay = today.startOf("month");

    return {
      dateRange: [firstDay, today] as [dayjs.Dayjs, dayjs.Dayjs],
      asRpsnOffice: "",
      asDept: "",
      asCust: "",
      slipType: "N",
      glProcess: "N",
    };
  }, []);

  // Form 인스턴스 설정 함수
  const setForm = useCallback(
    (instance: FormInstance | null) => {
      formRef.current = instance;

      // Form 인스턴스가 설정되면 초기값 설정
      if (instance) {
        instance.setFieldsValue(getInitialValues());
      }
    },
    [getInitialValues]
  );

  // 초기화 핸들러 (SearchForm에 전달)
  const handleReset = useCallback(() => {
    if (!formRef.current) return;
    formRef.current.setFieldsValue(getInitialValues());
  }, [getInitialValues]);

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    if (!formRef.current) return;

    try {
      const values = await formRef.current.validateFields();

      if (!user?.officeId) {
        message.error("사무소 정보를 찾을 수 없습니다.");
        return;
      }

      // 날짜 범위 검증
      const dateRange = values.dateRange as
        | [dayjs.Dayjs, dayjs.Dayjs]
        | undefined;
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        message.error("적용년월을 선택해주세요.");
        return;
      }

      // API 요청 파라미터 구성
      const searchRequest: AdvpayCtExcclcProcessSearchRequest = {
        asOfficeId: user.officeId,
        asOrgId: values.asRpsnOffice || undefined,
        asDept: values.asDept || undefined,
        asSupplier: values.asCust || undefined,
        asMonthFr: dateRange[0].format("YYYYMM"),
        asMonthTo: dateRange[1].format("YYYYMM"),
        asRbYn: values.slipType ? values.slipType : undefined,
        asAttribute8: values.glProcess ? values.glProcess : undefined,
        // 기준통화 정보 (기본값: KRW)
        asGCurr: "KRW",
        asGCurrDeci: "0",
        asGCurrFormat: "###,###,###",
      };

      // API 요청 파라미터 콘솔 출력 (개발 환경에서만)
      if (import.meta.env.DEV) {
        console.log("=== API 요청 파라미터 ===");
        console.log("searchRequest:", searchRequest);
        console.log("Form values:", values);
        console.log("========================");
      }

      // store의 search 함수 호출
      await search(searchRequest);
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation error
        message.error("입력값을 확인해주세요.");
      } else {
        message.error("조회 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("조회 실패:", error);
        }
      }
    }
  }, [user, search]);

  // ref를 통해 handleSearch를 외부에서 호출할 수 있도록 expose
  useEffect(() => {
    if (onRefReady) {
      onRefReady({
        handleSearch,
      });
    }
  }, [onRefReady, handleSearch]);

  return (
    <SearchForm
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={true}
      visibleRows={2}
      columnsPerRow={4}
      className={className}
    >
      <FormWatcher onFormInstanceReady={setForm} />
      <FormSelect
        name="asRpsnOffice"
        label="사업장"
        placeholder="전체"
        comCodeParams={{
          module: "PF",
          type: "ORG",
          enabledFlag: "Y",
        }}
        filterValues={["##"]}
        allOptionLabel="전체"
      />
      <FormDatePicker
        name="dateRange"
        isRange={true}
        label="작성일자"
        placeholder={["시작년월", "종료년월"]}
      />
      <FormSearchInput
        name="asDept"
        label="귀속부서"
        placeholder=""
        showReadOnlyBoxName="asDeptDisplay"
      />
      <FormSearchInput
        name="asCust"
        label="거래처"
        showReadOnlyBoxName="asCustDisplay"
      />
      <FormRadioGroup
        name="slipType"
        label=""
        options={[
          { label: "전표생성", value: "N" },
          { label: "전표취소", value: "Y" },
        ]}
      />
      <FormRadioGroup
        name="glProcess"
        label="GL처리"
        options={[
          { label: "GL처리대상", value: "N" },
          { label: "GL처리대상취소", value: "Y" },
        ]}
      />
    </SearchForm>
  );
};

export default FilterPanel;