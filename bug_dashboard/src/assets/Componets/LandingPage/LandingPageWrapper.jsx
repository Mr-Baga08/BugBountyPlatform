import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';

const LandingPageWrapper = () => {
  const navigate = useNavigate();
  
  return <LandingPage navigate={navigate} />;
};

export default LandingPageWrapper;