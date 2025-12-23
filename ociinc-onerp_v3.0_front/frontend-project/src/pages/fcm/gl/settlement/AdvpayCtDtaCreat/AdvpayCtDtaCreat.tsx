import React, { useEffect, useRef } from "react";
import SearchGridLayout from "@/components/ui/layout/SearchGridLayout";
import { 
    FilterPanel,
    DetailGrid
} from "@components/features/fcm/gl/settlement/AdvpayCtDtaCreat";
import { useAdvpayCtDtaCreatStore } from "@/store/fcm/gl/settlement/AdvpayCtDtaCreatStore";
import type { FormInstance } from "antd";

const AdvpayCtDtaCreat: React.FC = () => {
    const reset = useAdvpayCtDtaCreatStore((state) => state.reset);
    const formRef = useRef<FormInstance | null>(null);

    // 컴포넌트 마운트 시 store 초기화
    useEffect(() => {
        reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // reset은 Zustand store 함수이므로 안정적인 참조를 유지하므로 의존성 배열에서 제외

    return (
        <SearchGridLayout
            filterPanel={
                <FilterPanel 
                    className="page-layout__filter-panel"
                    onFormRefReady={(instance) => {
                        // formRef.current를 직접 업데이트
                        formRef.current = instance;
                    }}
                />
            }
            grid={
                <DetailGrid 
                    className="page-layout__detail-grid"
                    formRef={formRef}
                />
            }
        />
    );
};

export default AdvpayCtDtaCreat;