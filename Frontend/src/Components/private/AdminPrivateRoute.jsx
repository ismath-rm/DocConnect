import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthAdmin from '../../utils/isAuthAdmin';
import Loader from '../loader/Loader';

function AdminPrivateRoute({ children }) {

  const [isAuthenticated, setIsAuthenticated] = useState({
    'is_authenticated': false,
    'is_admin': false,
    'is_loading': true,
  });
  const [isLoading, setLoading] = useState(true);



  useEffect(() => {
    const fetchData = async () => {
      const authInfo = await isAuthAdmin();
      console.log(authInfo);
      setIsAuthenticated({
        'is_authenticated': authInfo.isAuthenticated,
        'is_admin': authInfo.isAdmin,
        'is_loading': false
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader/>;
  }


  if (isAuthenticated.is_loading)
    return <div>Loading</div>
  if (!isAuthenticated.is_authenticated) {
    return <Navigate to="/admincontrol/login" />;
  }

  if ((!isAuthenticated.is_admin)) {
    return <Navigate to="/admincontrol/login" />;
  }

  return children;
}


export default AdminPrivateRoute;