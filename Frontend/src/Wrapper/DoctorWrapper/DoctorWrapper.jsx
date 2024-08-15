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
import DoctorChatComponent from "../../Components/Messages/DoctMessage";
import DoctorSlotBooking from '../../Components/doctorside/DoctorSlotBooking'
import DoctorSlot from '../../Pages/Doctor/DoctorSlot'
import DoctorVideoCallRoom from '../../Pages/Doctor/DoctorVideoCallRoom'
import Accountdetailes from '../../Pages/Doctor/Accountdetailes'
import About from '../../Pages/Doctor/About'

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
        { path: "/chat", element: <DoctorChatComponent /> },
        { path: "/slot", element: <DoctorSlot /> },
        { path: "/room/:roomID", element: <DoctorVideoCallRoom /> },
        { path: "/accountDetails", element: <Accountdetailes/> },
        { path: "/aboutUs", element: <About/> },
      ]
    }
  ]);

  return routes;
}

export default DoctorWrapper
