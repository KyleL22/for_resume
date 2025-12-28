import React from "react";
import SearchGridLayout from "@/components/ui/layout/SearchGridLayout/SearchGridLayout";
import { 
    FilterPanel as Tab2FilterPanel,
    DetailGrid as Tab2DetailGrid,
} from "@/components/features/fcm/md/account/StdFnnrTblatRegist/Tab2/index";

const Tab2: React.FC = () => {
    return (
        <SearchGridLayout
            filterPanel={<Tab2FilterPanel className="page-layout__filter-panel" />}
            grid={<Tab2DetailGrid className="page-layout__detail-grid" />}
        />
    );
};

export default Tab2;
