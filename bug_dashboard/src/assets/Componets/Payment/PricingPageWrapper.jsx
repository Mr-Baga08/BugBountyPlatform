// bug_dashboard/src/assets/Componets/Payment/PricingPageWrapper.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PricingPage from './PricingPage';

const PricingPageWrapper = () => {
  const navigate = useNavigate();
  
  return <PricingPage navigate={navigate} />;
};

export default PricingPageWrapper;