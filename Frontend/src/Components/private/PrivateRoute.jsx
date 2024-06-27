import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthUser from '../../utils/IsAuthUser';

const PrivateRoute = ({children}) => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    

    useEffect(() => {
        const fetchData = async () => {
            const authInfo = await isAuthUser();
            setIsAuthenticated(authInfo.isAuthenticated);
            
        };

        fetchData();
    }, []);

   

    if (isAuthenticated) {
        // If not authenticated, redirect to login page with the return URL
        return <Navigate to="/" />;
    }

    return children;
}

export default PrivateRoute
