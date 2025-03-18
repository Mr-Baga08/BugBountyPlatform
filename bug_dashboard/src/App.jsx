import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./assets/Componets/LoginPage/login";
import Signin from "./assets/Componets/LoginPage/signin";
import Admin from "./assets/Componets/AdminDashboard/Admin";
import Hunter from "./assets/Componets/HunterDashboard/hunter";
import Coach from "./assets/Componets/CoachDashboard/coach";
import Protected from "./App/Common/Auth/Protected";
import AdminBoard from "./assets/Componets/AdminDashboard/Admin_Dashboard";
import Leaderboard from "./assets/Componets/Lederboard/Lederboard";
import Tool from './assets/Componets/Tool/tool';
import TaskDetails from "./assets/Componets/Task/task";
import Task from './assets/Componets/Task/task';
import { CoachView } from "./assets/Componets/Tool/coach-view";
import LandingPageWrapper from "./assets/Componets/LandingPage/LandingPageWrapper.jsx";



function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/login" element={<Login setUserRole={setUserRole} />} />
        <Route path="/signin" element={<Signin setUserRole={setUserRole} />} />   
        <Route path="/hunter" element={<Protected><Hunter/></Protected>} /> 
        <Route path="/coach" element={<Protected><Coach/></Protected>} />
        <Route path="/admin-dashboard" element={<Protected><AdminBoard/></Protected>} />
        <Route path="/admin" element={userRole === "admin" ? <Admin /> : <Navigate to="/login" replace />} />
        <Route path="/tool/:taskId" element={<Tool/>} />
        <Route path="/task/:taskId" element={<Task/>} />
        <Route path="/tool-coach/:taskId" element={<CoachView userRole={"coach"}/>} />
        <Route path="/tool-admin/:taskId" element={<CoachView userRole={"admin"}/>} />
        <Route path="/task-details/:taskId" element={<TaskDetails />} />
        <Route path="/Leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;