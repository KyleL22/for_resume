/**
 * 은행계좌 등록
 * 
 * @description 은행계좌 등록
 * @author 이경철
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import React, { useCallback, useState } from "react";
import SearchGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import { FilterPanel, MainGrid } from "@components/features/fcm/md/other/BankAcnutRegist";
import { selectBankAcnutRegistList, saveBankAcnutRegist } from "@apis/fcm/md/other/bankAcnutRegist";
import type { BankAcnutRowData } from "@components/features/fcm/md/other/BankAcnutRegist/MainGrid/MainGrid";
import { useAuthStore } from "@store/authStore";
import { message } from "antd";

const BankAcnutRegist: React.FC = () => {
    const { user } = useAuthStore();
    const [rowData, setRowData] = useState<BankAcnutRowData[]>([]);

    const handleSearch = useCallback(async (values: any) => {
        try {
            const params = {
                ...values,
                asOfficeId: user?.officeId
            };
            const response = await selectBankAcnutRegistList(params);

            if (response.success) {
                // AG-Grid의 idField 용으로 id 부여 (기존 데이터는 bankCode + accNbrCode + seq 조합 등)
                const mappedData = response.data.map((item, index) => ({
                    ...item,
                    id: `${item.bankCode}_${item.accNbrCode}_${index}`
                }));
                setRowData(mappedData);
            }
        } catch (error) {
            console.error("Search error:", error);
            message.error("조회 중 오류가 발생했습니다.");
        }
    }, [user]);

    const handleSave = useCallback(async () => {
        const changedData = rowData.filter(row => row.rowStatus);
        if (changedData.length === 0) {
            message.info("변경사항이 없습니다.");
            return;
        }

        try {
            // 백엔드 스펙에 맞춰 데이터 가공 (C, U만 허용, D는 U + useYn: 'N'으로 변환)
            const saveList = changedData.map(row => {
                const mappedRow = { ...row };

                if (mappedRow.rowStatus === "C") {
                    mappedRow.officeId = user?.officeId || "OSE";
                    mappedRow.orgId = "HO"; // 기본값 (기존 XML 참고: gs_Def_Org)
                } else if (mappedRow.rowStatus === "D") {
                    // 기존 데이터 삭제 시 Soft Delete 처리
                    mappedRow.rowStatus = "U";
                    mappedRow.useYn = "N";
                }

                return mappedRow;
            }).filter(row => row.rowStatus === "C" || row.rowStatus === "U");

            if (saveList.length === 0) {
                // 신규 추가했다가 바로 삭제한 경우 등
                setRowData(prev => prev.filter(r => r.rowStatus !== "D"));
                return;
            }

            const response = await saveBankAcnutRegist({ list: saveList as any });

            if (response.success) {
                message.success("저장에 성공하였습니다.");
                // 재조회 (기존 검색 조건 활용 필요 시 상태 관리 추가 권장)
                handleSearch({});
            }
        } catch (error) {
            console.error("Save error:", error);
            message.error("저장 중 오류가 발생했습니다.");
        }
    }, [rowData, user, handleSearch]);

    return (
        <SearchGridSaveLayout
            filterPanel={
                <FilterPanel
                    className="page-layout__filter-panel"
                    onSearch={handleSearch}
                />
            }
            grid={
                <MainGrid
                    className="page-layout__main-grid"
                    rowData={rowData}
                    setRowData={setRowData}
                    onSave={handleSave}
                />
            }
            gridClassName="page-card--detail-grid"
        />
    );
};

export default BankAcnutRegist;
