import React, { useRef, useCallback, useMemo } from "react";
import type {
  GridApi,
  ColDef,
  GridReadyEvent,
  CellStyle,
} from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { LeftGridStyles } from "./LeftGrid.styles";
import { useAtmcJrnlzMastrSetupStore } from "@/store/fcm/md/account/AtmcJrnlzMastrSetupStore";
import type { AtmcJrnlzMastrSetupHderListResponse } from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";

export type LeftGridData = AtmcJrnlzMastrSetupHderListResponse & {
  id?: string;
};

// 초기 데이터 (빈 배열)
const initialLeftGridData: AtmcJrnlzMastrSetupHderListResponse[] = [];

type LeftGridProps = {
  className?: string;
  rowData?: AtmcJrnlzMastrSetupHderListResponse[];
};

const LeftGrid: React.FC<LeftGridProps> = ({
  className,
  rowData: propRowData,
}) => {
  // store에서 필요한 값들 가져오기
  const headerList = useAtmcJrnlzMastrSetupStore((state) => state.headerList);
  const setHeaderGridApi = useAtmcJrnlzMastrSetupStore((state) => state.setHeaderGridApi);
  const selectHeaderRow = useAtmcJrnlzMastrSetupStore((state) => state.selectHeaderRow);
  const gridRef = useRef<GridApi | null>(null);

  // propRowData가 있으면 propRowData 사용, 없으면 store의 headerList 사용
  // headerList를 dependency에 추가하여 store 업데이트 시 자동 반영
  const rowData = useMemo<(AtmcJrnlzMastrSetupHderListResponse & { id?: string })[]>(() => {
    const rawRowData = propRowData || headerList || initialLeftGridData;
    return rawRowData.map((item, index) => ({
      ...item,
      // 고유 ID 생성: applName_accountingType_glItem 조합 또는 index 사용
      id: item.applName && item.accountingType && item.glItem
        ? `${item.applName}_${item.accountingType}_${item.glItem}_${index}`
        : String(index),
    }));
  }, [propRowData, headerList]); // headerList를 dependency에 추가

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setHeaderGridApi(params.api); // store에 gridApi 저장
    },
    [setHeaderGridApi]
  );

  // 행 선택 변경 핸들러
  const handleSelectionChanged = useCallback(
    async (params: { api: GridApi }) => {
      const selectedRows = params.api.getSelectedRows() as LeftGridData[];
      
      if (import.meta.env.DEV) {
        console.log("선택 변경:", selectedRows);
      }

      // 첫 번째 선택된 행만 사용 (단일 선택으로 처리)
      const selectedRow = selectedRows.length > 0 ? selectedRows[0] : null;
      
      // store의 selectHeaderRow 호출하여 RightGrid 조회
      await selectHeaderRow(selectedRow);
    },
    [selectHeaderRow]
  );

  // 컬럼 정의
  const columnDefs: ColDef<AtmcJrnlzMastrSetupHderListResponse & { id?: string }>[] = useMemo(
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
        field: "applName",
        headerName: "모듈명",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accountingType",
        headerName: "회계유형",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "glItem",
        headerName: "GL항목",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "description",
        headerName: "적요",
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-left",
      },
      {
        field: "lastUpdatedBy",
        headerName: "최종수정자",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "lastUpdateDate",
        headerName: "최종수정일시",
        width: 160,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
    ] as ColDef<AtmcJrnlzMastrSetupHderListResponse & { id?: string }>[],
    []
  );

  return (
    <LeftGridStyles className={className}>
      <div className="data-grid-panel">
        {/* 그리드 */}
        <FormAgGrid<AtmcJrnlzMastrSetupHderListResponse & { id?: string }>
          rowData={rowData}
          headerHeight={32}
          columnDefs={columnDefs}
          height={600}
          excelFileName="자동분개마스터셋업_목록"
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
            rowSelection: "single", // 단일 선택으로 변경
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: false, // 행 클릭으로 선택 가능하도록 변경
            onSelectionChanged: handleSelectionChanged, // 선택 변경 핸들러 추가
            onGridReady: handleGridReady,
            onFirstDataRendered: () => {
              if (gridRef.current) {
                setHeaderGridApi(gridRef.current);
              }
            },
          }}
          toolbarButtons={{
            showDelete: false,
            showCopy: false,
            showAdd: false,
            enableExcelDownload: true,
            showSave: false,
            showExcelUpload: false,
          }}
        />
      </div>
    </LeftGridStyles>
  );
};

export default LeftGrid;
