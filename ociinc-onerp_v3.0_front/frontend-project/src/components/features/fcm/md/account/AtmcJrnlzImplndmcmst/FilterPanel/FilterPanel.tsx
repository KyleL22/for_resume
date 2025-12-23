import React, { useCallback, useEffect } from "react";
import { SearchForm } from "@components/ui/form";
import { useAtmcJrnlzMastrSetupStore } from "@/store/fcm/md/account/AtmcJrnlzMastrSetupStore";
import type { AtmcJrnlzMastrSetupSrchRequest } from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";

type FilterPanelProps = {
  className?: string;
  onRefReady?: (ref: { handleSearch: () => Promise<void> }) => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  onRefReady,
}) => {
  const { search, loading } = useAtmcJrnlzMastrSetupStore();

  // 조회 버튼 핸들러 - 검색 조건 없이 바로 API 호출
  const handleSearch = useCallback(async () => {
    try {
      // 빈 params로 호출 (헤더 조회만 수행)
      const searchParams: AtmcJrnlzMastrSetupSrchRequest = {
        asApplName: "",
        asAccountingType: "",
        asGlItem: "",
      };

      // API 요청 파라미터 콘솔 출력 (개발 환경에서만)
      if (import.meta.env.DEV) {
        console.log("=== 조회 API 호출 ===");
        console.log("searchParams:", searchParams);
        console.log("==================");
      }

      // store의 search 함수 호출
      await search(searchParams);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("조회 실패:", error);
      }
    }
  }, [search]);

  // 초기화 핸들러 (필드가 없으므로 빈 함수)
  const handleReset = useCallback(() => {
    // 검색 조건이 없으므로 초기화할 것이 없음
  }, []);

  // ref를 통해 handleSearch를 외부에서 호출할 수 있도록 expose
  useEffect(() => {
    if (onRefReady) {
      onRefReady({
        handleSearch,
      });
    }
  }, [onRefReady, handleSearch]);

  return (
    <SearchForm
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={false}
      visibleRows={1}
      columnsPerRow={4}
      className={className}
    >
      {/* 검색 조건 필드 없음 */}
    </SearchForm>
  );
};

export default FilterPanel;
