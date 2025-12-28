import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const StyledDashboardContainer = styled.div`
  padding: 32px;
  background: #f0f2f5;
  min-height: 100%;
  animation: ${fadeIn} 0.6s ease-out;
`;

export const HeaderSection = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    background: linear-gradient(90deg, #1677ff 0%, #00b96b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: #8c8c8c;
    font-size: 16px;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

export const StatCard = styled.div<{ color: string }>`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border-left: 6px solid ${props => props.color};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .title {
    color: #8c8c8c;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 24px;
    font-weight: 700;
    color: #262626;
  }

  .trend {
    margin-top: 12px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.up { color: #52c41a; }
    &.down { color: #ff4d4f; }
  }
`;

export const ContentRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  height: 400px;
  display: flex;
  flex-direction: column;
  
  .card-header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
  }
`;

export const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

export const ActivityItem = styled.div`
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e6f4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1677ff;
    flex-shrink: 0;
  }
  
  .content {
    .text {
      font-size: 14px;
      color: #262626;
      margin-bottom: 2px;
    }
    .time {
      font-size: 12px;
      color: #bfbfbf;
    }
  }
`;
