import React, { useEffect, useState, useCallback, useRef } from "react";
import { Form, Upload, Button, message, Space, Modal, Input, Table } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  FormInput,
  FormSelect,
  FormDatePicker,
  FormRadioGroup,
} from "@components/ui/form";
import { useTranslation } from "react-i18next";
import { downloadFileApi, getFileListApi, getImageBlobApi } from "@apis/system/file/fileApi";
import { toggleApplUseYnApi } from "@apis/system/user/userApi";
import { searchDeptListApi, type DeptDto } from "@apis/system/org/deptApi";
import ActionButtonGroup from "@components/ui/form/Button/ActionButtonGroup";
import { useUserMngStore } from "@store/system/org/user/userMngStore";
import { UserDetailPanelStyles } from "./UserDetailPanel.styles";

interface UserDetailPanelProps {
  form: any;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ form }) => {
  const { t } = useTranslation();
  const {
    selectedUser,
    orgList,
    positionList,
    handleDetailFormValuesChange,
    setPendingFileInfo,
    setPendingDeleteInfo,
    insert,
    remove,
    save,
  } = useUserMngStore();

  const handleEdit = useCallback(() => {
    message.info(t("수정 모드가 활성화되었습니다."));
  }, [t]);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [eatKey, setEatKey] = useState<number | null>(null);
  const blobUrlRef = useRef<string[]>([]);
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [deptSearchText, setDeptSearchText] = useState("");
  const [deptList, setDeptList] = useState<DeptDto[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);

  const isImageFile = (filename: string): boolean => {
    if (!filename) return false;
    const ext = filename.toLowerCase().substring(filename.lastIndexOf(".") + 1);
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext);
  };

  const fetchFileList = useCallback(async (key: number) => {
    try {
      blobUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlRef.current = [];
      
      const response = await getFileListApi(key);
      if (response.success && response.data) {
        const files: UploadFile[] = await Promise.all(
          response.data.map(async (item) => {
            const uid = item.uid || item.eatIdx || "";
            const name = item.name || item.fileName || "";
            const fileEatKey = item.eatKey || key;
            let imageUrl: string | undefined;
            if (fileEatKey && uid && name && isImageFile(name)) {
              try {
                const blob = await getImageBlobApi(fileEatKey, uid);
                imageUrl = URL.createObjectURL(blob);
                blobUrlRef.current.push(imageUrl);
              } catch (error) {
                console.error("이미지 로드 실패:", error);
              }
            }
            return {
              uid,
              name,
              status: (item.status as any) || "done",
              url: imageUrl,
              thumbUrl: imageUrl,
            };
          })
        );
        setFileList(files);
      } else {
        setFileList([]);
      }
    } catch (error) {
      console.error("파일 목록 조회 실패:", error);
    }
  }, []);

  const handleFileChange: UploadProps["onChange"] = (info) => {
    const { fileList: newFileList } = info;
    
    if (newFileList.length === 0 || newFileList.every(file => file.status === 'removed')) {
      setFileList([]);
      setPendingFileInfo(null);
      if (selectedUser) {
        const allValues = { ...form.getFieldsValue(), empCode: selectedUser.empCode, empImgId: undefined };
        handleDetailFormValuesChange({ empImgId: undefined }, allValues);
      }
      setPendingDeleteInfo(null);
      return;
    }
    
    const fileWithUrl = newFileList.find(file => file.url && (file.status === 'done' || file.status === 'uploading'));
    if (fileWithUrl && fileWithUrl.url) {
      setFileList([fileWithUrl]);
      if (selectedUser) {
        const allValues = { ...form.getFieldsValue(), empCode: selectedUser.empCode, empImgId: eatKey ? eatKey.toString() : 'PENDING' };
        handleDetailFormValuesChange({ empImgId: eatKey ? eatKey.toString() : 'PENDING' }, allValues);
      }
      return;
    }
    
    const fileWithOrigin = newFileList.find(file => file.originFileObj);
    if (fileWithOrigin && selectedUser) {
      const allValues = { ...form.getFieldsValue(), empCode: selectedUser.empCode, empImgId: eatKey ? eatKey.toString() : 'PENDING' };
      handleDetailFormValuesChange({ empImgId: eatKey ? eatKey.toString() : 'PENDING' }, allValues);
      setPendingFileInfo({ file: fileWithOrigin.originFileObj as File, eatKey: eatKey || null, empCode: selectedUser.empCode });
    }
  };

  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      fileList.forEach((prevFile) => {
        if (prevFile.url && prevFile.url.startsWith("blob:")) {
          URL.revokeObjectURL(prevFile.url);
          blobUrlRef.current = blobUrlRef.current.filter((url) => url !== prevFile.url);
        }
      });
      
      const fileObj = file as File;
      const previewUrl = URL.createObjectURL(fileObj);
      blobUrlRef.current.push(previewUrl);
      const currentEatKey = eatKey || null;
      const fileUid = (file as any).uid || `local_${Date.now()}`;
      const newFile: UploadFile = {
        uid: fileUid,
        name: fileObj.name,
        status: "done",
        url: previewUrl,
        thumbUrl: previewUrl,
        originFileObj: fileObj as any,
      };
      
      setFileList([newFile]);
      if (selectedUser) {
        const allValues = { ...form.getFieldsValue(), empCode: selectedUser.empCode, empImgId: currentEatKey ? currentEatKey.toString() : 'PENDING' };
        handleDetailFormValuesChange({ empImgId: currentEatKey ? currentEatKey.toString() : 'PENDING' }, allValues);
        setPendingFileInfo({ file: fileObj, eatKey: currentEatKey, empCode: selectedUser.empCode });
      }
      if (onSuccess) onSuccess({} as any);
    } catch (error) {
      if (onError) onError(error as Error);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!eatKey || fileList.length === 0) {
      message.warning(t("MSG_SY_0065"));
      return;
    }
    try {
      const file = fileList[0];
      if (file.uid) {
        await downloadFileApi(eatKey, file.uid, file.name);
        message.success(t("MSG_SY_0066"));
      }
    } catch (error) {
      message.error(t("MSG_SY_0067"));
    }
  }, [eatKey, fileList, t]);

  const prevSelectedEmpCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedUser) {
      const currentEmpCode = selectedUser.empCode;
      if (prevSelectedEmpCodeRef.current !== currentEmpCode) {
        form.setFieldsValue({
          ...selectedUser,
          startDate: selectedUser.startDate ? dayjs(selectedUser.startDate) : undefined,
          endDate: selectedUser.endDate ? dayjs(selectedUser.endDate) : undefined,
          passwordDate: selectedUser.passwordDate ? dayjs(selectedUser.passwordDate) : undefined,
          useYn: selectedUser.useYn || "Y",
          ySale: selectedUser.ySale || "N",
          buyerYn: selectedUser.buyerYn || "N",
        });

        setPendingFileInfo(null);
        setPendingDeleteInfo(null);
        
        if (selectedUser.empImgId && selectedUser.empImgId !== 'PENDING') {
          const empImgIdNum = parseInt(selectedUser.empImgId as any, 10);
          if (!isNaN(empImgIdNum) && empImgIdNum > 0) {
            setEatKey(empImgIdNum);
            fetchFileList(empImgIdNum);
          } else {
            setEatKey(null);
            setFileList([]);
          }
        } else {
          setEatKey(null);
          setFileList([]);
        }
        prevSelectedEmpCodeRef.current = currentEmpCode;
      }
    } else {
      form.resetFields();
      blobUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlRef.current = [];
      setFileList([]);
      setPendingFileInfo(null);
      setPendingDeleteInfo(null);
      prevSelectedEmpCodeRef.current = null;
    }
  }, [selectedUser, form, fetchFileList, setPendingFileInfo, setPendingDeleteInfo]);

  useEffect(() => {
    return () => {
      blobUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleDeptSearchExecute = async () => {
    try {
      setDeptLoading(true);
      const response = await searchDeptListApi({ find: deptSearchText, useYno: "Y" });
      if (response.success && response.data) {
        setDeptList(response.data);
      }
    } finally {
      setDeptLoading(false);
    }
  };

  const handleDeptSelect = (dept: DeptDto) => {
    form.setFieldsValue({ deptCode: dept.deptCde, deptName: dept.deptNme });
    setDeptModalVisible(false);
    handleDetailFormValuesChange({ deptCode: dept.deptCde, deptName: dept.deptNme }, form.getFieldsValue());
  };

  const handleApplUseYnChange = async () => {
    if (!selectedUser) return;
    try {
      const currentApplUseYn = form.getFieldValue("applUseYn") || "N";
      const newApplUseYn = currentApplUseYn === "Y" ? "N" : "Y";
      await toggleApplUseYnApi({
        officeId: selectedUser.officeId || "",
        empCode: selectedUser.empCode,
        applUseYn: newApplUseYn
      });
      form.setFieldsValue({ applUseYn: newApplUseYn });
      handleDetailFormValuesChange({ applUseYn: newApplUseYn }, form.getFieldsValue());
      message.success(t("MSG_SY_0049"));
    } catch (error) {
      console.error("전자결재 사용 여부 변경 실패:", error);
    }
  };

  const deptColumns: ColumnsType<DeptDto> = [
    { title: t("사업장코드"), dataIndex: "orgCde", key: "orgCde" },
    { title: t("부서코드"), dataIndex: "deptCde", key: "deptCde" },
    { title: t("부서명"), dataIndex: "deptNme", key: "deptNme" },
  ];

  const yesNoOptions = [
    { label: t("예"), value: "Y" },
    { label: t("아니오"), value: "N" },
  ];

  const purreqRoleOptions = [
    { label: t("권한없음"), value: "0" },
    { label: t("권한있음"), value: "1" },
  ];

  const purkpoRoleOptions = [
    { label: t("권한없음"), value: "0" },
    { label: t("구매팀"), value: "1" },
    { label: t("법무팀"), value: "2" },
  ];

  const buyerYnOptions = [
    { label: t("선택"), value: "" },
    { label: t("예"), value: "Y" },
    { label: t("아니오"), value: "N" },
  ];

  const currentApplUseYn = Form.useWatch("applUseYn", form);
  const applUseYnButtonText = currentApplUseYn === "Y" ? t("사용 중지") : t("사용 추가");

  return (
    <UserDetailPanelStyles>
      <div className="user-detail__header">
        <div className="header-title"></div>
        <div className="header-buttons">
          <ActionButtonGroup
            onButtonClick={{
              create: insert,
              edit: handleEdit,
              delete: remove,
              save: save,
            }}
            hideButtons={["copy"]}
          />
        </div>
      </div>
      <Form form={form} layout="horizontal" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} onValuesChange={handleDetailFormValuesChange}>
        <div className="user-detail__table">
          <table>
            <colgroup>
              <col width="12%" /><col width="21%" /><col width="12%" /><col width="21%" />
              <col width="12%" /><col width="22%" />
            </colgroup>
            <tbody>
              <tr>
                <th>{t("사용자ID")}</th>
                <td><FormInput name="empCode" label="" disabled style={{ marginBottom: 0 }} /></td>
                <th>{t("사용자명")}</th>
                <td><FormInput name="empName" label="" required style={{ marginBottom: 0 }} /></td>
                <th>{t("부서")}</th>
                <td>
                  <Space.Compact style={{ width: "100%" }}>
                    <FormInput name="deptName" label="" disabled style={{ flex: 1, marginBottom: 0 }} />
                    <Button icon={<SearchOutlined />} onClick={() => setDeptModalVisible(true)} />
                  </Space.Compact>
                </td>
              </tr>
              <tr>
                <th>{t("직위")}</th>
                <td><FormSelect name="pstnme" label="" options={positionList} allowClear style={{ marginBottom: 0, width: "100%" }} /></td>
                <th>{t("시작일자")}</th>
                <td><FormDatePicker name="startDate" label="" style={{ marginBottom: 0, width: "100%" }} /></td>
                <th>{t("종료일자")}</th>
                <td><FormDatePicker name="endDate" label="" style={{ marginBottom: 0, width: "100%" }} /></td>
              </tr>
              <tr>
                <th>{t("비밀번호변경일자")}</th>
                <td><FormDatePicker name="passwordDate" label="" disabled style={{ marginBottom: 0, width: "100%" }} /></td>
                <th>{t("사용여부")}</th>
                <td><FormRadioGroup name="useYn" label="" options={yesNoOptions} style={{ marginBottom: 0 }} /></td>
                <th>{t("영업담당여부")}</th>
                <td><FormRadioGroup name="ySale" label="" options={yesNoOptions} style={{ marginBottom: 0 }} /></td>
              </tr>
              <tr>
                <th>{t("사용자약어")}</th>
                <td><FormInput name="empAbbName" label="" style={{ marginBottom: 0 }} /></td>
                <th>{t("구매요청권한")}</th>
                <td><FormSelect name="purreqRole" label="" options={purreqRoleOptions} allowClear style={{ marginBottom: 0, width: "100%" }} /></td>
                <th>{t("E-Mail 수신")}</th>
                <td><FormRadioGroup name="emailReceiveYn" label="" options={yesNoOptions} style={{ marginBottom: 0 }} /></td>
              </tr>
              <tr>
                <th>{t("소속사업장")}</th>
                <td>
                  <FormSelect
                    name="orgId"
                    label=""
                    options={orgList}
                    allowClear
                    style={{ marginBottom: 0, width: "100%" }}
                    onChange={(value) => handleDetailFormValuesChange({ orgId: value }, form.getFieldsValue())}
                  />
                </td>
                <th>{t("구매결의권한")}</th>
                <td><FormSelect name="purkpoRole" label="" options={purkpoRoleOptions} allowClear style={{ marginBottom: 0, width: "100%" }} /></td>
                <th>{t("전자결재 사용")}</th>
                <td>
                  <Space.Compact style={{ width: "100%" }}>
                    <FormInput name="applUseYn" label="" disabled style={{ flex: 1, marginBottom: 0 }} />
                    <Button type="primary" onClick={handleApplUseYnChange} disabled={!selectedUser || selectedUser.rowStatus === "C"}>
                      {applUseYnButtonText}
                    </Button>
                  </Space.Compact>
                </td>
              </tr>
              <tr>
                <th>{t("종 사업장")}</th>
                <td><FormSelect name="subOrgId" label="" options={orgList} allowClear style={{ marginBottom: 0, width: "100%" }} /></td>
                <th>{t("구매담당여부")}</th>
                <td><FormSelect name="buyerYn" label="" options={buyerYnOptions} allowClear style={{ marginBottom: 0, width: "100%" }} /></td>
                <th>{t("근무장소")}</th>
                <td><FormSelect name="workPlace" label="" options={orgList} allowClear style={{ marginBottom: 0, width: "100%" }} /></td>
              </tr>
              <tr>
                <th>{t("사진")}</th>
                <td colSpan={5} className="user-detail__photo-cell-bottom">
                  <div className="user-detail__photo-container-bottom">
                    <Upload
                      listType="picture"
                      fileList={fileList}
                      onChange={handleFileChange}
                      customRequest={handleUpload}
                      maxCount={1}
                      onPreview={() => {}}
                    >
                      {fileList.length === 0 && (
                        <Button icon={<SearchOutlined />}>{t("사진등록")}</Button>
                      )}
                    </Upload>
                    {fileList.length > 0 && (
                      <Button icon={<DownloadOutlined />} onClick={handleDownload} style={{ marginLeft: 8 }}>
                        {t("다운로드")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Form>
      <Modal title={t("부서조회")} open={deptModalVisible} onCancel={() => setDeptModalVisible(false)} footer={null} width={600}>
        <div style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: "100%" }}>
            <Input placeholder={t("부서코드 또는 부서명")} value={deptSearchText} onChange={(e) => setDeptSearchText(e.target.value)} onPressEnter={handleDeptSearchExecute} style={{ flex: 1 }} />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleDeptSearchExecute} loading={deptLoading}>{t("조회")}</Button>
          </Space.Compact>
        </div>
        <Table columns={deptColumns} dataSource={deptList} loading={deptLoading} rowKey="deptCde" pagination={{ pageSize: 10 }} onRow={(record) => ({ onDoubleClick: () => handleDeptSelect(record) })} />
        <div style={{ marginTop: 16, textAlign: "right" }}><Button onClick={() => setDeptModalVisible(false)}>{t("취소")}</Button></div>
      </Modal>
    </UserDetailPanelStyles>
  );
};

export default UserDetailPanel;
