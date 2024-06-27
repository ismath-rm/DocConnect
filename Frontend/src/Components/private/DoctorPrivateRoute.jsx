import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthDoctor from '../../utils/isAuthDoctor';

function DoctorPrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        
        const authInfo = await isAuthDoctor();
        console.log(authInfo);
      setIsAuthenticated(authInfo.isAuthenticated && authInfo.is_doctor);
    };

    fetchData();
  }, []);

  if (isAuthenticated) {
    console.log(isAuthenticated);
    return <Navigate to="/doctor/doctorHome" />;
  }

  return children;
}

export default DoctorPrivateRoute;
