import React from "react";
import { Routes, Route } from "react-router-dom";
import SideBar from "./components/SideBar/SideBar";
import DashBoard from "./pages/DashBoard/DashBoard";
import CropRecommendation from "./pages/CropRecommendation/CropRecommendation";
import Weather from "./pages/WeatherAnalysis/Weather";
import PlantMonitoring from "./pages/PlantMonitoring/PlantMonitoring";
import Report from "./pages/Report/Report";

const App = () => {
  return (
    <SideBar>
      <Routes>
        <Route path="/" element={<DashBoard />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/recommendation" element={<CropRecommendation />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/monitoring" element={<PlantMonitoring />} />
        <Route path="/reports" element={<Report />} />
      </Routes>
    </SideBar>
  );
};

export default App;
