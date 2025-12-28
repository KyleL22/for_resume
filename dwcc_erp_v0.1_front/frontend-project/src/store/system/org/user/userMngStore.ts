import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { message } from "antd";
import dayjs from "dayjs";
import {
  getAllUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  type UserDto,
  type UserSearchRequest,
  type UserSaveItem,
} from "@apis/system/user/userApi";
import { getCodeDetailApi } from "@apis/comCode";
import { getAllOrgListApi } from "@apis/system/common/listApi";
import { uploadFileApi, createEatKeyApi, deleteFileApi } from "@apis/system/file/fileApi";
import i18n from "@/i18n";

interface UserMngState {
  // State
  userList: UserDto[];
  selectedUser: UserDto | null;
  orgList: Array<{ value: string; label: string }>;
  positionList: Array<{ value: string; label: string }>;
  loading: boolean;
  isModified: boolean;
  searchParams: UserSearchRequest;
  selectedRows: UserDto[]; // 다중 선택 데이터 추가
  pendingFileInfo: { file: File; eatKey: number | null; empCode: string } | null;
  pendingDeleteInfo: { eatKey: number; eatIdx: string; empCode: string } | null;

  // Actions
  setSearchParams: (params: Partial<UserSearchRequest>) => void;
  setSelectedUser: (user: UserDto | null) => void;
  setSelectedRows: (rows: UserDto[]) => void; // 다중 선택 설정 액션 추가
  setPendingFileInfo: (info: { file: File; eatKey: number | null; empCode: string } | null) => void;
  setPendingDeleteInfo: (info: { eatKey: number; eatIdx: string; empCode: string } | null) => void;
  
  fetchUserList: () => Promise<void>;
  fetchOrgList: (officeId: string) => Promise<void>;
  fetchPositionList: () => Promise<void>;
  
  search: (params?: UserSearchRequest) => Promise<void>;
  reset: () => void;
  
  insert: () => void;
  remove: () => void; // 매개변수 없이 내부 상태 사용하도록 변경
  save: () => Promise<void>;
  
  handleCellValueChanged: (data: UserDto) => void;
  handleDetailFormValuesChange: (changedValues: any, allValues: any) => void;
}

