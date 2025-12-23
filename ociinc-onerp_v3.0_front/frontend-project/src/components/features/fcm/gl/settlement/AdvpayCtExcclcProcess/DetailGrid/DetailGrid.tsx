import React, { useRef, useCallback, useMemo } from "react";
import type { GridApi, GridReadyEvent, CellStyle, ColDef, IHeaderParams } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import type { AdvpayCtExcclcProcessDetailResponse } from "@/types/fcm/gl/settlement/AdvpayCtExcclcProcess";
import { useAdvpayCtExcclcProcessStore } from "@/store/fcm/gl/settlement/AdvpayCtExcclcProcesStore";
import { createCheckboxColumn } from "@utils/agGridUtils";


type DetailGridProps = {
  className?: string;
  rowData?: AdvpayCtExcclcProcessDetailResponse[];
};

type AdvpayCtExcclcProcessDataWithStatus = AdvpayCtExcclcProcessDetailResponse & {
  rowStatus?: "C" | "U" | "D";
};

const DetailGrid: React.FC<DetailGridProps> = ({ rowData: propRowData }) => {
  // store에서 searchData 구독 추가
  const { searchData, setGridApi } = useAdvpayCtExcclcProcessStore();
  const gridRef = useRef<GridApi | null>(null);

  // propRowData가 있으면 propRowData 사용, 없으면 store의 searchData 사용
  const rowData = useMemo<(AdvpayCtExcclcProcessDataWithStatus & { id?: string })[]>(() => {
    const rawRowData = propRowData || searchData || [];
    return rawRowData.map((item) => ({
      ...item,
      id: item.invoiceId !== undefined ? String(item.invoiceId) : undefined,
    }));
  }, [propRowData, searchData]); // searchData를 dependency에 추가

  const CheckboxHeaderRenderer = React.memo((params: IHeaderParams) => {
    const [isChecked, setIsChecked] = React.useState(false);
    const [isIndeterminate, setIsIndeterminate] = React.useState(false);

    // 모든 행의 체크 상태 확인
    const updateHeaderCheckboxState = React.useCallback(() => {
      if (!params.api) return;

      const rowNodes: AdvpayCtExcclcProcessDataWithStatus[] = [];
      params.api.forEachNode((node) => {
        if (node.data) {
          rowNodes.push(node.data);
        }
      });

      if (rowNodes.length === 0) {
        setIsChecked(false);
        setIsIndeterminate(false);
        return;
      }

      const checkedCount = rowNodes.filter((row) => row.chk === "Y").length;
      const allChecked = checkedCount === rowNodes.length;
      const someChecked = checkedCount > 0 && checkedCount < rowNodes.length;

      setIsChecked(allChecked);
      setIsIndeterminate(someChecked);
    }, [params.api]);
    // 헤더 체크박스 클릭 핸들러
    const handleHeaderCheckboxChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!params.api) return;

        const checked = e.target.checked;
        const rowNodes: any[] = [];
        
        params.api.forEachNode((node) => {
          if (node.data) {
            // 모든 행의 chk 값을 업데이트
            node.data.chk = checked ? "Y" : "N";
            rowNodes.push(node);
          }
        });

        // 그리드 업데이트
        if (rowNodes.length > 0) {
          params.api.refreshCells({
            rowNodes: rowNodes,
            columns: ["chk"],
            force: true,
          });
        }

        setIsChecked(checked);
        setIsIndeterminate(false);
      },
      [params.api]
    );

    // 초기 상태 설정 및 변경 감지
    React.useEffect(() => {
      updateHeaderCheckboxState();
      
      // 그리드 이벤트 리스너 등록
      const onModelUpdated = () => {
        updateHeaderCheckboxState();
      };
      
      params.api?.addEventListener("modelUpdated", onModelUpdated);
      params.api?.addEventListener("cellValueChanged", onModelUpdated);

      return () => {
        params.api?.removeEventListener("modelUpdated", onModelUpdated);
        params.api?.removeEventListener("cellValueChanged", onModelUpdated);
      };
    }, [params.api, updateHeaderCheckboxState]);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          ref={(input) => {
            if (input) {
              input.indeterminate = isIndeterminate;
            }
          }}
          onChange={handleHeaderCheckboxChange}
          style={{
            cursor: "pointer",
            margin: 0,
            width: "16px",
            height: "16px",
          }}
        />
      </div>
    );
  });    
  
  //그리드 준비 핸들러
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
    setGridApi(params.api); // store에 gridApi 저장
  }, [setGridApi]);


  const columnDefs: ColDef<AdvpayCtExcclcProcessDataWithStatus & { id?: string }>[] = useMemo(
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
        ...createCheckboxColumn<AdvpayCtExcclcProcessDataWithStatus>(
          "chk",
          "",
          50
        ),
        checkboxSelection: false, // 기본 체크박스 비활성화하고 커스텀 렌더러 사용
        headerComponent: CheckboxHeaderRenderer,
        cellRenderer: "agCheckboxCellRenderer",
        cellEditor: "agCheckboxCellEditor",
        cellClass: "ag-checkbox-cell-center",
        editable: true,   
        valueGetter: (params) => {
          return params.data?.chk === "Y";
        },
        valueSetter: (params) => {
          if (params.data) {
            params.data.chk = params.newValue ? "Y" : "N";
          }
          return true;
        },
        cellStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0",
        } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "creationYn",
        headerName: "전표",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "exptnTgt",
        headerName: "전기여부",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "applyYm",
        headerName: "처리연월",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: (params) => {
          const val = params.value;
          if (!val) return "";
          // "202406" 또는 "2024-06" 등에서 숫자만 추출
          const str = String(val).replace(/[^0-9]/g, "");
          if (str.length === 6) {
            return `${str.slice(0, 4)}.${str.slice(4)}`;
          }
          return val;
        },
      },
      {
        field: "numberTimes",
        headerName: "회차",
        width: 80,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "fromAccount",
        headerName: "선급비용계정",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "fromAcctName",
        headerName: "선급비용계정명",
        width: 180,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "toAccount",
        headerName: "비용계정",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "toAcctName",
        headerName: "비용계정명",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "costCenter",
        headerName: "공정코드",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "costCenterName",
        headerName: "공정코드명",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "occurDate",
        headerName: "발생일",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "maturDate",
        headerName: "만기일",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "days",
        headerName: "일수",
        width: 80,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",

      },
      {
        field: "monthAmt",
        headerName: "월비용원화",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "monthForeAmt",
        headerName: "월비용외화",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "janAmt",
        headerName: "원화잔액",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "janAmtFr",
        headerName: "외화잔액",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "fromDept",
        headerName: "발생부서",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "fromDeptName",
        headerName: "발생부서명",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "toDept",
        headerName: "귀속부서",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "toDeptName",
        headerName: "귀속부서명",
        width: 180,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "attribute1",
        headerName: "적요",
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "supplier",
        headerName: "거래처",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "custname",
        headerName: "거래처명",
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "occurAmt",
        headerName: "원화금액",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "mkDatePayCertf",
        headerName: "작성일자",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "seqPayCertf",
        headerName: "순번",
        width: 100,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center"
      },
      {
        field: "glNumber",
        headerName: "회계전표",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "invoiceId",
        headerName: "인보이스ID",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "officeId",
        headerName: "사무소ID",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "attribute8",
        headerName: "GL수기처리",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "creationYn",
        headerName: "전표생성여부",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "orgNme",
        headerName: "조직명",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
    ] as ExtendedColDef<AdvpayCtExcclcProcessDataWithStatus & { id?: string }>[],
    []
  );

  return (
    <div className="data-grid-panel">
      <FormAgGrid<AdvpayCtExcclcProcessDataWithStatus & { id?: string }>
        rowData={rowData}
        columnDefs={columnDefs}
        headerHeight={32}
        height={600}
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
          showCopy: false,
          showAdd: false,
          enableExcelDownload: true,
          showDelete: false,
          showSave: true
        }}
      />
    </div>
  );
};

export default DetailGrid;