// Update this code in bug_dashboard/src/App.jsx to include the new routes
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
import TaskDetail from "./assets/Componets/Task/TaskDetail.jsx";
import { CoachView } from "./assets/Componets/Tool/coach-view";
import LandingPageWrapper from "./assets/Componets/LandingPage/LandingPageWrapper.jsx";
import AdminLogin from "./assets/Componets/AdminAuth/login.jsx";
import AdminRegister from "./assets/Componets/AdminAuth/register.jsx";
import CoachReviewComponent from "./assets/Componets/CoachReviewComponent";
import AdminReviewComponent from "./assets/Componets/AdminReviewComponent";

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
        <Route path="/admin/login" element={<AdminLogin setUserRole={setUserRole} />} />
        <Route path="/hunter" element={<Protected><Hunter/></Protected>} /> 
        <Route path="/coach" element={<Protected><Coach/></Protected>} />
        <Route path="/admin-dashboard" element={<Protected><AdminBoard/></Protected>} />
        <Route path="/admin" element={userRole === "admin" ? <Admin /> : <Navigate to="/login" replace />} />
        <Route path="/tool/:taskId" element={<Tool/>} />
        <Route path="/task/:taskId" element={<Protected><TaskDetail /></Protected>} />
        
        {/* New Routes for Task Workflow */}
        <Route path="/coach/review/:taskId" element={<Protected><CoachReviewComponent /></Protected>} />
        <Route path="/admin/review/:taskId" element={<Protected><AdminReviewComponent /></Protected>} />
        
        {/* Legacy routes - consider updating these to use new components */}
        <Route path="/tool-coach/:taskId" element={<CoachView userRole={"coach"}/>} />
        <Route path="/tool-admin/:taskId" element={<CoachView userRole={"admin"}/>} />
        <Route path="/Leaderboard" element={<Leaderboard />} />
        <Route path="/admin/register" element={<AdminRegister />} />
      </Routes>
    </Router>
  );
}

export default App;