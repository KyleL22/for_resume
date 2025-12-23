/**
 * 계정조회 팝업 (Account Inquiry Popup)
 * 
 * @description 시스템 공통 계정 과목 조회를 위한 팝업 컴포넌트
 * @author 김민수
 * @date 2025-12-18
 * @last_modified 2025-12-18
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form } from "antd";
import type { GridApi } from "ag-grid-community";
import VerticalLayout from "@/components/ui/layout/VerticalLayout/VerticalLayout";
import {
  FormInput,
  FormCheckbox,
  SearchActions,
  FormAgGrid,
} from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import { selectAcntInqirePopupList } from "@apis/comPopup/acntInqirePopupApi";
import type {
  AcntInqirePopupSrchRequest,
  AcntInqirePopupListResponse,
} from "@/types/comPopup/AcntInqirePopup.types";
import { showError } from "@components/ui/feedback";
import type { InjectedProps } from "@/components/ui/feedback/Modal/PageModal";
import { isEmpty } from "@utils/stringUtils";

export type SelectedAccount = AcntInqirePopupListResponse;

type AcntInqirePopupListResponseWithId = AcntInqirePopupListResponse & {
  id?: string;
};

interface AcntInqirePopupProps {
  /** 대표사무소 */
  asOfficeId?: string;
  /** 초기 계정코드 */
  initialAccCode?: string;
  /** 초기 검색 조건 (하위 호환성 유지) */
  initialSearch?: Partial<AcntInqirePopupSrchRequest>;
}

const AcntInqirePopup: React.FC<
  AcntInqirePopupProps & InjectedProps<SelectedAccount>
> = ({ asOfficeId, initialAccCode, initialSearch, returnValue, close: _close }) => {
  void _close;
  const gridApiRef = useRef<GridApi | null>(null);
  const [rowData, setRowData] = useState<AcntInqirePopupListResponseWithId[]>(
    []
  );
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);

  const addIdToData = useCallback(
    (
      data: AcntInqirePopupListResponse[]
    ): AcntInqirePopupListResponseWithId[] => {
      return data.map((item, index) => ({
        ...item,
        id: item.accCode || `row-${index}`,
      }));
    },
    []
  );

  const createSearchRequest = useCallback(
    (asAccCde?: string, asCstPayYn?: boolean): AcntInqirePopupSrchRequest => {
      return {
        asOfficeId: asOfficeId || initialSearch?.asOfficeId || "OSE",
        asAccCde: !isEmpty(asAccCde) ? asAccCde : (initialAccCode || initialSearch?.asAccCde),
        asAccActYn: initialSearch?.asAccActYn,
        asCstPayYn: asCstPayYn === true ? "Y" : undefined,
        asUseYn: initialSearch?.asUseYn || "Y",
        asAccLvl: initialSearch?.asAccLvl,
      };
    },
    [asOfficeId, initialAccCode, initialSearch]
  );

  const handleSearch = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        const asAccCde = values.asAccCde as string | undefined;
        const asCstPayYn = values.asCstPayYn as boolean | undefined;
        const request = createSearchRequest(asAccCde, asCstPayYn);

        const response = await selectAcntInqirePopupList(request);
        if (response.success && response.data) {
          setRowData(addIdToData(response.data));
        } else {
          showError(response.message || "계정조회에 실패했습니다.");
        }
      } catch {
        showError("계정조회 중 오류가 발생했습니다.");
      }
    },
    [createSearchRequest, addIdToData]
  );

  const columnDefs: ExtendedColDef<AcntInqirePopupListResponseWithId>[] = [
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
      valueGetter: () => "",
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "accCode",
      headerName: "계정코드",
      width: 150,
      minWidth: 150,
      maxWidth: 150,
      sortable: true,
      filter: true,
      headerAlign: "center",
    },
    {
      field: "accName",
      headerName: "계정과목명",
      width: 200,
      sortable: true,
      filter: true,
      flex: 1,
      headerAlign: "center",
    },
  ];

  const handleRowDoubleClick = useCallback(
    (event: { data: AcntInqirePopupListResponseWithId }) => {
      if (!event.data || !returnValue) return;

      const accountData: AcntInqirePopupListResponse = {
        officeId: event.data.officeId,
        accCode: event.data.accCode,
        accName: event.data.accName,
        accEngName: event.data.accEngName,
        accAbb: event.data.accAbb,
        actAccYn: event.data.actAccYn,
        accLvl: event.data.accLvl,
      };
      returnValue(accountData);
    },
    [returnValue]
  );

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const accCode = initialAccCode || initialSearch?.asAccCde;
    const initialRequest = createSearchRequest(accCode, undefined);

    if (accCode) {
      form.setFieldsValue({ asAccCde: accCode });
    }

    (async () => {
      try {
        const response = await selectAcntInqirePopupList(initialRequest);
        if (response.success && response.data) {
          setRowData(addIdToData(response.data));
        } else {
          showError(response.message || "계정조회에 실패했습니다.");
        }
      } catch {
        showError("계정조회 중 오류가 발생했습니다.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <VerticalLayout
      filterPanel={
        <div className="page-layout__filter-panel">
          <SearchActions
            form={form}
            onSearch={handleSearch}
            visibleRows={1}
            columnsPerRow={4}
            resetExpandOnReset={true}
            className="page-layout__filter-panel"
          >
            <FormInput
              name="asAccCde"
              label="계정코드"
              placeholder="계정코드를 입력하세요"
              style={{ width: "150px", marginRight: "100px" }}
              onPressEnter={() => handleSearch(form.getFieldsValue())}
            />
            <FormCheckbox name="asCstPayYn" label="지결표시여부" />
          </SearchActions>
        </div>
      }
      topPanel={
        <div className="page-layout__grid">
          <FormAgGrid<AcntInqirePopupListResponseWithId>
            rowData={rowData}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            onRowDoubleClicked={handleRowDoubleClick}
            height={400}
            gridOptions={{
              rowSelection: "single",
              pagination: false,
            }}
            enableFilter={true}
            showToolbar={false}
            idField="id"
          />
        </div>
      }
    />
  );
};

export default AcntInqirePopup;
