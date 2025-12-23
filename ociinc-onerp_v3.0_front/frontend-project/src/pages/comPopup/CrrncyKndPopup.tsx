/**
 * 통화종류조회 팝업 (Currency Kind Popup)
 * 
 * @description 각국의 통화 코드 및 종류 조회를 위한 공통 팝업
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
import { selectCrrncyKndPopupList } from "@apis/comPopup";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import type {
  CrrncyKndPopupProps,
  CrrncyKndPopupSrchRequest,
  CrrncyKndPopupListResponse,
  SelectedCurrency,
} from "@/types/comPopup/CrrncyKndPopup.types";

export type { SelectedCurrency };

const CrrncyKndPopup: FC<
  CrrncyKndPopupProps & InjectedProps<SelectedCurrency>
> = ({ asOfficeId, initialCurrCode, returnValue, close }) => {
  const [currencyList, setCurrencyList] = useState<CrrncyKndPopupListResponse[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);

  // 검색 함수
  const handleSearch = useCallback(async (values?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const asCode = values?.asCode as string | undefined;
      // API 요청 파라미터
      const apiParams: CrrncyKndPopupSrchRequest = {
        asOfficeId: asOfficeId,
        asType: "FRNCUR",
        asCode: asCode || undefined,
      };

      const response = await selectCrrncyKndPopupList(apiParams);

      if (response.success && response.data) {
        // 백엔드 응답을 프론트엔드 형식으로 변환
        const transformedData: CrrncyKndPopupListResponse[] = response.data.map((item: any, index: number) => {
          const currCode = item.currCode || item.CURR_CODE || "";
          const currName = item.currName || item.CURR_NAME || "";
          const nameDesc = item.nameDesc || item.NAME_DESC || "";
          const orderSeq = item.orderSeq || item.ORDER_SEQ || "";

          const result: CrrncyKndPopupListResponse = {
            id: currCode || `row-${index}`,
            currCode: String(currCode),
            currName: String(currName),
            nameDesc: String(nameDesc),
            orderSeq: String(orderSeq),
          };

          // 나머지 필드도 포함
          Object.keys(item).forEach((key) => {
            if (
              !["CURR_CODE", "CURR_NAME", "NAME_DESC", "ORDER_SEQ", "currCode", "currName", "nameDesc", "orderSeq"].includes(key)
            ) {
              result[key] = item[key];
            }
          });

          return result;
        });

        setCurrencyList(transformedData);
      } else {
        showError(response.message || "화폐 목록 조회 중 오류가 발생했습니다.");
        setCurrencyList([]);
      }
    } catch (error) {
      console.error("화폐 목록 조회 오류:", error);
      showError("화폐 목록 조회 중 오류가 발생했습니다.");
      setCurrencyList([]);
    } finally {
      setLoading(false);
    }
  }, [asOfficeId]);

  // 초기 화폐코드가 있으면 자동 조회
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (initialCurrCode) {
      form.setFieldsValue({ asCode: initialCurrCode });
    }
    handleSearch(form.getFieldsValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // 그리드 더블클릭 이벤트
  const handleRowDoubleClick = useCallback(
    (params: RowDoubleClickedEvent<CrrncyKndPopupListResponse>) => {
      const data = params.data;
      if (data && data.currCode) {
        returnValue({
          currCode: data.currCode,
          currName: data.currName || "",
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
  const columnDefs: ExtendedColDef<CrrncyKndPopupListResponse>[] = [
    {
      field: "currCode",
      headerName: "코드",
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "currName",
      headerName: "코드명",
      width: 200,
      sortable: true,
      filter: true,
      headerAlign: "center",
    },
    {
      field: "nameDesc",
      headerName: "설명",
      width: 300,
      sortable: true,
      flex: 1,
      headerAlign: "center",
    },
    {
      field: "orderSeq",
      headerName: "정렬순서",
      width: 100,
      sortable: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
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
            onReset={() => form.resetFields()}
            visibleRows={1}
            columnsPerRow={3}
            resetExpandOnReset={true}
            className="page-layout__filter-panel"
          >
            <FormInput
              name="asCode"
              label="화폐코드/명"
              placeholder="화폐코드 또는 화폐명 입력"
              style={{ width: "250px" }}
              onPressEnter={() => handleSearch(form.getFieldsValue())}
            />
          </SearchActions>
        </div>
      }
      topPanel={
        <div className="page-layout__grid">
          <FormAgGrid<CrrncyKndPopupListResponse>
            rowData={currencyList}
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

export default CrrncyKndPopup;
