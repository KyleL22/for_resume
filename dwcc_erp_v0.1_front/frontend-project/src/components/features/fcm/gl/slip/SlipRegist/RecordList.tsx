/**
 * 전표 목록 리스트 (Slip Record List)
 * 
 * @description 검색 조건에 맞는 전표들을 카드 형태로 리스팅하고 선택 기능을 제공하는 컴포넌트
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import { useMemo, useCallback } from "react";
import CardGridList from "@/components/ui/form/CardGridList";
import type { ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import dayjs from "dayjs";

interface RecordItem {
  id: string;
  company: string;
  date: string;
  status?: string;
  statusClass?: string;
  isActive?: boolean;
  description?: string;
}

const columnDefs: ExtendedColDef<RecordItem>[] = [
  { field: "id", headerName: "전표ID", flex: 1 },
  { field: "company", headerName: "거래처명", flex: 2 },
  { field: "date", headerName: "회계일자", flex: 1 },
  { field: "description", headerName: "적요", flex: 2, width: 250, minWidth: 250 },
  { field: "status", headerName: "전표상태", flex: 1 },
];

const RecordList = ({
  className,
  onSelect,
}: {
  className?: string;
  onSelect?: (item: RecordItem | null) => void;
}) => {
  const { slipList, selectedSlipId, handleSelectSlip, isNewSlip } = useSlipRegist();

  // 데이터 변환: SlipRegistListResponse -> RecordItem
  const recordItems: RecordItem[] = useMemo(() => {
    return slipList.map((item) => {
      const formattedDate = item.bltDateAckSlp
        ? dayjs(item.bltDateAckSlp, "YYYYMMDD").format("YYYY.MM.DD")
        : "";

      return {
        id: item.slpHeaderId || "",
        company: item.custname || "",
        date: formattedDate,
        description: item.description || "",
        status: item.edimStatusName || undefined,
        statusClass: item.statusClass || undefined,
        isActive: selectedSlipId === item.slpHeaderId,
      };
    });
  }, [slipList, selectedSlipId]);

  // 항목 선택 핸들러 - store의 handleSelectSlip 호출하여 헤더/상세 조회
  const handleSelect = useCallback(
    (item: RecordItem | null) => {
      if (!item || !item.id) {
        // null이 전달되는 경우는 선택 해제이므로 아무것도 하지 않음
        if (onSelect) {
          onSelect(item);
        }
        return;
      }

      // 현재 선택된 항목과 같은 항목을 선택한 경우 (신규 모드가 아닐 때만 무시)
      // 신규 모드일 때는 같은 항목을 선택해도 조회를 다시 실행하여 신규 모드를 취소해야 함
      if (selectedSlipId === item.id && !isNewSlip) {
        // 외부 onSelect 콜백만 호출
        if (onSelect) {
          onSelect(item);
        }
        return;
      }

      // 다른 항목을 선택한 경우에만 store의 handleSelectSlip 호출하여 헤더/상세 조회
      handleSelectSlip(item.id);

      // 외부 onSelect 콜백이 있으면 호출
      if (onSelect) {
        onSelect(item);
      }
    },
    [handleSelectSlip, onSelect, selectedSlipId]
  );

  return (
    <CardGridList
      items={recordItems}
      columnDefs={columnDefs}
      totalCount={recordItems.length}
      className={className}
      onSelect={handleSelect}
      cardFields={{
        headerLeft: ["id", "status"],
        headerRight: ["date"],
        body: ["company"],
      }}
    />
  );
};

export default RecordList;
