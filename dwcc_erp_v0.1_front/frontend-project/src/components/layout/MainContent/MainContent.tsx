import React, { Suspense, useMemo } from "react";
import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@store/uiStore";
import { LoadingSpinner } from "@components/ui/feedback";
import {
  StyledContent,
  StyledContentInner,
  StyledWelcomeCard,
  StyledTabContent,
} from "./MainContent.styles";
import TabBar from "./TabBar";

const { Title, Paragraph } = Typography;

const MainContent: React.FC = () => {
  const { t } = useTranslation();
  const { openTabs, activeTabKey, setActiveTabKey, removeTab, closeAllTabs } =
    useUiStore();

  const activeTab = useMemo(() => {
    return openTabs.find((tab) => tab.path === activeTabKey);
  }, [openTabs, activeTabKey]);

  // 로그인 후 열려있는 탭이 없을 때 환영 메시지 표시
  if (openTabs.length === 0) {
    return (
      <StyledContent>
        <StyledContentInner>
          <StyledWelcomeCard>
            <Title level={2}>{t("welcome_main", "환영합니다!")}</Title>
            <Paragraph>
              {t("main_description", "좌측 메뉴를 클릭하여 시작하세요.")}
            </Paragraph>
          </StyledWelcomeCard>
        </StyledContentInner>
      </StyledContent>
    );
  }

  const Element = activeTab?.element;

  return (
    <StyledContent>
      {/* 탭 바 */}
      <TabBar
        openTabs={openTabs}
        activeTabKey={activeTabKey}
        setActiveTabKey={setActiveTabKey}
        removeTab={removeTab}
        closeAllTabs={closeAllTabs}
      />
      {/* 탭 내용 영역 */}
      <StyledTabContent>
        <Suspense fallback={<LoadingSpinner />}>
          {Element
            ? React.isValidElement(Element)
              ? Element
              : React.createElement(Element as React.ComponentType)
            : null}
        </Suspense>
      </StyledTabContent>
    </StyledContent>
  );
};

export default MainContent;
