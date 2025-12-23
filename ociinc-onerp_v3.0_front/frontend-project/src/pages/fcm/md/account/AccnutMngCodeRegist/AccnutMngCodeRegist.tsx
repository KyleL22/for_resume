import React from "react";
import SearchGridLayout from "@/components/ui/layout/SearchGridLayout";
import { 
    FilterPanel,
    DetailGrid
} from "@components/features/fcm/md/account/AccnutMngCodeRegist";


const AccnutMngCodeRegist: React.FC = () => {
    return (
        <SearchGridLayout
            filterPanel={<FilterPanel className="page-layout__filter-panel" />}
            grid={<DetailGrid className="page-layout__detail-grid" />}
        />
    );
};

export default AccnutMngCodeRegist;