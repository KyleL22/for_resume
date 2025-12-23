import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { ColDef, GridReadyEvent, GridApi, CellStyle } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { DetailGridStyles } from "./DetailGrid.styles";  
import { showError, showSuccess } from "@components/ui/feedback/Message";
import { parseExcelFile } from "@utils/excelUtils";
import type { AcnutCodeListResponse } from "@/types/fcm/md/account/AcntRegist.types";

type DetailGridProps = {
  className?: string;
  rowData?: AcnutCodeListResponse[];
};

const DetailGrid: React.FC<DetailGridProps> = ({ className, rowData: propRowData }) => {
  const [rowData, setRowData] = useState<AcnutCodeListResponse[]>(propRowData || []);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [isEditMode] = useState(true); // 편집 모드 상태 (필요시 props로 받을 수 있음)

  // propRowData가 변경되면 rowData 업데이트
  useEffect(() => {
    if (propRowData) {
      setRowData(propRowData);
    }
  }, [propRowData]);

  // 그리드 준비 완료 이벤트
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  // 컬럼 정의
  const columnDefs: ColDef<AcnutCodeListResponse>[] = useMemo(
    () => [
      {
        width: 50,
        headerCheckboxSelection: true,
        checkboxSelection: true,
        resizable: false,
        suppressHeaderMenuButton: true,
        pinned: "left",
        editable: false,
      },
      {
        headerName: "순번",
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
        field: "accCode",
        headerName: "계정코드",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accName",
        headerName: "계정명",
        width: 200,
        editable: true,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accEngName",
        headerName: "계정명(영어)",
        width: 200,
        editable: true,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accAbb",
        headerName: "계정약어",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accOutName1",
        headerName: "출력명 1",
        width: 150,
        editable: true,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accOutName2",
        headerName: "출력명 2",
        width: 150,
        editable: true,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accOutName3",
        headerName: "출력명 3",
        width: 150,
        editable: true,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accOutName4",
        headerName: "출력명 4",
        width: 150,
        editable: true,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "highAccCode1",
        headerName: "대분류",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "highAccCode2",
        headerName: "중분류",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "highAccCode3",
        headerName: "소분류",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "highAccCode4",
        headerName: "표시계정",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "effectiveDateFrom",
        headerName: "유효일자(From)",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: (params) => {
          if (!params.value) return "";
          return params.value;
        },
      },
      {
        field: "effectiveDateTo",
        headerName: "유효일자(To)",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: (params) => {
          if (!params.value) return "";
          return params.value;
        },
      },
      {
        field: "useYn",
        headerName: "사용여부",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "newYn",
        headerName: "신규여부",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "actAccYn",
        headerName: "실계정여부",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accLvl",
        headerName: "계정레벨",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "cdtDbtYn",
        headerName: "지결입력여부",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "cstPayYn",
        headerName: "지결표시여부",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "fundAckYn",
        headerName: "법카표시여부",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "cstCdeOpt",
        headerName: "공정표시",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "entItemYn",
        headerName: "접대비여부",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "actSstmTbl",
        headerName: "고정자산구분",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "cipYn",
        headerName: "CIP 여부",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "dlyTbOutYn",
        headerName: "일계표표시",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "glOutYn",
        headerName: "총계정원장표시",
        width: 140,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "tbOutYn",
        headerName: "시산표표시",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "bsOutYn",
        headerName: "재무상태표표시",
        width: 130,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "isOutYn",
        headerName: "손익계산서표시",
        width: 130,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "pssnDeptYn",
        headerName: "귀속부서여부",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "blncArgmYn",
        headerName: "잔액관리",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accMgmtNbr1Opt",
        headerName: "관리번호1 선택",
        width: 130,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accMgmtNbr1Type",
        headerName: "관리번호1 타입",
        width: 130,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accMgmtNbr2Opt",
        headerName: "관리번호2 선택",
        width: 130,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accMgmtNbr2Type",
        headerName: "관리번호2 타입",
        width: 130,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "refOpt",
        headerName: "Ref 선택",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "refType",
        headerName: "Ref 타입",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "exchgRateOpt",
        headerName: "금액선택",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "exchgRateType",
        headerName: "금액타입",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "unitOpt",
        headerName: "단위선택",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "unitType",
        headerName: "단위타입",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "etcOpt",
        headerName: "기타여부",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "etcType",
        headerName: "기타타입",
        width: 100,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "occurDateOpt",
        headerName: "발생일자선택",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "maturDateOpt",
        headerName: "만기일자선택",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "cstCdeOpt",
        headerName: "공정코드선택",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "finGdsGrpOpt",
        headerName: "품목군선택",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accOutLvl",
        headerName: "계정관리레벨",
        width: 130,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "accMgmtLvl",
        headerName: "계정관리수준",
        width: 130,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "plType",
        headerName: "손익요소구분",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "plTypeName",
        headerName: "손익요소구분명",
        width: 150,
        editable: true,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "coType",
        headerName: "원가요소구분",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "coTypeName",
        headerName: "원가요소구분명",
        width: 150,
        editable: true,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "vfType",
        headerName: "변동비/고정비",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "lagacyCode",
        headerName: "과거계정",
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "createdBy",
        headerName: "생성자",
        width: 100,
        editable: false,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "createdByName",
        headerName: "생성자명",
        width: 120,
        editable: false,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "creationDate",
        headerName: "생성일",
        width: 150,
        editable: false,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: (params) => {
          if (!params.value) return "";
          return params.value;
        },
      },
      {
        field: "lastUpdatedBy",
        headerName: "최종수정자",
        width: 120,
        editable: false,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "lastUpdatedByName",
        headerName: "최종수정자명",
        width: 130,
        editable: false,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "lastUpdateDate",
        headerName: "최종수정일",
        width: 150,
        editable: false,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: (params) => {
          if (!params.value) return "";
          return params.value;
        },
      },
      {
        field: "programId",
        headerName: "프로그램ID",
        width: 120,
        editable: false,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "terminalId",
        headerName: "사용자IP",
        width: 120,
        editable: false,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
    ],
    []
  );

  // 행추가
  const handleAddRow = useCallback((api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다.");
      return;
    }

    const newRow: AcnutCodeListResponse = {
      accCode: "",
      accName: "",
      accEngName: "",
      accAbb: "",
      useYn: "Y",
      newYn: "Y",
      actAccYn: "Y",
    };
    
    const newGridData = [...rowData, newRow];
    setRowData(newGridData);
    
    // 그리드에 새 행 추가
    if (currentApi) {
      currentApi.applyTransaction({ add: [newRow] });
    }
  }, [gridApi, isEditMode, rowData]);

  // 행복사
  const handleCopyRow = useCallback((api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다.");
      return;
    }

    if (!currentApi) return;
    const selectedRows = currentApi.getSelectedRows() as AcnutCodeListResponse[];
    if (selectedRows.length === 0) {
      showError("복사할 행을 선택해주세요.");
      return;
    }

    // 선택된 행들을 복사 (accCode는 빈 값으로 설정)
    const newRows = selectedRows.map((row) => ({
      ...row,
      accCode: "", // 새 행이므로 계정코드는 빈 값
      newYn: "Y",
    }));

    const newGridData = [...rowData, ...newRows];
    setRowData(newGridData);
    
    // 그리드에 새 행 추가
    currentApi.applyTransaction({ add: newRows });
  }, [gridApi, isEditMode, rowData]);

  // 행삭제
  const handleDeleteRow = useCallback((api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다.");
      return;
    }

    if (!currentApi) return;
    const selectedRows = currentApi.getSelectedRows() as AcnutCodeListResponse[];
    if (selectedRows.length === 0) {
      showError("삭제할 행을 선택해주세요.");
      return;
    }

    // 선택된 행들의 accCode로 필터링
    const selectedAccCodes = selectedRows.map(row => row.accCode).filter(Boolean);
    const newGridData = rowData.filter(row => !selectedAccCodes.includes(row.accCode));

    setRowData(newGridData);
    
    // 그리드에서 행 제거
    currentApi.applyTransaction({ remove: selectedRows });
  }, [gridApi, isEditMode, rowData]);

  // 엑셀 다운로드
  const handleExcelDownload = useCallback((api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!currentApi) {
      showError("그리드가 초기화되지 않았습니다.");
      return;
    }

    if (rowData.length === 0) {
      showError("다운로드할 데이터가 없습니다.");
      return;
    }

    try {
      currentApi.exportDataAsExcel({
        fileName: `계정코드등록_${new Date().getTime()}.xlsx`,
      });
      showSuccess("엑셀 파일이 다운로드되었습니다.");
    } catch (error) {
      showError("엑셀 다운로드 중 오류가 발생했습니다.");
      if (import.meta.env.DEV) {
        console.error("Excel download error:", error);
      }
    }
  }, [gridApi, rowData]);

  // 엑셀 업로드
  const handleExcelUpload = useCallback(async (file: File, api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다.");
      return false;
    }

    try {
      // 컬럼 매핑 설정 (헤더명 -> 필드명)
      const columnMapping: Record<string, string> = {};
      columnDefs.forEach((col) => {
        if (col.field && col.headerName) {
          columnMapping[col.headerName] = col.field;
        }
      });

      // 엑셀 파일 파싱
      const uploadedData = await parseExcelFile<Partial<AcnutCodeListResponse>>(file, {
        hasHeader: true,
        columnMapping: Object.keys(columnMapping).length > 0 ? columnMapping : undefined,
        filterEmptyRows: true,
        validator: (row) => {
          // 최소한 계정코드가 있어야 유효한 행으로 간주
          return !!row.accCode;
        },
      });

      if (uploadedData.length === 0) {
        showError("업로드할 유효한 데이터가 없습니다.");
        return false;
      }

      // 업로드된 데이터를 그리드 형식에 맞게 변환
      const newRows: AcnutCodeListResponse[] = uploadedData.map((row) => ({
        ...row,
        accCode: row.accCode || "",
        accName: row.accName || "",
        useYn: row.useYn || "Y",
        newYn: row.newYn || "Y",
      } as AcnutCodeListResponse));

      // 그리드에 새 행 추가
      const newGridData = [...rowData, ...newRows];
      setRowData(newGridData);
      
      if (currentApi) {
        currentApi.applyTransaction({ add: newRows });
      }
      
      showSuccess(`${uploadedData.length}건의 데이터가 업로드되었습니다.`);
      
      return false; // 파일 업로드 후 자동 업로드 방지
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "엑셀 업로드 중 오류가 발생했습니다."
      );
      if (import.meta.env.DEV) {
        console.error("Excel upload error:", error);
      }
      return false;
    }
  }, [gridApi, isEditMode, rowData, columnDefs]);

  return (
    <DetailGridStyles className={className}>
      {/* 그리드 */}
      <FormAgGrid<AcnutCodeListResponse & { id?: string | number }>
        rowData={rowData as (AcnutCodeListResponse & { id?: string | number })[]}
        headerHeight={32}
        columnDefs={columnDefs}
        height={700}
        idField="accCode"
        showToolbar={true}
        onGridReady={onGridReady}
        toolbarButtons={{
          showDelete: true,
          showCopy: true,
          showAdd: true,
          enableExcelDownload: true,
          enableExcelUpload: true,
          showSave: false,
        }}
        excelFileName="계정코드등록"
        onAddRow={handleAddRow}
        onCopyRow={handleCopyRow}
        onDeleteRow={handleDeleteRow}
        onExcelDownload={handleExcelDownload}
        onExcelUpload={handleExcelUpload}
        gridOptions={{
          rowSelection: "multiple",
          animateRows: true,
          pagination: false,
          paginationPageSize: 50,
          rowHeight: 32,
          paginationPageSizeSelector: [10, 20, 50, 100],
          suppressRowClickSelection: true,
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
      />
    </DetailGridStyles>
  );
};

export default DetailGrid;