export const useUserMngStore = create<UserMngState>()(
  devtools(
    (set, get) => ({
      // Initial State
      userList: [],
      selectedUser: null,
      orgList: [],
      positionList: [],
      loading: false,
      isModified: false,
      searchParams: {
        asType: "2", // 성명
        asName: undefined,
        asUseYn: "%", // 전체
      },
      selectedRows: [],
      pendingFileInfo: null,
      pendingDeleteInfo: null,

      // Simple Setters
      setSearchParams: (params) => 
        set((state) => ({ searchParams: { ...state.searchParams, ...params } })),
      
      setSelectedUser: (user) => {
        const state = get();
        // 다른 사용자 선택 시 대기 중인 파일 정보 초기화
        if (state.selectedUser?.empCode !== user?.empCode) {
          set({ 
            selectedUser: user,
            pendingFileInfo: null,
            pendingDeleteInfo: null
          });
        } else {
          set({ selectedUser: user });
        }
      },

      setSelectedRows: (rows) => set({ selectedRows: rows }),
      setPendingFileInfo: (info) => set({ pendingFileInfo: info }),
      setPendingDeleteInfo: (info) => set({ pendingDeleteInfo: info }),

      // Data Fetching
      fetchUserList: async () => {
        const { searchParams, loading } = get();
        if (loading) return;

        try {
          set({ loading: true });
          
          let empName: string | undefined;
          let department: string | undefined;
          let empCode: string | undefined;
          
          if (searchParams.asType === "2") empName = searchParams.asName;
          else if (searchParams.asType === "1") department = searchParams.asName;
          else if (searchParams.asType === "3") empCode = searchParams.asName;
          
          const useYn = searchParams.asUseYn === "%" ? "%" : searchParams.asUseYn;
          
          const response = await getAllUsersApi({
            empName,
            department,
            empCode,
            useYn,
          });
          
          if (response.success) {
            const data = Array.isArray(response.data) ? response.data : [];
            const dataWithId = data.map((item, index) => ({
              ...item,
              id: `${item.empCode}_${index}`,
              rowStatus: undefined,
            }));
            
            set({ userList: dataWithId });

            // 선택된 사용자 정보 동기화
            const { selectedUser } = get();
            if (selectedUser) {
              const updatedSelectedUser = dataWithId.find(
                (item) => item.empCode === selectedUser.empCode
              );
              set({ selectedUser: updatedSelectedUser ? { ...updatedSelectedUser } : null });
            }
          }
        } catch (error) {
          console.error("사용자 목록 조회 실패:", error);
          message.error(i18n.t("MSG_SY_0064"));
        } finally {
          set({ loading: false });
        }
      },

      fetchOrgList: async (officeId) => {
        try {
          const response = await getAllOrgListApi({ officeId });
          if (response.success && response.data) {
            const options = response.data.map((item) => ({
              value: item.code || "",
              label: item.name || item.code || "",
            }));
            set({ orgList: options });
          }
        } catch (error) {
          console.error("조직 목록 조회 실패:", error);
        }
      },

      fetchPositionList: async () => {
        try {
          const response = await getCodeDetailApi({
            module: "HR",
            type: "PSTNME",
            enabledFlag: "Y",
          });
          if (response.success && response.data) {
            const codeList = Array.isArray(response.data) ? response.data : [response.data];
            const options = codeList.map((item) => ({
              value: item.code || "",
              label: item.name1 || "",
            }));
            set({ positionList: options });
          }
        } catch (error) {
          console.error("직위 목록 조회 실패:", error);
        }
      },

      search: async (params) => {
        if (params) {
          set({ searchParams: params });
        }
        await get().fetchUserList();
      },

      reset: () => {
        set({
          userList: [],
          selectedUser: null,
          selectedRows: [],
          isModified: false,
          searchParams: {
            asType: "2",
            asName: undefined,
            asUseYn: "%",
          },
          pendingFileInfo: null,
          pendingDeleteInfo: null,
        });
      },

      // Grid Operations
      insert: () => {
        const { userList } = get();
        const newRow: UserDto & { id?: string } = {
          empCode: "",
          empName: "",
          officeId: "",
          useYn: "Y",
          ySale: "N",
          rowStatus: "C",
          id: `new_${Date.now()}`,
        };
        set({
          userList: [newRow, ...userList],
          isModified: true,
        });
      },

      remove: () => {
        const { userList, selectedRows } = get();
        if (selectedRows.length === 0) {
          message.warning(i18n.t("MSG_SY_0043"));
          return;
        }

        const updatedData = userList.map((row) => {
          const isSelected = selectedRows.some((selected) => selected.empCode === row.empCode);
          if (isSelected) {
            return row.rowStatus === "C" ? null : { ...row, rowStatus: "D" };
          }
          return row;
        }).filter((row) => row !== null) as UserDto[];

        set({
          userList: updatedData,
          isModified: true,
          selectedRows: [], // 삭제 후 선택 초기화
        });
      },

      save: async () => {
        const { userList, isModified, pendingFileInfo, pendingDeleteInfo } = get();
        
        if (!isModified) {
          message.info(i18n.t("MSG_SY_0045"));
          return;
        }

        const saveItems = userList.filter((row) => 
          row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D"
        );

        if (saveItems.length === 0) {
          message.warning(i18n.t("MSG_SY_0048"));
          return;
        }

        try {
          set({ loading: true });
          let successCount = 0;
          let errorCount = 0;

          for (const item of saveItems) {
            try {
              let finalEmpImgId: string | undefined = undefined;
              let fileDeleted = false;

              // 파일 삭제 처리
              if (pendingDeleteInfo && pendingDeleteInfo.empCode === item.empCode) {
                await deleteFileApi(pendingDeleteInfo.eatKey, pendingDeleteInfo.eatIdx);
                fileDeleted = true;
                set({ pendingDeleteInfo: null });
                if (!pendingFileInfo || pendingFileInfo.empCode !== item.empCode) {
                  finalEmpImgId = null as any;
                }
              }

              // 파일 업로드 처리
              if (pendingFileInfo && pendingFileInfo.empCode === item.empCode) {
                let finalEatKey = pendingFileInfo.eatKey;
                if (!finalEatKey) {
                  const eatKeyResponse = await createEatKeyApi("00051");
                  if (eatKeyResponse.success && eatKeyResponse.data) {
                    finalEatKey = eatKeyResponse.data;
                  } else {
                    throw new Error("EAT_KEY 생성 실패");
                  }
                }
                const uploadResponse = await uploadFileApi(pendingFileInfo.file, {
                  eatKey: finalEatKey,
                });
                if (uploadResponse.success) {
                  finalEmpImgId = finalEatKey.toString();
                  set({ pendingFileInfo: null });
                } else {
                  throw new Error("파일 업로드 실패");
                }
              }

              // 기존 이미지 유지 로직
              if (!fileDeleted && finalEmpImgId === undefined && item.empImgId && item.empImgId !== 'PENDING') {
                const empImgIdNum = parseInt(item.empImgId, 10);
                if (!isNaN(empImgIdNum) && empImgIdNum > 0) {
                  finalEmpImgId = empImgIdNum.toString();
                }
              }

              const formatDate = (date: any) => {
                if (!date) return undefined;
                return dayjs(date).format('YYYY-MM-DD');
              };

              const userSaveItem: UserSaveItem = {
                ...item,
                rowStatus: item.rowStatus!,
                startDate: formatDate(item.startDate),
                endDate: formatDate(item.endDate),
                empImgId: finalEmpImgId,
                ySale: item.ySale || "N",
                empCode: item.empCode,
                empName: item.empName,
              };

              if (item.rowStatus === "D") {
                await deleteUserApi(item.empCode);
              } else if (item.rowStatus === "C") {
                await createUserApi(userSaveItem);
              } else if (item.rowStatus === "U") {
                await updateUserApi(item.empCode, userSaveItem);
              }
              successCount++;
            } catch (error) {
              console.error(`사용자 ${item.empCode} 저장 실패:`, error);
              errorCount++;
            }
          }

          if (errorCount === 0) {
            message.success(i18n.t("MSG_SY_0049"));
            set({ isModified: false, pendingFileInfo: null, pendingDeleteInfo: null });
            await get().fetchUserList();
          } else {
            message.warning(`${successCount}건 성공, ${errorCount}건 실패`);
            await get().fetchUserList();
          }
        } catch (error) {
          message.error(i18n.t("MSG_SY_0050"));
        } finally {
          set({ loading: false });
        }
      },

      handleCellValueChanged: (data) => {
        const { userList } = get();
        const updatedList = userList.map((row) => {
          if (row.empCode === data.empCode) {
            return {
              ...row,
              ...data,
              rowStatus: row.rowStatus || "U",
            };
          }
          return row;
        });
        set({ userList: updatedList, isModified: true });
      },

      handleDetailFormValuesChange: (_changedValues, allValues) => {
        const { selectedUser, userList } = get();
        const targetEmpCode = allValues?.empCode || selectedUser?.empCode;
        if (!targetEmpCode) return;

        const updatedList = userList.map((row) => {
          if (row.empCode === targetEmpCode) {
            const updatedRow = {
              ...row,
              ...allValues,
              empCode: row.empCode,
              rowStatus: row.rowStatus || "U",
            };
            return updatedRow;
          }
          return row;
        });

        set((state) => ({
          userList: updatedList,
          isModified: true,
          // selectedUser도 동기화 (이미지 펜딩 상태 등 반영)
          selectedUser: state.selectedUser?.empCode === targetEmpCode 
            ? { ...state.selectedUser, ...allValues }
            : state.selectedUser
        }));
      },
    }),
    { name: "UserMngStore" }
  )
);
