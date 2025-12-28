import React, { useRef, useCallback, useMemo } from "react";
import type { GridApi, ColDef, GridReadyEvent, CellStyle } from "ag-grid-community";
import { FormAgGrid, FormButton } from "@components/ui/form";
import { LeftGridStyles } from "./LeftGrid.styles";
import type { FgcryEvlHderListResponse } from "@/types/fcm/gl/settlement/fgcryEvl.types";
import { useFgcryEvlStore } from "@/store/fcm/gl/settlement/FgcryEvlStore";

// 초기 데이터 (빈 배열)
const initialLeftGridData: FgcryEvlHderListResponse[] = [];

type LeftGridProps = {
  className?: string;
  rowData?: FgcryEvlHderListResponse[];
};

const LeftGrid: React.FC<LeftGridProps> = ({
  className,
  rowData: propRowData,
}) => {
  // store에서 searchData 구독 추가
  const { searchData, setGridApi } = useFgcryEvlStore();
  const gridRef = useRef<GridApi | null>(null);

  // propRowData가 있으면 propRowData 사용, 없으면 store의 searchData 사용
  // searchData를 dependency에 추가하여 store 업데이트 시 자동 반영
  const rowData = useMemo<(FgcryEvlHderListResponse & { id?: string })[]>(() => {
    const rawRowData = propRowData || searchData || initialLeftGridData;
    return rawRowData.map((item, index) => ({
      ...item,
      id: item.slpHeaderId || item.frExEvalId || String(index),
    }));
  }, [propRowData, searchData]); // searchData를 dependency에 추가

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setGridApi(params.api); // store에 gridApi 저장
    },
    [setGridApi]
  );

  // 컬럼 정의
  const columnDefs: ColDef<FgcryEvlHderListResponse & { id?: string }>[] = useMemo(
    () => [
      {
        headerName: "No.",
        width: 60,
        pinned: "left",
        valueGetter: (params) => {
          return (params.node?.rowIndex ?? 0) + 1;
        },
        sortable: false,
        filter: false,
        resizable: false,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "evalType",
        headerName: "평가구분",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "slipNo",
        headerName: "전표번호",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "revSlipNo",
        headerName: "Reverse 전표번호",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "evaluationType",
        headerName: "평가구분코드",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "slpHeaderId",
        headerName: "전표헤더ID",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "revSlpHeaderId",
        headerName: "Reverse 전표헤더ID",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "stdDate",
        headerName: "기준일자",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "frExEvalId",
        headerName: "외화평가ID",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "slipNoPosted",
        headerName: "전표전기여부",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "revSlipNoPosted",
        headerName: "Reverse 전표전기여부",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "createdBy",
        headerName: "생성자",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "creationDate",
        headerName: "생성일시",
        width: 160,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "lastUpdatedBy",
        headerName: "최종수정자",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "lastUpdateDate",
        headerName: "최종수정일시",
        width: 160,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "programId",
        headerName: "프로그램ID",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "terminalId",
        headerName: "터미널ID",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
    ] as ColDef<FgcryEvlHderListResponse & { id?: string }>[],
    []
  );

  // handleCreate 함수 정의 (create 버튼 클릭 시 사용)
  const handleCreate = useCallback(() => {
    // TODO: 생성 로직 구현
  }, []);


  return (
    <LeftGridStyles className={className}>
      <div className="data-grid-panel">
        {/* 그리드 */}
        <FormAgGrid<FgcryEvlHderListResponse & { id?: string }>
          rowData={rowData}
          headerHeight={32}
          columnDefs={columnDefs}
          height={600}
          excelFileName="외화평가_목록"
          idField="id"
          showToolbar={true}
          styleOptions={{
            fontSize: "12px",
            headerFontSize: "12px",
            rowHeight: "32px",
            headerHeight: "32px",
            cellPadding: "6px",
            headerPadding: "8px",
            selectedRowBackgroundColor: "#e6f7ff",
            hoverRowBackgroundColor: "#bae7ff",
          }}
          gridOptions={{
            defaultColDef: {
              flex: undefined,
            },
            rowSelection: "multiple",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: true,
            onSelectionChanged: (params) => {
              if (import.meta.env.DEV) {
                console.log("선택 변경:", params.api.getSelectedRows());
              }
            },
            onGridReady: handleGridReady,
            onFirstDataRendered: () => {
              if (gridRef.current) {
                setGridApi(gridRef.current);
              }
            },
            onCellValueChanged: (params) => {
              if (import.meta.env.DEV) {
                console.log("셀 값 변경:", {
                  field: params.colDef.field,
                  oldValue: params.oldValue,
                  newValue: params.newValue,
                  data: params.data,
                });
              }
            },
          }}
          toolbarButtons={{
            showDelete: false,
            showCopy: false,
            showAdd: false,
            enableExcelDownload: true,
            showSave: false,
            showExcelUpload: false
          }}
          customButtons={[
            <FormButton
              key="create"
              size="small"
              className="data-grid-panel__button data-grid-panel__button--search"
              onClick={handleCreate}
            >
              Create
            </FormButton>,
            <FormButton
              key="delete"
              size="small"
              className="data-grid-panel__button data-grid-panel__button--delete"
              onClick={() => {
                console.log("delete");
              }}
            >
              Delete
            </FormButton>,
            <FormButton
              key="reverse"
              size="small"
              className="data-grid-panel__button data-grid-panel__button--reverse"
              onClick={() => {
                console.log("reverse");
              }}
            >
              Reverse
            </FormButton>,
          ]}
        />
      </div>
    </LeftGridStyles>
  );
};

export default LeftGrid;
