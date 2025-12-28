import React from "react";
import SearchGridLayout from "@/components/ui/layout/SearchGridLayout/SearchGridLayout";
import { Tab1FilterPanel } from "@/components/features/fcm/md/account/StdFnnrTblatRegist/index";

// Tab
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { DetailGrid as Tab2DetailGrid } from "@/components/features/fcm/md/account/StdFnnrTblatRegist/Tab2/index";

const onChange = (key: string) => {
  console.log(key);
};
const items: TabsProps["items"] = [
  {
    key: "tab1",
    label: "Tab 1",
    children: <Tab2DetailGrid className="page-layout__detail-grid" />,
  },
  {
    key: "tab2",
    label: "Tab 2",
    children: <div>Test</div>,
  },
];
const Tab1: React.FC = () => {
  return (
    <SearchGridLayout
      filterPanel={<Tab1FilterPanel className="page-layout__filter-panel" />}
      grid={<Tabs defaultActiveKey="1" items={items} onChange={onChange} />}
    />
  );
};

export default Tab1;
