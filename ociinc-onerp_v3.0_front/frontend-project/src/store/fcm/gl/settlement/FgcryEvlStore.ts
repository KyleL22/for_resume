import { create } from "zustand";
import type { GridApi } from "ag-grid-community";
import { selectFgcryEvlList, selectFgcryEvlDetailList } from "@apis/fcm/gl/settlement";
import type {
  FgcryEvlSrchRequest,
  FgcryEvlHderListResponse,
  FgcryEvlDetailListResponse,
} from "@/types/fcm/gl/settlement/fgcryEvl.types";
import { showSuccess, showError, showWarning } from "@components/ui/feedback/Message";

interface FgcryEvlState {
  // 상태
  searchData: FgcryEvlHderListResponse[];  // 헤더 목록 (왼쪽 그리드)
  detailData: FgcryEvlDetailListResponse[]; // 상세 목록 (오른쪽 그리드)
  selectedHeaderId: string | null;          // 선택된 헤더 ID
  loading: boolean;
  gridApi: GridApi | null;
  detailGridApi: GridApi | null;            // 상세 그리드 API
  lastSearchRequest: FgcryEvlSrchRequest | null;

  // 액션
  setSearchData: (data: FgcryEvlHderListResponse[]) => void;
  setDetailData: (data: FgcryEvlDetailListResponse[]) => void;
  setSelectedHeaderId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  setDetailGridApi: (api: GridApi | null) => void;
  search: (searchRequest: FgcryEvlSrchRequest) => Promise<void>;
  selectHeader: (headerId: string) => Promise<void>; // 헤더 선택 시 상세 조회
  refresh: () => Promise<void>;
  reset: () => void;
}

export const useFgcryEvlStore = create<FgcryEvlState>(
  (set, get) => ({
    // 초기 상태
    searchData: [],
    detailData: [],
    selectedHeaderId: null,
    loading: false,
    gridApi: null,
    detailGridApi: null,
    lastSearchRequest: null,

    // 상태 설정 액션
    setSearchData: (data) => set({ searchData: data }),
    setDetailData: (data) => set({ detailData: data }),
    setSelectedHeaderId: (id) => set({ selectedHeaderId: id }),
    setLoading: (loading) => set({ loading }),
    setGridApi: (api) => set({ gridApi: api }),
    setDetailGridApi: (api) => set({ detailGridApi: api }),

    // 조회 액션
    search: async (searchRequest) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        const response = await selectFgcryEvlList(searchRequest);

        if (response.success && response.data) {
          const headerList = response.data as FgcryEvlHderListResponse[];
          set({
            searchData: headerList,
            lastSearchRequest: searchRequest,
          });
          showSuccess(`조회 완료: ${headerList.length}건`);

          // 조회 후 첫 번째 행이 있으면 자동으로 상세 조회
          if (headerList.length > 0) {
            const firstRow = headerList[0];
            // 전표번호(slipNo) 또는 외화평가ID(frExEvalId) 사용
            const headerId = firstRow.frExEvalId || firstRow.slpHeaderId || firstRow.slipNo;
            
            if (headerId) {
              // 첫 번째 행의 전표번호를 asFrExEvalId에 설정하여 상세 조회
              await get().selectHeader(headerId);
            }
          } else {
            // 조회 결과가 없으면 상세 데이터 초기화
            set({ detailData: [], selectedHeaderId: null });
          }
        } else {
          showError(response.message || "조회에 실패했습니다.");
          set({ searchData: [], detailData: [] });
        }
      } catch (error) {
        showError("조회 중 오류가 발생했습니다.");
        set({ searchData: [], detailData: [] });
        console.error("조회 실패:", error);
      } finally {
        set({ loading: false });
      }
    },

    // 헤더 선택 시 상세 조회
    selectHeader: async (headerId: string) => {
      if (!headerId) return;

      const state = get();
      if (state.loading) return;

      try {
        set({ loading: true, selectedHeaderId: headerId });

        // lastSearchRequest가 없으면 기본값 사용
        const detailRequest: FgcryEvlSrchRequest = {
          ...(state.lastSearchRequest || {}),
          asFrExEvalId: headerId, // 헤더 ID(전표번호 또는 외화평가ID)로 상세 조회
        };

        const response = await selectFgcryEvlDetailList(detailRequest);

        if (response.success && response.data) {
          set({ detailData: response.data });
        } else {
          showError(response.message || "상세 조회에 실패했습니다.");
          set({ detailData: [] });
        }
      } catch (error) {
        showError("상세 조회 중 오류가 발생했습니다.");
        set({ detailData: [] });
        console.error("상세 조회 실패:", error);
      } finally {
        set({ loading: false });
      }
    },

    // 재조회 액션
    refresh: async () => {
      const state = get();
      if (state.lastSearchRequest) {
        await get().search(state.lastSearchRequest);
      } else {
        showWarning("조회 조건이 없습니다. 먼저 조회를 실행해주세요.");
      }
    },

    // 초기화 액션
    reset: () =>
      set({
        searchData: [],
        detailData: [],
        selectedHeaderId: null,
        loading: false,
        gridApi: null,
        detailGridApi: null,
        lastSearchRequest: null,
      }),
  })
);

