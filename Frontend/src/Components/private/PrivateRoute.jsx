import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthUser from '../../utils/IsAuthUser';
import Loader from '../loader/Loader';

const PrivateRoute = ({children}) => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setLoading] = useState(true);
    

    useEffect(() => {
        const fetchData = async () => {
            const authInfo = await isAuthUser();
            setIsAuthenticated(authInfo.isAuthenticated);
            setTimeout(() => { setLoading(false); }, 2000);
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    if (isAuthenticated) {
        return <Navigate to="/" />;
    }

    return children;
}

export default PrivateRoute
