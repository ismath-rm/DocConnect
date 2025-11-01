import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthAdmin from '../../utils/isAuthAdmin';
import Loader from '../loader/Loader';


function AdminLogRoute({ children }) {
  
  const [isAuthenticated, setIsAuthenticated] = useState({
    'is_authenticated': false,
    'is_admin': false,
  });
  const [isLoading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchData = async () => {
      const authInfo = await isAuthAdmin();
      setIsAuthenticated({
        'is_authenticated' : authInfo.isAuthenticated,
        'is_admin' : authInfo.isAdmin,
      });
      setLoading(false);
      
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader />
  }

  
  if (isAuthenticated.is_authenticated && isAuthenticated.is_admin) {

    return <Navigate to="/admincontrol/" />;
  }

 
  return children;
}


export default AdminLogRoute;