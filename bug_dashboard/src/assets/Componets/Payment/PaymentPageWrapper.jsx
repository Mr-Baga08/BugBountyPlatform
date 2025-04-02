// bug_dashboard/src/assets/Componets/Payment/PaymentPageWrapper.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentPage from './PaymentPage';

const PaymentPageWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return <PaymentPage navigate={navigate} location={location} />;
};

export default PaymentPageWrapper;