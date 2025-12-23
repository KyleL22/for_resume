import React from "react";
import TwoGridLayout from "@/components/ui/layout/TwoGridLayout";
import {
  FilterPanel,
  LeftGrid,
  RightGrid,
} from "@components/features/fcm/md/account/AtmcJrnlzImplndmcmst";

const AtmcJrnlzMastrSetup: React.FC = () => {
  return (
    <TwoGridLayout
      filterPanel={<FilterPanel className="page-layout__filter-panel" />}
      leftPanel={<LeftGrid />}
      rightPanel={<RightGrid />}
    />
  );
};

export default AtmcJrnlzMastrSetup;