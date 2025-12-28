import React, { useEffect, useCallback } from "react";
import { Form } from "antd";
import { useTranslation } from "react-i18next";
import { SearchForm, FormInput, FormSelect } from "@components/ui/form";
import { useUserMngStore } from "@store/system/org/user/userMngStore";

const FilterPanel: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { loading, searchParams, search, reset } = useUserMngStore();

  const handleSearch = useCallback(async () => {
    const values = await form.validateFields();
    search({
      asType: values.asType,
      asName: values.asName,
      asUseYn: values.asUseYn,
    });
  }, [form, search]);

  const handleReset = useCallback(() => {
    form.resetFields();
    reset();
  }, [form, reset]);

  useEffect(() => {
    form.setFieldsValue(searchParams);
  }, [form, searchParams]);

  const typeOptions = [
    { value: "2", label: t("성명") },
    { value: "1", label: t("부서") },
    { value: "3", label: t("사번") },
  ];

  const useYnOptions = [
    { value: "%", label: t("전체") },
    { value: "Y", label: t("사용") },
    { value: "N", label: t("미사용") },
  ];

  return (
    <SearchForm
      form={form}
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      columnsPerRow={4} // 조회 버튼 우측 배치를 위해 컬럼 수 조정
      showExpand={false}
      className="page-layout__filter-panel"
    >
      <FormSelect
        name="asType"
        label={t("조회구분")}
        options={typeOptions}
        style={{ width: "100%" }}
      />
      <FormInput
        name="asName"
        label={t("조회명")}
        onPressEnter={handleSearch}
        style={{ width: "100%" }}
      />
      <FormSelect
        name="asUseYn"
        label={t("사용여부")}
        options={useYnOptions}
        style={{ width: "100%" }}
      />
    </SearchForm>
  );
};

export default FilterPanel;
