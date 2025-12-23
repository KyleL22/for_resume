/**
 * 품목군조회 팝업 (Product Section Inquiry Popup)
 * 
 * @description 마스터에 등록된 품목 구분을 조회하는 공통 팝업
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
  FormSelect,
  SearchActions,
  FormAgGrid,
} from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import type {
  GridApi,
  RowDoubleClickedEvent,
} from "ag-grid-community";
import { selectPrdlstSeInqirePopupList } from "@apis/comPopup";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import type {
  PrdlstSeInqirePopupProps,
  PrdlstSeInqirePopupSrchRequest,
  PrdlstSeInqirePopupListResponse,
  SelectedPrdlstSe,
} from "@/types/comPopup/PrdlstSeInqirePopup.types";

export type { SelectedPrdlstSe };

const PrdlstSeInqirePopup: FC<
  PrdlstSeInqirePopupProps & InjectedProps<SelectedPrdlstSe>
> = ({ asOfficeId = "OSE", asOrgId = "", itemGroup, returnValue, close }) => {
  const [prdlstSeList, setPrdlstSeList] = useState<PrdlstSeInqirePopupListResponse[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);


  // 검색 함수
  const handleSearch = useCallback(async (values?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const asMatclass = values?.asMatclass as string | undefined;
      const asSegment = values?.asSegment as string | undefined;
      const apiParams: PrdlstSeInqirePopupSrchRequest = {
        asOfficeId: asOfficeId || "OSE",
        asOrgId: asOrgId || "",
        asMatclass: asMatclass || "",
        asSegment: asSegment || "",
      };

      const response = await selectPrdlstSeInqirePopupList(apiParams);
      if (response.success && response.data) {
        const transformedData: PrdlstSeInqirePopupListResponse[] = response.data.map((item, index) => {
          const itemGroup = item.itemGroup || "";
          const itemGroupName = item.itemGroupName || "";

          return {
            id: itemGroup || `row-${index}`,
            itemGroup,
            itemGroupName,
          };
        });

        setPrdlstSeList(transformedData);
      } else {
        showError(response.message || "품목군 목록 조회 중 오류가 발생했습니다.");
        setPrdlstSeList([]);
      }
    } catch (error) {
      console.error("품목군 목록 조회 오류:", error);
      showError("품목군 목록 조회 중 오류가 발생했습니다.");
      setPrdlstSeList([]);
    } finally {
      setLoading(false);
    }
  }, [asOfficeId, asOrgId]);

  // 초기 품목군코드가 있으면 자동 조회
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (itemGroup) {
      form.setFieldsValue({ asSegment: itemGroup });
    }
    handleSearch(form.getFieldsValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 그리드 더블클릭 이벤트
  const handleRowDoubleClick = useCallback(
    (params: RowDoubleClickedEvent<PrdlstSeInqirePopupListResponse>) => {
      const data = params.data;
      if (data && data.itemGroup) {
        returnValue({
          itemGroup: data.itemGroup,
          itemGroupName: data.itemGroupName || "",
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
  const columnDefs: ExtendedColDef<PrdlstSeInqirePopupListResponse>[] = [
    {
      headerName: "No.",
      minWidth: 90,
      maxWidth: 90,
      width: 90,
      valueGetter: (params) => {
        if (params.node?.rowIndex !== null) {
          return (params.node?.rowIndex ?? 0) + 1;
        }
        return "";
      },
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "상태",
      width: 90,
      minWidth: 90,
      maxWidth: 90,
      valueGetter: () => "사용",
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "itemGroup",
      headerName: "품목군코드",
      width: 150,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "itemGroupName",
      headerName: "품목군명",
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
              setPrdlstSeList([]);
            }}
            visibleRows={1}
            columnsPerRow={3}
            resetExpandOnReset={true}
            className="page-layout__filter-panel"
          >
            <FormSelect
              name="asMatclass"
              label="품목구분"
              placeholder="품목구분 선택"
              comCodeParams={{
                module: "INV",
                type: "MATCLASS",
              }}
              style={{ width: "200px" }}
              allOptionLabel="전체"
            />
            <FormInput
              name="asSegment"
              label="검색어"
              placeholder="품목군코드 또는 품목군명 입력"
              style={{ width: "350px" }}
              onPressEnter={() => handleSearch(form.getFieldsValue())}
            />
          </SearchActions>
        </div>
      }
      topPanel={
        <div className="page-layout__grid">
          <FormAgGrid<PrdlstSeInqirePopupListResponse>
            rowData={prdlstSeList}
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

export default PrdlstSeInqirePopup;
