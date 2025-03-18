import React ,{navigator} from 'react';
import { useNavigate } from 'react-router-dom';

export default function Protected({children}){
    const navigate = useNavigate;
    const user = localStorage.getItem("userName");
    if(!user || user==""){
        navigate('/signin');
    }
    return (<div>{children}</div>);
}