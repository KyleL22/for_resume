import React, { useRef, useCallback, useMemo } from "react";
import type {
  GridApi,
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
  IRowNode,
} from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { RightGridStyles } from "./RightGrid.styles";

import { useAtmcJrnlzMastrSetupStore } from "@/store/fcm/md/account/AtmcJrnlzMastrSetupStore";
import type { AtmcJrnlzMastrSetupDetailListResponse } from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";

export type RightGridData = AtmcJrnlzMastrSetupDetailListResponse & {
  id?: string;
  rowStatus?: "C" | "U" | "D";
};

type RightGridProps = {
  className?: string;
};

const RightGrid: React.FC<RightGridProps> = ({ className }) => {
  const gridRef = useRef<GridApi | null>(null);
  const detailList = useAtmcJrnlzMastrSetupStore((state) => state.detailList);
  const originalDetailList = useAtmcJrnlzMastrSetupStore((state) => state.originalDetailList);
  //const selectedHeaderRow = useAtmcJrnlzMastrSetupStore((state) => state.selectedHeaderRow);
  const setDetailGridApi = useAtmcJrnlzMastrSetupStore((state) => state.setDetailGridApi);
  //const save = useAtmcJrnlzMastrSetupStore((state) => state.save);

  // 그리드 데이터를 useMemo로 관리 (store와 분리하여 편집 중 리렌더링 방지)
  // 조회 완료 시점에만 갱신되도록 detailList 전체를 의존성으로 설정
  const gridRowData = useMemo(() => {
    return detailList.map((item, index) => ({
      ...item,
      id: item.officeId && item.applName && item.accountingType && item.glItem
        ? `${item.officeId}_${item.applName}_${item.accountingType}_${item.glItem}_${index}`
        : String(index),
      _rowIndex: index, // fallback용 인덱스 저장
    }));
  }, [detailList]);

  // 원본 데이터 Map 생성 (getChangedRows에서 사용)
  const originalDetailMap = useMemo(() => {
    const map = new Map<string, RightGridData>();
    originalDetailList.forEach((item, index) => {
      const id = item.officeId && item.applName && item.accountingType && item.glItem
        ? `${item.officeId}_${item.applName}_${item.accountingType}_${item.glItem}_${index}`
        : String(index);
      map.set(id, { ...item, id });
    });
    return map;
  }, [originalDetailList]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setDetailGridApi(params.api);
    },
    [setDetailGridApi]
  );

  // 변경된 행 추출 (모든 행 확인 - 스크롤 밖 행 포함)
  const getChangedRows = useCallback((): RightGridData[] => {
    if (!gridRef.current) return [];
    const changedRows: RightGridData[] = [];

    // 그리드에서 모든 행 데이터 가져오기 (forEachNode 사용)
    gridRef.current.forEachNode((node: IRowNode<RightGridData>) => {
      const item = node.data as RightGridData;
      if (!item) return;

      const original = item.id ? originalDetailMap.get(item.id) : undefined;

      if (original) {
        // 원본과 비교하여 변경사항이 있으면 추가
        const hasChanges = 
          original.accountCode !== item.accountCode ||
          original.cusCde !== item.cusCde ||
          original.itemCode !== item.itemCode ||
          original.glClass !== item.glClass;
        
        if (hasChanges || item.rowStatus) {
          changedRows.push({ ...item });
        }
      } else {
        // 원본에 없는 경우 (새로 추가된 경우)
        if (item.rowStatus === "C") {
          changedRows.push({ ...item });
        }
      }
    });
    return changedRows;
  }, [originalDetailMap]);

  // 저장 버튼 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      return;
    }

    // 변경된 행만 추출
    const changedRows = getChangedRows();
    if (changedRows.length === 0) {
      return;
    }

    // TODO: 저장 로직 구현 (store에 save 함수가 있으면 호출)
    // await save(changedRows);
  }, [getChangedRows]);

  // 셀 값 변경 핸들러 (필요시 구현)
  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<RightGridData>) => {
      if (!params.data) return;

      const row = params.data as RightGridData;
      
      // 원본과 비교하여 rowStatus 설정
      const original = row.id ? originalDetailMap.get(row.id) : undefined;
      if (original) {
        // 원본과 비교하여 변경사항이 있으면 수정 상태
        const hasChanges = 
          original.accountCode !== row.accountCode ||
          original.cusCde !== row.cusCde ||
          original.itemCode !== row.itemCode ||
          original.glClass !== row.glClass;
        
        if (hasChanges) {
          row.rowStatus = "U";
        } else {
          row.rowStatus = undefined;
        }
      } else {
        // 원본이 없는 신규 행
        if (row.rowStatus !== "C") {
          row.rowStatus = "U";
        }
      }

      // rowStatus 컬럼 refresh
      params.api.refreshCells({
        rowNodes: [params.node],
        columns: ["rowStatus"],
        force: true,
      });
    },
    [originalDetailMap]
  );

  // 컬럼 정의
  const columnDefs: ColDef<RightGridData>[] = useMemo(
    () => [
      {
        headerName: "No",
        width: 60,
        pinned: "left",
        valueGetter: (params) => {
          return (params.node?.rowIndex ?? 0) + 1;
        },
        sortable: false,
        filter: false,
        resizable: false,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
      {
        field: "rowStatus",
        headerName: "상태",
        width: 80,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
        cellRenderer: (params: { value: "C" | "U" | "D" | undefined }) => {
          if (!params.value) return null;
          const statusMap = {
            C: { text: "추가", color: "blue" },
            U: { text: "수정", color: "orange" },
            D: { text: "삭제", color: "red" },
          };
          const statusInfo = statusMap[params.value];
          if (!statusInfo) return null;
          return (
            <span style={{ color: statusInfo.color, fontWeight: "bold" }}>
              {statusInfo.text}
            </span>
          );
        },
      },
      {
        field: "applName",
        headerName: "모듈명",
        width: 120,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accountingType",
        headerName: "회계유형",
        width: 120,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
      {
        field: "glItem",
        headerName: "GL항목",
        width: 120,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
      {
        field: "glClass",
        headerName: "GL분류",
        width: 120,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accountCode",
        headerName: "계정코드",
        width: 120,
        headerClass: "ag-header-cell-center",
        cellStyle: { textAlign: "center" },
      },
      {
        field: "cusCde",
        headerName: "거래처코드",
        width: 120,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
      {
        field: "itemCode",
        headerName: "품목코드",
        width: 120,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
      {
        field: "lastUpdateDate",
        headerName: "최종수정일",
        width: 130,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
      {
        field: "lastUpdatedBy",
        headerName: "최종수정자",
        width: 130,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
    ],
    []
  );

  return (
    <RightGridStyles className={className}>
      <div className="data-grid-panel">
        <FormAgGrid<RightGridData & { id?: string }>
          rowData={gridRowData}
          headerHeight={32}
          columnDefs={columnDefs}
          height={600}
          excelFileName="자동분개마스터셋업_상세"
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
            // getRowId 설정: row id 매칭 안정화
            getRowId: (params) => {
              if (params.data?.id) {
                return String(params.data.id);
              }
              // id가 없는 경우 fallback
              const data = params.data as RightGridData & {
                _rowIndex?: number;
              };
              return `row-right-${data?._rowIndex ?? "unknown"}`;
            },
            rowSelection: "multiple",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: false,
            singleClickEdit: false,
            onGridReady: handleGridReady,
            onCellValueChanged: handleCellValueChanged,
          }}
          toolbarButtons={{
            showDelete: true,
            showCopy: true,
            showAdd: true,
            enableExcelDownload: true,
            showSave: true,
          }}
          onSave={handleSave}
          customButtons={[]}
        />
      </div>
    </RightGridStyles>
  );
};

export default RightGrid;
