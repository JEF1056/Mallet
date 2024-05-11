import NavBarComponent from "./components/NavBarComponent";
import ConfigurationPage from "./components/pages/ConfigurationPage/ConfigurationPage";
// import { Avatar } from "react-daisyui";
// import { useQuery, gql } from "@apollo/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div className="flex flex-col p-4 h-screen gap-4">
      <Router>
        <NavBarComponent />

        <Routes>
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="/topics" element={<></>} />
          <Route path="/" element={<></>} />
        </Routes>
      </Router>
    </div>
  );
}
