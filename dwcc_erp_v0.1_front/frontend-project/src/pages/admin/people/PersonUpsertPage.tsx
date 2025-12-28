import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Button, Input, Space, DatePicker } from 'antd';
import {
    FormInput,
    FormSelect,
} from '@components/ui/form';
import { adminMockService } from '@/utils/admin/adminMockService';
import { useAdminCodeStore } from '@/store/admin/adminCodeStore';
import type { Person } from '@/types/admin/admin.types';
import { showSuccess, showError } from '@components/ui/feedback/Message';
import { useUiStore } from '@/store/uiStore';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

interface PersonUpsertPageProps {
    mode?: 'create' | 'edit';
    personId?: string;
}

const PersonUpsertPage: React.FC<PersonUpsertPageProps> = ({ mode = 'create', personId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { fetchCodes, getOptionsByGroupId } = useAdminCodeStore();
    const { removeTab, activeTabKey } = useUiStore();
    const params = useParams<{ personId: string }>();
    const resolvedPersonId = personId || params.personId;

    useEffect(() => {
        fetchCodes();
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, resolvedPersonId]);

    const loadData = () => {
        if (mode === 'edit' && resolvedPersonId) {
            const p = adminMockService.getPeople().find(item => item.personId === resolvedPersonId);
            if (p) {
                // Convert date strings to dayjs if needed for DatePicker
                const formData = {
                    ...p,
                    birthDate: p.birthDate ? dayjs(p.birthDate) : null,
                };
                form.setFieldsValue(formData);
            } else {
                showError('인력 정보를 찾을 수 없습니다.');
            }
        } else {
            form.resetFields();
            form.setFieldsValue({
                status: 'IDLE',
                category: 'INTERNAL',
                careerYears: 0,
                techGrade: 'BEGINNER'
            });
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Process values (e.g. date conversion)
            const processedValues = {
                ...values,
                birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : '',
            };

            if (mode === 'create') {
                // Generate ID
                const newId = `P${dayjs().format('YYMMDD')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
                processedValues.personId = newId;
                processedValues.id = newId; // Ensure AG Grid ID compatibility
            } else {
                // Determine ID from prop or form
                processedValues.personId = resolvedPersonId || values.personId;
                processedValues.id = processedValues.personId;
            }

            adminMockService.savePerson(processedValues as Person);
            showSuccess(mode === 'create' ? '인력이 등록되었습니다.' : '인력 정보가 수정되었습니다.');

            // Close tab after save
            if (activeTabKey) {
                removeTab(activeTabKey);
            }
        } catch (error) {
            console.error(error);
            showError('저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (activeTabKey) {
            removeTab(activeTabKey);
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <Card
                title={mode === 'create' ? "인력 등록" : "인력 수정"}
                extra={
                    <Space>
                        <Button onClick={handleCancel}>취소</Button>
                        <Button type="primary" onClick={handleSave} loading={loading}>저장</Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <FormInput
                                name="personId"
                                label="관리번호"
                                placeholder="자동 생성"
                                disabled
                                required={false} // Auto-generated
                            />
                        </Col>
                        <Col span={8}>
                            <FormInput name="name" label="성명" required />
                        </Col>
                        <Col span={8}>
                            <FormInput name="alias" label="익명/별칭" />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="birthDate" label="생년월일">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <FormSelect name="gender" label="성별" options={getOptionsByGroupId('GENDER')} />
                        </Col>
                        <Col span={8}>
                            <FormSelect name="category" label="구분" options={getOptionsByGroupId('PERSON_CATEGORY')} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <FormInput name="phone" label="연락처" />
                        </Col>
                        <Col span={8}>
                            <FormSelect name="techGrade" label="기술자등급" options={getOptionsByGroupId('TECH_GRADE')} />
                        </Col>
                        <Col span={8}>
                            <Form.Item name="careerYears" label="경력(년)">
                                <Input type="number" min={0} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <FormSelect name="education" label="최종학력" options={getOptionsByGroupId('EDUCATION')} />
                        </Col>
                        <Col span={8}>
                            <FormInput name="company" label="회사명" />
                        </Col>
                        <Col span={8}>
                            <FormSelect name="position" label="직위" options={getOptionsByGroupId('POSITION')} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <FormSelect name="status" label="현재상태" options={getOptionsByGroupId('PERSON_STATUS')} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="address" label="주소">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="certifications" label="자격증">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="recentProject" label="최근/수행 중 프로젝트">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default PersonUpsertPage;
