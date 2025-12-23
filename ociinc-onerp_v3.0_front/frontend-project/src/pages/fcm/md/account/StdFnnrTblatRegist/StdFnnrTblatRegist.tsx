import React, { Suspense } from "react";
import { LayoutTabs } from "@/pages/sample/layout/LayoutSample";

// ============================================================================
// Lazy Imports
// ============================================================================
const Tab1 = React.lazy(() => import("./Tab1"));
const Tab2 = React.lazy(() => import("./Tab2"));

const onChange = (key: string) => {
    console.log(key);
};

const StdFnnrTblatRegist: React.FC = () => {
    return (
        <LayoutTabs
            defaultActiveKey="tab1"
            items={[
                {
                    key: "tab1",
                    label: "Tab 1",
                    children: (
                        <Suspense fallback={null}>
                            <Tab1 />
                        </Suspense>
                    ),
                },
                {
                    key: "tab2",
                    label: "Tab 2",
                    children: (
                        <Suspense fallback={null}>
                            <Tab2 />
                        </Suspense>
                    ),
                },
            ]}
            onChange={onChange}
        />
    );
};

export default StdFnnrTblatRegist;