import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Space, Descriptions, Tag } from 'antd';
import {
    FormAgGrid,
} from '@components/ui/form';
import type { ExtendedColDef } from '@components/ui/form/AgGrid/FormAgGrid';
import type { GridApi } from 'ag-grid-community';
import { adminMockService } from '@/utils/admin/adminMockService';
import { useAdminCodeStore } from '@/store/admin/adminCodeStore';
import type { Person, PersonProjectHistory } from '@/types/admin/admin.types';
import { createGridReadyHandlerRef } from '@utils/agGridUtils';
import { useUiStore } from '@/store/uiStore';
import PersonUpsertPage from './PersonUpsertPage';

interface PersonProfilePageProps {
    personId?: string;
}

const PersonProfilePage: React.FC<PersonProfilePageProps> = (props) => {
    const params = useParams<{ personId: string }>();
    const personId = props.personId || params.personId;
    const gridApiRef = useRef<GridApi | null>(null);
    const [person, setPerson] = useState<Person | null>(null);
    const [history, setHistory] = useState<PersonProjectHistory[]>([]);

    const { fetchCodes, getCodeName } = useAdminCodeStore();
    const { addTab } = useUiStore();
    const onGridReady = createGridReadyHandlerRef(gridApiRef);

    useEffect(() => {
        fetchCodes();
        if (personId) {
            const p = adminMockService.getPeople().find(item => item.personId === personId);
            if (p) {
                setPerson(p);
            }
            const h = adminMockService.getProjectHistory(personId);
            setHistory(h);
        }
    }, [personId, fetchCodes]);

    const handleEdit = () => {
        if (!person) return;
        addTab({
            path: `/admin/people/${person.personId}/edit`,
            meta: { title: `${person.name} 수정` },
            element: <PersonUpsertPage mode="edit" personId={person.personId} />
        });
    };

    const columnDefs: ExtendedColDef<PersonProjectHistory>[] = [
        { field: 'seq', headerName: '순번', width: 70 },
        { field: 'projectName', headerName: '사업명', width: 200 },
        { field: 'period', headerName: '참여기간', width: 150 },
        { field: 'role', headerName: '담당업무', width: 120 },
        { field: 'client', headerName: '발주처', width: 120 },
        { field: 'techStack', headerName: '적용기술', width: 200 },
    ];

    if (!person) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: 16 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                    title="기본 정보"
                    extra={<Button type="primary" onClick={handleEdit}>수정</Button>}
                >
                    <Descriptions bordered column={3}>
                        <Descriptions.Item label="성명">{person.name}</Descriptions.Item>
                        <Descriptions.Item label="관리번호">{person.personId}</Descriptions.Item>
                        <Descriptions.Item label="현재상태">
                            <Tag color={person.status === 'IDLE' ? 'green' : 'blue'}>
                                {getCodeName('PERSON_STATUS', person.status)}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="기술등급">{getCodeName('TECH_GRADE', person.techGrade)}</Descriptions.Item>
                        <Descriptions.Item label="연락처">{person.phone}</Descriptions.Item>
                        <Descriptions.Item label="생년월일">{person.birthDate}</Descriptions.Item>

                        <Descriptions.Item label="구분">{getCodeName('PERSON_CATEGORY', person.category)}</Descriptions.Item>
                        <Descriptions.Item label="최종학력">{getCodeName('EDUCATION', person.education)}</Descriptions.Item>
                        <Descriptions.Item label="경력">{person.careerYears}년</Descriptions.Item>

                        <Descriptions.Item label="회사명">{person.company}</Descriptions.Item>
                        <Descriptions.Item label="직위">{getCodeName('POSITION', person.position)}</Descriptions.Item>
                        <Descriptions.Item label="성별">{getCodeName('GENDER', person.gender)}</Descriptions.Item>

                        <Descriptions.Item label="주소" span={3}>{person.address}</Descriptions.Item>
                        <Descriptions.Item label="자격증" span={3}>{person.certifications}</Descriptions.Item>
                        <Descriptions.Item label="스킬셋" span={3}>{person.recentProject}</Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="프로젝트 실적">
                    <FormAgGrid<PersonProjectHistory>
                        rowData={history}
                        columnDefs={columnDefs}
                        onGridReady={onGridReady}
                        height={300}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default PersonProfilePage;
