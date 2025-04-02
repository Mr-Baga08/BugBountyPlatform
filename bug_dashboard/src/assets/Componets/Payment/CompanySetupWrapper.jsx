// bug_dashboard/src/assets/Componets/Payment/CompanySetupWrapper.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CompanySetupPage from './CompanySetupPage';

const CompanySetupWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return <CompanySetupPage navigate={navigate} location={location} />;
};

export default CompanySetupWrapper;