import React from "react";
import PersonUpsertPage from "./PersonUpsertPage";

// 신규 등록 전용 페이지 (목록과 독립 동작)
const PersonCreatePage: React.FC = () => {
  return <PersonUpsertPage mode="create" />;
};

export default PersonCreatePage;
