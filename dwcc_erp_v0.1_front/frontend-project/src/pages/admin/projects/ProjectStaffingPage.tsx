import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Card, Button, Space, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    FormInput,
    FormAgGrid,
} from '@components/ui/form';
import type { ExtendedColDef } from '@components/ui/form/AgGrid/FormAgGrid';
import type { GridApi } from 'ag-grid-community';
import { adminMockService } from '@/utils/admin/adminMockService';
import { useAdminCodeStore } from '@/store/admin/adminCodeStore';
import type { Project, ProjectStaffing } from '@/types/admin/admin.types';
import { createGridReadyHandlerRef } from '@utils/agGridUtils';
import { showSuccess } from '@components/ui/feedback/Message';

const ProjectStaffingPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [t] = useTranslation();
    const [form] = Form.useForm();
    const gridApiRef = useRef<GridApi | null>(null);
    const [, setProject] = useState<Project | null>(null);
    const [staffing, setStaffing] = useState<ProjectStaffing[]>([]);

    const { fetchCodes, getOptionsByGroupId } = useAdminCodeStore();
    const onGridReady = createGridReadyHandlerRef(gridApiRef);

    useEffect(() => {
        fetchCodes();
        if (projectId) {
            const p = adminMockService.getProjects().find(item => item.projectId === projectId);
            if (p) {
                setProject(p);
                form.setFieldsValue(p);
            }
            const s = adminMockService.getStaffing(projectId);
            setStaffing(s);
        }
    }, [projectId, fetchCodes, form]);

    const handleSave = () => {
        if (!projectId) return;

        const rowData: ProjectStaffing[] = [];
        gridApiRef.current?.forEachNode(node => {
            if (node.data) rowData.push(node.data);
        });

        adminMockService.saveStaffing(projectId, rowData);
        showSuccess('투입현황이 저장되었습니다.');
    };

    const columnDefs: ExtendedColDef<ProjectStaffing>[] = [
        { field: 'personId', headerName: '관리번호', width: 100, editable: true },
        { field: 'name', headerName: '성명', width: 100, editable: true },
        { field: 'joinDate', headerName: '투입일', width: 120, editable: true, cellEditor: 'agDateStringCellEditor' },
        { field: 'leaveDate', headerName: '종료일', width: 120, editable: true, cellEditor: 'agDateStringCellEditor' },
        {
            field: 'staffingStatus',
            headerName: '상태',
            width: 100,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: getOptionsByGroupId('STAFFING_STATUS').map(o => o.value)
            },
            valueFormatter: (params) => {
                const options = getOptionsByGroupId('STAFFING_STATUS');
                return options.find(o => o.value === params.value)?.label || params.value;
            }
        },
        { field: 'role', headerName: '역할', width: 120, editable: true },
        { field: 'skill', headerName: '기술', width: 120, editable: true },
        { field: 'skillDetail', headerName: '세부기술', width: 150, editable: true },
        { field: 'rating', headerName: '평가', width: 80, editable: true },
        { field: 'comment', headerName: '의견', width: 200, editable: true },
    ];

    const handleAddRow = () => {
        if (!projectId) return;
        const newRow: ProjectStaffing = {
            id: `new_${Date.now()}`,
            projectId,
            personId: '',
            name: '',
            joinDate: new Date().toISOString().split('T')[0],
            leaveDate: '',
            staffingStatus: 'WORKING',
            role: '',
            skill: '',
            rating: '',
        };
        setStaffing([...staffing, newRow]);
    };

    const handleDeleteRow = () => {
        const selectedNodes = gridApiRef.current?.getSelectedNodes();
        if (!selectedNodes || selectedNodes.length === 0) return;

        const selectedIds = selectedNodes.map(node => node.data.id);
        setStaffing(staffing.filter(s => !selectedIds.includes(s.id)));
    };

    return (
        <div style={{ padding: 16 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card title="프로젝트 정보">
                    <Form form={form} layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}><FormInput name="projectId" label={t('프로젝트번호', '프로젝트번호')} disabled /></Col>
                            <Col span={12}><FormInput name="projectName" label={t('프로젝트명', '프로젝트명')} disabled /></Col>
                        </Row>
                    </Form>
                </Card>

                <Card
                    title="투입 인력 목록"
                    extra={
                        <Space>
                            <Button onClick={handleAddRow}>행 추가</Button>
                            <Button onClick={handleDeleteRow} danger>행 삭제</Button>
                            <Button type="primary" onClick={handleSave}>저장하기</Button>
                        </Space>
                    }
                >
                    <FormAgGrid<any>
                        rowData={staffing}
                        columnDefs={columnDefs}
                        onGridReady={onGridReady}
                        height={450}
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

export default ProjectStaffingPage;
