import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../App/Common/Layout/AppLayout";
import TaskDisplayView from "../../../App/Common/Container/TaskDisplay/TaskDisplayView";

export default function Hunter() {
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Security Hunter");
  const navigate = useNavigate();

  // Verify authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (!token || userRole !== "hunter") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <AppLayout title="Security Hunter Dashboard">
      <TaskDisplayView title="Security Testing Dashboard" role="hunter" />
    </AppLayout>
  );
}