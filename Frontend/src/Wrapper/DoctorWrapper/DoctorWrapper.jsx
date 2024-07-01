import React, { useEffect } from 'react'
import DoctorHeader from '../../Components/doctorside/DoctorHeader'
import DoctorFooter from '../../Components/doctorside/DoctorFooter'
import DoctorHome from '../../Pages/Doctor/DoctorHome'
import { Outlet, useRoutes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { set_Authentication } from '../../Redux/authentication/authenticationSlice'
import isAuthDoctor from '../../utils/isAuthDoctor'
import DoctorPrivateRoute from '../../Components/private/DoctorPrivateRoute'
import DoctorProfile from '../../Pages/Doctor/DoctorProfile'

const DoctorWrapper = () => {
  const dispatch = useDispatch();

  const authentication_user = useSelector((state => state.authentication_user));

  const checkAuth = async () => {
    const isAuthenticated = await isAuthDoctor();
    dispatch(
      set_Authentication({
        name: isAuthenticated.name,
        isAuthenticated: isAuthenticated.is_doctor,
        user_id: isAuthenticated.user_id,

      })
      
    )
  }

  useEffect(() => {
    if(!authentication_user.name){
      checkAuth();
    }
  },[authentication_user]);

  const routes = useRoutes([
    {
      element:(
        <>
        <DoctorHeader/>
        {/* <DoctorPrivateRoute> */}
          <Outlet/>
        {/* </DoctorPrivateRoute> */}
        <DoctorFooter/>
        </>
      ),
      children:[
        { path: '/doctorHome', element: <DoctorHome /> },
        { path: "/profile/", element: <DoctorProfile /> },
      ]
    }
  ]);

  return routes;


  // return (
  //   <div>
  //     <DoctorHeader/>
  //     <Routes>
  //       <Route path="/doctorHome" element={<DoctorHome/>} />
  //     </Routes>
  //     <DoctorFooter/>
      
  //   </div>
  // )
}

export default DoctorWrapper
