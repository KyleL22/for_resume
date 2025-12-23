import React, { useCallback, useState } from "react";
import { SearchForm, FormSelect } from "@components/ui/form";

type FilterPanelProps = {
    className?: string;
    onSearch?: (values: any) => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className, onSearch }) => {
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(async (values: any) => {
        if (onSearch) {
            setLoading(true);
            await onSearch(values);
            setLoading(false);
        }
    }, [onSearch]);

    return (
        <SearchForm
            onSearch={handleSearch}
            loading={loading}
            className={className}
            initialValues={{
                asBankType: "%"
            }}
        >
            <FormSelect
                name="asBankType"
                label="금융타입"
                options={[
                    { label: "전체", value: "%" },
                    { label: "은행", value: "BANK" },
                    { label: "생명보험", value: "LIFE INSU" },
                    { label: "손해보험", value: "FIRE INSU" },
                    { label: "증권사", value: "STOCK FIRM" },
                ]}
            />
            <FormSelect
                name="asBankCode"
                label="금융사"
                placeholder="전체"
                comCodeParams={{
                    module: "GL",
                    type: "BNKCDE",
                    enabledFlag: "Y"
                }}
                allOptionLabel="전체"
                allowClear
            />
            <FormSelect
                name="asBkGubun"
                label="계좌종류"
                placeholder="전체"
                comCodeParams={{
                    module: "GL",
                    type: "ACCTGB",
                    enabledFlag: "Y"
                }}
                allOptionLabel="전체"
                allowClear
            />
        </SearchForm>
    );
};

export default FilterPanel;
