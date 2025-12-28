import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import VerticalLayout from '@/components/ui/layout/VerticalLayout/VerticalLayout';
import {
    FormInput,
    SearchActions,
    FormAgGrid,
    ActionButton,
    ActionButtonGroup
} from '@components/ui/form';
import type { ExtendedColDef } from '@components/ui/form/AgGrid/FormAgGrid';
import type { GridApi } from 'ag-grid-community';
import { adminMockService } from '@/utils/admin/adminMockService';
import { useAdminCodeStore } from '@/store/admin/adminCodeStore';
import type { Project } from '@/types/admin/admin.types';
import { createGridReadyHandlerRef } from '@utils/agGridUtils';
import { useUiStore } from '@/store/uiStore';
import ProjectStaffingPage from '@/pages/admin/projects/ProjectStaffingPage';

const ProjectsListPage: React.FC = () => {
    const [t] = useTranslation();
    const [form] = Form.useForm();
    const gridApiRef = useRef<GridApi | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedRows, setSelectedRows] = useState<Project[]>([]);

    const { fetchCodes, getOptionsByGroupId } = useAdminCodeStore();
    const addTab = useUiStore(state => state.addTab);

    const onGridReady = createGridReadyHandlerRef(gridApiRef);

    const handleSearch = useCallback(async () => {
        try {
            const values = form.getFieldsValue();
            let data = adminMockService.getProjects();

            if (values.searchText) {
                const text = values.searchText.toLowerCase();
                data = data.filter(p =>
                    p.projectName.toLowerCase().includes(text) ||
                    p.projectId.toLowerCase().includes(text) ||
                    p.client.toLowerCase().includes(text)
                );
            }

            setProjects(data);
        } catch (error) {
            console.error('Failed to search projects:', error);
        }
    }, [form]);

    useEffect(() => {
        fetchCodes();
        handleSearch();
    }, [fetchCodes, handleSearch]);

    const handleOpenStaffing = () => {
        if (selectedRows.length !== 1) return;
        const project = selectedRows[0];

        addTab({
            path: `/app/admin/projects/${project.projectId}/staffing`,
            element: ProjectStaffingPage,
            meta: {
                title: `${project.projectName} 투입현황`,
                requiresAuth: true,
            }
        });
    };

    const columnDefs: ExtendedColDef<Project>[] = [
        { field: 'projectId', headerName: '프로젝트번호', width: 130, checkboxSelection: true, headerCheckboxSelection: true },
        { field: 'projectName', headerName: '프로젝트명', width: 250 },
        { field: 'startDate', headerName: '시작일자', width: 110 },
        { field: 'endDate', headerName: '종료일자', width: 110 },
        { field: 'client', headerName: '발주처', width: 130 },
        {
            field: 'industry',
            headerName: '업종',
            width: 100,
            valueFormatter: (params) => {
                const options = getOptionsByGroupId('INDUSTRY');
                return options.find(o => o.value === params.value)?.label || params.value;
            }
        },
        { field: 'contractor', headerName: '계약처', width: 130 },
        {
            field: 'type',
            headerName: '운영/개발',
            width: 100,
            valueFormatter: (params) => {
                const options = getOptionsByGroupId('PROJECT_TYPE');
                return options.find(o => o.value === params.value)?.label || params.value;
            }
        },
        { field: 'parentProjectId', headerName: '(원)프로젝트번호', width: 150 },
        { field: 'owner', headerName: '담당자', width: 100 },
    ];

    return (
        <VerticalLayout
            filterPanel={
                <div className="page-layout__filter-panel">
                    <SearchActions
                        form={form}
                        onSearch={handleSearch}
                        showReset={true}
                        onReset={() => {
                            form.resetFields();
                            handleSearch();
                        }}
                        columnsPerRow={2}
                    >
                        <FormInput name="searchText" label={t('검색어', '검색어')} placeholder="프로젝트명, 번호, 발주처" />
                    </SearchActions>
                </div>
            }
            topPanel={
                <div className="page-layout__content">
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}>
                        <ActionButtonGroup
                            hideButtons={["create", "edit", "copy", "delete", "save"]}
                            customButtons={[
                                <ActionButton
                                    actionType="copy"
                                    key="view-staffing"
                                    label="투입현황"
                                    disabled={selectedRows.length !== 1}
                                    onClick={handleOpenStaffing}
                                />
                            ]}
                        />
                    </div>
                    <FormAgGrid<any>
                        rowData={projects}
                        columnDefs={columnDefs}
                        onGridReady={onGridReady}
                        onSelectionChanged={(params) => setSelectedRows(params.api.getSelectedRows())}
                        height={500}
                        gridOptions={{
                            rowSelection: 'multiple',
                        }}
                    />
                </div>
            }
        />
    );
};

export default ProjectsListPage;
