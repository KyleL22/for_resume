import React from "react";
import TwoGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import TowGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/TowGridLayout";
import {
  FilterPanel,
  LeftGrid,
  RightGrid,
} from "@components/features/fcm/gl/settlement/fgcryEvl";

const FgcryEvl: React.FC = () => {
  return (
      <TwoGridSaveLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        grid={
          <TowGridSaveLayout
            leftPanel={<LeftGrid className="page-layout__grid" />}
            rightPanel={<RightGrid className="page-layout__grid" />}
          />
        }
      />
  );
};

export default FgcryEvl;
