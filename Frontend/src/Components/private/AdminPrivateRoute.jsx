import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthAdmin from '../../utils/isAuthAdmin';


function AdminPrivateRoute({ children }) {
  
  const [isAuthenticated, setIsAuthenticated] = useState({
    'is_authenticated' : false,
    'is_admin' : false,
  });
  

  useEffect(() => {
    const fetchData = async () => {
      const authInfo = await isAuthAdmin();
      setIsAuthenticated({
        'is_authenticated' : authInfo.isAuthenticated,
        'is_admin' : authInfo.isAdmin,
      });
      
    };

    fetchData();
  }, []);


//   if(!isAuthenticated.is_authenticated)
//   {
//     return <Navigate to="/admincontrol/login" />;
//   }

//   if ((!isAuthenticated.is_admin)) {
//     // If not authenticated, redirect to login page with the return URL
//     return <Navigate to="/admincontrol/login" />;
//   }

  // If authenticated, render the child components
  return children;
}


export default AdminPrivateRoute;