import React from "react";
import { Typography, Button, notification, Tag, Empty } from "antd";
import {
  RiseOutlined,
  FallOutlined,
  UserOutlined,
  ContainerOutlined,
  WalletOutlined,
  HistoryOutlined,
  ExportOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { getMainInitDataApi } from "@apis/main";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import {
  StyledDashboardContainer,
  HeaderSection,
  StatsGrid,
  StatCard,
  ContentRow,
  GlassCard,
  ActivityList,
  ActivityItem
} from "./Dashboard.styles";

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);

  const handleExport = async () => {
    try {
      const response = await getMainInitDataApi();
      if (response.success && response.data) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "main_init_data.json";
        a.click();
        URL.revokeObjectURL(url);
        notification.success({
          title: t("export_success", "데이터 추출 완료"),
          description: t("export_success_desc", "main_init_data.json 파일이 다운로드되었습니다.")
        });
      } else {
        notification.error({
          title: t("error", "오류 발생"),
          description: t("data_fetch_fail", "데이터를 가져올 수 없습니다.")
        });
      }
    } catch (error) {
      console.error(error);
      notification.error({
        title: t("error", "오류 발생"),
        description: t("export_error", "데이터 추출 중 오류가 발생했습니다.")
      });
    }
  };

  const stats = [
    { title: "Today's Revenue", value: "$54,230", trend: "+12.5%", isUp: true, color: "#1677ff", icon: <WalletOutlined /> },
    { title: "Active Users", value: "2,420", trend: "+3.2%", isUp: true, color: "#52c41a", icon: <UserOutlined /> },
    { title: "Pending Orders", value: "45", trend: "-2.1%", isUp: false, color: "#faad14", icon: <ContainerOutlined /> },
    { title: "Success Rate", value: "98.5%", trend: "+0.4%", isUp: true, color: "#13c2c2", icon: <CheckCircleOutlined /> },
  ];

  const activities = [
    { user: "Admin", action: "System update completed", time: "2 mins ago" },
    { user: "User_04", action: "Report generated: Quarterly_Q4", time: "15 mins ago" },
    { user: "System", action: "Automatic backup successful", time: "1 hour ago" },
    { user: "Manager", action: "Budget approved for Project_A", time: "3 hours ago" },
  ];

  return (
    <StyledDashboardContainer>
      <HeaderSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={1}>
              {t("welcome_user", "{{name}}님, 환영합니다!", { name: user?.empName || 'Admin' })}
            </Title>
            <Paragraph>
              {t("dashboard_tagline", "오늘의 비즈니스 현황을 한눈에 확인하세요.")}
            </Paragraph>
          </div>
          <Button
            onClick={handleExport}
            type="primary"
            shape="round"
            icon={<ExportOutlined />}
            size="large"
          >
            {t("export_data", "데이터 추출")}
          </Button>
        </div>
      </HeaderSection>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index} color={stat.color}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="title">{stat.title}</div>
              <div style={{ color: stat.color, fontSize: '20px' }}>{stat.icon}</div>
            </div>
            <div className="value">{stat.value}</div>
            <div className={`trend ${stat.isUp ? 'up' : 'down'}`}>
              {stat.isUp ? <RiseOutlined /> : <FallOutlined />}
              {stat.trend} {t("from_last_week", "vs last week")}
            </div>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentRow>
        <GlassCard>
          <div className="card-header">
            <h3>{t("performance_summary", "실적 요약")}</h3>
            <Tag color="processing">Monthly</Tag>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: '8px' }}>
            <Empty description={t("chart_placeholder", "실시간 데이터 분석 준비 중...")} />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="card-header">
            <h3><HistoryOutlined /> {t("recent_activity", "최근 활동")}</h3>
          </div>
          <ActivityList>
            {activities.map((item, index) => (
              <ActivityItem key={index}>
                <div className="avatar">
                  {item.user.charAt(0)}
                </div>
                <div className="content">
                  <div className="text">
                    <strong>{item.user}</strong> {item.action}
                  </div>
                  <div className="time">{item.time}</div>
                </div>
              </ActivityItem>
            ))}
          </ActivityList>
        </GlassCard>
      </ContentRow>
    </StyledDashboardContainer>
  );
};

export default Dashboard;
