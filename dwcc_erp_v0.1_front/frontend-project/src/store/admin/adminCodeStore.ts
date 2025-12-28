import { create } from 'zustand';
import type { CommonCodeGroup, CommonCodeItem } from '@/types/admin/admin.types';
import { adminMockService } from '@/utils/admin/adminMockService';

interface AdminCodeState {
    groups: CommonCodeGroup[];
    items: CommonCodeItem[];
    loading: boolean;

    fetchCodes: () => void;
    getOptionsByGroupId: (groupId: string) => { label: string, value: string }[];
    getCodeName: (groupId: string, codeValue?: string) => string;
    saveCodes: (groups: CommonCodeGroup[], items: CommonCodeItem[]) => void;
}

export const useAdminCodeStore = create<AdminCodeState>((set, get) => ({
    groups: [],
    items: [],
    loading: false,

    fetchCodes: () => {
        set({ loading: true });
        adminMockService.initSeedData();
        const { groups, items } = adminMockService.getCodes();
        set({ groups, items, loading: false });
    },

    getOptionsByGroupId: (groupId) => {
        const { items } = get();
        return items
            .filter(item => item.groupId === groupId && item.useYn === 'Y')
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(item => ({
                label: item.codeName,
                value: item.codeValue
            }));
    },

    getCodeName: (groupId: string, codeValue?: string) => {
        if (!codeValue) return '';
        const { items } = get();
        const found = items.find(item => item.groupId === groupId && item.codeValue === codeValue);
        return found ? found.codeName : codeValue;
    },

    saveCodes: (groups, items) => {
        adminMockService.saveCodes(groups, items);
        set({ groups, items });
    }
}));
