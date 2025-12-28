/**
 * 전표 검색 패널 (Slip Filter Panel)
 * 
 * @description 사업부, 회계일자, 부서 등 전표 목록 조회를 위한 검색 조건을 설정하는 컴포넌트
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import React, { useState, useEffect } from "react";
import { Form } from "antd";

import dayjs from "dayjs";
import { getCodeDetailApi } from "@apis/comCode";
import type { SlipRegistSrchRequest } from "@/types/fcm/gl/slip/SlipRegist/SlipRegist.types";
import {
  FormInput,
  FormDatePicker,
  FormSelect,
  SearchActions,
} from "@components/ui/form";
import { usePageModal } from "@/hooks/usePageModal";
import { AppPageModal } from "@/components/ui/feedback";
import {
  DeptInqirePopup,
  WrterInqirePopup,
} from "@/pages/comPopup";
import type { SelectedDept } from "@/pages/comPopup/DeptInqirePopup";
import type { SelectedWriter } from "@/pages/comPopup/WrterInqirePopup";
import { useAuthStore } from "@/store/authStore";

import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";

type FilterPanelProps = {
  className?: string;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  const { handleSearch: executeSearch, reset } = useSlipRegist();
  const [businessUnitOptions, setBusinessUnitOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // 사용자 정보 가져오기 (asOfficeId용) - DetailGrid.tsx 참고
  const { user } = useAuthStore();

  const [form] = Form.useForm();

  // 부서조회 팝업 모달 관리
  const deptModal = usePageModal<
    {
      initialDeptCode?: string;
      asOfficeId?: string;
      asStndDate?: string;
    },
    SelectedDept
  >(DeptInqirePopup, {
    title: "부서조회",
    width: 700,
    height: 600,
    onReturn: (value) => {
      form.setFieldsValue({
        makeDeptName: value.makeDeptName,
        "makeDept": value.makeDept,
      });
    },
  });

  // 작성자조회 팝업 모달 관리
  const writerModal = usePageModal<
    {
      initialUserId?: string;
      asOfficeId?: string;
      asDeptCode?: string;
    },
    SelectedWriter
  >(WrterInqirePopup, {
    title: "작성자조회",
    width: 700,
    height: 600,
    onReturn: (value) => {
      form.setFieldsValue({
        makeUserName: value.makeUserName,
        "makeUser": value.makeUser,
      });
    },
  });

  // 컴포넌트 마운트 시 상태 초기화
  useEffect(() => {
    reset();

    // 컴포넌트 언마운트 시 cleanup
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 사업부 옵션 조회
  useEffect(() => {
    const fetchBusinessUnitOptions = async () => {
      try {
        const response = await getCodeDetailApi({
          module: "PF",
          type: "ORG",
          enabledFlag: "Y",
        });

        if (response.success && response.data) {
          const codeList = Array.isArray(response.data)
            ? response.data
            : [response.data];
          const transformedOptions = codeList
            .filter((item) => item.code && item.name1 && item.code !== "##")
            .map((item) => ({
              value: item.code as string,
              label: item.name1 as string,
            }));

          setBusinessUnitOptions([
            { value: "", label: "전체" },
            ...transformedOptions,
          ]);
        } else {
          setBusinessUnitOptions([{ value: "", label: "전체" }]);
        }
      } catch (error) {
        console.error("사업부 옵션 조회 실패:", error);
        setBusinessUnitOptions([{ value: "", label: "전체" }]);
      }
    };

    fetchBusinessUnitOptions();
  }, []);

  // @modified 2025-12-16 이상찬 SearchForm에서 전달된 values를 사용하도록 수정 (불필요한 Form 인스턴스 제거)
  const handleSearch = (values: any) => {
    // 여기에 검색 로직 추가
    // 회계일자 변환
    const dateRange = values["dateRange"] as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
    const dateFr = dateRange && dateRange[0] ? dateRange[0].format("YYYYMMDD") : "";
    const dateTr = dateRange && dateRange[1] ? dateRange[1].format("YYYYMMDD") : "";

    const searchParams: SlipRegistSrchRequest = {
      asRpsnOffice: values["asRpsnOffice"] || "",
      dvs: values["dvs"] || "",
      dateFr,
      dateTr,
      slpHeaderId: values["slpHeaderId"] || "",
      makeDept: values["makeDept"] || "",
      makeDeptName: values["makeDeptName"] || "",
      makeUser: values["makeUser"] || "",
      makeUserName: values["makeUserName"] || "",
    };

    executeSearch(searchParams);
  };

  return (
    <>
      <SearchActions
        initialValues={{
          dateRange: [dayjs().startOf("month"), dayjs()],
        }}
        onSearch={handleSearch}
        visibleRows={1}
        columnsPerRow={4}
        resetExpandOnReset={true}
        className={className}
        form={form}
      >
        {/* 사업부 필드 */}
        <FormSelect
          name="dvs"
          label="사업부"
          placeholder="전체"
          options={businessUnitOptions}
        />

        {/* 회계일자 필드 */}
        <FormDatePicker
          name="dateRange"
          label="회계일자"
          isRange={true}
          rules={[{ required: true, message: "시작일을 선택해주세요" }]}
        />

        {/* 작성부서 입력 필드 */}
        <FormInput
          type="search"
          name="makeDeptName"
          label="작성부서"
          showReadOnlyBoxName="makeDept"
          placeholder="작성부서를 입력하세요"
          width="350px"
          onSearch={(value) => {
            // 작성부서 팝업 열기
            deptModal.openModal({
              initialDeptCode: value || undefined,
              asOfficeId: user?.officeId,
              asStndDate: dayjs().format("YYYYMMDD"),
            });
          }}
        />

        {/* 작성자 입력 필드 */}
        <FormInput
          type="search"
          name="makeUserName"
          label="작성자"
          showReadOnlyBoxName="makeUser"
          placeholder="작성자를 입력하세요"
          width="350px"
          onSearch={(value) => {
            writerModal.openModal({
              initialUserId: value || undefined,
              asOfficeId: user?.officeId,
            });
          }}
        />

      </SearchActions>

      {/* 부서조회 팝업 모달 - SearchActions 밖에 배치하여 정상 렌더링 보장 */}
      <AppPageModal {...deptModal.modalProps} />

      {/* 작성자조회 팝업 모달 - SearchActions 밖에 배치하여 정상 렌더링 보장 */}
      <AppPageModal {...writerModal.modalProps} />
    </>
  );
};

export default FilterPanel;
