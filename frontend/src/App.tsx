import ConfigurationPage from "./components/pages/ConfigurationPage/ConfigurationPage";
// import { Avatar } from "react-daisyui";
// import { useQuery, gql } from "@apollo/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProjectDetailPage from "./components/pages/ProjectDetailPage/ProjectDetailPage";
import LoginPage from "./components/pages/LoginPage/LoginPage";
import HomePage from "./components/pages/HomePage/HomePage";
import JudgingPage from "./components/pages/JudgingPage/JudgingPage";

export default function App() {
  return (
    <div className="flex flex-col p-4 h-screen gap-4">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/judge" element={<JudgingPage />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={"404 not found"} />
        </Routes>
      </Router>
    </div>
  );
}
