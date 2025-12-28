import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import type { GridApi, GridReadyEvent, ColDef, ValueGetterParams, ValueSetterParams, IRowNode, ICellRendererParams, CellValueChangedEvent, ValueFormatterParams } from "ag-grid-community";
import { FormAgGrid, ActionButtonGroup } from "@components/ui/form";
import { message, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { usePageModal } from "@hooks/usePageModal";
import { AppPageModal } from "@components/ui/feedback";
import { AcntInqirePopup, BcncInqirePopup } from "@/pages/comPopup";
import type { AcntInqirePopupListResponse, BcncInqirePopupListResponse } from "@/types/comPopup";
import type { BankAcnutRegistListResponse } from "@/types/fcm/md/other/bankAcnutRegist.types";
import { getCodeDetailApi } from "@apis/comCode";

// 행 데이터 타입 정의 (응답 타입에 rowStatus 추가)
export type BankAcnutRowData = BankAcnutRegistListResponse & {
    id: string | number;
    rowStatus?: "C" | "U" | "D";
};

type MainGridProps = {
    className?: string;
    rowData: BankAcnutRowData[];
    setRowData: (data: BankAcnutRowData[]) => void;
    onSave?: () => void;
};

const MainGrid: React.FC<MainGridProps> = React.memo(({ className, rowData, setRowData, onSave }) => {
    const gridRef = useRef<GridApi<BankAcnutRowData> | null>(null);
    const searchContextRef = useRef<{ node: IRowNode<BankAcnutRowData>; field: string } | null>(null);
    const [bkGubunOptions, setBkGubunOptions] = useState<{ value: string; label: string }[]>([]);
    const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string }[]>([]);
    const [orgOptions, setOrgOptions] = useState<{ value: string; label: string }[]>([]);
    const [bankOptions, setBankOptions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        const fetchCodes = async () => {
            try {
                // 금융권 타입 (ACCTGB)
                const gubunResponse = await getCodeDetailApi({
                    module: "GL",
                    type: "ACCTGB",
                    enabledFlag: "Y"
                });
                if (gubunResponse.success && Array.isArray(gubunResponse.data)) {
                    setBkGubunOptions(gubunResponse.data.map((item) => ({
                        value: String(item.code || ""),
                        label: item.name1 || "",
                    })));
                }

                // 화폐 (FRNCUR)
                const currencyResponse = await getCodeDetailApi({
                    module: "GL",
                    type: "FRNCUR",
                    enabledFlag: "Y"
                });
                if (currencyResponse.success && Array.isArray(currencyResponse.data)) {
                    setCurrencyOptions(currencyResponse.data.map((item) => ({
                        value: String(item.code || ""),
                        label: String(item.code || ""),
                    })));
                }

                // 조직 (ORG)
                const orgResponse = await getCodeDetailApi({
                    module: "PF",
                    type: "ORG",
                    enabledFlag: "Y"
                });
                if (orgResponse.success && Array.isArray(orgResponse.data)) {
                    const options = orgResponse.data.map((item) => ({
                        value: String(item.code || ""),
                        label: item.name1 || "",
                    }));
                    setOrgOptions([{ value: "", label: "전체" }, ...options]);
                }

                // 은행 (BNKCDE)
                const bankResponse = await getCodeDetailApi({
                    module: "GL",
                    type: "BNKCDE",
                    enabledFlag: "Y"
                });
                if (bankResponse.success && Array.isArray(bankResponse.data)) {
                    setBankOptions(bankResponse.data.map((item) => ({
                        value: String(item.code || ""),
                        label: item.name1 || "",
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch codes:", error);
            }
        };
        fetchCodes();
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent<BankAcnutRowData>) => {
        gridRef.current = params.api;
    }, []);

    // 계정조회 팝업 설정
    const acntModal = usePageModal(AcntInqirePopup, {
        title: "계정조회",
        width: 800,
        height: 550,
        onReturn: (data: AcntInqirePopupListResponse) => {
            if (searchContextRef.current && gridRef.current) {
                const { node, field } = searchContextRef.current;
                const nameField = field === "accCode" ? "accName" : "onacctAccName";

                if (node.data) {
                    node.setData({
                        ...node.data,
                        [field]: data.accCode,
                        [nameField]: data.accName,
                        rowStatus: node.data.rowStatus === "C" ? "C" : "U"
                    } as BankAcnutRowData);

                    gridRef.current.refreshCells({
                        rowNodes: [node],
                        columns: [field, nameField, "rowStatus"],
                        force: true
                    });
                }
            }
        }
    });

    const openAcntModal = useCallback((node: IRowNode<BankAcnutRowData>, field: string) => {
        searchContextRef.current = { node, field };
        acntModal.openModal({
            initialSearch: {
                asAccCde: node.data?.[field as keyof BankAcnutRowData] as string
            }
        });
    }, [acntModal]);

    // 거래처조회 팝업 설정
    const bcncModal = usePageModal(BcncInqirePopup, {
        title: "거래처조회",
        width: 1000,
        height: 600,
        onReturn: (data: BcncInqirePopupListResponse) => {
            if (searchContextRef.current && gridRef.current) {
                const { node, field } = searchContextRef.current;

                if (node.data) {
                    node.setData({
                        ...node.data,
                        [field]: data.custno,
                        rowStatus: node.data.rowStatus === "C" ? "C" : "U"
                    } as BankAcnutRowData);

                    gridRef.current.refreshCells({
                        rowNodes: [node],
                        columns: [field, "rowStatus"],
                        force: true
                    });
                }
            }
        }
    });

    const openBcncModal = useCallback((node: IRowNode<BankAcnutRowData>, field: string) => {
        searchContextRef.current = { node, field };
        bcncModal.openModal({
            asOfficeId: "OSE",
            initialCustno: node.data?.[field as keyof BankAcnutRowData] as string
        });
    }, [bcncModal]);

    // 새 행 생성 함수
    const createNewRow = useCallback((newId: number | string, seq?: number): BankAcnutRowData => ({
        id: String(newId),
        bankCode: "",
        bankName: "",
        bankRgnName: "",
        accNbrCode: "",
        useYn: "Y",
        currency: "KRW",
        rowStatus: "C",
        seq: seq || 1
    }), []);

    // 새 ID 생성 함수
    const generateNewId = useCallback((): string => {
        if (rowData.length === 0) return "1";
        const maxId = Math.max(
            ...rowData.map((row) => {
                const id = row.id;
                if (typeof id === "number") return id;
                const num = parseInt(String(id), 10);
                return isNaN(num) ? 0 : num;
            })
        );
        return String(maxId + 1);
    }, [rowData]);

    // 새 SEQ 생성 함수
    const generateNewSeq = useCallback((): number => {
        if (rowData.length === 0) return 1;
        const maxSeq = Math.max(
            ...rowData.map((row) => row.seq || 0)
        );
        return maxSeq + 1;
    }, [rowData]);

    // 행 추가 핸들러
    const handleAddRow = useCallback(() => {
        const newId = generateNewId();
        const newSeq = generateNewSeq();
        const newRow = createNewRow(newId, newSeq);
        setRowData([...rowData, newRow]);

        // 가장 아래 행으로 포커스 이동
        setTimeout(() => {
            if (gridRef.current) {
                const rowCount = gridRef.current.getDisplayedRowCount();
                const lastNode = gridRef.current.getDisplayedRowAtIndex(rowCount - 1);
                if (lastNode) {
                    lastNode.setSelected(true);
                    gridRef.current.ensureNodeVisible(lastNode, "bottom");
                }
            }
        }, 100);
    }, [rowData, generateNewId, generateNewSeq, createNewRow, setRowData]);

    // 행 복사 핸들러
    const handleCopyRow = useCallback(() => {
        if (!gridRef.current) return;
        const selectedRows = gridRef.current.getSelectedRows();
        if (selectedRows.length === 0) {
            message.warning("복사할 행을 선택해주세요.");
            return;
        }

        const newRows = selectedRows.map((row) => {
            const newId = generateNewId();
            return {
                ...row,
                id: newId,
                rowStatus: "C" as const
            };
        });

        setRowData([...rowData, ...newRows]);

        // 가장 아래 행으로 포커스 이동
        setTimeout(() => {
            if (gridRef.current) {
                const rowCount = gridRef.current.getDisplayedRowCount();
                const lastNode = gridRef.current.getDisplayedRowAtIndex(rowCount - 1);
                if (lastNode) {
                    lastNode.setSelected(true);
                    gridRef.current.ensureNodeVisible(lastNode, "bottom");
                }
            }
        }, 100);
    }, [rowData, generateNewId, setRowData]);

    // 체크박스 헬퍼 (Y/N 처리)
    const checkboxColumn = useCallback((headerName: string, field: keyof BankAcnutRowData, width: number = 100): ColDef<BankAcnutRowData> => ({
        headerName,
        field,
        width,
        cellRenderer: "agCheckboxCellRenderer",
        cellEditor: "agCheckboxCellEditor",
        editable: true,
        valueGetter: (params: ValueGetterParams<BankAcnutRowData>) => params.data?.[field] === "Y",
        valueSetter: (params: ValueSetterParams<BankAcnutRowData>) => {
            if (params.data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (params.data as any)[field] = (params.newValue ? "Y" : "N");
                return true;
            }
            return false;
        },
        cellClass: "ag-checkbox-cell-center",
        headerClass: "ag-header-cell-center",
    }), []);

    const columnDefs = useMemo<ColDef<BankAcnutRowData>[]>(() => [
        {
            headerName: "상태",
            field: "rowStatus",
            width: 50,
            pinned: "left",
            excludeFromExcel: true,
            cellRenderer: (params: ICellRendererParams<BankAcnutRowData>) => {
                if (params.value === "C") return <Tag color="blue">추가</Tag>;
                if (params.value === "U") return <Tag color="orange">수정</Tag>;
                if (params.value === "D") return <Tag color="red">삭제</Tag>;
                return null;
            },
            cellStyle: { textAlign: "center" },
            headerClass: "ag-header-cell-center",
        },
        {
            headerName: "순번",
            valueGetter: "node.rowIndex + 1",
            width: 50,
            pinned: "left",
            cellStyle: { textAlign: "center" },
            headerClass: "ag-header-cell-center",
        },
        { headerName: "은행코드", field: "bankCode", width: 80, pinned: "left", bodyAlign: "center", headerClass: "ag-header-cell-center" },
        {
            headerName: "은행명",
            field: "bankName",
            width: 100,
            pinned: "left",
            editable: true,
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: {
                values: bankOptions.map(opt => opt.label),
                searchDebounceDelay: 200,
            },
        },
        { headerName: "지점명", field: "bankRgnName", width: 100, pinned: "left", editable: true },
        { headerName: "실계좌번호", field: "accNbrCode", width: 150, pinned: "left", editable: true },
        {
            headerName: "계정코드",
            field: "accCode",
            width: 120,
            editable: true,
            bodyAlign: "center",
            headerClass: "ag-header-cell-center",
            cellRenderer: (params: ICellRendererParams<BankAcnutRowData>) => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span>{params.value}</span>
                    <SearchOutlined
                        style={{ cursor: "pointer", color: "#1890ff", marginLeft: "4px" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (params.node) {
                                openAcntModal(params.node, "accCode");
                            }
                        }}
                    />
                </div>
            )
        },
        { headerName: "계정명", field: "accName", width: 200 },
        {
            headerName: "선수금계정",
            field: "onacctAccCode",
            width: 120,
            editable: true,
            bodyAlign: "center",
            headerClass: "ag-header-cell-center",
            cellRenderer: (params: ICellRendererParams<BankAcnutRowData>) => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span>{params.value}</span>
                    <SearchOutlined
                        style={{ cursor: "pointer", color: "#1890ff", marginLeft: "4px" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (params.node) {
                                openAcntModal(params.node, "onacctAccCode");
                            }
                        }}
                    />
                </div>
            )
        },
        { headerName: "선수금계정명", field: "onacctAccName", width: 200 },
        {
            headerName: "거래처",
            field: "custNo",
            width: 120,
            editable: true,
            bodyAlign: "center",
            headerClass: "ag-header-cell-center",
            cellRenderer: (params: ICellRendererParams<BankAcnutRowData>) => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span>{params.value}</span>
                    <SearchOutlined
                        style={{ cursor: "pointer", color: "#1890ff", marginLeft: "4px" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (params.node) {
                                openBcncModal(params.node, "custNo");
                            }
                        }}
                    />
                </div>
            )
        },
        { headerName: "금융권타입", field: "bankType", width: 150, bodyAlign: "center", headerClass: "ag-header-cell-center" },
        {
            headerName: "사업부",
            field: "dvs",
            width: 120,
            editable: true,
            bodyAlign: "center",
            headerClass: "ag-header-cell-center",
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
                values: orgOptions.map((opt) => opt.value),
            },
            valueFormatter: (params: ValueFormatterParams<BankAcnutRowData>) => {
                const val = (params.value === undefined || params.value === null) ? "" : String(params.value);
                if (val === "") return "전체";
                const option = orgOptions.find(opt => opt.value === val);
                return option ? option.label : val;
            }
        },
        {
            headerName: "사업장",
            field: "orgId",
            width: 120,
            editable: true,
            bodyAlign: "center",
            headerClass: "ag-header-cell-center",
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
                values: orgOptions.map((opt) => opt.value),
            },
            valueFormatter: (params: ValueFormatterParams<BankAcnutRowData>) => {
                const val = (params.value === undefined || params.value === null) ? "" : String(params.value);
                if (val === "") return "전체";
                const option = orgOptions.find(opt => opt.value === val);
                return option ? option.label : val;
            }
        },
        { headerName: "은행주소", field: "bankAddr", width: 300, editable: true },
        checkboxColumn("TR사용", "trAccount", 100),
        checkboxColumn("예금시제표 표시", "attribute10", 120),
        { headerName: "계좌번호별칭", field: "accNbr", width: 200, editable: true },
        { headerName: "계좌명", field: "accNbrName", width: 200, editable: true },
        {
            headerName: "화폐",
            field: "currency",
            width: 100,
            editable: true,
            bodyAlign: "center",
            headerClass: "ag-header-cell-center",
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
                values: currencyOptions.map((opt) => opt.value),
            },
        },
        {
            headerName: "금융권 타입",
            field: "bkGubun",
            width: 120,
            editable: true,
            bodyAlign: "center",
            headerClass: "ag-header-cell-center",
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
                values: bkGubunOptions.map((opt) => opt.value),
            },
            refData: bkGubunOptions.reduce((acc, opt) => {
                acc[opt.value] = opt.label;
                return acc;
            }, {} as Record<string, string>),
        },
        checkboxColumn("수금 Default", "receiptDefault", 120),
        checkboxColumn("지급 Default", "paymentDefault", 120),
        checkboxColumn("사용", "useYn", 80),
        { headerName: "구계정코드", field: "oldAccCode", width: 120, editable: true, bodyAlign: "center", headerClass: "ag-header-cell-center" },
        { headerName: "구계좌번호", field: "oldAcctNbr", width: 200, editable: true },
    ], [checkboxColumn, openAcntModal, openBcncModal, bkGubunOptions, currencyOptions, orgOptions, bankOptions]);

    const toolbarButtons = useMemo(() => ({
        showAdd: true,
        showCopy: true,
        showDelete: true,
        showExcelDownload: true,
        showExcelUpload: false,
        showSave: false
    }), []);

    const handleCellValueChanged = useCallback((params: CellValueChangedEvent<BankAcnutRowData>) => {
        if (params.data) {
            const updatedRow = params.data;
            const columnsToRefresh = ["rowStatus"];

            // 은행명이 변경된 경우 은행코드도 업데이트
            if (params.column.getColId() === "bankName") {
                const bankName = params.newValue;
                const bankOption = bankOptions.find(opt => opt.label === bankName);
                if (bankOption) {
                    updatedRow.bankCode = bankOption.value;
                    columnsToRefresh.push("bankCode");
                }
            }

            if (updatedRow.rowStatus !== "C" && updatedRow.rowStatus !== "D") {
                updatedRow.rowStatus = "U";
            }

            params.api.refreshCells({ rowNodes: [params.node], columns: columnsToRefresh, force: true });
        }
    }, [bankOptions]);

    const styleOptions = useMemo(() => ({
        fontSize: "12px",
        headerFontSize: "12px",
        rowHeight: "32px",
        headerHeight: "32px",
        cellPadding: "6px",
        headerPadding: "8px",
        selectedRowBackgroundColor: "#e6f7ff",
        hoverRowBackgroundColor: "#bae7ff",
    }), []);

    const gridOptions = useMemo(() => ({
        rowSelection: "multiple" as const,
        animateRows: true,
        pagination: false,
        suppressRowClickSelection: false,
        onGridReady,
        onCellValueChanged: handleCellValueChanged,
    }), [onGridReady, handleCellValueChanged]);

    return (
        <div className={className} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <ActionButtonGroup
                    onButtonClick={{
                        save: onSave,
                    }}
                    hideButtons={["create", "edit", "copy", "delete", "expand"]}
                />
            </div>
            <div style={{ flex: 1 }}>
                <FormAgGrid<BankAcnutRowData>
                    idField="id"
                    columnDefs={columnDefs}
                    rowData={rowData}
                    gridOptions={gridOptions}
                    showToolbar={true}
                    enableFilter={false}
                    styleOptions={styleOptions}
                    toolbarButtons={toolbarButtons}
                    onAddRow={handleAddRow}
                    onCopyRow={handleCopyRow}
                    setRowData={setRowData}
                    createNewRow={createNewRow}
                    excelFileName={() => {
                        const d = new Date();
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        return `은행계좌 등록_${year}${month}${day}`;
                    }}
                />
            </div>
            <AppPageModal {...acntModal.modalProps} />
            <AppPageModal {...bcncModal.modalProps} />
        </div>
    );
});

export default MainGrid;
