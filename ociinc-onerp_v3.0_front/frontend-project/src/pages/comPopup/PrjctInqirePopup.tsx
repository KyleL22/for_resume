/**
 * 프로젝트조회 팝업 (Project Inquiry Popup)
 * 
 * @description 진행 중이거나 등록된 프로젝트 정보 조회를 위한 공통 팝업
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
import { selectPrjctInqirePopupList } from "@apis/comPopup";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import type {
  PrjctInqirePopupProps,
  PrjctInqirePopupSrchRequest,
  PrjctInqirePopupListResponse,
  SelectedProject,
} from "@/types/comPopup/PrjctInqirePopup.types";

export type { SelectedProject };

const PrjctInqirePopup: FC<
  PrjctInqirePopupProps & InjectedProps<SelectedProject>
> = ({ asOfficeId, initialProjectCode, returnValue, close }) => {
  const [projectList, setProjectList] = useState<PrjctInqirePopupListResponse[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);

  // 검색 함수
  const handleSearch = useCallback(async (values?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const asProjectCodeInput = values?.asProjectCode as string | undefined;
      const apiParams: PrjctInqirePopupSrchRequest = {
        asOfficeId: asOfficeId,
        asProjectCode: asProjectCodeInput || undefined,
      };

      const response = await selectPrjctInqirePopupList(apiParams);

      if (response.success && response.data) {
        const transformedData: PrjctInqirePopupListResponse[] = response.data.map((item, index) => {
          const projectCode = String(item.projectId || item.PROJECT_ID || item.project_id || item.projectCode || item.PROJECT_CODE || item.project_code || "");
          const projectName = String(item.projectName || item.PROJECT_NAME || item.project_name || "");

          return {
            ...item,
            id: projectCode || `row-${index}`,
            projectCode,
            projectName,
          };
        });
        setProjectList(transformedData);
      } else {
        showError(response.message || "프로젝트 목록 조회 중 오류가 발생했습니다.");
        setProjectList([]);
      }
    } catch (error) {
      console.error("프로젝트 목록 조회 오류:", error);
      showError("프로젝트 목록 조회 중 오류가 발생했습니다.");
      setProjectList([]);
    } finally {
      setLoading(false);
    }
  }, [asOfficeId]);

  // 초기 프로젝트코드가 있으면 자동 조회
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (initialProjectCode) {
      form.setFieldsValue({ asProjectCode: initialProjectCode });
    }
    handleSearch(form.getFieldsValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // 그리드 더블클릭 이벤트
  const handleRowDoubleClick = useCallback(
    (params: RowDoubleClickedEvent<PrjctInqirePopupListResponse>) => {
      const data = params.data;
      if (data && data.projectCode) {
        returnValue({
          projectCode: data.projectCode,
          projectName: data.projectName || "",
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
  const columnDefs: ExtendedColDef<PrjctInqirePopupListResponse>[] = [
    {
      field: "projectCode",
      headerName: "Project Id",
      width: 150,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "projectName",
      headerName: "Project Name",
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
              setProjectList([]);
            }}
            visibleRows={1}
            columnsPerRow={3}
            resetExpandOnReset={true}
            className="page-layout__filter-panel"
          >
            <FormInput
              name="asProjectCode"
              label="검색어"
              placeholder="프로젝트코드 또는 프로젝트명 입력"
              style={{ width: "350px" }}
              onPressEnter={() => handleSearch(form.getFieldsValue())}
            />
          </SearchActions>
        </div>
      }
      topPanel={
        <div className="page-layout__grid">
          <FormAgGrid<PrjctInqirePopupListResponse>
            rowData={projectList}
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

export default PrjctInqirePopup;
