import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../App/Common/Layout/AppLayout";
import TaskDisplayView from "../../../App/Common/Container/TaskDisplay/TaskDisplayView";

export default function Coach() {
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Team Lead");
  const navigate = useNavigate();

  // Verify authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (!token || userRole !== "coach") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <AppLayout title="Team Lead Dashboard">
      <TaskDisplayView title="Security Testing Management" role="coach" />
    </AppLayout>
  );
}