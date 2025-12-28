import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Card, Button, Space, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    FormInput,
    FormSelect,
    FormAgGrid,
    SearchActions,
} from '@components/ui/form';
import type { ExtendedColDef } from '@components/ui/form/AgGrid/FormAgGrid';
import type { GridApi } from 'ag-grid-community';
import { useAdminCodeStore } from '@/store/admin/adminCodeStore';
import type { CommonCodeGroup, CommonCodeItem } from '@/types/admin/admin.types';
import { createGridReadyHandlerRef } from '@utils/agGridUtils';
import { showSuccess, showError } from '@components/ui/feedback/Message';

const CommonCodePage: React.FC = () => {
    const { t } = useTranslation();
    const [searchForm] = Form.useForm();
    const [headerForm] = Form.useForm();
    const gridApiRef = useRef<GridApi | null>(null);

    const [, setSelectedGroup] = useState<CommonCodeGroup | null>(null);
    const [codeItems, setCodeItems] = useState<CommonCodeItem[]>([]);

    const { fetchCodes, groups, items, saveCodes } = useAdminCodeStore();
    const onGridReady = createGridReadyHandlerRef(gridApiRef);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    const handleSearch = useCallback(() => {
        const groupId = searchForm.getFieldValue('groupId');
        const group = groups.find(g => g.groupId === groupId);

        if (group) {
            setSelectedGroup(group);
            headerForm.setFieldsValue(group);
            const filteredItems = items.filter(i => i.groupId === groupId);
            setCodeItems(filteredItems);
        } else {
            setSelectedGroup(null);
            headerForm.resetFields();
            setCodeItems([]);
            if (groupId) showError('해당 그룹ID를 찾을 수 없습니다.');
        }
    }, [groups, items, searchForm, headerForm]);

    const handleSave = async () => {
        try {
            const headerValues = await headerForm.validateFields();

            const gridItems: CommonCodeItem[] = [];
            gridApiRef.current?.forEachNode(node => {
                if (node.data) {
                    gridItems.push({
                        ...node.data,
                        groupId: headerValues.groupId,
                        updatedAt: new Date().toISOString(),
                        updatedBy: 'admin'
                    });
                }
            });

            const updatedGroups = groups.map(g => g.groupId === headerValues.groupId ? { ...g, ...headerValues } : g);
            if (!groups.find(g => g.groupId === headerValues.groupId)) {
                updatedGroups.push({
                    ...headerValues,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    updatedBy: 'admin'
                });
            }

            const otherItems = items.filter(i => i.groupId !== headerValues.groupId);
            const updatedItems = [...otherItems, ...gridItems];

            saveCodes(updatedGroups, updatedItems);
            showSuccess('공통코드가 저장되었습니다.');
            fetchCodes();
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const columnDefs: ExtendedColDef<CommonCodeItem>[] = [
        { field: 'codeId', headerName: '코드ID', width: 120, editable: true },
        { field: 'codeName', headerName: '코드명', width: 150, editable: true },
        { field: 'codeValue', headerName: '코드값', width: 120, editable: true },
        { field: 'sortOrder', headerName: '정렬순서', width: 100, editable: true, type: 'numericColumn' },
        {
            field: 'useYn',
            headerName: '사용여부',
            width: 100,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: ['Y', 'N'] }
        },
        { field: 'updatedAt', headerName: '변경일시', width: 180 },
        { field: 'updatedBy', headerName: '변경자ID', width: 100 },
    ];

    const handleAddRow = () => {
        const groupId = headerForm.getFieldValue('groupId');
        if (!groupId) {
            showError('먼저 그룹ID를 입력하거나 선택해주세요.');
            return;
        }
        const newRow: CommonCodeItem = {
            id: `new_${Date.now()}`,
            groupId,
            codeId: '',
            codeName: '',
            codeValue: '',
            sortOrder: codeItems.length + 1,
            useYn: 'Y',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: 'admin'
        };
        setCodeItems([...codeItems, newRow]);
    };

    const handleDeleteRow = () => {
        const selectedNodes = gridApiRef.current?.getSelectedNodes();
        if (!selectedNodes || selectedNodes.length === 0) return;

        const selectedIds = selectedNodes.map(node => node.data.id || node.data.codeId);
        setCodeItems(codeItems.filter(i => !(selectedIds.includes(i.id) || selectedIds.includes(i.codeId))));
    };

    return (
        <div style={{ padding: 16 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <SearchActions
                        form={searchForm}
                        onSearch={handleSearch}
                        columnsPerRow={2}
                    >
                        <FormSelect
                            name="groupId"
                            label={t('그룹ID 검색', '그룹ID 검색')}
                            options={groups.map(g => ({ label: `${g.groupId} (${g.groupName})`, value: g.groupId }))}
                            placeholder="그룹ID 선택"
                        />
                    </SearchActions>
                </Card>

                <Card title="그룹 정보" extra={<Button type="primary" onClick={handleSave}>전체 저장</Button>}>
                    <Form form={headerForm} layout="vertical">
                        <Row gutter={16}>
                            <Col span={6}><FormInput name="groupId" label="그룹ID" required /></Col>
                            <Col span={6}><FormInput name="groupName" label="그룹명" required /></Col>
                            <Col span={6}><FormInput name="groupDesc" label="그룹설명" /></Col>
                            <Col span={6}><FormSelect name="useYn" label="사용여부" options={[{ label: 'Y', value: 'Y' }, { label: 'N', value: 'N' }]} /></Col>
                        </Row>
                    </Form>
                </Card>

                <Card title="코드 목록" extra={<Space><Button onClick={handleAddRow}>행 추가</Button><Button onClick={handleDeleteRow} danger>행 삭제</Button></Space>}>
                    <FormAgGrid<any>
                        rowData={codeItems}
                        columnDefs={columnDefs}
                        onGridReady={onGridReady}
                        height={400}
                        gridOptions={{
                            rowSelection: 'multiple',
                            singleClickEdit: true,
                            stopEditingWhenCellsLoseFocus: true,
                        }}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default CommonCodePage;
