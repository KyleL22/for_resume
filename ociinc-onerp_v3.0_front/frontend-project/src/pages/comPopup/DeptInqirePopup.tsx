/**
 * 부서조회 팝업 (Department Inquiry Popup)
 * 
 * @description 조직도 내 부서 정보 조회를 위한 공통 팝업
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { FC } from "react";
import { Form } from "antd";
import type { InjectedProps } from "@/components/ui/feedback/Modal";
import { showError } from "@/components/ui/feedback/Message";
import VerticalLayout from "@/components/ui/layout/VerticalLayout/VerticalLayout";
import {
  FormInput,
  SearchActions,
  FormAgGrid,
} from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import type {
  GridApi,
  RowDoubleClickedEvent,
} from "ag-grid-community";
import { selectDeptInqirePopupList } from "@apis/comPopup";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";

import type {
  DeptInqirePopupProps,
  DeptInqirePopupSrchRequest,
  DeptInqirePopupListResponse,
  SelectedDept,
} from "@/types/comPopup/DeptInqirePopup.types";

export type { SelectedDept };

const DeptInqirePopup: FC<
  DeptInqirePopupProps & InjectedProps<SelectedDept>
> = ({ asOfficeId, initialDeptCode, asStndDate, returnValue, close }) => {
  const [deptList, setDeptList] = useState<DeptInqirePopupListResponse[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);

  // 검색 함수
  const handleSearch = useCallback(async (values?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const deptCodeInput = values?.deptCode as string | undefined;
      // API 요청 파라미터 (백엔드 DeptInqirePopupSrchRequest와 동일)
      const apiParams: DeptInqirePopupSrchRequest = {
        asOfficeId: asOfficeId || undefined,
        asFind: deptCodeInput || undefined,
        asStndDate: asStndDate || undefined,
      };

      const response = await selectDeptInqirePopupList(apiParams);

      if (response.success && response.data) {
        const transformedData: DeptInqirePopupListResponse[] = response.data.map((item, index) => ({
          ...item,
          id: item.deptCde || `row-${index}`,
          deptCde: String(item.deptCde || ""),
          deptNme: String(item.deptNme || ""),
        }));
        setDeptList(transformedData);
      } else {
        showError(response.message || "부서 목록 조회 중 오류가 발생했습니다.");
        setDeptList([]);
      }
    } catch (error) {
      console.error("부서 목록 조회 오류:", error);
      showError("부서 목록 조회 중 오류가 발생했습니다.");
      setDeptList([]);
    } finally {
      setLoading(false);
    }
  }, [asOfficeId, asStndDate]);

  // 초기 부서코드가 있으면 자동 조회
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (initialDeptCode) {
      form.setFieldsValue({ deptCode: initialDeptCode });
    }
    handleSearch(form.getFieldsValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 그리드 더블클릭 이벤트
  const handleRowDoubleClick = useCallback(
    (params: RowDoubleClickedEvent<DeptInqirePopupListResponse>) => {
      const data = params.data;
      if (data && data.deptCde) {
        returnValue({
          makeDept: data.deptCde,
          makeDeptName: data.deptNme || "",
        });
        close();
      }
    },
    [returnValue, close]
  );

  // ESC 키 처리
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [close]);

  // 그리드 컬럼 정의
  const columnDefs: ExtendedColDef<DeptInqirePopupListResponse>[] = [
    {
      field: "deptCde",
      headerName: "부서코드",
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "deptNme",
      headerName: "부서명",
      width: 300,
      sortable: true,
      filter: true,
      flex: 1,
      headerAlign: "center",
    },
  ];

  return (
    <VerticalLayout
      filterPanel={
        <div className="page-layout__filter-panel">
          <SearchActions
            form={form}
            onSearch={handleSearch}
            showReset={true}
            onReset={() => {
              form.resetFields();
              setDeptList([]);
            }}
            visibleRows={1}
            columnsPerRow={3}
            resetExpandOnReset={true}
            className="page-layout__filter-panel"
          >
            <FormInput
              name="deptCode"
              label="검색"
              placeholder="부서코드 또는 부서명 입력"
              style={{ width: "250px" }}
              onPressEnter={() => handleSearch(form.getFieldsValue())}
            />
          </SearchActions>
        </div>
      }
      topPanel={
        <div className="page-layout__grid">
          <FormAgGrid<DeptInqirePopupListResponse>
            rowData={deptList}
            columnDefs={columnDefs}
            height={400}
            onGridReady={onGridReady}
            onRowDoubleClicked={handleRowDoubleClick}
            enableFilter={true}
            gridOptions={{
              rowSelection: "single",
              pagination: false,
            }}
            showToolbar={false}
            headerTextAlign="center"
            idField="id"
          />
        </div>
      }
    />
  );
};

export default DeptInqirePopup;
