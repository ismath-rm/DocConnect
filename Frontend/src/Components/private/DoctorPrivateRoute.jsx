import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthDoctor from '../../utils/isAuthDoctor';
import Loader from '../loader/Loader';

function DoctorPrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        
        const authInfo = await isAuthDoctor();
        console.log(authInfo);
      setIsAuthenticated(authInfo.isAuthenticated && authInfo.is_doctor);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader />;
  } 

  if (isAuthenticated) {
    console.log(isAuthenticated);
    return <Navigate to="/doctor/doctorHome" />;
  }

  return children;
}

export default DoctorPrivateRoute;
