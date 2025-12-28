/**
 * 전표 상세 그리드 (Slip Detail Grid)
 * 
 * @description 전표의 분개 항목(계정, 금액, 거래처 등)을 Ag-Grid를 통해 편집하고 관리하는 컴포넌트
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import React, { useCallback, useRef, useEffect } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { ICellRendererParams, GridApi } from "ag-grid-community";
import FormAgGrid, {
  type ExtendedColDef,
} from "@/components/ui/form/AgGrid/FormAgGrid";
import { FormButton } from "@/components/ui/form";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import type { SlipRegistDetailResponse } from "@/types/fcm/gl/slip/SlipRegist/SlipRegist.types";
import { usePageModal } from "@/hooks/usePageModal";
import { AppPageModal } from "@/components/ui/feedback";
import {
  AcntInqirePopup,
  CrrncyKndPopup,
  DeptInqirePopup,
  BcncInqirePopup,
  PrjctInqirePopup,
  ProcsCodePopup,
  PrdlstSeInqirePopup,
  PrdlstCodeInqirePopup,
} from "@/pages/comPopup";
import type { SelectedAccount } from "@/pages/comPopup/AcntInqirePopup";
import type { SelectedCurrency } from "@/pages/comPopup/CrrncyKndPopup";
import type { SelectedDept } from "@/pages/comPopup/DeptInqirePopup";
import type { SelectedBcnc } from "@/pages/comPopup/BcncInqirePopup";
import type { SelectedProject } from "@/pages/comPopup/PrjctInqirePopup";
import type { SelectedProcsCode } from "@/pages/comPopup/ProcsCodePopup";
import type { SelectedPrdlstSe } from "@/pages/comPopup/PrdlstSeInqirePopup";
import type { SelectedPrdlstCode } from "@/pages/comPopup/PrdlstCodeInqirePopup";

// 컬럼 정의
const columnDefs: ExtendedColDef<SlipRegistDetailResponse>[] = [
  {
    field: "seqAckSlp",
    headerName: "번호",
    width: 70,
    minWidth: 70,
    maxWidth: 70,
    sortable: true,
    filter: true,
  },
  {
    field: "accCode",
    headerName: "계정",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header"
  },
  {
    field: "accName",
    headerName: "계정명",
    width: 170,
    minWidth: 170,
    maxWidth: 170,
    sortable: true,
    filter: true,
  },
  {
    field: "curr",
    headerName: "화폐",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header"
  },
  {
    field: "exchgRateType",
    headerName: "환율타입",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
    valueGetter: (params) => {
      // exchgRateType 또는 exRateType 필드에서 값 가져오기
      return params.data?.exchgRateType || (params.data as any)?.exRateType || "";
    },
    valueSetter: (params) => {
      // 값 설정 시 exchgRateType에 저장
      if (params.data) {
        params.data.exchgRateType = params.newValue || "";
        // exRateType도 함께 업데이트 (백엔드 호환성)
        (params.data as any).exRateType = params.newValue || "";
      }
      return true;
    },
  },
  {
    field: "exchgRate",
    headerName: "환율",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    valueFormatter: (params) => params.value ? Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
    bodyAlign: "right",
  },
  {
    field: "drRelAmt",
    headerName: "차변금액",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    valueFormatter: (params) =>
      params.value ? Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0",
    sortable: true,
    filter: true,
    editable: true,
    bodyAlign: "right",
    headerClass: "required-header",
    valueSetter: (params) => {
      if (params.data) {
        const newVal = params.newValue || "0";
        params.data.drRelAmt = newVal; // 차변금액 설정

        // 환율 가져오기 (기본값 1)
        const rate = parseFloat(params.data.exchgRate || "1");
        // 환산금액 계산 (입력금액 / 환율)
        const relVal = (parseFloat(newVal) / rate).toString();
        params.data.drAmt = relVal; // 차변환산금액 설정
      }
      return true;
    },
  },
  {
    field: "crRelAmt",
    headerName: "대변금액",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    valueFormatter: (params) =>
      params.value ? Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0",
    sortable: true,
    filter: true,
    editable: true,
    bodyAlign: "right",
    headerClass: "required-header",
    valueSetter: (params) => {
      if (params.data) {
        const newVal = params.newValue || "0";
        params.data.crRelAmt = newVal; // 대변금액 설정

        // 환율 가져오기 (기본값 1)
        const rate = parseFloat(params.data.exchgRate || "1");
        // 환산금액 계산 (입력금액 / 환율)
        const relVal = (parseFloat(newVal) / rate).toString();
        params.data.crAmt = relVal; // 대변환산금액 설정
      }
      return true;
    },
  },
  {
    field: "drAmt",
    headerName: "차변금액(환산)",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    valueFormatter: (params) =>
      params.value ? Number(params.value).toLocaleString() : "0",
    sortable: true,
    filter: true,
    bodyAlign: "right",
  },
  {
    field: "crAmt",
    headerName: "대변금액(환산)",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    valueFormatter: (params) =>
      params.value ? Number(params.value).toLocaleString() : "0",
    sortable: true,
    filter: true,
    bodyAlign: "right",
  },
  {
    field: "rem",
    headerName: "적요",
    width: 400,
    minWidth: 400,
    maxWidth: 400,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
  },
  {
    field: "pssnDept",
    headerName: "부서",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
  },
  {
    field: "deptName",
    headerName: "부서명",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
  },
  {
    field: "accMgmtNbr3",
    headerName: "거래처",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
  },
  {
    field: "custname",
    headerName: "거래처명",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
  },
  {
    field: "accMgmtNbr1Nme",
    headerName: "관리(1)명",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "accMgmtNbr2Nme",
    headerName: "관리(2)명",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "dvs",
    headerName: "시산사업장",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    sortable: true,
    filter: true,
  },
  {
    field: "orgId",
    headerName: "사업장",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
  },
  {
    field: "costCode",
    headerName: "공정코드",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "costCodeName",
    headerName: "공정명",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    sortable: true,
    filter: true,
  },
  {
    field: "finGdsGrpCode",
    headerName: "품목군",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "grpName",
    headerName: "품목군명",
    width: 180,
    minWidth: 180,
    maxWidth: 180,
    sortable: true,
    filter: true,
  },
  {
    field: "itemCode",
    headerName: "품목코드",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "itemName",
    headerName: "품목명",
    width: 180,
    minWidth: 180,
    maxWidth: 180,
    sortable: true,
    filter: true,
  },
  {
    field: "projectCode",
    headerName: "프로젝트",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "projectName",
    headerName: "프로젝트명",
    width: 250,
    minWidth: 250,
    maxWidth: 250,
    sortable: true,
    filter: true,
  },
  {
    field: "srcTblNme",
    headerName: "서브모듈원천",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    sortable: true,
    filter: true,
  },
  {
    field: "subModuleKey",
    headerName: "서브모튤KEY",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
  },
  {
    field: "taxType",
    headerName: "AP부가세",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "vatWthTaxType",
    headerName: "상세",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "sendYn",
    headerName: "지급대상",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "channel1",
    headerName: "Channel1",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "channel2",
    headerName: "Channel2",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "channel3",
    headerName: "Channel3",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "trReDept",
    headerName: "품목구분",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "itemSegment1",
    headerName: "품목대분류",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "itemSegment2",
    headerName: "품목중분류",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "itemSegment3",
    headerName: "품목소분류",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "fixAssRgstYn",
    headerName: "고정자산",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "fixYn",
    headerName: "Reg Fix",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
];

// 그리드 행 데이터 타입
type GridRowData = SlipRegistDetailResponse & {
  id?: string | number;
  rowStatus?: "C" | "U" | "D";
};

// 계정 팝업 Props 타입
type AcntInqirePopupProps = {
  asOfficeId?: string;
  initialAccCode?: string;
};

// 화폐 팝업 Props 타입
type CrrncyKndPopupProps = {
  asOfficeId?: string;
  initialCurrCode?: string;
};

// 부서 팝업 Props 타입
type DeptInqirePopupProps = {
  asOfficeId?: string;
  initialDeptCode?: string;
  asStndDate?: string;
};

// 거래처 팝업 Props 타입
type BcncInqirePopupProps = {
  asOfficeId?: string;
  initialCustno?: string;
  asUseYno?: string;
  asCustType?: string;
};

// 프로젝트 팝업 Props 타입
type PrjctInqirePopupProps = {
  asOfficeId?: string;
  initialProjectCode?: string;
};

// 공정코드 팝업 Props 타입
interface ProcsCodePopupProps {
  asOfficeId?: string;
  asOrgId?: string;
  initialCostCode?: string;
  [key: string]: any;
}
;

// 품목군 팝업 Props 타입
type PrdlstSeInqirePopupProps = {
  asOfficeId?: string;
  asOrgId?: string;
  itemGroup?: string;
};

// 품목코드 팝업 Props 타입
type PrdlstCodeInqirePopupProps = {
  asOfficeId?: string;
  asOrgId?: string;
  asMatclass?: string;
  initialFind?: string;
};

// 계정 셀 렌더러 Props
interface AccountCellRendererProps {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
  slipHeader: any;
}

// 계정 셀 렌더러 컴포넌트
const AccountCellRenderer: React.FC<AccountCellRendererProps> = ({
  params,
  gridRef,
  slipHeader,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 계정조회 팝업 모달 관리
  const accountModal = usePageModal<AcntInqirePopupProps, SelectedAccount>(
    AcntInqirePopup,
    {
      title: "계정조회",
      centered: true,
      width: 700,
      height: 600,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          // 계정코드와 계정명 업데이트
          rowData.accCode = returnValue.accCode;
          rowData.accName = returnValue.accName;

          // 그리드 셀 갱신
          if (gridRef.current) {
            gridRef.current.refreshCells({
              rowNodes: [currentParams.node],
              columns: ["accCode", "accName"],
            });
            // 상태 업데이트 (신규가 아닌 경우 "U"로 변경)
            if (rowData.rowStatus && rowData.rowStatus !== "C") {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            } else if (!rowData.rowStatus) {
              // rowStatus가 없는 경우 "U"로 설정
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          }
        }
      },
    }
  );

  const handleSearchClick = () => {
    const officeId = slipHeader?.bltOfficeId || "OSE"; // slipHeader에서 가져오거나 기본값 사용

    accountModal.openModal({
      asOfficeId: officeId,
      initialAccCode: value,
    });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    width: "100%",
    position: "relative",
    paddingLeft: "4px",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
    marginLeft: "4px",
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...accountModal.modalProps} />
    </>
  );
};

// 화폐 셀 렌더러 Props
interface CurrencyCellRendererProps {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
  slipHeader: any;
}

// 화폐 셀 렌더러 컴포넌트
const CurrencyCellRenderer: React.FC<CurrencyCellRendererProps> = ({
  params,
  gridRef,
  slipHeader,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 화폐조회 팝업 모달 관리
  const currencyModal = usePageModal<CrrncyKndPopupProps, SelectedCurrency>(
    CrrncyKndPopup,
    {
      title: "화폐종류 조회",
      centered: true,
      width: 700,
      height: 600,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        console.log("화폐 선택 반환값:", returnValue);
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          // 화폐코드 업데이트
          rowData.curr = returnValue.currCode;
          console.log("화폐코드 업데이트:", returnValue.currCode, "행 데이터:", rowData);

          // 그리드 셀 갱신
          if (gridRef.current) {
            gridRef.current.refreshCells({
              rowNodes: [currentParams.node],
              columns: ["curr"],
            });
            // 상태 업데이트 (신규가 아닌 경우 "U"로 변경)
            if (rowData.rowStatus && rowData.rowStatus !== "C") {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            } else if (!rowData.rowStatus) {
              // rowStatus가 없는 경우 "U"로 설정
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          } else {
            console.error("gridRef.current가 null입니다.");
          }
        } else {
          console.error("rowData 또는 currentParams.node가 없습니다.", { rowData, node: currentParams.node });
        }
      },
    }
  );

  const handleSearchClick = () => {
    const officeId = slipHeader?.bltOfficeId || "OSE"; // slipHeader에서 가져오거나 기본값 사용

    currencyModal.openModal({
      asOfficeId: officeId,
      initialCurrCode: value,
    });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    width: "100%",
    position: "relative",
    paddingLeft: "4px",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
    marginLeft: "4px",
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...currencyModal.modalProps} />
    </>
  );
};

// 부서 셀 렌더러 Props
interface DeptCellRendererProps {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
  slipHeader: any;
}

// 부서 셀 렌더러 컴포넌트
const DeptCellRenderer: React.FC<DeptCellRendererProps> = ({
  params,
  gridRef,
  slipHeader,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 부서조회 팝업 모달 관리
  const deptModal = usePageModal<DeptInqirePopupProps, SelectedDept>(
    DeptInqirePopup,
    {
      title: "부서조회",
      centered: true,
      width: 700,
      height: 600,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        console.log("부서 선택 반환값:", returnValue);
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          // 부서코드와 부서명 업데이트 (DeptInqirePopup은 makeDept, makeDeptName을 반환)
          rowData.pssnDept = returnValue.makeDept;
          rowData.deptName = returnValue.makeDeptName;
          console.log("부서코드 업데이트:", returnValue.makeDept, "부서명:", returnValue.makeDeptName, "행 데이터:", rowData);

          // 그리드 셀 갱신
          if (gridRef.current) {
            gridRef.current.refreshCells({
              rowNodes: [currentParams.node],
              columns: ["pssnDept", "deptName"],
            });
            // 상태 업데이트 (신규가 아닌 경우 "U"로 변경)
            if (rowData.rowStatus && rowData.rowStatus !== "C") {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            } else if (!rowData.rowStatus) {
              // rowStatus가 없는 경우 "U"로 설정
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          } else {
            console.error("gridRef.current가 null입니다.");
          }
        } else {
          console.error("rowData 또는 currentParams.node가 없습니다.", { rowData, node: currentParams.node });
        }
      },
    }
  );

  const handleSearchClick = () => {
    const officeId = slipHeader?.bltOfficeId || "OSE"; // slipHeader에서 가져오거나 기본값 사용
    const currentDate = new Date();
    const asStndDate = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, "0")}${String(currentDate.getDate()).padStart(2, "0")}`;

    deptModal.openModal({
      asOfficeId: officeId,
      initialDeptCode: value,
      asStndDate: asStndDate,
    });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    width: "100%",
    position: "relative",
    paddingLeft: "4px",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
    marginLeft: "4px",
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...deptModal.modalProps} />
    </>
  );
};

// 거래처 셀 렌더러 Props
interface BcncCellRendererProps {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
  slipHeader: any;
}

// 거래처 셀 렌더러 컴포넌트
const BcncCellRenderer: React.FC<BcncCellRendererProps> = ({
  params,
  gridRef,
  slipHeader,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 거래처조회 팝업 모달 관리
  const bcncModal = usePageModal<BcncInqirePopupProps, SelectedBcnc>(
    BcncInqirePopup,
    {
      title: "거래처 조회",
      centered: true,
      width: 900,
      height: 600,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        console.log("거래처 선택 반환값:", returnValue);
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          // 거래처번호와 거래처명 업데이트
          rowData.accMgmtNbr3 = returnValue.custno;
          rowData.custname = returnValue.custname;
          console.log("거래처번호 업데이트:", returnValue.custno, "거래처명:", returnValue.custname, "행 데이터:", rowData);

          // 그리드 셀 갱신
          if (gridRef.current) {
            gridRef.current.refreshCells({
              rowNodes: [currentParams.node],
              columns: ["accMgmtNbr3", "custname"],
            });
            // 상태 업데이트 (신규가 아닌 경우 "U"로 변경)
            if (rowData.rowStatus && rowData.rowStatus !== "C") {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            } else if (!rowData.rowStatus) {
              // rowStatus가 없는 경우 "U"로 설정
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          } else {
            console.error("gridRef.current가 null입니다.");
          }
        } else {
          console.error("rowData 또는 currentParams.node가 없습니다.", { rowData, node: currentParams.node });
        }
      },
    }
  );

  const handleSearchClick = () => {
    const officeId = slipHeader?.bltOfficeId || "OSE"; // slipHeader에서 가져오거나 기본값 사용

    bcncModal.openModal({
      asOfficeId: officeId,
      initialCustno: value,
    });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    width: "100%",
    position: "relative",
    paddingLeft: "4px",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
    marginLeft: "4px",
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...bcncModal.modalProps} />
    </>
  );
};

// 프로젝트 셀 렌더러 Props
interface ProjectCellRendererProps {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
  slipHeader: any;
}

// 프로젝트 셀 렌더러 컴포넌트
const ProjectCellRenderer: React.FC<ProjectCellRendererProps> = ({
  params,
  gridRef,
  slipHeader,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 프로젝트조회 팝업 모달 관리
  const projectModal = usePageModal<PrjctInqirePopupProps, SelectedProject>(
    PrjctInqirePopup,
    {
      title: "프로젝트 조회",
      centered: true,
      width: 900,
      height: 600,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        console.log("프로젝트 선택 반환값:", returnValue);
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          // 프로젝트코드와 프로젝트명 업데이트
          rowData.projectCode = returnValue.projectCode;
          rowData.projectName = returnValue.projectName;
          console.log("프로젝트코드 업데이트:", returnValue.projectCode, "프로젝트명:", returnValue.projectName, "행 데이터:", rowData);

          // 그리드 셀 갱신
          if (gridRef.current) {
            gridRef.current.refreshCells({
              rowNodes: [currentParams.node],
              columns: ["projectCode", "projectName"],
            });
            // 상태 업데이트 (신규가 아닌 경우 "U"로 변경)
            if (rowData.rowStatus && rowData.rowStatus !== "C") {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            } else if (!rowData.rowStatus) {
              // rowStatus가 없는 경우 "U"로 설정
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          } else {
            console.error("gridRef.current가 null입니다.");
          }
        } else {
          console.error("rowData 또는 currentParams.node가 없습니다.", { rowData, node: currentParams.node });
        }
      },
    }
  );

  const handleSearchClick = () => {
    const officeId = slipHeader?.bltOfficeId || "OSE"; // slipHeader에서 가져오거나 기본값 사용

    projectModal.openModal({
      asOfficeId: officeId,
      initialProjectCode: value,
    });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    width: "100%",
    position: "relative",
    paddingLeft: "4px",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
    marginLeft: "4px",
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...projectModal.modalProps} />
    </>
  );
};

// 공정코드 셀 렌더러 Props
interface ProcsCodeCellRendererProps {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
  slipHeader: any;
}

// 공정코드 셀 렌더러 컴포넌트
const ProcsCodeCellRenderer: React.FC<ProcsCodeCellRendererProps> = ({
  params,
  gridRef,
  slipHeader,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 공정코드조회 팝업 모달 관리
  const procsCodeModal = usePageModal<ProcsCodePopupProps, SelectedProcsCode>(
    ProcsCodePopup,
    {
      title: "공정코드 조회",
      centered: true,
      width: 1000,
      height: 600,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        console.log("공정코드 선택 반환값:", returnValue);
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          // 공정코드와 공정명 업데이트
          rowData.costCode = returnValue.costCode;
          rowData.costCodeName = returnValue.costCodeName;
          console.log("공정코드 업데이트:", returnValue.costCode, "공정명:", returnValue.costCodeName, "행 데이터:", rowData);

          // 그리드 셀 갱신
          if (gridRef.current) {
            gridRef.current.refreshCells({
              rowNodes: [currentParams.node],
              columns: ["costCode", "costCodeName"],
            });
            // 상태 업데이트 (신규가 아닌 경우 "U"로 변경)
            if (rowData.rowStatus && rowData.rowStatus !== "C") {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            } else if (!rowData.rowStatus) {
              // rowStatus가 없는 경우 "U"로 설정
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          } else {
            console.error("gridRef.current가 null입니다.");
          }
        } else {
          console.error("rowData 또는 currentParams.node가 없습니다.", { rowData, node: currentParams.node });
        }
      },
    }
  );

  const handleSearchClick = () => {
    const officeId = slipHeader?.bltOfficeId || "OSE";
    const orgId = slipHeader?.bltOrgId || "";

    procsCodeModal.openModal({
      asOfficeId: officeId,
      asOrgId: orgId,
      initialCostCode: value,
    });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    width: "100%",
    position: "relative",
    paddingLeft: "4px",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
    marginLeft: "4px",
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...procsCodeModal.modalProps} />
    </>
  );
};

// 품목군 셀 렌더러 Props
interface PrdlstSeCellRendererProps {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
  slipHeader: any;
}

// 품목군 셀 렌더러 컴포넌트
const PrdlstSeCellRenderer: React.FC<PrdlstSeCellRendererProps> = ({
  params,
  gridRef,
  slipHeader,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 품목군조회 팝업 모달 관리
  const prdlstSeModal = usePageModal<PrdlstSeInqirePopupProps, SelectedPrdlstSe>(
    PrdlstSeInqirePopup,
    {
      title: "품목군 조회",
      centered: true,
      width: 900,
      height: 600,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        console.log("품목군 선택 반환값:", returnValue);
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          // 품목군코드와 품목군명 업데이트
          rowData.finGdsGrpCode = returnValue.itemGroup;
          rowData.grpName = returnValue.itemGroupName;
          console.log("품목군코드 업데이트:", returnValue.itemGroup, "품목군명:", returnValue.itemGroupName, "행 데이터:", rowData);

          // 그리드 셀 갱신
          if (gridRef.current) {
            gridRef.current.refreshCells({
              rowNodes: [currentParams.node],
              columns: ["finGdsGrpCode", "grpName"],
            });
            // 상태 업데이트 (신규가 아닌 경우 "U"로 변경)
            if (rowData.rowStatus && rowData.rowStatus !== "C") {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            } else if (!rowData.rowStatus) {
              // rowStatus가 없는 경우 "U"로 설정
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          } else {
            console.error("gridRef.current가 null입니다.");
          }
        } else {
          console.error("rowData 또는 currentParams.node가 없습니다.", { rowData, node: currentParams.node });
        }
      },
    }
  );

  const handleSearchClick = () => {
    const officeId = slipHeader?.bltOfficeId || "OSE"; // slipHeader에서 가져오거나 기본값 사용
    const orgId = slipHeader?.orgId || "";

    prdlstSeModal.openModal({
      asOfficeId: officeId,
      asOrgId: orgId,
      itemGroup: value,
    });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    width: "100%",
    position: "relative",
    paddingLeft: "4px",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
    marginLeft: "4px",
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...prdlstSeModal.modalProps} />
    </>
  );
};

// 품목코드 셀 렌더러 Props
interface PrdlstCodeCellRendererProps {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
  slipHeader: any;
}

// 품목코드 셀 렌더러 컴포넌트
const PrdlstCodeCellRenderer: React.FC<PrdlstCodeCellRendererProps> = ({
  params,
  gridRef,
  slipHeader,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 품목코드조회 팝업 모달 관리
  const prdlstCodeModal = usePageModal<PrdlstCodeInqirePopupProps, SelectedPrdlstCode>(
    PrdlstCodeInqirePopup,
    {
      title: "품목코드 조회",
      centered: true,
      width: 900,
      height: 600,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        console.log("품목코드 선택 반환값:", returnValue);
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          // 품목코드와 품목명 업데이트
          rowData.itemCode = returnValue.itemCode;
          rowData.itemName = returnValue.itemName;
          console.log("품목코드 업데이트:", returnValue.itemCode, "품목명:", returnValue.itemName, "행 데이터:", rowData);

          // 그리드 셀 갱신
          if (gridRef.current) {
            gridRef.current.refreshCells({
              rowNodes: [currentParams.node],
              columns: ["itemCode", "itemName"],
            });
            // 상태 업데이트 (신규가 아닌 경우 "U"로 변경)
            if (rowData.rowStatus && rowData.rowStatus !== "C") {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            } else if (!rowData.rowStatus) {
              // rowStatus가 없는 경우 "U"로 설정
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          } else {
            console.error("gridRef.current가 null입니다.");
          }
        } else {
          console.error("rowData 또는 currentParams.node가 없습니다.", { rowData, node: currentParams.node });
        }
      },
    }
  );

  const handleSearchClick = () => {
    const officeId = slipHeader?.bltOfficeId || "OSE";
    const orgId = slipHeader?.bltOrgId || "";
    const rowData = params.data as GridRowData;
    const matclass = rowData?.finGdsGrpCode || "";

    prdlstCodeModal.openModal({
      asOfficeId: officeId,
      asOrgId: orgId,
      asMatclass: matclass,
      initialFind: value,
    });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    width: "100%",
    position: "relative",
    paddingLeft: "4px",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
    marginLeft: "4px",
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...prdlstCodeModal.modalProps} />
    </>
  );
};

const DetailGrid: React.FC<{ className?: string }> = ({ className }) => {
  const { slipDetails, setSlipDetails, slipHeader } = useSlipRegist();
  const gridRef = useRef<GridApi | null>(null);

  // 내부 행 추가용 함수
  const createNewRow = useCallback(
    (newId: number | string): SlipRegistDetailResponse => ({
      // 기본값 설정
      seqAckSlp:
        typeof newId === "number" ? newId.toString() : newId || undefined,
      curr: "KRW",
      exchgRateType: "User",
      exchgRate: "1.00",
      rem: slipHeader?.description || "",
      rowStatus: "C",
    }),
    [slipHeader]
  );

  const handleSelectionChanged = useCallback(
    (event: { api: { getSelectedRows: () => SlipRegistDetailResponse[] } }) => {
      const selected = event.api.getSelectedRows();
      if (selected.length > 0) {
        console.log("선택된 행:", selected[0]);
      }
    },
    []
  );

  // gridReady 핸들러
  const handleGridReady = useCallback((event: { api: GridApi }) => {
    gridRef.current = event.api;
  }, []);

  // accCode, curr, pssnDept, accMgmtNbr3, projectCode, costCode, finGdsGrpCode, itemCode 컬럼에 cellRenderer 추가 (동적으로 생성)
  const columnDefsWithRenderer = React.useMemo(() => {
    return columnDefs.map((col) => {
      if (col.field === "accCode") {
        return {
          ...col,
          cellRenderer: (params: ICellRendererParams<GridRowData>) => {
            return React.createElement(AccountCellRenderer, {
              params,
              gridRef,
              slipHeader,
            });
          },
        };
      }
      if (col.field === "curr") {
        return {
          ...col,
          cellRenderer: (params: ICellRendererParams<GridRowData>) => {
            return React.createElement(CurrencyCellRenderer, {
              params,
              gridRef,
              slipHeader,
            });
          },
        };
      }
      if (col.field === "pssnDept") {
        return {
          ...col,
          cellRenderer: (params: ICellRendererParams<GridRowData>) => {
            return React.createElement(DeptCellRenderer, {
              params,
              gridRef,
              slipHeader,
            });
          },
        };
      }
      if (col.field === "accMgmtNbr3") {
        return {
          ...col,
          cellRenderer: (params: ICellRendererParams<GridRowData>) => {
            return React.createElement(BcncCellRenderer, {
              params,
              gridRef,
              slipHeader,
            });
          },
        };
      }
      if (col.field === "projectCode") {
        return {
          ...col,
          cellRenderer: (params: ICellRendererParams<GridRowData>) => {
            return React.createElement(ProjectCellRenderer, {
              params,
              gridRef,
              slipHeader,
            });
          },
        };
      }
      if (col.field === "costCode") {
        return {
          ...col,
          cellRenderer: (params: ICellRendererParams<GridRowData>) => {
            return React.createElement(ProcsCodeCellRenderer, {
              params,
              gridRef,
              slipHeader,
            });
          },
        };
      }
      if (col.field === "finGdsGrpCode") {
        return {
          ...col,
          cellRenderer: (params: ICellRendererParams<GridRowData>) => {
            return React.createElement(PrdlstSeCellRenderer, {
              params,
              gridRef,
              slipHeader,
            });
          },
        };
      }
      if (col.field === "itemCode") {
        return {
          ...col,
          cellRenderer: (params: ICellRendererParams<GridRowData>) => {
            return React.createElement(PrdlstCodeCellRenderer, {
              params,
              gridRef,
              slipHeader,
            });
          },
        };
      }
      return col;
    });
  }, [slipHeader]);

  return (
    <FormAgGrid<SlipRegistDetailResponse & { id?: string | number }>
      rowData={slipDetails}
      columnDefs={columnDefsWithRenderer}
      onGridReady={handleGridReady}
      enableFilter={true}
      showToolbar={true}
      createNewRow={createNewRow}
      setRowData={setSlipDetails}
      toolbarButtons={{
        showAdd: true,
        showCopy: true,
        showDelete: true,
        showExcelDownload: true,
        showExcelUpload: false,
        showRefresh: true,
        showSave: false,
      }}
      gridOptions={{
        pagination: true,
        paginationPageSize: 10,
        rowSelection: "multiple",
      }}
      className={className}
      onSelectionChanged={handleSelectionChanged}
      // customButtons={[
      //   <FormButton
      //     key="search"
      //     size="small"
      //     className="data-grid-panel__button"
      //     onClick={() => {
      //       showSuccess("커스텀 버튼 클릭됨");
      //     }}
      //   >
      //     Button
      //   </FormButton>,
      //   <FormButton
      //     key="custom1"
      //     size="small"
      //     className="data-grid-panel__button"
      //     onClick={() => {
      //       showSuccess("커스텀 버튼 1 클릭됨");
      //     }}
      //   >
      //     Button 1
      //   </FormButton>,
      //   <FormButton
      //     key="custom2"
      //     size="small"
      //     className="data-grid-panel__button "
      //     onClick={() => {
      //       showSuccess("커스텀 버튼 2 클릭됨");
      //     }}
      //   >
      //     Button 2
      //   </FormButton>,
      // ]}
      showAllCustomButtons={false}
      maxVisibleCustomButtons={2}
      headerTextAlign="center" // 헤더 텍스트 가운데 정렬
    />
  );
};

export default DetailGrid;
