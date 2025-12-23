import React, { useRef, useCallback, useMemo } from "react";
import type { GridApi, GridReadyEvent, CellStyle, ColDef } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import type { AdvpayCtDtaCreatSearchResponse } from "@/types/fcm/gl/settlement/AdvpayCtDtaCreat.types";
import { useAdvpayCtDtaCreatStore } from "@/store/fcm/gl/settlement/AdvpayCtDtaCreatStore";


type DetailGridProps = {
  className?: string;
  rowData?: AdvpayCtDtaCreatSearchResponse[];
};

type AdvpayCtDtaCreatDataWithStatus = AdvpayCtDtaCreatSearchResponse & {
  rowStatus?: "C" | "U" | "D";
};

const DetailGrid: React.FC<DetailGridProps> = ({ rowData: propRowData }) => {
  // store에서 searchData 구독 추가
  const { searchData, setGridApi } = useAdvpayCtDtaCreatStore();
  const gridRef = useRef<GridApi | null>(null);

  // propRowData가 있으면 propRowData 사용, 없으면 store의 searchData 사용
  // searchData가 없거나 빈 배열이면 빈 배열 반환 (조회 결과 없음)
  // rowData를 id 필드와 함께 매핑 (useMemo로 최적화)
  const rowData = useMemo(() => {
    const rowRowData = propRowData || searchData || [];
    return rowRowData.map((item) => ({
      ...item,
      id: item.invoiceId ?? undefined,
    }));
  }, [propRowData, searchData]); // searchData를 dependency에 추가

  //그리드 준비 핸들러
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
    setGridApi(params.api); // store에 gridApi 저장
  }, [setGridApi]);

  // CheckboxHeaderRenderer 제거 (사용되지 않음)

  const columnDefs: ColDef<AdvpayCtDtaCreatDataWithStatus>[] = useMemo(
    () =>
      [
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
          field: "modified",
          headerName: "양식코드",
          width: 80,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "orgId",
          headerName: "코드",
          width: 100,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",

        },
        {
          field: "invoiceLineId",
          headerName: "표준계정코드",
          width: 150,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",

        },
        {
          field: "maturDate",
          headerName: "표준계정코드명",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "creationYn",
          headerName: "출력명",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "oDate",
          headerName: "사용여부",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "mkDate",
          headerName: "신규여부",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "toAccount",
          headerName: "계정 From",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "toAcctNme",
          headerName: "계정명 From",
          width: 150,
          cellStyle: { textAlign: "left" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "fromDept",
          headerName: "계정 To",
          width: 150,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "fromDeptName",
          headerName: "계정명 To",
          width: 180,
          cellStyle: { textAlign: "left" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "toDept",
          headerName: "ID",
          width: 150,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        }
      ] as ColDef<AdvpayCtDtaCreatDataWithStatus>[],
    []
  );

  return (
    <div className="data-grid-panel">
      <FormAgGrid<AdvpayCtDtaCreatDataWithStatus & { id?: string }>
        rowData={rowData}
        columnDefs={columnDefs}
        headerHeight={32}
        height={600}
        excelFileName="선급비용자료생성"
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
        gridOptions={useMemo(
          () => ({
            defaultColDef: {
              flex: undefined, // flex 제거하여 width가 적용되도록 함
            },
            animateRows: true,
            pagination: false,
            rowHeight: 32,
            suppressRowClickSelection: true,
            onGridReady: handleGridReady,
          }),
          [handleGridReady]
        )}
        onGridReady={handleGridReady}
        toolbarButtons={{
          showCopy: true,
          showAdd: true,
          showDelete: true,
          showSave: true,
          enableExcelDownload: true,
          showExcelUpload: false
        }}
        customButtons={[
        ]}
      />
    </div>
  );
};

export default DetailGrid;