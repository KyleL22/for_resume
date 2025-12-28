import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GridApi } from "ag-grid-community";
import { message } from "antd";

import type {
  AtmcJrnlzMastrSetupSrchRequest,
  AtmcJrnlzMastrSetupHderListResponse,
  AtmcJrnlzMastrSetupDetailListResponse,
} from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";

import {
  selectAtmcJrnlzMastrSetupHderList,
  selectAtmcJrnlzMastrSetupDetailList,
} from "@apis/fcm/md/account/accountApi";

interface AtmcJrnlzMastrSetupState {
  // State
  headerList: AtmcJrnlzMastrSetupHderListResponse[];
  detailList: AtmcJrnlzMastrSetupDetailListResponse[];

  selectedHeaderRow: AtmcJrnlzMastrSetupHderListResponse | null;

  headerGridApi: GridApi | null;
  detailGridApi: GridApi | null;

  loading: boolean;

  originalHeaderList: AtmcJrnlzMastrSetupHderListResponse[];
  originalDetailList: AtmcJrnlzMastrSetupDetailListResponse[];  // 오른쪽 그리드 원본 데이터 (변경사항 감지용)

  lastSearchParams: AtmcJrnlzMastrSetupSrchRequest | null;  // 마지막 검색 조건

  // Actions
  setHeaderGridApi: (api: GridApi | null) => void;
  setDetailGridApi: (api: GridApi | null) => void;

  setHeaderList: (rows: AtmcJrnlzMastrSetupHderListResponse[]) => void;
  setDetailList: (rows: AtmcJrnlzMastrSetupDetailListResponse[]) => void;

  /** 조회(헤더 + 선택적으로 상세까지) */
  search: (params: AtmcJrnlzMastrSetupSrchRequest) => Promise<void>;

  /** 헤더 row 선택 시 상세 조회 */
  selectHeaderRow: (
    row: AtmcJrnlzMastrSetupHderListResponse | null
  ) => Promise<void>;

  reset: () => void;
}

export const useAtmcJrnlzMastrSetupStore = create<AtmcJrnlzMastrSetupState>()(
  devtools(
    (set, get) => ({
      // Initial state
      headerList: [],
      detailList: [],
      selectedHeaderRow: null,
      headerGridApi: null,
      detailGridApi: null,
      loading: false,
      originalHeaderList: [],
      originalDetailList: [],
      lastSearchParams: null,

      // Actions
      setHeaderGridApi: (api) => set({ headerGridApi: api }),
      setDetailGridApi: (api) => set({ detailGridApi: api }),

      setHeaderList: (rows) =>
        set({
          headerList: rows,
          originalHeaderList: rows.map((r) => ({ ...r })),
        }),

      setDetailList: (rows) =>
        set({
          detailList: rows,
          originalDetailList: rows.map((r) => ({ ...r })),
        }),

      /**
       * 조회
       * - 헤더는 request 없이 조회됨(백엔드 컨트롤러 기준)
       * - 상세는 params 필요 (asApplName/asAccountingType/asGlItem 필수)
       */
      search: async (params) => {
        const state = get();
        if (state.loading) return;

        set({ loading: true });

        try {
          // 1) 헤더 조회 (백엔드: body 없음)
          const headerRes = await selectAtmcJrnlzMastrSetupHderList();

          if (headerRes?.success) {
            const headerRows = headerRes.data ?? [];
            set({
              headerList: headerRows,
              originalHeaderList: headerRows.map((r) => ({ ...r })),
            });
            message.success(`헤더 조회 완료: ${headerRows.length}건`);
          } else {
            message.error(headerRes?.message || "헤더 조회에 실패했습니다.");
            set({ headerList: [], originalHeaderList: [] });
          }

          // 2) 상세 조회 (params로 조회)
          const detailRes = await selectAtmcJrnlzMastrSetupDetailList(params);

          if (detailRes?.success) {
            const detailRows = detailRes.data ?? [];
            set({
              detailList: detailRows,
              originalDetailList: detailRows.map((r) => ({ ...r })),
            });
            message.success(`상세 조회 완료: ${detailRows.length}건`);
          } else {
            message.error(detailRes?.message || "상세 조회에 실패했습니다.");
            set({ detailList: [], originalDetailList: [] });
          }

          set({ lastSearchParams: params });
        } catch (error) {
          message.error("조회 중 오류가 발생했습니다.");
          if (import.meta.env.DEV) {
            console.error("AtmcJrnlzMastrSetup search failed:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      /**
       * 헤더 row 선택 -> 상세 재조회
       * ⚠️ 주의: 현재 백엔드 상세조회는 request가 필요하고,
       * 헤더 응답(applName/accountingType/glItem)이 그대로 매핑 가능하다고 가정함.
       */
      selectHeaderRow: async (row) => {
        const state = get();
        if (state.loading) return;

        set({ selectedHeaderRow: row });

        // row가 null이면 상세 비우기
        if (!row) {
          set({ detailList: [], originalDetailList: [] });
          return;
        }

        // 마지막 검색조건(officeId) 유지하면서 row에서 조건 조립
        const base = state.lastSearchParams;

        const request: AtmcJrnlzMastrSetupSrchRequest = {
          asOfficeId: base?.asOfficeId,
          asApplName: row.applName || "", // 필수값이라 빈값 방지
          asAccountingType: row.accountingType || "",
          asGlItem: row.glItem || "",
        };

        // 필수값 부족하면 호출 막기
        if (!request.asApplName || !request.asAccountingType || !request.asGlItem) {
          message.warning("선택한 헤더에 필수 조건값이 없어 상세 조회를 할 수 없습니다.");
          set({ detailList: [], originalDetailList: [] });
          return;
        }

        set({ loading: true });

        try {
          const detailRes = await selectAtmcJrnlzMastrSetupDetailList(request);

          if (detailRes?.success) {
            const detailRows = detailRes.data ?? [];
            set({
              detailList: detailRows,
              originalDetailList: detailRows.map((r) => ({ ...r })),
            });
            message.success(`상세 조회 완료: ${detailRows.length}건`);
          } else {
            message.error(detailRes?.message || "상세 조회에 실패했습니다.");
            set({ detailList: [], originalDetailList: [] });
          }

          // 상세 조회 조건도 “마지막 조건”으로 갱신해두면 저장/재조회에 편함
          set({ lastSearchParams: request });
        } catch (error) {
          message.error("상세 조회 중 오류가 발생했습니다.");
          if (import.meta.env.DEV) {
            console.error("selectHeaderRow failed:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      reset: () => {
        set({
          headerList: [],
          detailList: [],
          selectedHeaderRow: null,
          originalHeaderList: [],
          originalDetailList: [],
          lastSearchParams: null,
        });
      },
    }),
    { name: "AtmcJrnlzMastrSetupStore" }
  )
);
