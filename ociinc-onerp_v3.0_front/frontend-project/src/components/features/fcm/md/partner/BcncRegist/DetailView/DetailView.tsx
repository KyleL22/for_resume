import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { Form, Modal } from "antd";
import dayjs from "dayjs";
import { AppPageModal } from "@components/ui/feedback";
import { DataForm } from "@components/ui/form";
import { useBcncRegistStore } from "@store/bcncRegistStore";
import { useAuthStore } from "@store/authStore";
import { usePageModal } from "@hooks/usePageModal";
import { getTableRows } from "./DetailView.config";
import type { SearchPopupResult } from "./SearchPopup";

const DetailView: React.FC<{ className?: string; mode?: "view" | "edit" }> = ({
  className,
  mode: initialMode = "view",
}) => {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [form] = Form.useForm();
  const {
    detailData,
    save: saveBcncData,
    getInsertInfo,
    setDetailData,
    setShipListData,
    setDetailViewMode,
  } = useBcncRegistStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setDetailViewMode(mode);
  }, [mode, setDetailViewMode]);

  const currentPopupParamsRef = useRef<Record<string, any>>({});
  const searchPopup = usePageModal<Record<string, any>, SearchPopupResult>(
    React.lazy(() => import("./SearchPopup")),
    {
      title: "검색 팝업",
      onReturn: (value) => {
        const fields: any = {};
        if (currentPopupParamsRef.current.targetField1)
          fields[currentPopupParamsRef.current.targetField1] = value.field1;
        if (currentPopupParamsRef.current.targetField2)
          fields[currentPopupParamsRef.current.targetField2] = value.field2;
        form.setFieldsValue(fields);
      },
    }
  );

  const handleSearchInputClick = useCallback(
    (value: string, options: any) => {
      currentPopupParamsRef.current = options;
      searchPopup.openModal({ initialField1: value, ...options });
    },
    [searchPopup]
  );

  const personYn = Form.useWatch("personYn", form) || "N";
  const tableRows = useMemo(
    () => getTableRows({ detailData, personYn, handleSearchInputClick, form }),
    [detailData, personYn, handleSearchInputClick, form]
  );

  const handleSave = useCallback(async () => {
    const values = form.getFieldsValue();
    let gridData: unknown[] = [];
    if (useBcncRegistStore.getState().gridApi) {
      const api = useBcncRegistStore.getState().gridApi;
      const allRowData: unknown[] = [];
      api?.forEachNode((node) => {
        if (node.data) allRowData.push(node.data);
      });
      gridData = allRowData;
    }

    const finalFormData = { ...detailData, ...values };
    ["sdate", "odate", "cdate"].forEach((field) => {
      const val = finalFormData[field];
      if (dayjs.isDayjs(val)) finalFormData[field] = val.format("YYYY-MM-DD");
    });

    if (user?.officeId) {
      const rowStatus = detailData?.custno ? "U" : "C";
      const saveRequest = {
        bcncList: [{ ...finalFormData, officeId: user.officeId, rowStatus }],
        shipToList: gridData
          .filter((r: any) => r.rowStatus === "C" || r.rowStatus === "U")
          .map((r: any) => ({
            ...r,
            custno: finalFormData.custno,
            officeId: user.officeId,
          })),
        rowStatus,
      };
      try {
        await saveBcncData(saveRequest as any);
        setMode("view");
      } catch (e) {
        console.error(e);
      }
    }
  }, [form, detailData, user, saveBcncData]);

  const scwinInsertInit = useCallback(async () => {
    if (!user?.officeId) return;
    setDetailData(null);
    setShipListData([]);
    form.resetFields();
    setMode("edit");
    try {
      await getInsertInfo({ asOfficeId: user.officeId });
    } catch (e) {
      console.error(e);
    }
  }, [user, setDetailData, setShipListData, getInsertInfo, form]);

  const handleCreate = useCallback(() => {
    if (detailData?.custno) {
      Modal.confirm({
        title: "확인",
        content: "진행하시겠습니까?",
        onOk: scwinInsertInit,
      });
    } else scwinInsertInit();
  }, [detailData, scwinInsertInit]);

  return (
    <>
      <DataForm
        form={form} // 부모의 form 인스턴스를 전달하여 자식과 상태 공유
        className={className}
        tableRows={tableRows}
        tableData={(detailData || {}) as Record<string, unknown>}
        mode={mode}
        actionButtonGroup={{
          onButtonClick: {
            edit: () => setMode("edit"),
            save: handleSave,
            create: handleCreate,
          },
          hideButtons: ["copy", "delete"],
        }}
      />
      <AppPageModal {...searchPopup.modalProps} />
    </>
  );
};

export default DetailView;
