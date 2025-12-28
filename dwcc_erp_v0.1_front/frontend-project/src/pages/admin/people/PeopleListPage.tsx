import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form } from 'antd';
import VerticalLayout from '@/components/ui/layout/VerticalLayout/VerticalLayout';
import {
    FormInput,
    SearchActions,
    FormAgGrid,
    FormSelect,
    ActionButton,
    ActionButtonGroup
} from '@components/ui/form';
import type { ExtendedColDef } from '@components/ui/form/AgGrid/FormAgGrid';
import type { GridApi } from 'ag-grid-community';
import { adminMockService } from '@/utils/admin/adminMockService';
import { useAdminCodeStore } from '@/store/admin/adminCodeStore';
import type { Person } from '@/types/admin/admin.types';
import { createGridReadyHandlerRef } from '@utils/agGridUtils';
import { useUiStore } from '@/store/uiStore';
import PersonProfilePage from '@/pages/admin/people/PersonProfilePage';
import PersonUpsertPage from '@/pages/admin/people/PersonUpsertPage';
import PersonCreatePage from '@/pages/admin/people/PersonCreatePage';

const PeopleListPage: React.FC = () => {
    // const [_t] = useTranslation(); // Unused
    // const _navigate = useNavigate(); // Unused
    const [form] = Form.useForm();
    const gridApiRef = useRef<GridApi | null>(null);
    const [people, setPeople] = useState<Person[]>([]);
    const [, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Person[]>([]);

    const { fetchCodes, getOptionsByGroupId } = useAdminCodeStore();
    const addTab = useUiStore(state => state.addTab);

    const onGridReady = createGridReadyHandlerRef(gridApiRef);

    // 초기 데이터 로드 및 공통코드 페치
    useEffect(() => {
        fetchCodes();
        handleSearch();
    }, [fetchCodes]);

    const handleSearch = useCallback(async () => {
        setLoading(true);
        try {
            const values = form.getFieldsValue();
            let data = adminMockService.getPeople();

            // 필터 적용 (간단한 예시)
            if (values.industry) data = data.filter(p => p.recentProject?.includes(values.industry));
            if (values.techGrade) data = data.filter(p => p.techGrade === values.techGrade);
            if (values.status) data = data.filter(p => p.status === values.status);
            if (values.category) data = data.filter(p => p.category === values.category);
            if (values.searchText) {
                const text = values.searchText.toLowerCase();
                data = data.filter(p =>
                    p.name.toLowerCase().includes(text) ||
                    p.personId.toLowerCase().includes(text)
                );
            }

            setPeople(data);
        } catch (error) {
            console.error('Failed to search people:', error);
        } finally {
            setLoading(false);
        }
    }, [form]);

    const handleViewProfile = () => {
        if (selectedRows.length !== 1) return;
        const person = selectedRows[0];

        addTab({
            path: `/app/admin/people/${person.personId}`,
            element: <PersonProfilePage personId={person.personId} />,
            meta: {
                title: `${person.name} 프로필`,
                requiresAuth: true,
            }
        });
    };

    const handleRegister = () => {
        addTab({
            // 파일 기반 라우트 패턴과 동일한 경로로 탭을 생성 (사이드바 메뉴와 일치)
            path: `/app/admin/people/PersonCreatePage`,
            element: <PersonCreatePage />,
            meta: {
                title: '인력 등록 (독립 화면)',
                requiresAuth: true,
            }
        });
    };

    const handleEdit = () => {
        if (selectedRows.length !== 1) return;
        const person = selectedRows[0];

        addTab({
            path: `/app/admin/people/${person.personId}/edit`,
            element: <PersonUpsertPage mode="edit" personId={person.personId} />,
            meta: {
                title: `${person.name} 수정`,
                requiresAuth: true,
            }
        });
    };

    // ... inside ActionButtonGroup properties:
    /* 
    customButtons={[
        <ActionButton key="view-profile" label="프로필보기" ... onClick={handleViewProfile} />,
        <ActionButton key="register" label="등록" actionType="create" onClick={handleRegister} />,
        <ActionButton key="edit-person" label="수정" actionType="edit" ... onClick={handleEdit} />
    ]}
    */

    const columnDefs: ExtendedColDef<Person>[] = [
        { field: 'name', headerName: '성명', width: 100, checkboxSelection: true, headerCheckboxSelection: true },
        { field: 'personId', headerName: '관리번호', width: 120 },
        { field: 'birthDate', headerName: '생년월일', width: 120 },
        {
            field: 'gender',
            headerName: '성별',
            width: 80,
            valueFormatter: (params) => {
                const options = getOptionsByGroupId('GENDER');
                return options.find(o => o.value === params.value)?.label || params.value;
            }
        },
        {
            field: 'category',
            headerName: '구분',
            width: 100,
            valueFormatter: (params) => {
                const options = getOptionsByGroupId('PERSON_CATEGORY');
                return options.find(o => o.value === params.value)?.label || params.value;
            }
        },
        { field: 'phone', headerName: '연락처', width: 150 },
        {
            field: 'techGrade',
            headerName: '기술자등급',
            width: 120,
            valueFormatter: (params) => {
                const options = getOptionsByGroupId('TECH_GRADE');
                return options.find(o => o.value === params.value)?.label || params.value;
            }
        },
        { field: 'careerYears', headerName: '경력(년)', width: 80, type: 'numericColumn' },
        { field: 'recentProject', headerName: '최근/수행 중 프로젝트', width: 250 },
        {
            field: 'status',
            headerName: '현재상태',
            width: 100,
            valueFormatter: (params) => {
                const options = getOptionsByGroupId('PERSON_STATUS');
                return options.find(o => o.value === params.value)?.label || params.value;
            }
        },
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
                        columnsPerRow={3}
                    >
                        <FormInput name="searchText" label="검색어" placeholder="성명 또는 관리번호" />
                        <FormSelect name="industry" label="업종" options={getOptionsByGroupId('INDUSTRY')} placeholder="전체" />
                        <FormSelect name="techGrade" label="등급" options={getOptionsByGroupId('TECH_GRADE')} placeholder="전체" />
                        <FormSelect name="status" label="현재상태" options={getOptionsByGroupId('PERSON_STATUS')} placeholder="전체" />
                        <FormSelect name="category" label="구분" options={getOptionsByGroupId('PERSON_CATEGORY')} placeholder="전체" />
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
                                    key="view-profile"
                                    label="프로필보기"
                                    disabled={selectedRows.length !== 1}
                                    onClick={handleViewProfile}
                                />,
                                <ActionButton
                                    key="register"
                                    actionType="create"
                                    label="등록"
                                    onClick={handleRegister}
                                />,
                                <ActionButton
                                    key="edit-person"
                                    actionType="edit"
                                    label="수정"
                                    disabled={selectedRows.length !== 1}
                                    onClick={handleEdit}
                                />
                            ]}
                        />
                    </div>
                    <FormAgGrid<Person>
                        rowData={people}
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

export default PeopleListPage;
