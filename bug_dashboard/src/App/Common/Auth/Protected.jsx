import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Protected({children}){
    const navigate = useNavigate();
    
    useEffect(() => {
        const user = localStorage.getItem("userName");
        if(!user || user === ""){
            navigate('/signin');
        }
    }, [navigate]);
    
    return <>{children}</>;
}
