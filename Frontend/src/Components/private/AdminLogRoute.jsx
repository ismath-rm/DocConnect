import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthAdmin from '../../utils/isAuthAdmin';




function AdminLogRoute({ children }) {
  
  const [isAuthenticated, setIsAuthenticated] = useState({
    'is_authenticated' : true,
    'is_admin' : true,
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

  
//   if(isAuthenticated.is_authenticated)
//   {
//     return <Navigate to="/admincontrol/" />;
//   }

  // If authenticated, render the child components
  return children;
}


export default AdminLogRoute;