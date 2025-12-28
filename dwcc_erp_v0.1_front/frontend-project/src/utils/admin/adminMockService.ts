import type {
    Person,
    Project,
    CommonCodeGroup,
    CommonCodeItem,
    ProjectStaffing,
    PersonProjectHistory
} from '@/types/admin/admin.types';

const STORAGE_KEYS = {
    PEOPLE: 'app.people.v1',
    PROJECTS: 'app.projects.v1',
    STAFFING: 'app.staffing.v1',
    CODES: 'app.codes.v1',
    PROJECT_HISTORY: 'app.project_history.v1',
};

/**
 * Mock Service for Admin Data (localStorage)
 */
export const adminMockService = {
    /**
     * Initialize seed data if not present
     */
    initSeedData: () => {
        // 1. 공통코드 시드
        if (!localStorage.getItem(STORAGE_KEYS.CODES)) {
            const groups: CommonCodeGroup[] = [
                { id: 'INDUSTRY', groupId: 'INDUSTRY', groupName: '업종', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'TECH_GRADE', groupId: 'TECH_GRADE', groupName: '기술자등급', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'AGE_RANGE', groupId: 'AGE_RANGE', groupName: '연령대', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'PERSON_STATUS', groupId: 'PERSON_STATUS', groupName: '인력상태', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'PERSON_CATEGORY', groupId: 'PERSON_CATEGORY', groupName: '인력구분', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'GENDER', groupId: 'GENDER', groupName: '성별', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'EDUCATION', groupId: 'EDUCATION', groupName: '학력', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'POSITION', groupId: 'POSITION', groupName: '직위', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'PROJECT_TYPE', groupId: 'PROJECT_TYPE', groupName: '프로젝트구분', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'STAFFING_STATUS', groupId: 'STAFFING_STATUS', groupName: '투입상태', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'ROLE', groupId: 'ROLE', groupName: '역할', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'SKILL', groupId: 'SKILL', groupName: '기술', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'RATING', groupId: 'RATING', groupName: '평가', useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
            ];

            const items: CommonCodeItem[] = [
                { id: 'GENDER_M', groupId: 'GENDER', codeId: 'M', codeName: '남성', codeValue: 'M', sortOrder: 1, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'GENDER_F', groupId: 'GENDER', codeId: 'F', codeName: '여성', codeValue: 'F', sortOrder: 2, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'PERSON_CATEGORY_INTERNAL', groupId: 'PERSON_CATEGORY', codeId: 'INTERNAL', codeName: '정규직', codeValue: 'INTERNAL', sortOrder: 1, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'PERSON_CATEGORY_EXTERNAL', groupId: 'PERSON_CATEGORY', codeId: 'EXTERNAL', codeName: '프리랜서', codeValue: 'EXTERNAL', sortOrder: 2, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'TECH_GRADE_HIGH', groupId: 'TECH_GRADE', codeId: 'HIGH', codeName: '고급', codeValue: 'HIGH', sortOrder: 1, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'TECH_GRADE_MID', groupId: 'TECH_GRADE', codeId: 'MID', codeName: '중급', codeValue: 'MID', sortOrder: 2, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'TECH_GRADE_LOW', groupId: 'TECH_GRADE', codeId: 'LOW', codeName: '초급', codeValue: 'LOW', sortOrder: 3, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'PERSON_STATUS_WORKING', groupId: 'PERSON_STATUS', codeId: 'WORKING', codeName: '투입중', codeValue: 'WORKING', sortOrder: 1, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'PERSON_STATUS_IDLE', groupId: 'PERSON_STATUS', codeId: 'IDLE', codeName: '대기중', codeValue: 'IDLE', sortOrder: 2, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'INDUSTRY_FIN', groupId: 'INDUSTRY', codeId: 'FIN', codeName: '금융', codeValue: 'FIN', sortOrder: 1, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'INDUSTRY_PUB', groupId: 'INDUSTRY', codeId: 'PUB', codeName: '공공', codeValue: 'PUB', sortOrder: 2, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'PROJECT_TYPE_DEV', groupId: 'PROJECT_TYPE', codeId: 'DEV', codeName: '개발', codeValue: 'DEV', sortOrder: 1, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
                { id: 'PROJECT_TYPE_SM', groupId: 'PROJECT_TYPE', codeId: 'SM', codeName: '운영', codeValue: 'SM', sortOrder: 2, useYn: 'Y', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 'admin' },
            ];

            localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify({ groups, items }));
        }

        // 2. 인력 시드
        if (!localStorage.getItem(STORAGE_KEYS.PEOPLE)) {
            const people: Person[] = [
                { id: 'P001', personId: 'P001', name: '홍길동', birthDate: '1990-01-01', gender: 'M', category: 'INTERNAL', phone: '010-1234-5678', techGrade: 'HIGH', careerYears: 10, education: 'UNIVERSITY', recentProject: 'A은행 차세대', status: 'WORKING' },
                { id: 'P002', personId: 'P002', name: '김철수', birthDate: '1985-05-15', gender: 'M', category: 'EXTERNAL', phone: '010-2222-3333', techGrade: 'MID', careerYears: 7, education: 'UNIVERSITY', recentProject: 'B카드 고도화', status: 'IDLE' },
                { id: 'P003', personId: 'P003', name: '이영희', birthDate: '1992-11-20', gender: 'F', category: 'INTERNAL', phone: '010-9999-8888', techGrade: 'LOW', careerYears: 3, education: 'UNIVERSITY', recentProject: 'C증권 유지보수', status: 'WORKING' },
            ];
            localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
        }

        // 3. 프로젝트 시드
        if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
            const projects: Project[] = [
                { id: 'PRJ_001', projectId: 'PRJ_001', projectName: 'A은행 차세대 시스템 구축', startDate: '2024-01-01', endDate: '2025-06-30', client: 'A은행', industry: 'FIN', contractor: 'OCI', type: 'DEV', owner: '박팀장' },
                { id: 'PRJ_002', projectId: 'PRJ_002', projectName: 'B카드 디지털 고도화', startDate: '2023-05-01', endDate: '2024-12-31', client: 'B카드', industry: 'FIN', contractor: 'OCI', type: 'DEV', owner: '이팀장' },
            ];
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        }
        // 4. 프로젝트 실적 시드
        if (!localStorage.getItem(STORAGE_KEYS.PROJECT_HISTORY)) {
            const history: PersonProjectHistory[] = [
                { id: 'H001', personId: 'P001', seq: 1, projectName: 'D생명 보험통합', period: '2023-01 ~ 2023-12', role: 'BA', client: 'D생명', techStack: 'Java, Oracle' },
                { id: 'H002', personId: 'P001', seq: 2, projectName: 'E캐피탈 웹사이트', period: '2022-05 ~ 2022-12', role: 'Developer', client: 'E캐피탈', techStack: 'React, Node.js' },
                { id: 'H003', personId: 'P002', seq: 1, projectName: 'F카드 마이데이터', period: '2023-06 ~ 2024-05', role: 'Developer', client: 'F카드', techStack: 'Spring Boot, Redis' },
            ];
            localStorage.setItem(STORAGE_KEYS.PROJECT_HISTORY, JSON.stringify(history));
        }
    },

    // Generic Data Operations
    getData: <T>(key: string): T[] => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    saveData: <T>(key: string, data: T[]) => {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Specific Entity Operations
    getPeople: () => {
        const data = adminMockService.getData<Person>(STORAGE_KEYS.PEOPLE);
        return data.map(p => ({ ...p, id: p.id || p.personId }));
    },
    savePerson: (person: Person) => {
        const people = adminMockService.getPeople();
        const index = people.findIndex(p => p.personId === person.personId);
        const personWithId = { ...person, id: person.id || person.personId };
        if (index > -1) {
            people[index] = personWithId;
        } else {
            people.push(personWithId);
        }
        adminMockService.saveData(STORAGE_KEYS.PEOPLE, people);
    },

    getProjects: () => {
        const data = adminMockService.getData<Project>(STORAGE_KEYS.PROJECTS);
        return data.map(p => ({ ...p, id: p.id || p.projectId }));
    },

    getStaffing: (projectId: string) => {
        const allStaffing = adminMockService.getData<ProjectStaffing>(STORAGE_KEYS.STAFFING);
        return allStaffing.filter(s => s.projectId === projectId);
    },

    saveStaffing: (projectId: string, staffing: ProjectStaffing[]) => {
        const allStaffing = adminMockService.getData<ProjectStaffing>(STORAGE_KEYS.STAFFING);
        const filtered = allStaffing.filter(s => s.projectId !== projectId);
        adminMockService.saveData(STORAGE_KEYS.STAFFING, [...filtered, ...staffing]);
    },

    getCodes: () => {
        const data = localStorage.getItem(STORAGE_KEYS.CODES);
        return data ? JSON.parse(data) as { groups: CommonCodeGroup[], items: CommonCodeItem[] } : { groups: [], items: [] };
    },

    saveCodes: (groups: CommonCodeGroup[], items: CommonCodeItem[]) => {
        localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify({ groups, items }));
    },

    getProjectHistory: (personId: string) => {
        const allHistory = adminMockService.getData<PersonProjectHistory>(STORAGE_KEYS.PROJECT_HISTORY);
        return allHistory.filter(h => h.personId === personId).sort((a, b) => b.seq - a.seq);
    }
};
